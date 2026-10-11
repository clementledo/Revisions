import { Text, View } from 'react-native';

import { Bar, Card, H1, H2, Icon, Muted, Screen } from '@/components/ui';
import { COURSES } from '@/lib/courses';
import { useStoreVersion, useStored } from '@/lib/store';
import { chapterStats, dayKey, streak } from '@/lib/study';
import { makeStyles, space, useTheme } from '@/lib/theme';

export default function Progress() {
  useStoreVersion();
  const { p } = useTheme();
  const s = useStyles();
  const [days] = useStored<Record<string, number>>('days', {});
  const ready = COURSES.filter((c) => c.lessons.length);

  // 5 dernières semaines, du lundi au dimanche.
  const start = new Date();
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - 28);
  const weeks = Array.from({ length: 5 }, (_, w) =>
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
    <Screen top>
      <H1>Progrès</H1>
      <View style={s.kpis}>
        <Kpi icon="fire" n={String(streak(days))} l="jours de suite" color={p.warn} />
        <Kpi icon="cards" n={`${mastered}/${cards}`} l="cartes maîtrisées" color={p.accent} />
        <Kpi icon="check-all" n={done ? `${Math.round((ok / done) * 100)} %` : '–'} l="bonnes réponses" color={p.good} />
      </View>

      <Card>
        <Text style={s.cardTitle}>Activité</Text>
        <Muted>{activeDays} jour{activeDays > 1 ? 's' : ''} de révision au total</Muted>
        <View style={{ gap: 6, marginTop: 6 }}>
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
                      { backgroundColor: n ? p.accent : p.surface2, opacity: future ? 0.3 : n ? 0.35 + 0.65 * (n / max) : 1 },
                      dayKey(d) === dayKey() && { borderWidth: 2, borderColor: p.text },
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </Card>

      {weak.length > 0 && (
        <>
          <H2>Points faibles</H2>
          <Card>
            {weak.map(({ c, st }) => (
              <View key={c.id + st.id} style={{ gap: 4, paddingVertical: 4 }}>
                <Text style={s.chTitle}>
                  {c.code} · {st.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                  <View style={{ flex: 1 }}>
                    <Bar value={st.level} color={p.warn} />
                  </View>
                  <Text style={s.pct}>{Math.round(st.level * 100)} %</Text>
                </View>
              </View>
            ))}
          </Card>
        </>
      )}

      {ready.map((c) => (
        <View key={c.id} style={{ gap: space.sm }}>
          <H2>{`${c.code} · par chapitre`}</H2>
          <Card>
            {chapterStats(c).map((st) => (
              <View key={st.id} style={{ gap: 4, paddingVertical: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[s.chTitle, { flex: 1 }]} numberOfLines={1}>
                    {st.title}
                  </Text>
                  {st.read && <Icon name="book-check" size={16} color={p.good} />}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                  <View style={{ flex: 1 }}>
                    <Bar value={st.level} color={c.color} />
                  </View>
                  <Text style={s.pct}>{Math.round(st.level * 100)} %</Text>
                </View>
                <Text style={s.detail}>
                  Cartes {st.mastered}/{st.cards} · QCM {st.quizOk}/{st.quizTotal}
                </Text>
              </View>
            ))}
          </Card>
        </View>
      ))}
    </Screen>
  );

  function Kpi({ icon, n, l, color }: { icon: 'fire' | 'cards' | 'check-all'; n: string; l: string; color: string }) {
    return (
      <View style={s.kpi}>
        <Icon name={icon} size={20} color={color} />
        <Text style={s.kpiN}>{n}</Text>
        <Text style={s.kpiL}>{l}</Text>
      </View>
    );
  }
}

const useStyles = makeStyles((p) => ({
  kpis: { flexDirection: 'row', gap: space.sm },
  kpi: { flex: 1, backgroundColor: p.surface, borderWidth: 1, borderColor: p.line, borderRadius: 16, padding: 12, gap: 2 },
  kpiN: { fontFamily: 'Inter', fontSize: 20, fontWeight: '800', color: p.text, marginTop: 4 },
  kpiL: { fontFamily: 'Inter', fontSize: 12, color: p.muted },
  cardTitle: { fontFamily: 'Inter', fontSize: 16, fontWeight: '700', color: p.text },
  week: { flexDirection: 'row', gap: 6 },
  dayLabel: { flex: 1, textAlign: 'center', fontFamily: 'Inter', fontSize: 11, color: p.muted, fontWeight: '600' },
  cell: { flex: 1, aspectRatio: 1, borderRadius: 6 },
  chTitle: { fontFamily: 'Inter', fontSize: 14.5, fontWeight: '600', color: p.text },
  pct: { fontFamily: 'Inter', fontSize: 12.5, fontWeight: '700', color: p.muted, width: 40, textAlign: 'right' },
  detail: { fontFamily: 'Inter', fontSize: 12, color: p.muted },
}));
