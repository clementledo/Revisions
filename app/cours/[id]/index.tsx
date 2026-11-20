import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, type IconName } from '@/components/ui';
import { courseById, examLabel } from '@/lib/courses';
import { allDocs, importDocs } from '@/lib/docs';
import { useStoreVersion } from '@/lib/store';
import { chapterStats } from '@/lib/study';
import { makeStyles, space, type, useTheme } from '@/lib/theme';

type Tool = { icon: IconName; label: string; go: string; show?: unknown };

/** Page d'un cours : une liste simple d'outils, puis les chapitres. Les chiffres sont dans Progrès. */
export default function CourseScreen() {
  useStoreVersion();
  const { id } = useLocalSearchParams<{ id: string }>();
  const course = courseById(id)!;
  const router = useRouter();
  const { p } = useTheme();
  const s = useStyles();
  const insets = useSafeAreaInsets();
  const docs = allDocs().filter((d) => d.course === id);
  const base = `/cours/${id}`;

  const header = (
    <View style={s.head}>
      <Text style={s.code}>{course.code}</Text>
      <Text style={s.title}>{course.title}</Text>
      {!!course.exam && <Text style={s.sub}>Examen le {examLabel(course)}</Text>}
    </View>
  );

  if (!course.lessons.length) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: p.bg }} contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 48 }]}>
        <Stack.Screen options={{ title: '' }} />
        {header}
        <Text style={s.sub}>Contenu à venir.</Text>
        <Button label="Ajouter des slides" icon="file-pdf-box" kind="soft" onPress={() => importDocs({ course: id })} />
        {docs.length > 0 && <Button label="Mes documents" kind="ghost" onPress={() => router.push(`${base}/slides`)} />}
      </ScrollView>
    );
  }

  const stats = chapterStats(course);
  const has = (f: (ch: (typeof course.chapters)[number]) => unknown) => course.chapters.some(f);
  const exercises = course.questions.filter((q) => q.t === 'ex').length;
  const next = stats.find((x) => !x.read) ?? stats[0];
  const tools = (
    [
      { icon: 'book-open-variant', label: stats.some((x) => x.read) ? 'Reprendre la lecture' : 'Lire le cours', go: `${base}/lire?ch=${next.id}` },
      { icon: 'cards-outline', label: 'Cartes mémoire', go: `/cartes?course=${id}` },
      { icon: 'format-list-checks', label: 'QCM', go: `${base}/quiz`, show: course.questions.length > exercises },
      { icon: 'pencil-outline', label: 'Exercices corrigés', go: `${base}/exercices`, show: exercises || has((ch) => ch.examples) },
      { icon: 'sort-variant', label: 'Tableaux à trier', go: `${base}/tri`, show: course.sorts?.length },
      { icon: 'timer-outline', label: 'Examen blanc', go: `${base}/lire?ch=blanc`, show: has((ch) => ch.id === 'blanc') },
      { icon: 'star-four-points-outline', label: 'Récapitulatifs', go: `${base}/liste?kind=recap`, show: has((ch) => ch.hasRecap) },
      { icon: 'alert-outline', label: 'Pièges d’examen', go: `${base}/liste?kind=traps`, show: has((ch) => ch.traps) },
      { icon: 'calculator-variant-outline', label: 'Calculs', go: `${base}/liste?kind=calc`, show: has((ch) => ch.widgets.length) },
      { icon: 'sigma', label: 'Formules', go: `${base}/lire?ch=formules`, show: has((ch) => ch.id === 'formules') },
      { icon: 'file-document-outline', label: 'Antisèche', go: `${base}/antiseche`, show: course.antiseche },
      { icon: 'presentation', label: 'Slides', go: `${base}/slides` },
      { icon: 'play-circle-outline', label: 'Vidéos et ressources', go: `${base}/lire?ch=liens`, show: has((ch) => ch.id === 'liens') },
    ] satisfies Tool[]
  ).filter((t) => !('show' in t) || t.show);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: p.bg }} contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 48 }]}>
      <Stack.Screen options={{ title: '' }} />
      {header}

      <View style={s.group}>
        {tools.map((t, i) => (
          <Pressable
            key={t.label}
            onPress={() => router.push(t.go as never)}
            style={({ pressed }) => [s.row, i > 0 && s.sep, pressed && { backgroundColor: p.surface2 }]}>
            <Icon name={t.icon} size={21} color={p.accent} />
            <Text style={s.rowText}>{t.label}</Text>
            <Icon name="chevron-right" size={20} color={p.muted} />
          </Pressable>
        ))}
      </View>

      <View style={{ gap: space.sm }}>
        <Text style={s.label}>Chapitres</Text>
        <View style={s.group}>
          {stats.map((st, i) => {
            const ch = course.chapters.find((x) => x.id === st.id)!;
            return (
              <Pressable
                key={st.id}
                onPress={() => router.push(`${base}/chapitre?ch=${st.id}`)}
                style={({ pressed }) => [s.row, i > 0 && s.sep, pressed && { backgroundColor: p.surface2 }]}>
                <View style={s.dot}>{st.read ? <Icon name="check" size={16} color={p.accent} /> : <Text style={s.num}>{i + 1}</Text>}</View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={s.rowText} numberOfLines={2}>
                    {ch.title}
                    {ch.hot ? ' ★' : ''}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={p.muted} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((p) => ({
  content: { paddingHorizontal: 20, paddingTop: space.sm, gap: space.xl },
  head: { gap: 4 },
  code: { ...type.caption, color: p.muted, fontWeight: '600', letterSpacing: 0.4 },
  title: { ...type.display, fontSize: 30, lineHeight: 36, color: p.text },
  sub: { ...type.callout, color: p.muted },
  label: { ...type.caption, color: p.muted, fontWeight: '600', letterSpacing: 0.4, paddingHorizontal: 4 },
  group: { backgroundColor: p.surface, borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16 },
  sep: { borderTopWidth: 1, borderTopColor: p.line },
  rowText: { ...type.body, flex: 1, color: p.text },
  rowSub: { ...type.caption, color: p.muted },
  dot: { width: 22, alignItems: 'center' },
  num: { ...type.callout, color: p.muted, fontWeight: '600' },
}));
