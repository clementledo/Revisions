import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { CourseCard } from '@/components/CourseCard';
import { UpdateBanner } from '@/components/UpdateBanner';
import { Card, Gradient, Icon, Press, Ring, Screen, Section, type IconName } from '@/components/ui';
import { COURSES, daysToExam, examLabel } from '@/lib/courses';
import { useStoreVersion, useStored } from '@/lib/store';
import { courseProgress, dayKey, dueCards, streak } from '@/lib/study';
import { makeStyles, radius, shadow, space, tone, toneSoft, type, useTheme } from '@/lib/theme';

/** Objectif quotidien : cartes notées + questions répondues + chapitres lus. */
const GOAL = 30;

const today = () =>
  new Date().toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, (c) => c.toUpperCase());

const hello = () => {
  const h = new Date().getHours();
  return h < 5 || h >= 18 ? 'Bonsoir' : 'Bonjour';
};

export default function Home() {
  useStoreVersion();
  const router = useRouter();
  const { p } = useTheme();
  const s = useStyles();
  const [days] = useStored<Record<string, number>>('days', {});
  const st = streak(days);
  const done = days[dayKey()] ?? 0;
  const dues = COURSES.map((c) => ({ c, n: dueCards(c).length }));
  const totalDue = dues.reduce((a, d) => a + d.n, 0);
  const exams = COURSES.map((c) => ({ c, d: daysToExam(c) }))
    .filter((x): x is { c: (typeof COURSES)[number]; d: number } => x.d != null && x.d <= 45)
    .sort((a, b) => a.d - b.d);

  return (
    <Screen
      overline={today()}
      title={`${hello()} Clement`}
      right={
        <Pressable onPress={() => router.push('/parametres')} hitSlop={10} style={[s.avatar, shadow(p)]}>
          <Icon name="cog-outline" size={22} color={p.text2} />
        </Pressable>
      }>
      <UpdateBanner />

      {/* ---------- séance du jour */}
      <View style={[s.hero, shadow(p, 2)]}>
        <Gradient colors={p.hero} id="home" />
        <View style={s.heroTop}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.heroOver}>Aujourd’hui</Text>
            <Text style={s.heroBig}>
              {totalDue ? `${totalDue} carte${totalDue > 1 ? 's' : ''}` : 'Tout est à jour'}
            </Text>
            <Text style={s.heroSub}>
              {totalDue ? `à revoir · environ ${Math.max(1, Math.round((Math.min(totalDue, 25) * 12) / 60))} min pour une séance` : 'Aucune carte à revoir. Un QCM pour garder la main ?'}
            </Text>
          </View>
          <Ring value={done / GOAL} size={74} stroke={7} color="#ffffff" track="rgba(255,255,255,0.22)">
            <Text style={s.ringN}>{done}</Text>
            <Text style={s.ringL}>/ {GOAL}</Text>
          </Ring>
        </View>
        <View style={s.heroBottom}>
          <View style={s.streak}>
            <Icon name="fire" size={16} color="#ffd27a" />
            <Text style={s.streakText}>
              {st ? `${st} jour${st > 1 ? 's' : ''} de suite` : 'Commence ta série'}
            </Text>
          </View>
          <Press onPress={() => router.push(totalDue ? '/cartes?course=all' : '/reviser')} style={s.heroButton}>
            <Text style={[s.heroButtonText, { color: p.hero[0] }]}>{totalDue ? 'Commencer' : 'Réviser'}</Text>
            <Icon name="arrow-right" size={18} color={p.hero[0]} />
          </Press>
        </View>
      </View>

      {/* ---------- examens à venir */}
      {exams.map(({ c, d }) => {
        const prog = courseProgress(c);
        const hot = c.chapters.filter((ch) => ch.hot).length;
        const col = tone(c.color, p);
        return (
          <Card key={c.id} onPress={() => router.push(`/cours/${c.id}`)} style={s.exam}>
            <View style={[s.examDays, { backgroundColor: toneSoft(c.color, p) }]}>
              <Text style={[s.examN, { color: col }]}>{d}</Text>
              <Text style={[s.examJ, { color: col }]}>{d > 1 ? 'jours' : 'jour'}</Text>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={s.examTitle}>
                {d === 0 ? 'Examen aujourd’hui' : d === 1 ? 'Examen demain' : 'Examen final'} · {c.code}
              </Text>
              <Text style={s.examSub}>
                {examLabel(c)}
                {hot ? ` · ${hot} parties ★ du prof` : ''}
              </Text>
              <View style={s.examBarRow}>
                <View style={[s.examTrack, { backgroundColor: p.surface2 }]}>
                  <View style={{ width: `${Math.round(prog.level * 100)}%`, height: 5, borderRadius: 5, backgroundColor: col }} />
                </View>
                <Text style={s.examPct}>maîtrise {Math.round(prog.level * 100)} %</Text>
              </View>
            </View>
          </Card>
        );
      })}

      {/* ---------- raccourcis */}
      <View style={s.quick}>
        <Quick icon="format-list-checks" label="QCM" onPress={() => router.push('/reviser')} />
        <Quick icon="magnify" label="Chercher" onPress={() => router.push('/recherche')} />
        <Quick icon="chart-arc" label="Progrès" onPress={() => router.push('/progres')} />
      </View>

      <Section title="Mes cours">
        {dues.map(({ c, n }) => (
          <CourseCard key={c.id} course={c} due={n} onPress={() => router.push(`/cours/${c.id}`)} />
        ))}
      </Section>
    </Screen>
  );

  function Quick({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
    return (
      <Press onPress={onPress} style={[s.quickItem, shadow(p)]}>
        <Icon name={icon} size={20} color={p.accent} />
        <Text style={s.quickText}>{label}</Text>
      </Press>
    );
  }
}

const useStyles = makeStyles((p) => ({
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: p.surface,
    borderWidth: p.dark ? 1 : 0,
    borderColor: p.line,
  },
  hero: { borderRadius: radius.xl, overflow: 'hidden', padding: 20, gap: 18, backgroundColor: p.hero[0] },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  heroOver: { ...type.overline, color: 'rgba(255,255,255,0.75)' },
  heroBig: { ...type.title, fontSize: 27, color: '#ffffff' },
  heroSub: { ...type.callout, color: 'rgba(255,255,255,0.82)' },
  ringN: { fontFamily: 'Inter', fontSize: 20, fontWeight: '800', color: '#fff', lineHeight: 22 },
  ringL: { fontFamily: 'Inter', fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  heroBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.16)', borderRadius: 99, paddingHorizontal: 11, paddingVertical: 6 },
  streakText: { fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: '#fff' },
  heroButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ffffff', borderRadius: 99, paddingHorizontal: 18, paddingVertical: 10 },
  heroButtonText: { fontFamily: 'Inter', fontSize: 15, fontWeight: '800' },
  exam: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  examDays: { width: 62, height: 62, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  examN: { fontFamily: 'Inter', fontSize: 24, fontWeight: '800', letterSpacing: -0.8, lineHeight: 27 },
  examJ: { fontFamily: 'Inter', fontSize: 11, fontWeight: '700' },
  examTitle: { ...type.bodyStrong, color: p.text },
  examSub: { ...type.caption, color: p.muted },
  examBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  examTrack: { flex: 1, height: 5, borderRadius: 5, overflow: 'hidden' },
  examPct: { ...type.caption, fontSize: 11.5, color: p.muted, fontWeight: '600' },
  quick: { flexDirection: 'row', gap: space.sm },
  quickItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: p.surface,
    borderRadius: radius.md,
    paddingVertical: 12,
    borderWidth: p.dark ? 1 : 0,
    borderColor: p.line,
  },
  quickText: { fontFamily: 'Inter', fontSize: 13.5, fontWeight: '700', color: p.text },
}));
