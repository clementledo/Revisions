import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Bar, Button, Card, Chip, Icon, Pill, Ring, Screen, Section, Stat } from '@/components/ui';
import { courseById } from '@/lib/courses';
import { read } from '@/lib/store';
import { checkAnswer, quizChapterOf, quizKey, recordAnswer, type QuizMap } from '@/lib/study';
import { makeStyles, radius, shadow, space, tone, toneSoft, type as typo, useTheme } from '@/lib/theme';
import type { Question } from '@/lib/types';

const TYPES = [
  { id: 'all', label: 'Tous' },
  { id: 'qcm', label: 'QCM' },
  { id: 'vf', label: 'Vrai / Faux' },
  { id: 'num', label: 'Calcul' },
  { id: 'fill', label: 'Texte à trous' },
] as const;
const TLABEL = { qcm: 'QCM', vf: 'Vrai / Faux', num: 'Calcul', fill: 'Texte à trous', ex: 'Exercice' };

type Item = { q: Question; i: number };

/** « Cours 2 · partie A » → « C2A » ; les noms courts restent tels quels. */
const shortLabel = (eyebrow: string) => eyebrow.replace('Cours ', 'C').replace(' · partie ', '');

const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let k = b.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [b[k], b[j]] = [b[j], b[k]];
  }
  return b;
};

export default function Quiz() {
  const { id, ch } = useLocalSearchParams<{ id: string; ch?: string }>();
  const course = courseById(id)!;
  const router = useRouter();
  const { p } = useTheme();
  const s = useStyles();
  const [chapter, setChapter] = useState<string>(ch ?? 'all');
  const [type, setType] = useState<(typeof TYPES)[number]['id']>('all');
  const [mistakes, setMistakes] = useState(false);
  const [run, setRun] = useState<Item[] | null>(null);
  const [pos, setPos] = useState(0);
  const [answer, setAnswer] = useState<number | boolean | string | null>(null);
  const [typed, setTyped] = useState('');
  const [results, setResults] = useState<boolean[]>([]);

  const pool = (): Item[] => {
    const past = read<QuizMap>(quizKey(id), {});
    return course.questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => q.t !== 'ex')
      .filter(({ q }) => chapter === 'all' || quizChapterOf(course, q) === chapter)
      .filter(({ q }) => type === 'all' || q.t === type)
      .filter(({ i }) => !mistakes || (past[i] && !past[i].ok));
  };

  const start = (items: Item[]) => {
    setRun(shuffle(items));
    setPos(0);
    setAnswer(null);
    setTyped('');
    setResults([]);
  };

  // ---------- réglages
  if (!run) {
    const n = pool().length;
    return (
      <Screen>
        <Section title="Chapitre">
        <View style={s.chips}>
          <Chip label="Tous" active={chapter === 'all'} color={course.color} onPress={() => setChapter('all')} />
          {course.lessons.map((l) => (
            <Chip
              key={l}
              label={shortLabel(course.chapters.find((c) => c.id === l)!.eyebrow)}
              active={chapter === l}
              color={course.color}
              onPress={() => setChapter(l)}
            />
          ))}
        </View>
        </Section>
        <Section title="Type de questions">
        <View style={s.chips}>
          {TYPES.filter((t) => t.id === 'all' || course.questions.some((q) => q.t === t.id)).map((t) => (
            <Chip key={t.id} label={t.label} active={type === t.id} color={course.color} onPress={() => setType(t.id)} />
          ))}
        </View>
        </Section>
        <Section title="Questions">
        <View style={s.chips}>
          <Chip label="Toutes" active={!mistakes} color={course.color} onPress={() => setMistakes(false)} />
          <Chip label="Mes erreurs seulement" active={mistakes} color={course.color} onPress={() => setMistakes(true)} />
        </View>
        </Section>
        <Card tint={toneSoft(course.color, p)} style={s.summary}>
          <View style={[s.summaryIcon, { backgroundColor: tone(course.color, p) }]}>
            <Icon name="format-list-checks" size={22} color={p.dark ? '#0b0d12' : '#fff'} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={s.big}>{n} question{n > 1 ? 's' : ''}</Text>
            <Text style={s.count}>Ordre mélangé, explication après chaque réponse.</Text>
          </View>
        </Card>
        <Button label="Commencer" icon="play" size="lg" color={course.color} disabled={!n} onPress={() => start(pool())} />
      </Screen>
    );
  }

  const item = run[pos];

  // ---------- résultats
  if (!item) {
    const ok = results.filter(Boolean).length;
    const wrong = run.filter((_, k) => !results[k]);
    return (
      <Screen>
        <Card style={s.result}>
          <Ring value={ok / run.length} size={132} stroke={11} color={ok / run.length >= 0.6 ? p.good : p.warn}>
            <Text style={s.resultPct}>{Math.round((ok / run.length) * 100)} %</Text>
          </Ring>
          <Text style={s.resultTitle}>{ok / run.length >= 0.8 ? 'Excellent !' : ok / run.length >= 0.6 ? 'Bien joué' : 'Encore un effort'}</Text>
          <View style={{ flexDirection: 'row', alignSelf: 'stretch' }}>
            <Stat value={String(ok)} label="bonnes réponses" color={p.good} />
            <Stat value={String(run.length - ok)} label="erreurs" color={p.bad} />
            <Stat value={String(run.length)} label="questions" />
          </View>
        </Card>
        {wrong.length > 0 && <Button label={`Refaire mes ${wrong.length} erreur${wrong.length > 1 ? 's' : ''}`} icon="refresh" size="lg" color={course.color} onPress={() => start(wrong)} />}
        <Button label="Nouveau QCM" kind="soft" color={course.color} onPress={() => setRun(null)} />
        <Button label="Retour au cours" kind="ghost" color={course.color} onPress={() => router.back()} />
      </Screen>
    );
  }

  // ---------- question
  const { q } = item;
  const answered = answer !== null;
  const ok = answered && checkAnswer(q, answer);
  const submit = (v: number | boolean | string) => {
    if (answered) return;
    setAnswer(v);
    const good = checkAnswer(q, v);
    recordAnswer(id, item.i, good);
    setResults((r) => [...r, good]);
  };
  const next = () => {
    setPos(pos + 1);
    setAnswer(null);
    setTyped('');
  };
  const chapterTitle = course.chapters.find((c) => c.id === quizChapterOf(course, q));

  const optionStyle = (v: number | boolean) => {
    if (!answered) return null;
    if (v === q.a) return { backgroundColor: p.goodSoft, borderColor: p.good };
    if (v === answer) return { backgroundColor: p.badSoft, borderColor: p.bad };
    return { opacity: 0.6 };
  };

  return (
    <Screen>
      <View style={s.progress}>
        <View style={{ flex: 1 }}>
          <Bar value={(pos + (answered ? 1 : 0)) / run.length} color={tone(course.color, p)} />
        </View>
        <Text style={s.count}>
          {pos + 1} / {run.length}
        </Text>
      </View>
      <Card style={{ gap: space.md, padding: 18 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Pill label={TLABEL[q.t]} color={course.color} />
          <Text style={s.chapter} numberOfLines={1}>
            {chapterTitle?.eyebrow}
          </Text>
        </View>
        <Text style={s.question}>{q.q}</Text>

        {q.t === 'qcm' &&
          q.o!.map((o, k) => (
            <Pressable key={k} onPress={() => submit(k)} style={({ pressed }) => [s.option, pressed && !answered && s.optionPressed, optionStyle(k)]}>
              <View style={[s.letterBox, answered && k === q.a && { backgroundColor: p.good }, answered && k === answer && k !== q.a && { backgroundColor: p.bad }]}>
                {answered && (k === q.a || k === answer) ? (
                  <Icon name={k === q.a ? 'check' : 'close'} size={15} color="#fff" />
                ) : (
                  <Text style={s.letter}>{'ABCDEF'[k]}</Text>
                )}
              </View>
              <Text style={s.optionText}>{o}</Text>
            </Pressable>
          ))}

        {q.t === 'vf' && (
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {[true, false].map((v) => (
              <Pressable
                key={String(v)}
                onPress={() => submit(v)}
                style={({ pressed }) => [s.option, { flex: 1, justifyContent: 'center', paddingVertical: 16 }, pressed && !answered && s.optionPressed, optionStyle(v)]}>
                <Icon name={v ? 'check-circle-outline' : 'close-circle-outline'} size={20} color={p.text2} />
                <Text style={[s.optionText, { flex: 0, fontWeight: '700' }]}>{v ? 'Vrai' : 'Faux'}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {(q.t === 'num' || q.t === 'fill') && (
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <TextInput
              value={typed}
              onChangeText={setTyped}
              editable={!answered}
              keyboardType={q.t === 'num' ? 'numeric' : 'default'}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Ta réponse"
              placeholderTextColor={p.muted}
              onSubmitEditing={() => typed && submit(typed)}
              style={[s.input, answered && { borderColor: ok ? p.good : p.bad }]}
            />
            {!answered && <Button label="Valider" color={course.color} disabled={!typed} onPress={() => submit(typed)} />}
          </View>
        )}

        {answered && (
          <View style={[s.feedback, { backgroundColor: ok ? p.goodSoft : p.badSoft }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name={ok ? 'check-circle' : 'close-circle'} size={20} color={ok ? p.good : p.bad} />
              <Text style={[s.fbTitle, { color: ok ? p.good : p.bad }]}>
                {ok ? 'Bonne réponse' : q.t === 'num' ? `Réponse attendue : ${q.a}` : 'Pas tout à fait'}
              </Text>
            </View>
            <Text style={s.fbText}>{q.e}</Text>
          </View>
        )}
      </Card>
      {answered && <Button label={pos + 1 < run.length ? 'Question suivante' : 'Voir mon score'} icon="arrow-right" size="lg" color={course.color} onPress={next} />}
    </Screen>
  );
}

const useStyles = makeStyles((p) => ({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  big: { ...typo.headline, fontSize: 20, color: p.text },
  count: { fontFamily: 'Inter', fontSize: 13, color: p.muted, fontWeight: '600' },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: space.sm },
  summaryIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  progress: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  result: { alignItems: 'center', gap: space.lg, paddingVertical: 28, ...shadow(p, 2) },
  resultPct: { ...typo.title, fontSize: 30, color: p.text },
  resultTitle: { ...typo.title, color: p.text },
  optionPressed: { backgroundColor: p.surface2 },
  letterBox: { width: 28, height: 28, borderRadius: 9, backgroundColor: p.surface2, alignItems: 'center', justifyContent: 'center' },
  chapter: { flex: 1, fontFamily: 'Inter', fontSize: 12.5, color: p.muted },
  question: { fontFamily: 'Inter', fontSize: 18.5, fontWeight: '700', color: p.text, lineHeight: 27, letterSpacing: -0.2 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: p.line,
    backgroundColor: p.surface,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  letter: { fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: p.text2 },
  optionText: { flex: 1, fontFamily: 'Inter', fontSize: 15.5, color: p.text, lineHeight: 21 },
  input: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 17,
    color: p.text,
    borderWidth: 1.5,
    borderColor: p.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    backgroundColor: p.bg,
  },
  feedback: { borderRadius: radius.md, padding: 14, gap: 6, borderLeftWidth: 0 },
  fbTitle: { fontFamily: 'Inter', fontSize: 15, fontWeight: '700' },
  fbText: { fontFamily: 'Inter', fontSize: 15, color: p.text, lineHeight: 22 },
}));
