import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { CourseCard } from '@/components/CourseCard';
import { UpdateBanner } from '@/components/UpdateBanner';
import { Button, Card, H2, Icon, Screen } from '@/components/ui';
import { COURSES } from '@/lib/courses';
import { useStoreVersion, useStored } from '@/lib/store';
import { dueCards, streak } from '@/lib/study';
import { makeStyles, space, useTheme } from '@/lib/theme';

const today = () =>
  new Date().toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, (c) => c.toUpperCase());

export default function Home() {
  useStoreVersion();
  const router = useRouter();
  const { p } = useTheme();
  const s = useStyles();
  const [days] = useStored<Record<string, number>>('days', {});
  const st = streak(days);
  const dues = COURSES.map((c) => ({ c, n: dueCards(c).length }));
  const totalDue = dues.reduce((a, d) => a + d.n, 0);

  return (
    <Screen top>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.date}>{today()}</Text>
          <Text style={s.hello}>Bonjour Clement</Text>
        </View>
        <Pressable onPress={() => router.push('/parametres')} hitSlop={10} style={s.gear}>
          <Icon name="cog-outline" size={24} color={p.muted} />
        </Pressable>
      </View>

      <UpdateBanner />

      <Card tint={p.accentSoft} style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={[s.flame, { backgroundColor: p.accent }]}>
            <Icon name="fire" size={22} color={p.onAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.big, { color: p.accent }]}>{st} jour{st > 1 ? 's' : ''} de suite</Text>
            <Text style={s.sub}>{totalDue ? `${totalDue} cartes à revoir aujourd'hui` : 'Rien à revoir, bravo !'}</Text>
          </View>
        </View>
        {totalDue > 0 && <Button label="Réviser mes cartes" icon="cards" onPress={() => router.push('/cartes?course=all')} />}
      </Card>

      <H2>Mes cours</H2>
      {dues.map(({ c, n }) => (
        <CourseCard key={c.id} course={c} due={n} onPress={() => router.push(`/cours/${c.id}`)} />
      ))}
    </Screen>
  );
}

const useStyles = makeStyles((p) => ({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm },
  date: { fontFamily: 'Inter', fontSize: 14, color: p.muted, fontWeight: '500' },
  hello: { fontFamily: 'Inter', fontSize: 30, fontWeight: '800', color: p.text, letterSpacing: -0.8 },
  gear: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: p.surface },
  flame: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  big: { fontFamily: 'Inter', fontSize: 18, fontWeight: '800' },
  sub: { fontFamily: 'Inter', fontSize: 14, color: p.muted },
}));
