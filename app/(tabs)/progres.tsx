import { Text, View } from 'react-native';

import { Bar, Card, Group, Icon, Ring, RingLabel, Screen, Section, type IconName } from '@/components/ui';
import { COURSES } from '@/lib/courses';
import { useStoreVersion, useStored } from '@/lib/store';
import { chapterStats, courseProgress, dayKey, streak } from '@/lib/study';
import { alpha, makeStyles, radius, shadow, space, tone, type, useTheme } from '@/lib/theme';

export default function Progress() {
  useStoreVersion();
  const { p } = useTheme();
  const s = useStyles();
  const [days] = useStored<Record<string, number>>('days', {});
  const ready = COURSES.filter((c) => c.lessons.length);

  // 6 dernières semaines, du lundi au dimanche.
  const start = new Date();
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - 35);
  const weeks = Array.from({ length: 6 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const x = new Date(start);
      x.setDate(start.getDate() + w * 7 + d);
      return x;
    }),
  );
  const max = Math.max(1, ...Object.values(days));
  const activeDays = Object.keys(days).length;
  const all = ready.flatMap((c) => chapterStats(c).map((st) => ({ c, st })));
  const mastered = all.reduce((a, x) => a + x.st.mastered, 0);
  const cards = all.reduce((a, x) => a + x.st.cards, 0);
  const done = all.reduce((a, x) => a + x.st.quizDone, 0);
  const ok = all.reduce((a, x) => a + x.st.quizOk, 0);
  const weak = all
    .filter((x) => x.st.quizDone > 0 || x.st.mastered > 0)
    .sort((a, b) => a.st.level - b.st.level)
    .slice(0, 3);

  return (
    <Screen title="Progrès" overline={`${activeDays} jour${activeDays > 1 ? 's' : ''} de révision`}>
      <View style={s.kpis}>
        <Kpi icon="fire" n={String(streak(days))} l="jours de suite" color={p.warn} />
        <Kpi icon="cards" n={`${mastered}`} l={`cartes maîtrisées sur ${cards}`} color={p.accent} />
        <Kpi icon="check-all" n={done ? `${Math.round((ok / done) * 100)} %` : '–'} l="bonnes réponses" color={p.good} />
      </View>

      <Section title="Activité">
        <Card>
          <View style={{ gap: 6 }}>
            <View style={s.week}>
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <Text key={i} style={s.dayLabel}>
                  {d}
                </Text>
              ))}
            </View>
            {weeks.map((w, i) => (
              <View key={i} style={s.week}>
                {w.map((d) => {
                  const n = days[dayKey(d)] ?? 0;
                  const future = d > new Date();
                  return (
                    <View
                      key={dayKey(d)}
                      style={[
                        s.cell,
                        { backgroundColor: n ? alpha(p.accent, 0.3 + 0.7 * (n / max)) : p.surface2, opacity: future ? 0.35 : 1 },
                        dayKey(d) === dayKey() && { borderWidth: 2, borderColor: p.accent },
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
          <View style={s.legend}>
            <Text style={s.legendText}>Moins</Text>
            {[0, 0.35, 0.6, 1].map((v) => (
              <View key={v} style={[s.legendCell, { backgroundColor: v ? alpha(p.accent, 0.3 + 0.7 * v) : p.surface2 }]} />
            ))}
            <Text style={s.legendText}>Plus</Text>
          </View>
        </Card>
      </Section>

      {weak.length > 0 && (
        <Section title="À retravailler">
          <Card style={{ gap: 14 }}>
            {weak.map(({ c, st }) => (
              <View key={c.id + st.id} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                  <Text style={[s.code, { color: tone(c.color, p) }]}>{c.code}</Text>
                  <Text style={[s.chTitle, { flex: 1 }]} numberOfLines={1}>
                    {st.title}
                  </Text>
                  <Text style={s.pct}>{Math.round(st.level * 100)} %</Text>
                </View>
                <Bar value={st.level} color={p.warn} />
              </View>
            ))}
          </Card>
        </Section>
      )}

      {ready.map((c) => {
        const col = tone(c.color, p);
        const prog = courseProgress(c);
        return (
          <Section key={c.id} title={`${c.code} · par chapitre`}>
            <Group inset={16}>
              <View style={s.courseHead}>
                <Ring value={prog.level} size={54} stroke={5} color={col}>
                  <RingLabel value={prog.level} size={12.5} />
                </Ring>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={s.courseTitle}>{c.title}</Text>
                  <Text style={s.detail}>
                    Lu {Math.round(prog.read * 100)} % · maîtrise {Math.round(prog.level * 100)} %
                  </Text>
                </View>
              </View>
              {chapterStats(c).map((st) => (
                <View key={st.id} style={s.ch}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[s.chTitle, { flex: 1 }]} numberOfLines={1}>
                      {st.title}
                    </Text>
                    {st.read && <Icon name="check-circle" size={15} color={p.good} />}
                    <Text style={s.pct}>{Math.round(st.level * 100)} %</Text>
                  </View>
                  <Bar value={st.level} color={col} height={5} />
                  <Text style={s.detail}>
                    Cartes {st.mastered}/{st.cards} · QCM {st.quizOk}/{st.quizTotal}
                  </Text>
                </View>
              ))}
            </Group>
          </Section>
        );
      })}
    </Screen>
  );

  function Kpi({ icon, n, l, color }: { icon: IconName; n: string; l: string; color: string }) {
    return (
      <View style={[s.kpi, shadow(p)]}>
        <View style={[s.kpiIcon, { backgroundColor: alpha(color, p.dark ? 0.2 : 0.13) }]}>
          <Icon name={icon} size={18} color={color} />
        </View>
        <Text style={s.kpiN} numberOfLines={1} adjustsFontSizeToFit>
          {n}
        </Text>
        <Text style={s.kpiL}>{l}</Text>
      </View>
    );
  }
}

const useStyles = makeStyles((p) => ({
  kpis: { flexDirection: 'row', gap: 10 },
  kpi: {
    flex: 1,
    backgroundColor: p.surface,
    borderWidth: p.dark ? 1 : 0,
    borderColor: p.line,
    borderRadius: radius.lg,
    padding: 14,
    gap: 2,
  },
  kpiIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  kpiN: { ...type.number, color: p.text },
  kpiL: { ...type.caption, fontSize: 12, color: p.muted },
  week: { flexDirection: 'row', gap: 6 },
  dayLabel: { flex: 1, textAlign: 'center', fontFamily: 'Inter', fontSize: 11, color: p.muted, fontWeight: '600' },
  cell: { flex: 1, aspectRatio: 1, borderRadius: 7 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: space.sm },
  legendText: { ...type.caption, fontSize: 11, color: p.muted, marginHorizontal: 2 },
  legendCell: { width: 12, height: 12, borderRadius: 3 },
  code: { ...type.overline, fontSize: 10.5 },
  chTitle: { fontFamily: 'Inter', fontSize: 14.5, fontWeight: '600', color: p.text },
  pct: { fontFamily: 'Inter', fontSize: 12.5, fontWeight: '700', color: p.muted, minWidth: 40, textAlign: 'right' },
  detail: { ...type.caption, color: p.muted },
  courseHead: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: space.lg },
  courseTitle: { ...type.headline, fontSize: 16.5, color: p.text },
  ch: { paddingHorizontal: space.lg, paddingVertical: 12, gap: 6 },
}));
