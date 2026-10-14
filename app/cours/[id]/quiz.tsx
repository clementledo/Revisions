import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Bar, Button, Card, Chip, Empty, H2, Icon, Muted, Pill, Screen } from '@/components/ui';
import { courseById } from '@/lib/courses';
import { read } from '@/lib/store';
import { checkAnswer, quizChapterOf, quizKey, recordAnswer, type QuizMap } from '@/lib/study';
import { makeStyles, radius, space, useTheme } from '@/lib/theme';
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
        <H2>Chapitre</H2>
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
        <H2>Type de questions</H2>
        <View style={s.chips}>
          {TYPES.filter((t) => t.id === 'all' || course.questions.some((q) => q.t === t.id)).map((t) => (
            <Chip key={t.id} label={t.label} active={type === t.id} color={course.color} onPress={() => setType(t.id)} />
          ))}
        </View>
        <H2>Questions</H2>
        <View style={s.chips}>
          <Chip label="Toutes" active={!mistakes} color={course.color} onPress={() => setMistakes(false)} />
          <Chip label="Mes erreurs seulement" active={mistakes} color={course.color} onPress={() => setMistakes(true)} />
        </View>
        <Card tint={p.surface2} style={{ marginTop: space.md }}>
          <Text style={s.big}>{n} question{n > 1 ? 's' : ''}</Text>
          <Muted>Dans un ordre mélangé, avec l’explication après chaque réponse.</Muted>
        </Card>
        <Button label="Commencer" icon="play" color={course.color} disabled={!n} onPress={() => start(pool())} />
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
        <Empty icon={ok / run.length >= 0.8 ? 'trophy' : 'chart-line'} title={`${ok} / ${run.length} bonnes réponses`} sub={`${Math.round((ok / run.length) * 100)} %`}>
          {wrong.length > 0 && <Button label={`Refaire mes ${wrong.length} erreurs`} icon="refresh" color={course.color} onPress={() => start(wrong)} />}
          <Button label="Nouveau QCM" kind="soft" onPress={() => setRun(null)} />
          <Button label="Retour au cours" kind="ghost" color={course.color} onPress={() => router.back()} />
        </Empty>
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
      <View style={{ gap: 6 }}>
        <Bar value={pos / run.length} color={course.color} />
        <Text style={s.count}>
          Question {pos + 1} / {run.length}
        </Text>
      </View>
      <Card style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Pill label={TLABEL[q.t]} color={course.color} />
          <Text style={s.chapter} numberOfLines={1}>
            {chapterTitle?.eyebrow}
          </Text>
        </View>
        <Text style={s.question}>{q.q}</Text>

        {q.t === 'qcm' &&
          q.o!.map((o, k) => (
            <Pressable key={k} onPress={() => submit(k)} style={[s.option, optionStyle(k)]}>
              <Text style={s.letter}>{'ABCDEF'[k]}</Text>
              <Text style={s.optionText}>{o}</Text>
            </Pressable>
          ))}

        {q.t === 'vf' && (
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {[true, false].map((v) => (
              <Pressable key={String(v)} onPress={() => submit(v)} style={[s.option, { flex: 1, justifyContent: 'center' }, optionStyle(v)]}>
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
      {answered && <Button label={pos + 1 < run.length ? 'Question suivante' : 'Voir mon score'} icon="arrow-right" color={course.color} onPress={next} />}
    </Screen>
  );
}

const useStyles = makeStyles((p) => ({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  big: { fontFamily: 'Inter', fontSize: 20, fontWeight: '800', color: p.text },
  count: { fontFamily: 'Inter', fontSize: 13, color: p.muted, fontWeight: '600' },
  chapter: { flex: 1, fontFamily: 'Inter', fontSize: 12.5, color: p.muted },
  question: { fontFamily: 'Inter', fontSize: 18, fontWeight: '600', color: p.text, lineHeight: 26 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: p.line,
    backgroundColor: p.bg,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  letter: { fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: p.muted, width: 16 },
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
  feedback: { borderRadius: radius.md, padding: 14, gap: 6 },
  fbTitle: { fontFamily: 'Inter', fontSize: 15, fontWeight: '700' },
  fbText: { fontFamily: 'Inter', fontSize: 15, color: p.text, lineHeight: 22 },
}));
