import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, Empty, Gradient, Group, Icon, Press, Ring, RingLabel, Row, Screen, Section, type IconName } from '@/components/ui';
import { courseById, daysToExam, examLabel } from '@/lib/courses';
import { allDocs, importDocs } from '@/lib/docs';
import { useStoreVersion } from '@/lib/store';
import { chapterStats, courseProgress, dueCards } from '@/lib/study';
import { courseHero, makeStyles, radius, shadow, space, tone, toneSoft, type, useTheme } from '@/lib/theme';

type Tool = { icon: IconName; label: string; sub: string; go: string; show?: unknown };

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
  const c = tone(course.color, p);

  if (!course.lessons.length) {
    return (
      <Screen>
        <Stack.Screen options={{ title: course.code }} />
        <Hero />
        <Empty
          icon="book-open-page-variant-outline"
          title="Contenu à venir"
          sub="Envoie-moi ta page de révision et tes slides de ce cours dans le fil du projet : je les ajoute dans une prochaine version.">
          <Button label="Ajouter des slides" icon="file-pdf-box" kind="soft" color={course.color} onPress={() => importDocs({ course: id })} />
          {docs.length > 0 && <Button label={`Voir mes documents (${docs.length})`} kind="ghost" color={course.color} onPress={() => router.push(`${base}/slides`)} />}
        </Empty>
      </Screen>
    );
  }

  const stats = chapterStats(course);
  const due = dueCards(course).length;
  const has = (f: (ch: (typeof course.chapters)[number]) => unknown) => course.chapters.some(f);
  const exercises = course.questions.filter((q) => q.t === 'ex').length;
  const next = stats.find((x) => !x.read);
  const tools = (
    [
      { icon: 'cards-outline', label: 'Cartes', sub: due ? `${due} à revoir` : 'À jour', go: `/cartes?course=${id}` },
      { icon: 'format-list-checks', label: 'QCM', sub: `${course.questions.length - exercises} questions`, go: `${base}/quiz` },
      { icon: 'pencil-outline', label: 'Exercices', sub: exercises ? `${exercises} corrigés` : 'Avec correction', go: `${base}/exercices`, show: exercises || has((ch) => ch.examples) },
      { icon: 'star-four-points-outline', label: 'Récaps', sub: 'L’essentiel', go: `${base}/liste?kind=recap`, show: has((ch) => ch.hasRecap) },
      { icon: 'alert-outline', label: 'Pièges', sub: 'À l’examen', go: `${base}/liste?kind=traps`, show: has((ch) => ch.traps) },
      { icon: 'calculator-variant-outline', label: 'Calculs', sub: 'Interactifs', go: `${base}/liste?kind=calc`, show: has((ch) => ch.widgets.length) },
      { icon: 'sigma', label: 'Formules', sub: 'Aide-mémoire', go: `${base}/lire?ch=formules`, show: has((ch) => ch.id === 'formules') },
      { icon: 'file-document-outline', label: 'Antisèche', sub: 'Recto verso', go: `${base}/antiseche`, show: course.antiseche },
      { icon: 'presentation', label: 'Slides', sub: slides ? `${slides} PDF` : 'À ajouter', go: `${base}/slides` },
    ] satisfies Tool[]
  ).filter((t) => !('show' in t) || t.show);

  return (
    <Screen>
      <Stack.Screen options={{ title: course.code }} />
      <Hero />

      {next && (
        <Press onPress={() => router.push(`${base}/lire?ch=${next.id}`)} style={[s.resume, shadow(p)]}>
          <View style={[s.resumeIcon, { backgroundColor: c }]}>
            <Icon name="play" size={20} color={p.dark ? '#0b0d12' : '#fff'} />
          </View>
          <View style={{ flex: 1, gap: 1 }}>
            <Text style={s.resumeOver}>{stats.some((x) => x.read) ? 'Reprendre la lecture' : 'Commencer la lecture'}</Text>
            <Text style={s.resumeTitle} numberOfLines={1}>
              {course.chapters.find((ch) => ch.id === next.id)!.eyebrow} · {next.title}
            </Text>
          </View>
          <Icon name="chevron-right" size={22} color={p.muted} />
        </Press>
      )}

      <Section title="Réviser">
        <View style={s.grid}>
          {tools.map((t) => (
            <Press key={t.label} onPress={() => router.push(t.go as never)} style={[s.tool, shadow(p)]}>
              <View style={[s.toolIcon, { backgroundColor: toneSoft(course.color, p) }]}>
                <Icon name={t.icon} size={21} color={c} />
              </View>
              <Text style={s.toolLabel} numberOfLines={1}>
                {t.label}
              </Text>
              <Text style={s.toolSub} numberOfLines={1}>
                {t.sub}
              </Text>
            </Press>
          ))}
        </View>
      </Section>

      <Section title={`Chapitres · ${stats.filter((x) => x.read).length}/${stats.length} lus`}>
        <Group>
          {stats.map((st, i) => {
            const ch = course.chapters.find((x) => x.id === st.id)!;
            return (
              <Row
                key={st.id}
                title={ch.title}
                sub={`${ch.eyebrow}${ch.hot ? '  ·  ★ signalé par le prof' : ''}`}
                onPress={() => router.push(`${base}/chapitre?ch=${st.id}`)}
                leading={
                  <Ring value={st.level} size={38} stroke={3.5} color={c}>
                    {st.read ? <Icon name="check" size={17} color={c} /> : <Text style={s.num}>{i + 1}</Text>}
                  </Ring>
                }
              />
            );
          })}
        </Group>
      </Section>
    </Screen>
  );

  function Hero() {
    const prog = courseProgress(course);
    const d = daysToExam(course);
    const empty = !course.lessons.length;
    return (
      <View style={[s.hero, shadow(p, 2)]}>
        <Gradient colors={courseHero(course.color, p)} id={`hero-${id}`} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={s.heroIcon}>
            <Icon name={course.icon as IconName} size={24} color="#fff" />
          </View>
          <Text style={s.heroCode}>{course.code}</Text>
          <View style={{ flex: 1 }} />
          {d != null && (
            <View style={s.badge}>
              <Icon name="calendar-clock" size={14} color="#fff" />
              <Text style={s.badgeText}>{d === 0 ? 'Examen aujourd’hui' : `Examen dans ${d} j`}</Text>
            </View>
          )}
        </View>
        <View style={{ gap: 4 }}>
          <Text style={s.heroTitle}>{course.title}</Text>
          <Text style={s.heroSub}>{d != null ? `Examen final le ${examLabel(course)}` : course.subtitle}</Text>
        </View>
        {!empty && (
          <View style={s.heroStats}>
            <Ring value={prog.level} size={52} stroke={5} color="#fff" track="rgba(255,255,255,0.22)">
              <RingLabel value={prog.level} size={12.5} />
            </Ring>
            <HeroStat n={`${Math.round(prog.level * 100)} %`} l="maîtrise" />
            <View style={s.heroSep} />
            <HeroStat n={`${Math.round(prog.read * 100)} %`} l="lu" />
            <View style={s.heroSep} />
            <HeroStat n={String(dueCards(course).length)} l="à revoir" />
          </View>
        )}
      </View>
    );
  }

  function HeroStat({ n, l }: { n: string; l: string }) {
    return (
      <View style={{ flex: 1 }}>
        <Text style={s.heroN}>{n}</Text>
        <Text style={s.heroL} numberOfLines={1}>
          {l}
        </Text>
      </View>
    );
  }
}

const useStyles = makeStyles((p) => ({
  hero: { borderRadius: radius.xl, overflow: 'hidden', padding: 20, gap: 16 },
  heroIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  heroCode: { ...type.overline, fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: '#fff' },
  heroTitle: { ...type.title, color: '#fff' },
  heroSub: { ...type.callout, color: 'rgba(255,255,255,0.82)' },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(0,0,0,0.14)',
    borderRadius: radius.lg,
    padding: 12,
  },
  ringLabelLight: { color: '#fff' },
  heroN: { fontFamily: 'Inter', fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  heroL: { fontFamily: 'Inter', fontSize: 11.5, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  heroSep: { width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.2)' },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: p.surface,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: p.dark ? 1 : 0,
    borderColor: p.line,
  },
  resumeIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  resumeOver: { ...type.caption, color: p.muted },
  resumeTitle: { ...type.bodyStrong, color: p.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tool: {
    width: '31.4%',
    flexGrow: 1,
    backgroundColor: p.surface,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 2,
    borderWidth: p.dark ? 1 : 0,
    borderColor: p.line,
  },
  toolIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  toolLabel: { fontFamily: 'Inter', fontSize: 14.5, fontWeight: '700', color: p.text, letterSpacing: -0.2 },
  toolSub: { ...type.caption, fontSize: 12, color: p.muted },
  num: { fontFamily: 'Inter', fontSize: 13, fontWeight: '800', color: p.text2 },
}));
