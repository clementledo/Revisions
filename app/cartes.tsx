import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bar, Button, Empty, Icon } from '@/components/ui';
import { COURSES, courseById } from '@/lib/courses';
import { read } from '@/lib/store';
import { dueCards, nextLabel, rateCard, srsKey, type Rating, type SrsMap } from '@/lib/study';
import { makeStyles, radius, space, useTheme } from '@/lib/theme';
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
        <Empty icon="party-popper" title="Séance terminée" sub={`${score.good} cartes sues · ${score.again} à revoir plus tard`}>
          <Button label="Continuer" icon="cards" onPress={() => {
            setQueue(buildSession(courseId, ch, false));
            setIndex(0);
          }} />
          <Button label="Retour" kind="ghost" onPress={() => router.back()} />
        </Empty>
      </View>
    );
  }

  const state = read<SrsMap>(srsKey(item.course.id), {})[item.card.id];
  const chapter = item.course.chapters.find((c) => c.id === item.card.ch);

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
        <Bar value={Math.min(index, total) / Math.max(1, total)} color={item.course.color} />
        <Text style={s.count}>
          {Math.min(index + 1, queue.length)} / {queue.length}
        </Text>
      </View>

      <Pressable style={s.stage} onPress={turn}>
        <Animated.View style={[s.card, { transform: [{ perspective: 1200 }, { rotateY: front }] }]}>
          <Meta />
          <Text style={s.q}>{item.card.q}</Text>
          <View style={s.hint}>
            <Icon name="gesture-tap" size={18} color={p.muted} />
            <Text style={s.hintText}>Touche pour voir la réponse</Text>
          </View>
        </Animated.View>
        <Animated.View style={[s.card, s.backCard, { transform: [{ perspective: 1200 }, { rotateY: back }] }]}>
          <Meta />
          <Text style={s.qSmall}>{item.card.q}</Text>
          <View style={[s.sep, { backgroundColor: item.course.color }]} />
          <Text style={s.a}>{item.card.a}</Text>
        </Animated.View>
      </Pressable>

      {flipped ? (
        <View style={s.rates}>
          {RATES.map(({ r, label, color }) => (
            <Pressable key={r} onPress={() => rate(r)} style={({ pressed }) => [s.rate, { borderColor: color }, pressed && { backgroundColor: color + '22' }]}>
              <Text style={[s.rateLabel, { color }]}>{label}</Text>
              <Text style={s.rateSub}>{nextLabel(state, r)}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={{ paddingHorizontal: space.lg }}>
          <Button label="Voir la réponse" color={item.course.color} onPress={turn} />
        </View>
      )}
    </View>
  );

  function Meta() {
    return (
      <View style={s.meta}>
        <Text style={[s.metaCode, { color: item.course.color }]}>{item.course.code}</Text>
        <Text style={s.metaCh} numberOfLines={1}>
          {chapter?.eyebrow} · {chapter?.title}
        </Text>
        {!state && <Text style={[s.new, { color: p.warn }]}>NOUVELLE</Text>}
      </View>
    );
  }
}

const useStyles = makeStyles((p) => ({
  top: { paddingHorizontal: space.lg, paddingTop: space.sm, gap: 6 },
  count: { fontFamily: 'Inter', fontSize: 13, color: p.muted, fontWeight: '600', textAlign: 'right' },
  stage: { flex: 1, margin: space.lg },
  card: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backfaceVisibility: 'hidden',
    backgroundColor: p.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: p.line,
    padding: space.xl,
    gap: space.lg,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  backCard: { justifyContent: 'flex-start', paddingTop: 64 },
  meta: { position: 'absolute', top: space.lg, left: space.xl, right: space.xl, flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaCode: { fontFamily: 'Inter', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  metaCh: { flex: 1, fontFamily: 'Inter', fontSize: 12, color: p.muted },
  new: { fontFamily: 'Inter', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  q: { fontFamily: 'Inter', fontSize: 22, fontWeight: '700', color: p.text, lineHeight: 30, textAlign: 'center', letterSpacing: -0.3 },
  qSmall: { fontFamily: 'Inter', fontSize: 15, fontWeight: '600', color: p.muted, lineHeight: 21 },
  sep: { height: 3, width: 40, borderRadius: 3 },
  a: { fontFamily: 'Inter', fontSize: 18.5, color: p.text, lineHeight: 27 },
  hint: { position: 'absolute', bottom: space.lg, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  hintText: { fontFamily: 'Inter', fontSize: 13, color: p.muted },
  rates: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg },
  rate: { flex: 1, borderWidth: 1.5, borderRadius: radius.md, paddingVertical: 10, alignItems: 'center', gap: 2, backgroundColor: p.surface },
  rateLabel: { fontFamily: 'Inter', fontSize: 14, fontWeight: '700' },
  rateSub: { fontFamily: 'Inter', fontSize: 11.5, color: p.muted },
}));
