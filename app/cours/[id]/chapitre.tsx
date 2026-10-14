import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Bar, Button, Card, H2, Row, Screen } from '@/components/ui';
import { courseById } from '@/lib/courses';
import { allDocs } from '@/lib/docs';
import { useStoreVersion } from '@/lib/store';
import { chapterStats, dueCards, markRead } from '@/lib/study';
import { makeStyles, space, useTheme } from '@/lib/theme';

export default function ChapterScreen() {
  useStoreVersion();
  const { id, ch } = useLocalSearchParams<{ id: string; ch: string }>();
  const course = courseById(id)!;
  const chapter = course.chapters.find((c) => c.id === ch)!;
  const router = useRouter();
  const { p } = useTheme();
  const s = useStyles();
  const st = chapterStats(course).find((x) => x.id === ch)!;
  const due = dueCards(course, ch).length;
  const slides = allDocs().filter((d) => d.course === id && d.chapter === ch && d.kind === 'slides');
  const base = `/cours/${id}`;
  const c = course.color;

  return (
    <Screen>
      <Stack.Screen options={{ title: chapter.eyebrow }} />
      <Text style={[s.eyebrow, { color: c }]}>
        {chapter.eyebrow}
        {chapter.hot && <Text style={{ color: p.bad }}>{'  ★ Signalé par le prof'}</Text>}
      </Text>
      <Text style={s.title}>{chapter.title}</Text>
      {!!chapter.lede && <Text style={s.lede}>{chapter.lede}</Text>}

      <Card>
        <View style={s.statRow}>
          <Stat n={`${st.mastered}/${st.cards}`} l="cartes maîtrisées" />
          <Stat n={`${st.quizOk}/${st.quizTotal}`} l="questions réussies" />
          <Stat n={`${Math.round(st.level * 100)} %`} l="niveau" />
        </View>
        <Bar value={st.level} color={c} />
      </Card>

      <Button label="Lire le chapitre" icon="book-open-variant" color={c} onPress={() => router.push(`${base}/lire?ch=${ch}`)} />
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Button
          style={{ flex: 1 }}
          kind="soft"
          icon="cards-outline"
          label={due ? `Cartes (${due})` : 'Cartes'}
          onPress={() => router.push(`/cartes?course=${id}&ch=${ch}${due ? '' : '&all=1'}`)}
        />
        <Button style={{ flex: 1 }} kind="soft" icon="format-list-checks" label="QCM" onPress={() => router.push(`${base}/quiz?ch=${ch}`)} />
      </View>

      <H2>Dans ce chapitre</H2>
      <Card style={{ paddingVertical: 4 }}>
        {chapter.hasRecap && <Row icon="star-four-points-outline" color={c} title="Récap : ce qu'il faut retenir" onPress={() => router.push(`${base}/lire?ch=${ch}&mode=recap`)} />}
        {chapter.examples > 0 && (
          <Row
            icon="pencil-box-outline"
            color={c}
            title="Exemples et exercices du cours"
            sub={`${chapter.examples} exemples détaillés`}
            onPress={() => router.push(`${base}/lire?ch=${ch}&mode=examples`)}
          />
        )}
        {chapter.traps > 0 && (
          <Row
            icon="alert-outline"
            color={c}
            title="Pièges d’examen"
            sub={`${chapter.traps} encadré${chapter.traps > 1 ? 's' : ''} à connaître`}
            onPress={() => router.push(`${base}/lire?ch=${ch}&mode=traps`)}
          />
        )}
        {chapter.widgets.map((w) => (
          <Row key={w.id} icon="calculator-variant-outline" color={c} title={w.title} sub="Calculateur interactif" onPress={() => router.push(`${base}/lire?ch=${ch}&anchor=${w.id}`)} />
        ))}
        {slides.map((d) => (
          <Row key={d.id} icon="presentation" color={c} title={d.name} sub="Slides" onPress={() => router.push(`/pdf?id=${d.id}`)} />
        ))}
      </Card>

      <H2>Sections</H2>
      <Card style={{ paddingVertical: 4 }}>
        {chapter.sections.map((sec) => (
          <Row key={sec.index} title={sec.title} onPress={() => router.push(`${base}/lire?ch=${ch}&anchor=${sec.index}`)} />
        ))}
      </Card>

      <Button
        kind={st.read ? 'soft' : 'ghost'}
        color={p.good}
        icon={st.read ? 'check-circle' : 'check-circle-outline'}
        label={st.read ? 'Chapitre lu' : 'Marquer comme lu'}
        onPress={() => markRead(id, ch, !st.read)}
      />
    </Screen>
  );

  function Stat({ n, l }: { n: string; l: string }) {
    return (
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={s.statN}>{n}</Text>
        <Text style={s.statL}>{l}</Text>
      </View>
    );
  }
}

const useStyles = makeStyles((p) => ({
  eyebrow: { fontFamily: 'Inter', fontSize: 12.5, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontFamily: 'Inter', fontSize: 26, fontWeight: '800', color: p.text, letterSpacing: -0.6, lineHeight: 31 },
  lede: { fontFamily: 'Inter', fontSize: 15, color: p.muted, lineHeight: 22 },
  statRow: { flexDirection: 'row', gap: space.sm, marginBottom: 6 },
  statN: { fontFamily: 'Inter', fontSize: 19, fontWeight: '800', color: p.text },
  statL: { fontFamily: 'Inter', fontSize: 12, color: p.muted },
}));
