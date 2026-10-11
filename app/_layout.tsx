import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';

import { useStored } from '@/lib/store';
import { THEMES, ThemeContext, type ThemeId } from '@/lib/theme';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const [stored, setTheme] = useStored<ThemeId>('theme', 'carnet');
  const id = THEMES[stored] ? stored : 'carnet';
  const p = THEMES[id].palette;
  const ctx = useMemo(() => ({ id, p, set: setTheme }), [id, p, setTheme]);
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
        <Stack
          screenOptions={{
            headerTintColor: p.text,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: p.bg },
            headerTitleStyle: { fontFamily: 'Inter', fontWeight: '700', fontSize: 17 },
            contentStyle: { backgroundColor: p.bg },
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
