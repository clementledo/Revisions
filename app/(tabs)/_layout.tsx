import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui';
import { alpha, useTheme } from '@/lib/theme';

const TABS: { name: string; title: string; icon: IconName; active: IconName }[] = [
  { name: 'index', title: 'Accueil', icon: 'home-variant-outline', active: 'home-variant' },
  { name: 'reviser', title: 'Réviser', icon: 'cards-outline', active: 'cards' },
  { name: 'recherche', title: 'Recherche', icon: 'magnify', active: 'text-search' },
  { name: 'progres', title: 'Progrès', icon: 'chart-box-outline', active: 'chart-box' },
];

export default function TabsLayout() {
  const { p } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: p.text,
        tabBarInactiveTintColor: p.muted,
        tabBarStyle: {
          backgroundColor: p.surface,
          borderTopColor: p.line,
          borderTopWidth: 1,
          height: 66 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
          elevation: 0,
        },
        tabBarLabelStyle: { fontFamily: 'Inter', fontSize: 11.5, fontWeight: '600', marginTop: 4 },
        sceneStyle: { backgroundColor: p.bg },
      }}>
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  width: 56,
                  height: 30,
                  borderRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: focused ? alpha(p.accent, p.dark ? 0.24 : 0.13) : 'transparent',
                }}>
                <Icon name={focused ? t.active : t.icon} size={22} color={focused ? p.accent : p.muted} />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
