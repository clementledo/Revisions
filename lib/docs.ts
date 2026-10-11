import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';

import { COURSES } from '@/lib/courses';
import { read, update, write } from '@/lib/store';
import type { Course } from '@/lib/types';

/** Document importé du téléphone ou du Drive (copié dans l'app). */
export type Doc = {
  id: string;
  course: string;
  /** Chapitre (id dans la page), si on a pu le deviner. */
  chapter?: string;
  kind: 'slides' | 'antiseche' | 'autre';
  name: string;
  uri: string;
  mime: string;
  size: number;
  added: number;
};

export const DOCS_KEY = 'docs';
export const allDocs = () => read<Doc[]>(DOCS_KEY, []);

const strip = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Devine le cours, le chapitre et le type d'un fichier d'après son nom (ex. « MTI881_Cours3_cem.pdf »). */
export function classify(name: string, fallbackCourse?: string): Pick<Doc, 'course' | 'chapter' | 'kind'> {
  const n = strip(name);
  const course = COURSES.find((c) => n.includes(c.code.toLowerCase()))?.id ?? fallbackCourse ?? COURSES[0].id;
  const kind: Doc['kind'] = /antiseche|cheat|aide.?memoire/.test(n) ? 'antiseche' : 'slides';
  return { course, chapter: kind === 'slides' ? guessChapter(COURSES.find((c) => c.id === course)!, n) : undefined, kind };
}

function guessChapter(course: Course, n: string) {
  const num = /(?:cours|chap(?:itre)?|ch|c|lecture|semaine|s)[\s_-]*0?(\d{1,2})/.exec(n)?.[1];
  if (!num) return undefined;
  const candidates = course.lessons
    .map((id) => course.chapters.find((c) => c.id === id)!)
    .filter((c) => new RegExp(`\\b${num}\\b`).test(c.eyebrow));
  if (candidates.length <= 1) return candidates[0]?.id;
  // Plusieurs parties (2a / 2b) : on cherche un mot du titre dans le nom du fichier.
  const byTitle = candidates.find((c) =>
    strip(c.title)
      .split(/[^a-z0-9]+/)
      .some((w) => w.length >= 5 && n.includes(w)),
  );
  return (byTitle ?? candidates[0]).id;
}

function docsDir() {
  const dir = new Directory(Paths.document, 'documents');
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/** Ouvre le sélecteur Android (téléphone, Google Drive…) et copie les fichiers choisis dans l'app. */
export async function importDocs(opts: { course?: string; kind?: Doc['kind']; chapter?: string; images?: boolean } = {}) {
  const res = await DocumentPicker.getDocumentAsync({
    type: opts.images ? ['application/pdf', 'image/*'] : 'application/pdf',
    multiple: true,
    copyToCacheDirectory: true,
  });
  if (res.canceled) return [];
  const added: Doc[] = [];
  for (const a of res.assets) {
    const guess = classify(a.name, opts.course);
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const ext = /\.[a-z0-9]+$/i.exec(a.name)?.[0] ?? (a.mimeType === 'application/pdf' ? '.pdf' : '');
    const dest = new File(docsDir(), `${id}${ext}`);
    new File(a.uri).copySync(dest);
    added.push({
      id,
      course: opts.course && !COURSES.some((c) => strip(a.name).includes(c.code.toLowerCase())) ? opts.course : guess.course,
      chapter: opts.chapter ?? guess.chapter,
      kind: opts.kind ?? guess.kind,
      name: a.name.replace(/\.pdf$/i, ''),
      uri: dest.uri,
      mime: a.mimeType ?? 'application/pdf',
      size: a.size ?? dest.size ?? 0,
      added: Date.now(),
    });
  }
  update<Doc[]>(DOCS_KEY, [], (d) => [...d, ...added]);
  return added;
}

export function editDoc(id: string, patch: Partial<Doc>) {
  update<Doc[]>(DOCS_KEY, [], (d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)));
}

export function removeDoc(id: string) {
  const doc = allDocs().find((d) => d.id === id);
  if (doc) {
    try {
      new File(doc.uri).delete();
    } catch {}
  }
  write(
    DOCS_KEY,
    allDocs().filter((d) => d.id !== id),
  );
}

export const formatSize = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} Mo` : `${Math.max(1, Math.round(b / 1e3))} Ko`);
