import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Bar, Button, Card, Group, Pill, Row, Screen, Section, Stat } from '@/components/ui';
import { courseById } from '@/lib/courses';
import { allDocs } from '@/lib/docs';
import { useStoreVersion } from '@/lib/store';
import { chapterStats, dueCards, markRead } from '@/lib/study';
import { makeStyles, space, tone, type, useTheme } from '@/lib/theme';

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
  const extras = chapter.hasRecap || chapter.examples > 0 || chapter.traps > 0 || chapter.widgets.length > 0 || slides.length > 0;

  return (
    <Screen>
      <Stack.Screen options={{ title: chapter.eyebrow }} />
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          <Pill label={chapter.eyebrow} color={c} />
          {chapter.hot && <Pill label="Signalé par le prof" icon="star" color={p.bad} />}
          {st.read && <Pill label="Lu" icon="check" color={p.good} />}
        </View>
        <Text style={s.title}>{chapter.title}</Text>
        {!!chapter.lede && <Text style={s.lede}>{chapter.lede}</Text>}
      </View>

      <Card style={{ gap: 14 }}>
        <View style={s.statRow}>
          <Stat value={`${st.mastered}/${st.cards}`} label="cartes maîtrisées" />
          <Stat value={`${st.quizOk}/${st.quizTotal}`} label="questions réussies" />
          <Stat value={`${Math.round(st.level * 100)} %`} label="niveau" color={c} />
        </View>
        <Bar value={st.level} color={tone(c, p)} />
      </Card>

      <View style={{ gap: space.sm }}>
        <Button label={st.read ? 'Relire le chapitre' : 'Lire le chapitre'} icon="book-open-variant" size="lg" color={c} onPress={() => router.push(`${base}/lire?ch=${ch}`)} />
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Button
            style={{ flex: 1 }}
            kind="soft"
            color={c}
            icon="cards-outline"
            label={due ? `Cartes (${due})` : 'Cartes'}
            onPress={() => router.push(`/cartes?course=${id}&ch=${ch}${due ? '' : '&all=1'}`)}
          />
          <Button style={{ flex: 1 }} kind="soft" color={c} icon="format-list-checks" label="QCM" onPress={() => router.push(`${base}/quiz?ch=${ch}`)} />
        </View>
      </View>

      {extras && (
        <Section title="Dans ce chapitre">
          <Group>
            {chapter.hasRecap && <Row icon="star-four-points-outline" color={c} title="Récap : l’essentiel" onPress={() => router.push(`${base}/lire?ch=${ch}&mode=recap`)} />}
            {chapter.examples > 0 && (
              <Row
                icon="pencil-outline"
                color={c}
                title="Exemples et exercices"
                sub={`${chapter.examples} exemple${chapter.examples > 1 ? 's' : ''} détaillé${chapter.examples > 1 ? 's' : ''}`}
                onPress={() => router.push(`${base}/lire?ch=${ch}&mode=examples`)}
              />
            )}
            {chapter.traps > 0 && (
              <Row
                icon="alert-outline"
                color={p.bad}
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
          </Group>
        </Section>
      )}

      <Section title={`Sections · ${chapter.sections.length}`}>
        <Group inset={52}>
          {chapter.sections.map((sec, i) => (
            <Row
              key={sec.index}
              title={sec.title}
              leading={<Text style={[s.num, { color: tone(c, p) }]}>{String(i + 1).padStart(2, '0')}</Text>}
              onPress={() => router.push(`${base}/lire?ch=${ch}&anchor=${sec.index}`)}
            />
          ))}
        </Group>
      </Section>

      <Button
        kind={st.read ? 'soft' : 'secondary'}
        color={st.read ? p.good : undefined}
        icon={st.read ? 'check-circle' : 'check-circle-outline'}
        label={st.read ? 'Chapitre lu' : 'Marquer comme lu'}
        onPress={() => markRead(id, ch, !st.read)}
      />
    </Screen>
  );
}

const useStyles = makeStyles((p) => ({
  title: { ...type.title, fontSize: 27, lineHeight: 33, color: p.text },
  lede: { ...type.body, color: p.text2 },
  statRow: { flexDirection: 'row', gap: space.md },
  num: { fontFamily: 'Inter', fontSize: 13, fontWeight: '800', width: 22, fontVariant: ['tabular-nums'] },
}));
