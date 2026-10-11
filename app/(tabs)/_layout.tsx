import { Tabs } from 'expo-router';

import { Icon, type IconName } from '@/components/ui';
import { useTheme } from '@/lib/theme';

const TABS: { name: string; title: string; icon: IconName; active: IconName }[] = [
  { name: 'index', title: 'Accueil', icon: 'home-outline', active: 'home' },
  { name: 'reviser', title: 'Réviser', icon: 'cards-outline', active: 'cards' },
  { name: 'recherche', title: 'Recherche', icon: 'magnify', active: 'magnify' },
  { name: 'progres', title: 'Progrès', icon: 'chart-box-outline', active: 'chart-box' },
];

export default function TabsLayout() {
  const { p } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: p.accent,
        tabBarInactiveTintColor: p.muted,
        tabBarStyle: { backgroundColor: p.surface, borderTopColor: p.line },
        tabBarLabelStyle: { fontFamily: 'Inter', fontSize: 11.5, fontWeight: '600' },
      }}>
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ focused, color }) => <Icon name={focused ? t.active : t.icon} size={24} color={color as string} />,
          }}
        />
      ))}
    </Tabs>
  );
}
