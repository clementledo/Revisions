import { Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bar, Button, Card, Icon, Pill, Ring, Section, Stat } from '@/components/ui';
import { courseById } from '@/lib/courses';
import { useStored } from '@/lib/store';
import { logActivity } from '@/lib/study';
import { alpha, makeStyles, radius, shadow, space, tone, toneSoft, type, useTheme } from '@/lib/theme';
import type { SortItem } from '@/lib/types';

type Saved = { err: Record<string, number>; runs: number; best: number | null };
type Run = {
  queue: SortItem[];
  total: number;
  seen: Set<string>;
  miss: Set<string>;
  firstOk: number;
  done: number;
  answer: string | null;
  start: number;
};

/** Horodatage pour la durée de la série (appelé dans les gestionnaires, pas au rendu). */
const now = () => new Date().getTime();

const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

/** Exercice de tri : chaque pratique s'affiche, on la range dans sa famille ; une erreur revient en fin de série. */
export default function SortScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const course = courseById(id)!;
  const ex = course.sort!;
  const { p } = useTheme();
  const s = useStyles();
  const insets = useSafeAreaInsets();
  const c = tone(course.color, p);
  const [saved, setSaved] = useStored<Saved>(`tri:${id}`, { err: {}, runs: 0, best: null });
  const [run, setRun] = useState<Run | null>(null);
  const [ended, setEnded] = useState<{ firstOk: number; total: number; miss: Set<string>; secs: number } | null>(null);
  const scroll = useRef<ScrollView>(null);

  const family = (fid: string) => ex.families.find((f) => f.id === fid)!;
  const traps = ex.items.filter((i) => (saved.err[i.name] ?? 0) > 0).sort((a, b) => saved.err[b.name] - saved.err[a.name]);

  const start = (list: SortItem[]) => {
    setEnded(null);
    setRun({ queue: shuffle(list), total: list.length, seen: new Set(), miss: new Set(), firstOk: 0, done: 0, answer: null, start: now() });
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  const answer = (fid: string) => {
    if (!run || run.answer) return;
    const item = run.queue[0];
    const ok = fid === item.family;
    const first = !run.seen.has(item.name);
    const err = { ...saved.err };
    if (!ok) err[item.name] = (err[item.name] ?? 0) + 1;
    else if (first && err[item.name]) err[item.name] = Math.max(0, err[item.name] - 1);
    setSaved({ ...saved, err });
    if (first) logActivity();
    const seen = new Set(run.seen).add(item.name);
    const miss = ok ? run.miss : new Set(run.miss).add(item.name);
    setRun({ ...run, seen, miss, answer: fid, firstOk: run.firstOk + (ok && first ? 1 : 0), done: run.done + (ok ? 1 : 0) });
    // Fait apparaître la définition et l'exemple sous les boutons.
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 80);
  };

  const next = () => {
    if (!run) return;
    const [item, ...rest] = run.queue;
    const queue = run.answer === item.family ? rest : [...rest, item];
    if (!queue.length) {
      const full = run.total === ex.items.length;
      setSaved({ ...saved, runs: saved.runs + 1, best: full && (saved.best == null || run.firstOk > saved.best) ? run.firstOk : saved.best });
      setEnded({ firstOk: run.firstOk, total: run.total, miss: run.miss, secs: Math.round((now() - run.start) / 1000) });
      setRun(null);
    } else setRun({ ...run, queue, answer: null });
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  const title = `Trier · ${ex.title}`;

  // ---------- série en cours
  if (run) {
    const item = run.queue[0];
    const retry = run.seen.has(item.name) && !run.answer;
    const ok = run.answer === item.family;
    const fam = family(item.family);
    return (
      <View style={{ flex: 1, backgroundColor: p.bg }}>
        <Stack.Screen options={{ title }} />
        <View style={s.top}>
          <View style={{ flex: 1 }}>
            <Bar value={run.done / run.total} color={c} />
          </View>
          <Text style={s.count}>
            {run.done} / {run.total}
          </Text>
        </View>
        <ScrollView ref={scroll} contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 120 }]}>
          <View style={[s.card, shadow(p, 2)]}>
            <View style={s.cardHead}>
              <Text style={[s.over, { color: c }]}>Dans quelle famille ?</Text>
              {retry && <Pill label="Deuxième chance" color={p.bad} icon="refresh" />}
            </View>
            <Text style={s.name}>{item.name}</Text>
          </View>

          <View style={{ gap: space.sm }}>
            {ex.families.map((f, i) => {
              const isGood = !!run.answer && f.id === item.family;
              const isBad = !!run.answer && f.id === run.answer && !ok;
              const col = isGood ? p.good : isBad ? p.bad : null;
              return (
                <Pressable
                  key={f.id}
                  disabled={!!run.answer}
                  onPress={() => answer(f.id)}
                  style={({ pressed }) => [
                    s.choice,
                    { borderColor: col ?? p.line, backgroundColor: col ? alpha(col, p.dark ? 0.16 : 0.08) : pressed ? p.surface2 : p.surface },
                    !!run.answer && !col && { opacity: 0.5 },
                  ]}>
                  <View style={[s.num, { backgroundColor: col ?? toneSoft(course.color, p) }]}>
                    {col ? (
                      <Icon name={isGood ? 'check' : 'close'} size={18} color="#fff" />
                    ) : (
                      <Text style={[s.numText, { color: c }]}>{i + 1}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={s.choiceTitle}>{f.title}</Text>
                    <Text style={s.choiceSub}>{f.sub}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {!!run.answer && (
            <View style={[s.feedback, { borderColor: ok ? p.good : p.bad, backgroundColor: ok ? p.goodSoft : p.badSoft }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name={ok ? 'check-circle' : 'close-circle'} size={20} color={ok ? p.good : p.bad} />
                <Text style={[s.fbTitle, { color: ok ? p.good : p.bad }]}>{ok ? 'Correct' : `Non : ${fam.title}`}</Text>
              </View>
              <Text style={s.def}>
                <Text style={{ fontWeight: '700' }}>{item.name}</Text> · {item.def}
              </Text>
              <View style={[s.example, { backgroundColor: p.surface }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="lightbulb-on-outline" size={16} color={c} />
                  <Text style={[s.exLabel, { color: c }]}>Exemple</Text>
                </View>
                <Text style={s.exText}>{item.ex}</Text>
              </View>
            </View>
          )}
        </ScrollView>
        <View style={[s.footer, { paddingBottom: insets.bottom + space.md, backgroundColor: p.bg }]}>
          {run.answer ? (
            <Button label={run.queue.length > 1 || !ok ? 'Suivante' : 'Voir le bilan'} icon="arrow-right" size="lg" color={course.color} onPress={next} />
          ) : (
            <Button label="Arrêter la série" kind="ghost" onPress={() => setRun(null)} />
          )}
        </View>
      </View>
    );
  }

  // ---------- accueil et bilan
  return (
    <ScrollView ref={scroll} style={{ flex: 1, backgroundColor: p.bg }} contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}>
      <Stack.Screen options={{ title }} />

      {ended ? (
        <View style={[s.card, shadow(p, 2), { alignItems: 'center' }]}>
          <Ring value={ended.firstOk / ended.total} size={112} stroke={10} color={ended.miss.size ? c : p.good}>
            <Text style={s.ringBig}>{ended.firstOk}</Text>
            <Text style={s.ringSmall}>/ {ended.total}</Text>
          </Ring>
          <Text style={s.endTitle}>{ended.miss.size ? 'Série terminée' : 'Sans-faute !'}</Text>
          <Text style={s.endSub}>
            Du premier coup · {Math.floor(ended.secs / 60)} min {String(ended.secs % 60).padStart(2, '0')} s
          </Text>
          <View style={{ alignSelf: 'stretch', gap: space.sm, marginTop: space.sm }}>
            {ended.miss.size > 0 && (
              <Button label={`Refaire mes ${ended.miss.size} erreurs`} icon="refresh" color={course.color} onPress={() => start(ex.items.filter((i) => ended.miss.has(i.name)))} />
            )}
            <Button label="Nouvelle série" kind={ended.miss.size ? 'soft' : 'primary'} color={course.color} onPress={() => start(ex.items)} />
          </View>
        </View>
      ) : (
        <View style={[s.card, shadow(p, 2)]}>
          <Text style={[s.over, { color: c }]}>{ex.title}</Text>
          <Text style={s.introTitle}>Range les {ex.items.length} pratiques dans leur famille</Text>
          <Text style={s.endSub}>
            Après chaque réponse, tu vois la définition et un exemple concret. Une erreur revient en fin de série jusqu’à ce que tu la réussisses.
          </Text>
          <View style={s.stats}>
            <Stat value={String(saved.runs)} label="séries" />
            <Stat value={saved.best == null ? '–' : `${saved.best}/${ex.items.length}`} label="meilleur score" color={course.color} />
            <Stat value={String(traps.length)} label="pièges" color={traps.length ? p.bad : undefined} />
          </View>
          <View style={{ gap: space.sm }}>
            <Button label={`Trier les ${ex.items.length} pratiques`} icon="play" size="lg" color={course.color} onPress={() => start(ex.items)} />
            {traps.length > 0 && <Button label={`Seulement mes pièges (${traps.length})`} kind="soft" color={course.color} onPress={() => start(traps)} />}
          </View>
        </View>
      )}

      <Section title={ended?.miss.size ? 'Tes erreurs en rouge' : 'Aide-mémoire'}>
        {ex.families.map((f) => {
          const list = ex.items.filter((i) => i.family === f.id);
          return (
            <Card key={f.id} style={{ gap: space.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.sm }}>
                <Text style={s.famTitle}>{f.title}</Text>
                <Text style={[s.famCount, { color: c }]}>{list.length}</Text>
              </View>
              <Text style={s.choiceSub}>{f.sub}</Text>
              <View style={s.tags}>
                {list.map((i) => {
                  const bad = !!ended?.miss.has(i.name);
                  return (
                    <View key={i.name} style={[s.tag, { backgroundColor: bad ? p.badSoft : p.surface2 }]}>
                      <Text style={[s.tagText, bad && { color: p.bad, fontWeight: '700' }]}>{i.name}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          );
        })}
      </Section>
    </ScrollView>
  );
}

const useStyles = makeStyles((p) => ({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: space.md },
  count: { fontFamily: 'Inter', fontSize: 13, color: p.muted, fontWeight: '700', fontVariant: ['tabular-nums'] },
  content: { paddingHorizontal: 18, paddingTop: space.lg, gap: space.lg },
  card: {
    backgroundColor: p.surface,
    borderRadius: radius.xl,
    borderWidth: p.dark ? 1 : 0,
    borderColor: p.line,
    padding: space.xl,
    gap: space.md,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  over: { ...type.overline },
  name: { ...type.title, fontSize: 28, lineHeight: 34, color: p.text, textAlign: 'center', paddingVertical: space.lg },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1.5, borderRadius: radius.lg, paddingVertical: 14, paddingHorizontal: 14 },
  num: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: 'Inter', fontWeight: '800', fontSize: 15 },
  choiceTitle: { ...type.bodyStrong, color: p.text },
  choiceSub: { ...type.caption, color: p.muted },
  feedback: { borderLeftWidth: 4, borderRadius: radius.md, padding: space.lg, gap: space.md },
  fbTitle: { ...type.headline, fontSize: 17 },
  def: { ...type.body, color: p.text },
  example: { borderRadius: radius.sm, padding: space.md, gap: 6 },
  exLabel: { ...type.overline, fontSize: 11 },
  exText: { ...type.body, fontSize: 15, lineHeight: 22, color: p.text },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: space.md },
  ringBig: { ...type.title, color: p.text, fontVariant: ['tabular-nums'] },
  ringSmall: { ...type.caption, color: p.muted },
  endTitle: { ...type.title, color: p.text, marginTop: space.sm },
  endSub: { ...type.callout, color: p.muted, textAlign: 'left' },
  introTitle: { ...type.title, color: p.text },
  stats: { flexDirection: 'row', paddingVertical: space.sm },
  famTitle: { ...type.headline, color: p.text },
  famCount: { ...type.number, fontSize: 18 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  tagText: { ...type.caption, color: p.text },
}));
