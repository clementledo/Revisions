import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bar, Button, Empty, Icon, Pill, Ring, Stat } from '@/components/ui';
import { COURSES, courseById } from '@/lib/courses';
import { read } from '@/lib/store';
import { dueCards, nextLabel, rateCard, srsKey, type Rating, type SrsMap } from '@/lib/study';
import { alpha, makeStyles, radius, shadow, space, tone, type, useTheme } from '@/lib/theme';
import type { Card, Course } from '@/lib/types';

const SESSION = 25;
type Item = { course: Course; card: Card };

const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

function buildSession(courseId: string, ch?: string, all?: boolean): Item[] {
  const courses = courseId === 'all' ? COURSES : [courseById(courseId)!];
  const items = courses.flatMap((course) =>
    (all ? course.cards.filter((c) => !ch || c.ch === ch) : dueCards(course, ch)).map((card) => ({ course, card })),
  );
  // Les cartes déjà vues passent avant les nouvelles.
  const seen = (i: Item) => !!read<SrsMap>(srsKey(i.course.id), {})[i.card.id];
  return [...shuffle(items.filter(seen)), ...shuffle(items.filter((i) => !seen(i)))].slice(0, SESSION);
}

export default function Flashcards() {
  const { course: courseId = 'all', ch, all } = useLocalSearchParams<{ course: string; ch?: string; all?: string }>();
  const router = useRouter();
  const { p } = useTheme();
  const s = useStyles();
  const insets = useSafeAreaInsets();
  const [queue, setQueue] = useState<Item[]>(() => buildSession(courseId, ch, !!all));
  const total = useMemo(() => queue.length, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState({ good: 0, again: 0 });
  const flip = useRef(new Animated.Value(0)).current;

  const item = queue[index];
  const title = courseId === 'all' ? 'Cartes mémoire' : `Cartes · ${courseById(courseId)!.code}`;

  if (!queue.length) {
    return (
      <View style={{ flex: 1, backgroundColor: p.bg, justifyContent: 'center' }}>
        <Stack.Screen options={{ title }} />
        <Empty icon="check-decagram" title="Tout est à jour" sub="Aucune carte à revoir pour l'instant.">
          {courseId !== 'all' && (
            <Button label="Revoir toutes les cartes" kind="soft" onPress={() => setQueue(buildSession(courseId, ch, true))} />
          )}
        </Empty>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: p.bg, justifyContent: 'center' }}>
        <Stack.Screen options={{ title }} />
        <View style={{ paddingHorizontal: 18, gap: space.md }}>
          <View style={[s.done, shadow(p, 2)]}>
            <Ring value={score.good / Math.max(1, score.good + score.again)} size={120} stroke={10} color={p.good}>
              <Icon name="party-popper" size={40} color={p.good} />
            </Ring>
            <Text style={s.doneTitle}>Séance terminée</Text>
            <View style={{ flexDirection: 'row', alignSelf: 'stretch' }}>
              <Stat value={String(score.good)} label="cartes sues" color={p.good} />
              <Stat value={String(score.again)} label="à revoir plus tard" color={p.bad} />
            </View>
          </View>
          <Button
            label="Continuer"
            icon="cards"
            size="lg"
            onPress={() => {
              setQueue(buildSession(courseId, ch, false));
              setIndex(0);
            }}
          />
          <Button label="Retour" kind="ghost" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const state = read<SrsMap>(srsKey(item.course.id), {})[item.card.id];
  const chapter = item.course.chapters.find((x) => x.id === item.card.ch);
  const c = tone(item.course.color, p);

  const turn = () => {
    Animated.spring(flip, { toValue: flipped ? 0 : 1, useNativeDriver: true, friction: 8, tension: 60 }).start();
    setFlipped(!flipped);
  };
  const rate = (r: Rating) => {
    rateCard(item.course.id, item.card, r);
    setScore((sc) => (r === 'again' ? { ...sc, again: sc.again + 1 } : { ...sc, good: sc.good + 1 }));
    if (r === 'again') setQueue((q) => [...q, item]);
    flip.setValue(0);
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  const front = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const back = flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  // Cache la face arrière même là où backfaceVisibility n'est pas pris en charge.
  const frontOp = flip.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: [1, 1, 0, 0] });
  const backOp = flip.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: [0, 0, 1, 1] });

  const RATES: { r: Rating; label: string; color: string }[] = [
    { r: 'again', label: 'À revoir', color: p.bad },
    { r: 'hard', label: 'Difficile', color: p.warn },
    { r: 'good', label: 'Bien', color: p.accent },
    { r: 'easy', label: 'Facile', color: p.good },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: p.bg, paddingBottom: insets.bottom + space.lg }}>
      <Stack.Screen options={{ title }} />
      <View style={s.top}>
        <View style={{ flex: 1 }}>
          <Bar value={Math.min(index, total) / Math.max(1, total)} color={c} />
        </View>
        <Text style={s.count}>
          {Math.min(index + 1, queue.length)} / {queue.length}
        </Text>
      </View>

      <View style={s.stage}>
        <Pressable style={s.deck} onPress={turn}>
          <View style={[s.under, { backgroundColor: alpha(c, p.dark ? 0.14 : 0.1) }]} />
          <Animated.View style={[s.card, shadow(p, 2), { opacity: frontOp, transform: [{ perspective: 1200 }, { rotateY: front }] }]}>
            <Meta />
            <Text style={s.q}>{item.card.q}</Text>
            <View style={s.hint}>
              <Icon name="gesture-tap" size={17} color={p.muted} />
              <Text style={s.hintText}>Touche pour retourner</Text>
            </View>
          </Animated.View>
          <Animated.View style={[s.card, s.backCard, shadow(p, 2), { opacity: backOp, transform: [{ perspective: 1200 }, { rotateY: back }] }]}>
            <Meta />
            <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ gap: space.md }} showsVerticalScrollIndicator={false}>
              <Text style={s.qSmall}>{item.card.q}</Text>
              <View style={[s.sep, { backgroundColor: c }]} />
              <Text style={s.a}>{item.card.a}</Text>
            </ScrollView>
          </Animated.View>
        </Pressable>
      </View>

      {flipped ? (
        <View style={s.rates}>
          {RATES.map(({ r, label, color }) => (
            <Pressable
              key={r}
              onPress={() => rate(r)}
              style={({ pressed }) => [s.rate, { backgroundColor: alpha(color, pressed ? 0.3 : p.dark ? 0.16 : 0.1) }]}>
              <Text style={[s.rateLabel, { color }]}>{label}</Text>
              <Text style={s.rateSub}>{nextLabel(state, r)}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={{ paddingHorizontal: 18 }}>
          <Button label="Voir la réponse" size="lg" color={item.course.color} onPress={turn} />
        </View>
      )}
    </View>
  );

  function Meta() {
    return (
      <View style={s.meta}>
        <Text style={[s.metaCode, { color: c }]}>{item.course.code}</Text>
        <Text style={s.metaCh} numberOfLines={1}>
          {chapter?.eyebrow} · {chapter?.title}
        </Text>
        {!state && <Pill label="Nouvelle" color={p.warn} />}
      </View>
    );
  }
}

const useStyles = makeStyles((p) => ({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: space.md },
  count: { fontFamily: 'Inter', fontSize: 13, color: p.muted, fontWeight: '700', fontVariant: ['tabular-nums'] },
  stage: { flex: 1, justifyContent: 'center', paddingHorizontal: 18, paddingVertical: space.lg },
  deck: { flex: 1, maxHeight: 500 },
  under: { position: 'absolute', left: 14, right: 14, bottom: -10, height: 40, borderRadius: radius.xl },
  done: { backgroundColor: p.surface, borderRadius: radius.xl, borderWidth: p.dark ? 1 : 0, borderColor: p.line, alignItems: 'center', gap: space.lg, paddingVertical: 28 },
  doneTitle: { ...type.title, color: p.text },
  card: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backfaceVisibility: 'hidden',
    backgroundColor: p.surface,
    borderRadius: radius.xl,
    borderWidth: p.dark ? 1 : 0,
    borderColor: p.line,
    padding: space.xl,
    gap: space.lg,
    justifyContent: 'center',
  },
  backCard: { justifyContent: 'flex-start', paddingTop: 62, paddingBottom: space.xl },
  meta: { position: 'absolute', top: space.lg, left: space.xl, right: space.xl, flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaCode: { ...type.overline, fontSize: 11 },
  metaCh: { flex: 1, fontFamily: 'Inter', fontSize: 12, color: p.muted },
  q: { fontFamily: 'Inter', fontSize: 22, fontWeight: '700', color: p.text, lineHeight: 30, textAlign: 'center', letterSpacing: -0.4 },
  qSmall: { fontFamily: 'Inter', fontSize: 15, fontWeight: '600', color: p.muted, lineHeight: 21 },
  sep: { height: 3, width: 40, borderRadius: 3 },
  a: { fontFamily: 'Inter', fontSize: 18.5, color: p.text, lineHeight: 27 },
  hint: { position: 'absolute', bottom: space.lg, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  hintText: { fontFamily: 'Inter', fontSize: 13, color: p.muted },
  rates: { flexDirection: 'row', gap: space.sm, paddingHorizontal: 18 },
  rate: { flex: 1, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center', gap: 2 },
  rateLabel: { fontFamily: 'Inter', fontSize: 14, fontWeight: '700' },
  rateSub: { fontFamily: 'Inter', fontSize: 11.5, color: p.muted },
}));
