import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useStored } from '@/lib/store';
import { THEMES, ThemeContext, type ThemeId, type ThemeMode } from '@/lib/theme';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const system = useColorScheme();
  // « theme » = thème clair choisi (ou ancien choix unique), « themeDark » = thème sombre, « themeMode » = clair / sombre / auto.
  const [storedLight, setLight] = useStored<string>('theme', 'porcelaine');
  const [storedDark, setDark] = useStored<string>('themeDark', '');
  const [storedMode, setMode] = useStored<ThemeMode | ''>('themeMode', '');

  const valid = (t: string, dark: boolean) => t in THEMES && THEMES[t as ThemeId].palette.dark === dark;
  // Ancien réglage : un seul thème, parfois sombre.
  const legacyDark = valid(storedLight, true) ? (storedLight as ThemeId) : null;
  const lightId: ThemeId = valid(storedLight, false) ? (storedLight as ThemeId) : 'porcelaine';
  const darkId: ThemeId = valid(storedDark, true) ? (storedDark as ThemeId) : (legacyDark ?? 'minuit');
  const mode: ThemeMode = storedMode || (legacyDark ? 'dark' : 'light');
  const isDark = mode === 'auto' ? system === 'dark' : mode === 'dark';
  const id = isDark ? darkId : lightId;
  const p = THEMES[id].palette;

  const ctx = useMemo(
    () => ({
      id,
      p,
      mode,
      lightId,
      darkId,
      setMode: (m: ThemeMode) => setMode(m),
      setTheme: (t: ThemeId) => {
        if (THEMES[t].palette.dark) {
          setDark(t);
          if (mode !== 'auto') setMode('dark');
        } else {
          setLight(t);
          if (mode !== 'auto') setMode('light');
        }
      },
    }),
    [id, p, mode, lightId, darkId, setMode, setDark, setLight],
  );

  const base = p.dark ? DarkTheme : DefaultTheme;
  const nav = {
    ...base,
    colors: { ...base.colors, primary: p.accent, background: p.bg, card: p.bg, text: p.text, border: p.line },
    fonts: {
      regular: { fontFamily: 'Inter', fontWeight: '400' as const },
      medium: { fontFamily: 'Inter', fontWeight: '500' as const },
      bold: { fontFamily: 'Inter', fontWeight: '700' as const },
      heavy: { fontFamily: 'Inter', fontWeight: '800' as const },
    },
  };

  return (
    <ThemeContext.Provider value={ctx}>
      <ThemeProvider value={nav}>
        <StatusBar style={p.dark ? 'light' : 'dark'} />
        <NavigationBar style={p.dark ? 'dark' : 'light'} />
        <Stack
          screenOptions={{
            headerTintColor: p.text,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: p.bg },
            headerTitleStyle: { fontFamily: 'Inter', fontWeight: '700', fontSize: 17 },
            headerTitleAlign: 'center',
            contentStyle: { backgroundColor: p.bg },
            animation: 'slide_from_right',
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="cours/[id]/index" options={{ title: '' }} />
          <Stack.Screen name="cours/[id]/chapitre" options={{ title: '' }} />
          <Stack.Screen name="cours/[id]/lire" options={{ title: '' }} />
          <Stack.Screen name="cours/[id]/liste" options={{ title: '' }} />
          <Stack.Screen name="cours/[id]/quiz" options={{ title: 'QCM' }} />
          <Stack.Screen name="cours/[id]/exercices" options={{ title: 'Exercices' }} />
          <Stack.Screen name="cours/[id]/antiseche" options={{ title: 'Antisèche' }} />
          <Stack.Screen name="cours/[id]/slides" options={{ title: 'Slides' }} />
          <Stack.Screen name="cartes" options={{ title: 'Cartes mémoire' }} />
          <Stack.Screen name="pdf" options={{ title: '' }} />
          <Stack.Screen name="parametres" options={{ title: 'Paramètres' }} />
        </Stack>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
