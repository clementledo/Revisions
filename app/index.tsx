import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UpdateBanner } from '@/components/UpdateBanner';
import { Icon, type IconName } from '@/components/ui';
import { ACTIVE } from '@/lib/courses';
import { makeStyles, radius, space, tone, toneSoft, type, useTheme } from '@/lib/theme';

/** Accueil : la liste des cours, rien d'autre. Recherche, progrès et réglages sont en haut à droite. */
export default function Home() {
  const router = useRouter();
  const { p } = useTheme();
  const s = useStyles();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: p.bg }} contentContainerStyle={[s.content, { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + 48 }]}>
      <View style={s.head}>
        <Text style={s.title}>Révisions</Text>
        <View style={s.actions}>
          <Action icon="magnify" label="Rechercher" onPress={() => router.push('/recherche')} />
          <Action icon="chart-box-outline" label="Progrès" onPress={() => router.push('/progres')} />
          <Action icon="cog-outline" label="Paramètres" onPress={() => router.push('/parametres')} />
        </View>
      </View>

      <UpdateBanner />

      <View style={s.list}>
        {ACTIVE.map((c, i) => (
          <Pressable
            key={c.id}
            onPress={() => router.push(`/cours/${c.id}`)}
            style={({ pressed }) => [s.row, i > 0 && s.rowSep, pressed && { opacity: 0.6 }]}>
            <View style={[s.tile, { backgroundColor: toneSoft(c.color, p) }]}>
              <Icon name={c.icon as IconName} size={22} color={tone(c.color, p)} />
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={s.code}>{c.code}</Text>
              <Text style={s.name} numberOfLines={2}>
                {c.title}
              </Text>
            </View>
            <Icon name="chevron-right" size={22} color={p.muted} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );

  function Action({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
    return (
      <Pressable onPress={onPress} hitSlop={6} accessibilityLabel={label} style={({ pressed }) => [s.action, pressed && { backgroundColor: p.surface }]}>
        <Icon name={icon} size={23} color={p.text} />
      </Pressable>
    );
  }
}

const useStyles = makeStyles((p) => ({
  content: { paddingHorizontal: 20, gap: space.xl },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  title: { ...type.display, color: p.text },
  actions: { flexDirection: 'row', gap: 2, marginRight: -8 },
  action: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  list: { marginTop: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  rowSep: { borderTopWidth: 1, borderTopColor: p.line },
  tile: { width: 44, height: 44, borderRadius: radius.sm + 2, alignItems: 'center', justifyContent: 'center' },
  code: { ...type.caption, color: p.muted, fontWeight: '600', letterSpacing: 0.4 },
  name: { ...type.headline, fontSize: 17, color: p.text },
}));
