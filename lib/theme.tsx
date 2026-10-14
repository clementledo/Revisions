import { createContext, useContext, useMemo } from 'react';
import { StyleSheet, type TextStyle } from 'react-native';

export type Palette = {
  dark: boolean;
  /** Fond de l'écran. */
  bg: string;
  /** Cartes et listes. */
  surface: string;
  /** Zones en retrait (champs, puces, pistes des barres). */
  surface2: string;
  text: string;
  /** Texte secondaire, plus doux que text mais plus lisible que muted. */
  text2: string;
  muted: string;
  line: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  /** Dégradé des grandes cartes (accueil, en-tête d'un cours). */
  hero: [string, string];
  warn: string;
  warnSoft: string;
  good: string;
  goodSoft: string;
  bad: string;
  badSoft: string;
};

export type ThemeId =
  | 'porcelaine'
  | 'carnet'
  | 'papier'
  | 'sable'
  | 'sauge'
  | 'lavande'
  | 'ocean'
  | 'nuit'
  | 'minuit'
  | 'encre'
  | 'ardoise'
  | 'foret'
  | 'moka';

export type ThemeMode = 'light' | 'dark' | 'auto';

const light = (o: Omit<Palette, 'dark' | 'onAccent' | 'text2'> & Partial<Pick<Palette, 'onAccent' | 'text2'>>): Palette => ({
  dark: false,
  onAccent: '#ffffff',
  text2: mix(o.text, o.muted, 0.45),
  ...o,
});
const dark = (o: Omit<Palette, 'dark' | 'text2'> & Partial<Pick<Palette, 'text2'>>): Palette => ({
  dark: true,
  text2: mix(o.text, o.muted, 0.4),
  ...o,
});

export const THEMES: Record<ThemeId, { name: string; palette: Palette }> = {
  porcelaine: {
    name: 'Porcelaine',
    palette: light({
      bg: '#f5f6f8', surface: '#ffffff', surface2: '#eceef3', text: '#14161c', muted: '#6b7180', line: '#e3e6ec',
      accent: '#3b4bd8', accentSoft: '#e8eafc', hero: ['#3b4bd8', '#6a4fd8'],
      warn: '#b25a0c', warnSoft: '#fbefe2', good: '#18794e', goodSoft: '#e2f4ea', bad: '#c4320a', badSoft: '#fdeae4',
    }),
  },
  carnet: {
    name: 'Carnet',
    palette: light({
      bg: '#f3f5f4', surface: '#ffffff', surface2: '#e8eeec', text: '#16202a', muted: '#5f6b76', line: '#dde4e2',
      accent: '#0e6b63', accentSoft: '#dff0ec', hero: ['#0e6b63', '#14806f'],
      warn: '#a8560c', warnSoft: '#fbeedd', good: '#1d7a3a', goodSoft: '#e3f3e7', bad: '#b3261e', badSoft: '#fbe6e4',
    }),
  },
  papier: {
    name: 'Papier',
    palette: light({
      bg: '#fbfbfa', surface: '#ffffff', surface2: '#f0f0ee', text: '#191919', muted: '#73726e', line: '#e8e8e5',
      accent: '#2f3437', accentSoft: '#ececea', hero: ['#2b2f33', '#4a4f55'],
      warn: '#b0602a', warnSoft: '#f7ebe1', good: '#2e7d4f', goodSoft: '#e6f2ea', bad: '#c0392b', badSoft: '#f8e5e2',
    }),
  },
  sable: {
    name: 'Sable',
    palette: light({
      bg: '#f8f3eb', surface: '#fffdf9', surface2: '#f0e8dc', text: '#2a2118', muted: '#7a6c5c', line: '#e8dccb',
      accent: '#b4532a', accentSoft: '#f6e3d7', hero: ['#b4532a', '#c9783c'],
      warn: '#8a6d1d', warnSoft: '#f5edd2', good: '#3f7a3a', goodSoft: '#e5f0e1', bad: '#b3261e', badSoft: '#f9e3e0',
    }),
  },
  sauge: {
    name: 'Sauge',
    palette: light({
      bg: '#f2f5f0', surface: '#fcfdfb', surface2: '#e6ece2', text: '#1b231b', muted: '#66705f', line: '#dbe3d6',
      accent: '#4d7c3f', accentSoft: '#e3eedc', hero: ['#4d7c3f', '#6a9a4a'],
      warn: '#a0601a', warnSoft: '#f6ecdc', good: '#2f7d4a', goodSoft: '#e1f1e6', bad: '#b8322a', badSoft: '#f8e4e1',
    }),
  },
  lavande: {
    name: 'Lavande',
    palette: light({
      bg: '#f6f4fb', surface: '#ffffff', surface2: '#ece8f6', text: '#1c1830', muted: '#6e6987', line: '#e4dff2',
      accent: '#6b4fd1', accentSoft: '#ece6fc', hero: ['#6b4fd1', '#a24fbf'],
      warn: '#a85a12', warnSoft: '#faeedf', good: '#1f7a55', goodSoft: '#e1f3ea', bad: '#c2304a', badSoft: '#fbe5ea',
    }),
  },
  ocean: {
    name: 'Océan',
    palette: light({
      bg: '#f1f6f9', surface: '#ffffff', surface2: '#e3edf3', text: '#0f1d27', muted: '#5f7180', line: '#d8e5ed',
      accent: '#0a6fb0', accentSoft: '#dcedf8', hero: ['#0a6fb0', '#0f97a8'],
      warn: '#b0600e', warnSoft: '#faeedd', good: '#16805a', goodSoft: '#dff3ea', bad: '#c0362c', badSoft: '#fbe6e3',
    }),
  },
  nuit: {
    name: 'Nuit',
    palette: dark({
      bg: '#0f1519', surface: '#172025', surface2: '#1f2a31', text: '#e6ecea', muted: '#8f9ea8', line: '#26323a',
      accent: '#4cc2b3', accentSoft: '#15332f', onAccent: '#06201c', hero: ['#0f5e56', '#16786c'],
      warn: '#f0a75a', warnSoft: '#36281a', good: '#5fcf80', goodSoft: '#173020', bad: '#ff8a80', badSoft: '#3b1d1b',
    }),
  },
  minuit: {
    name: 'Minuit',
    palette: dark({
      bg: '#0d1020', surface: '#151a2e', surface2: '#1d2340', text: '#e8eaf6', muted: '#8e93b3', line: '#242a48',
      accent: '#8b9bff', accentSoft: '#232a55', onAccent: '#0b1030', hero: ['#3b46b8', '#6a3fb8'],
      warn: '#f5b26b', warnSoft: '#372a1c', good: '#6bd6a0', goodSoft: '#17322a', bad: '#ff8f8f', badSoft: '#3d1d26',
    }),
  },
  encre: {
    name: 'Encre',
    palette: dark({
      bg: '#000000', surface: '#101012', surface2: '#1a1a1e', text: '#f2f2f3', muted: '#93939b', line: '#222226',
      accent: '#8ab4ff', accentSoft: '#162038', onAccent: '#0a1020', hero: ['#1e3a7a', '#2a2a6e'],
      warn: '#ffb86b', warnSoft: '#30220f', good: '#6bd38d', goodSoft: '#12281a', bad: '#ff8a80', badSoft: '#361613',
    }),
  },
  ardoise: {
    name: 'Ardoise',
    palette: dark({
      bg: '#1a1c24', surface: '#232631', surface2: '#2c303d', text: '#e9e7f1', muted: '#a09eb4', line: '#333747',
      accent: '#b49cff', accentSoft: '#332c52', onAccent: '#16112b', hero: ['#5b48a8', '#7a4a9c'],
      warn: '#f2b56b', warnSoft: '#3b2e1c', good: '#7dd3a0', goodSoft: '#1e3328', bad: '#ff9a8f', badSoft: '#43221f',
    }),
  },
  foret: {
    name: 'Forêt',
    palette: dark({
      bg: '#0f1611', surface: '#162019', surface2: '#1e2a21', text: '#e5ede6', muted: '#8fa293', line: '#243228',
      accent: '#8fd17a', accentSoft: '#1f3a1c', onAccent: '#0c1f08', hero: ['#2f6a2b', '#3f7d3a'],
      warn: '#e9b25c', warnSoft: '#33291a', good: '#6fd49b', goodSoft: '#163024', bad: '#ff958a', badSoft: '#3a1e1b',
    }),
  },
  moka: {
    name: 'Moka',
    palette: dark({
      bg: '#17120f', surface: '#211a16', surface2: '#2b221d', text: '#f1e8e1', muted: '#a8978a', line: '#33291f',
      accent: '#e8a36b', accentSoft: '#3d2b1c', onAccent: '#2a160a', hero: ['#8a4a24', '#a0602e'],
      warn: '#f0c060', warnSoft: '#36301a', good: '#8fd39a', goodSoft: '#1d3122', bad: '#ff9284', badSoft: '#3e1f1a',
    }),
  },
};

export const LIGHT_THEMES = (Object.keys(THEMES) as ThemeId[]).filter((t) => !THEMES[t].palette.dark);
export const DARK_THEMES = (Object.keys(THEMES) as ThemeId[]).filter((t) => THEMES[t].palette.dark);

export type ThemeState = { id: ThemeId; p: Palette; mode: ThemeMode; lightId: ThemeId; darkId: ThemeId };

export const ThemeContext = createContext<
  ThemeState & { setTheme: (id: ThemeId) => void; setMode: (m: ThemeMode) => void }
>({
  id: 'porcelaine',
  p: THEMES.porcelaine.palette,
  mode: 'light',
  lightId: 'porcelaine',
  darkId: 'minuit',
  setTheme: () => {},
  setMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

/** Styles recalculés quand le thème change. */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(fn: (p: Palette) => T) {
  return () => {
    const { p } = useTheme();
    return useMemo(() => StyleSheet.create(fn(p)), [p]);
  };
}

// ---------- couleurs
function hex(c: string) {
  const h = c.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function toHex(rgb: number[]) {
  return '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

/** Mélange deux couleurs : t = 0 → a, t = 1 → b. */
export function mix(a: string, b: string, t: number) {
  const x = hex(a);
  const y = hex(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
}

/** Couleur avec transparence (#rrggbbaa). */
export const alpha = (c: string, a: number) => c.slice(0, 7) + Math.round(a * 255).toString(16).padStart(2, '0');

/** Couleur d'un cours accordée au thème : plus claire sur fond sombre pour rester lisible. */
export const tone = (c: string, p: Palette) => (p.dark ? mix(c, '#ffffff', 0.32) : c);
/** Fond doux d'un cours (pastilles, icônes). */
export const toneSoft = (c: string, p: Palette) => mix(p.surface, c, p.dark ? 0.2 : 0.11);

/** Variables CSS des pages de révision, alignées sur le thème de l'app. */
export function pageCss(p: Palette) {
  return `html:root[data-theme][data-theme]{--bg:${p.bg};--surface:${p.surface};--ink:${p.text};--muted:${p.muted};--line:${p.line};` +
    `--accent:${p.accent};--accent-soft:${p.accentSoft};--reward:${p.warn};--reward-soft:${p.warnSoft};` +
    `--good:${p.good};--good-soft:${p.goodSoft};--bad:${p.bad};--bad-soft:${p.badSoft};` +
    // Noms utilisés par la page MGL805.
    `--paper:${p.bg};--surface-2:${p.surface2};--ink-2:${p.text2};--rule:${p.line};--flag:${p.bad};--flag-soft:${p.badSoft};` +
    `--ok:${p.good};--ok-soft:${p.goodSoft};color-scheme:${p.dark ? 'dark' : 'light'}}`;
}

// ---------- mesures et typographie
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 10, md: 14, lg: 18, xl: 24 };

const font = (size: number, weight: TextStyle['fontWeight'], extra?: TextStyle): TextStyle => ({
  fontFamily: 'Inter',
  fontSize: size,
  fontWeight: weight,
  ...extra,
});

/** Échelle typographique commune. */
export const type = {
  display: font(32, '800', { letterSpacing: -1, lineHeight: 38 }),
  title: font(24, '800', { letterSpacing: -0.6, lineHeight: 30 }),
  headline: font(18, '700', { letterSpacing: -0.3, lineHeight: 24 }),
  body: font(15.5, '400', { lineHeight: 23 }),
  bodyStrong: font(15.5, '600', { lineHeight: 22, letterSpacing: -0.1 }),
  callout: font(14, '500', { lineHeight: 20 }),
  caption: font(12.5, '500', { lineHeight: 17 }),
  overline: font(11.5, '700', { letterSpacing: 1.1, textTransform: 'uppercase' }),
  number: font(22, '800', { letterSpacing: -0.6, fontVariant: ['tabular-nums'] }),
};

/** Ombre douce des cartes (les thèmes sombres utilisent un contour à la place). */
export const shadow = (p: Palette, level: 1 | 2 = 1) =>
  p.dark
    ? {}
    : {
        shadowColor: '#0b1220',
        shadowOpacity: level === 1 ? 0.05 : 0.1,
        shadowRadius: level === 1 ? 10 : 18,
        shadowOffset: { width: 0, height: level === 1 ? 3 : 8 },
        elevation: level === 1 ? 1.5 : 4,
      };

/** Dégradé d'un cours pour les grandes cartes. */
export const courseHero = (c: string, p: Palette): [string, string] =>
  p.dark ? [mix(c, '#000000', 0.3), mix(mix(c, '#000000', 0.5), '#6a3fb8', 0.12)] : [c, mix(mix(c, '#000000', 0.22), '#6a3fb8', 0.15)];
