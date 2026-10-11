import type { Card, Course, Question } from '@/lib/types';
import { read, update } from '@/lib/store';

// ---------- jours
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayNum = (d = new Date()) => Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);

/** Note une activité de révision du jour (pour la série et le calendrier). */
export function logActivity(n = 1) {
  update<Record<string, number>>('days', {}, (d) => ({ ...d, [dayKey()]: (d[dayKey()] ?? 0) + n }));
}

export function streak(days: Record<string, number>) {
  let s = 0;
  const d = new Date();
  if (!days[dayKey(d)]) d.setDate(d.getDate() - 1); // la série tient jusqu'à ce soir
  while (days[dayKey(d)]) {
    s++;
    d.setDate(d.getDate() - 1);
  }
  return s;
}

// ---------- lecture des chapitres
export type ReadMap = Record<string, number>;
export const readKey = (course: string) => `read:${course}`;
export function markRead(course: string, chapter: string, done: boolean) {
  update<ReadMap>(readKey(course), {}, (m) => {
    const next = { ...m };
    if (done) next[chapter] = Date.now();
    else delete next[chapter];
    return next;
  });
  if (done) logActivity();
}

// ---------- cartes mémoire (répétition espacée, boîtes de Leitner)
export type CardState = { box: number; due: number; seen: number; lapses: number };
export type SrsMap = Record<string, CardState>;
export const srsKey = (course: string) => `srs:${course}`;
const INTERVALS = [0, 1, 2, 4, 8, 16, 32, 64];
export const MASTERED_BOX = 4;

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export function rateCard(course: string, card: Card, rating: Rating) {
  update<SrsMap>(srsKey(course), {}, (m) => {
    const cur = m[card.id] ?? { box: 0, due: 0, seen: 0, lapses: 0 };
    let box = cur.box;
    if (rating === 'again') box = 0;
    else if (rating === 'hard') box = Math.max(1, box);
    else if (rating === 'good') box = Math.min(INTERVALS.length - 1, box + 1);
    else box = Math.min(INTERVALS.length - 1, box + 2);
    const wait = rating === 'hard' ? Math.max(1, Math.floor(INTERVALS[box] / 2)) : INTERVALS[box];
    return {
      ...m,
      [card.id]: { box, due: dayNum() + wait, seen: cur.seen + 1, lapses: cur.lapses + (rating === 'again' ? 1 : 0) },
    };
  });
  logActivity();
}

export const isDue = (s: CardState | undefined) => !s || s.due <= dayNum();
export const isNew = (s: CardState | undefined) => !s;

/** Prochain délai affiché sous chaque bouton. */
export function nextLabel(s: CardState | undefined, rating: Rating) {
  const box = s?.box ?? 0;
  if (rating === 'again') return 'maintenant';
  const b =
    rating === 'hard' ? Math.max(1, box) : Math.min(INTERVALS.length - 1, box + (rating === 'good' ? 1 : 2));
  const d = rating === 'hard' ? Math.max(1, Math.floor(INTERVALS[b] / 2)) : INTERVALS[b];
  return d === 0 ? 'maintenant' : d === 1 ? 'demain' : `${d} j`;
}

// ---------- quiz
export type QuizResult = { ok: boolean; at: number; tries: number; okCount: number };
export type QuizMap = Record<number, QuizResult>;
export const quizKey = (course: string) => `quiz:${course}`;

export function recordAnswer(course: string, qIndex: number, ok: boolean) {
  update<QuizMap>(quizKey(course), {}, (m) => {
    const cur = m[qIndex];
    return {
      ...m,
      [qIndex]: { ok, at: Date.now(), tries: (cur?.tries ?? 0) + 1, okCount: (cur?.okCount ?? 0) + (ok ? 1 : 0) },
    };
  });
  logActivity();
}

export function checkAnswer(q: Question, value: number | boolean | string) {
  if (q.t === 'qcm') return value === q.a;
  if (q.t === 'vf') return value === q.a;
  if (q.t === 'num') {
    const n = Number(String(value).replace(',', '.').replace(/\s/g, ''));
    return Number.isFinite(n) && Math.abs(n - Number(q.a)) <= (q.tol ?? 0.005) + 1e-9;
  }
  return false;
}

// ---------- synthèse par cours / chapitre
export type ChapterStats = {
  id: string;
  title: string;
  read: boolean;
  cards: number;
  mastered: number;
  quizTotal: number;
  quizDone: number;
  quizOk: number;
  /** 0–1 : niveau estimé (cartes maîtrisées + bonnes réponses). */
  level: number;
};

export function chapterStats(course: Course): ChapterStats[] {
  const readMap = read<ReadMap>(readKey(course.id), {});
  const srs = read<SrsMap>(srsKey(course.id), {});
  const quiz = read<QuizMap>(quizKey(course.id), {});
  return course.lessons.map((id) => {
    const ch = course.chapters.find((c) => c.id === id)!;
    const cards = course.cards.filter((c) => c.ch === id);
    const mastered = cards.filter((c) => (srs[c.id]?.box ?? 0) >= MASTERED_BOX).length;
    const qs = course.questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => quizChapterOf(course, q) === id);
    const done = qs.filter(({ i }) => quiz[i]);
    const ok = done.filter(({ i }) => quiz[i].ok).length;
    const parts: number[] = [];
    if (cards.length) parts.push(mastered / cards.length);
    if (qs.length) parts.push(ok / qs.length);
    return {
      id,
      title: ch.title,
      read: !!readMap[id],
      cards: cards.length,
      mastered,
      quizTotal: qs.length,
      quizDone: done.length,
      quizOk: ok,
      level: parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0,
    };
  });
}

/** Chapitre principal d'une question (le cours 2 du quiz couvre les chapitres 2a et 2b). */
export function quizChapterOf(course: Course, q: Question) {
  return q.ch ?? course.quizChapters[q.c]?.[0];
}

export function courseProgress(course: Course) {
  const st = chapterStats(course);
  if (!st.length) return { read: 0, level: 0 };
  return {
    read: st.filter((s) => s.read).length / st.length,
    level: st.reduce((a, s) => a + s.level, 0) / st.length,
  };
}

/** Cartes à revoir aujourd'hui (nouvelles comprises). */
export function dueCards(course: Course, chapter?: string) {
  const srs = read<SrsMap>(srsKey(course.id), {});
  return course.cards.filter((c) => (!chapter || c.ch === chapter) && isDue(srs[c.id]));
}
