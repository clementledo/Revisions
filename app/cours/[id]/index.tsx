import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Bar, Button, Card, Empty, H2, Icon, Screen, type IconName } from '@/components/ui';
import { allDocs, importDocs } from '@/lib/docs';
import { courseById } from '@/lib/courses';
import { useStoreVersion } from '@/lib/store';
import { chapterStats, dueCards } from '@/lib/study';
import { makeStyles, radius, space, useTheme } from '@/lib/theme';

export default function CourseScreen() {
  useStoreVersion();
  const { id } = useLocalSearchParams<{ id: string }>();
  const course = courseById(id)!;
  const router = useRouter();
  const { p } = useTheme();
  const s = useStyles();
  const docs = allDocs().filter((d) => d.course === id);
  const slides = docs.filter((d) => d.kind === 'slides').length;
  const base = `/cours/${id}`;

  if (!course.lessons.length) {
    return (
      <Screen>
        <Stack.Screen options={{ title: course.code }} />
        <Header />
        <Empty
          icon="book-open-page-variant-outline"
          title="Contenu à venir"
          sub="Envoie-moi ta page de révision et tes slides de ce cours dans le fil du projet : je les ajoute dans une prochaine version.">
          <Button label="Ajouter des slides" icon="file-pdf-box" kind="soft" onPress={() => importDocs({ course: id })} />
        </Empty>
        {docs.length > 0 && <Button label={`Voir mes documents (${docs.length})`} kind="ghost" color={course.color} onPress={() => router.push(`${base}/slides`)} />}
      </Screen>
    );
  }

  const stats = chapterStats(course);
  const due = dueCards(course).length;
  const has = (f: (c: (typeof course.chapters)[number]) => unknown) => course.chapters.some(f);
  const exercises = course.questions.filter((q) => q.t === 'ex').length;
  type Tool = { icon: IconName; label: string; sub: string; go: string; show?: unknown };
  const tools = ([
    { icon: 'cards-outline', label: 'Cartes', sub: due ? `${due} à revoir` : 'À jour', go: `/cartes?course=${id}` },
    { icon: 'format-list-checks', label: 'QCM', sub: `${course.questions.length - exercises} questions`, go: `${base}/quiz` },
    { icon: 'pencil-box-outline', label: 'Exercices', sub: 'Avec correction', go: `${base}/exercices`, show: exercises || has((c) => c.examples) },
    { icon: 'star-four-points-outline', label: 'Récaps', sub: 'À retenir, pièges', go: `${base}/liste?kind=recap`, show: has((c) => c.hasRecap) },
    { icon: 'alert-outline', label: 'Pièges d’examen', sub: 'Ce qui fait perdre des points', go: `${base}/liste?kind=traps`, show: has((c) => c.traps) },
    { icon: 'calculator-variant-outline', label: 'Calculateurs', sub: 'Interactifs', go: `${base}/liste?kind=calc`, show: has((c) => c.widgets.length) },
    { icon: 'sigma', label: 'Aide-mémoire', sub: 'Toutes les formules', go: `${base}/lire?ch=formules`, show: has((c) => c.id === 'formules') },
    { icon: 'file-document-outline', label: 'Antisèche', sub: 'Recto verso', go: `${base}/antiseche`, show: course.antiseche },
    { icon: 'presentation', label: 'Slides', sub: slides ? `${slides} PDF` : 'À ajouter', go: `${base}/slides` },
  ] satisfies Tool[]).filter((t) => !('show' in t) || t.show);

  return (
    <Screen>
      <Stack.Screen options={{ title: course.code }} />
      <Header />
      <View style={s.grid}>
        {tools.map((t) => (
          <Pressable key={t.label} onPress={() => router.push(t.go as never)} style={({ pressed }) => [s.tool, pressed && { opacity: 0.7 }]}>
            <View style={[s.toolIcon, { backgroundColor: course.color + '1c' }]}>
              <Icon name={t.icon} size={22} color={course.color} />
            </View>
            <Text style={s.toolLabel}>{t.label}</Text>
            <Text style={s.toolSub}>{t.sub}</Text>
          </Pressable>
        ))}
      </View>

      <H2>Chapitres</H2>
      {stats.map((st) => {
        const ch = course.chapters.find((c) => c.id === st.id)!;
        return (
          <Card key={st.id} onPress={() => router.push(`${base}/chapitre?ch=${st.id}`)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Text style={[s.eyebrow, { color: course.color }]}>{ch.eyebrow}</Text>
              {ch.hot && <Text style={[s.hot, { color: p.bad }]}>★ Signalé par le prof</Text>}
              <View style={{ flex: 1 }} />
              {st.read && <Icon name="check-circle" size={18} color={p.good} />}
            </View>
            <Text style={s.chTitle}>{ch.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <View style={{ flex: 1 }}>
                <Bar value={st.level} color={course.color} />
              </View>
              <Text style={s.level}>{Math.round(st.level * 100)} %</Text>
            </View>
          </Card>
        );
      })}
    </Screen>
  );

  function Header() {
    return (
      <View style={[s.hero, { backgroundColor: course.color }]}>
        <Text style={s.heroCode}>{course.code}</Text>
        <Text style={s.heroTitle}>{course.title}</Text>
        <Text style={s.heroSub}>{course.subtitle}</Text>
      </View>
    );
  }
}

const useStyles = makeStyles((p) => ({
  hero: { borderRadius: radius.xl, padding: space.xl, gap: 4 },
  heroCode: { fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: '#ffffffcc', letterSpacing: 1.5 },
  heroTitle: { fontFamily: 'Inter', fontSize: 25, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontFamily: 'Inter', fontSize: 14, color: '#ffffffcc' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.xs },
  tool: {
    width: '48.6%',
    backgroundColor: p.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: p.line,
    padding: 14,
    gap: 3,
  },
  toolIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  toolLabel: { fontFamily: 'Inter', fontSize: 15.5, fontWeight: '700', color: p.text },
  toolSub: { fontFamily: 'Inter', fontSize: 12.5, color: p.muted },
  eyebrow: { fontFamily: 'Inter', fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  hot: { fontFamily: 'Inter', fontSize: 11.5, fontWeight: '700' },
  chTitle: { fontFamily: 'Inter', fontSize: 17, fontWeight: '700', color: p.text, letterSpacing: -0.2 },
  level: { fontFamily: 'Inter', fontSize: 12.5, fontWeight: '700', color: p.muted, width: 40, textAlign: 'right' },
}));
