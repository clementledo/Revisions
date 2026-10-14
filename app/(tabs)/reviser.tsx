import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, Card, Group, Icon, Press, Ring, Row, Screen, Section, type IconName } from '@/components/ui';
import { COURSES } from '@/lib/courses';
import { useStoreVersion } from '@/lib/store';
import { chapterStats, dueCards } from '@/lib/study';
import { makeStyles, radius, shadow, tone, toneSoft, type, useTheme } from '@/lib/theme';

export default function Review() {
  useStoreVersion();
  const router = useRouter();
  const { p } = useTheme();
  const s = useStyles();
  const ready = COURSES.filter((c) => c.lessons.length);
  const totalDue = ready.reduce((a, c) => a + dueCards(c).length, 0);

  return (
    <Screen title="Réviser" overline="Cartes, QCM, exercices">
      <Card style={s.due}>
        <View style={[s.dueIcon, { backgroundColor: p.accentSoft }]}>
          <Icon name="cards" size={24} color={p.accent} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={s.dueTitle}>{totalDue ? `${totalDue} carte${totalDue > 1 ? 's' : ''} à revoir` : 'Cartes à jour'}</Text>
          <Text style={s.dueSub}>Elles reviennent au bon moment selon ce que tu oublies.</Text>
        </View>
      </Card>
      {totalDue > 0 && <Button label="Lancer les cartes du jour" icon="play" size="lg" onPress={() => router.push('/cartes?course=all')} />}

      {ready.map((c) => {
        const col = tone(c.color, p);
        const weak = chapterStats(c)
          .filter((st) => st.quizDone > 0 || st.mastered > 0)
          .sort((a, b) => a.level - b.level)[0];
        const ch = weak && c.chapters.find((x) => x.id === weak.id);
        const due = dueCards(c).length;
        const tools: { icon: IconName; label: string; go: string }[] = [
          { icon: 'cards-outline', label: 'Cartes', go: `/cartes?course=${c.id}` },
          { icon: 'format-list-checks', label: 'QCM', go: `/cours/${c.id}/quiz` },
          { icon: 'pencil-outline', label: 'Exercices', go: `/cours/${c.id}/exercices` },
          { icon: 'star-four-points-outline', label: 'Récaps', go: `/cours/${c.id}/liste?kind=recap` },
        ];
        return (
          <Section key={c.id} title={`${c.code} · ${c.title}`}>
            <View style={s.tools}>
              {tools.map((t) => (
                <Press key={t.label} onPress={() => router.push(t.go as never)} style={[s.tool, shadow(p)]}>
                  <View style={[s.toolIcon, { backgroundColor: toneSoft(c.color, p) }]}>
                    <Icon name={t.icon} size={22} color={col} />
                    {t.label === 'Cartes' && due > 0 && (
                      <View style={[s.badge, { backgroundColor: col }]}>
                        <Text style={[s.badgeText, { color: p.dark ? '#0b0d12' : '#fff' }]}>{due > 99 ? '99+' : due}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.toolLabel}>{t.label}</Text>
                </Press>
              ))}
            </View>
            <Group>
              {ch && (
                <Row
                  title={`Point faible · ${ch.eyebrow}`}
                  sub={`${ch.title} · QCM ciblé`}
                  onPress={() => router.push(`/cours/${c.id}/quiz?ch=${ch.id}`)}
                  leading={
                    <Ring value={weak.level} size={36} stroke={3.5} color={p.warn}>
                      <Icon name="target" size={16} color={p.warn} />
                    </Ring>
                  }
                />
              )}
              {c.chapters.some((x) => x.traps) && (
                <Row icon="alert-outline" color={c.color} title="Pièges d’examen" onPress={() => router.push(`/cours/${c.id}/liste?kind=traps`)} />
              )}
              {c.antiseche && <Row icon="file-document-outline" color={c.color} title="Antisèche" sub="Recto verso, en PDF" onPress={() => router.push(`/cours/${c.id}/antiseche`)} />}
            </Group>
          </Section>
        );
      })}
    </Screen>
  );
}

const useStyles = makeStyles((p) => ({
  due: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dueIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dueTitle: { ...type.headline, color: p.text },
  dueSub: { ...type.caption, color: p.muted },
  tools: { flexDirection: 'row', gap: 10 },
  tool: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    backgroundColor: p.surface,
    borderRadius: radius.lg,
    paddingVertical: 14,
    borderWidth: p.dark ? 1 : 0,
    borderColor: p.line,
  },
  toolIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  toolLabel: { fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: p.text },
  badge: { position: 'absolute', top: -6, right: -8, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: 'Inter', fontSize: 11, fontWeight: '800' },
}));
