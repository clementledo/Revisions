import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useStored } from '@/lib/store';
import { THEME_CHOICES, THEMES, ThemeContext, type ThemeChoice, type ThemeId } from '@/lib/theme';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const system = useColorScheme();
  // « appTheme » : auto, blanc, creme, sombre ou noir. Les anciens réglages (13 thèmes) repassent en automatique.
  const [stored, setStored] = useStored<string>('appTheme', 'auto');
  const choice: ThemeChoice = (THEME_CHOICES as string[]).includes(stored) ? (stored as ThemeChoice) : 'auto';
  const id: ThemeId = choice === 'auto' ? (system === 'dark' ? 'sombre' : 'blanc') : choice;
  const p = THEMES[id].palette;
  const ctx = useMemo(() => ({ id, p, choice, setChoice: (c: ThemeChoice) => setStored(c) }), [id, p, choice, setStored]);

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
            headerTitleStyle: { fontFamily: 'Inter', fontWeight: '600', fontSize: 16 },
            headerTitleAlign: 'center',
            contentStyle: { backgroundColor: p.bg },
            animation: 'slide_from_right',
          }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="recherche" options={{ title: 'Recherche' }} />
          <Stack.Screen name="progres" options={{ title: 'Progrès' }} />
          <Stack.Screen name="cours/[id]/index" options={{ title: '' }} />
          <Stack.Screen name="cours/[id]/chapitre" options={{ title: '' }} />
          <Stack.Screen name="cours/[id]/lire" options={{ title: '' }} />
          <Stack.Screen name="cours/[id]/liste" options={{ title: '' }} />
          <Stack.Screen name="cours/[id]/quiz" options={{ title: 'QCM' }} />
          <Stack.Screen name="cours/[id]/exercices" options={{ title: 'Exercices' }} />
          <Stack.Screen name="cours/[id]/antiseche" options={{ title: 'Antisèche' }} />
          <Stack.Screen name="cours/[id]/slides" options={{ title: 'Slides' }} />
          <Stack.Screen name="cours/[id]/tri" options={{ title: 'Tableaux' }} />
          <Stack.Screen name="cartes" options={{ title: 'Cartes mémoire' }} />
          <Stack.Screen name="pdf" options={{ title: '' }} />
          <Stack.Screen name="parametres" options={{ title: 'Paramètres' }} />
        </Stack>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
