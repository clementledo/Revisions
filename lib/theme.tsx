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

export type ThemeId = 'blanc' | 'creme' | 'sombre' | 'noir';
/** Choix de l'utilisateur : un thème, ou « auto » (Blanc ou Sombre selon le téléphone). */
export type ThemeChoice = ThemeId | 'auto';

const ACCENT = '#4338ca';
const ACCENT_DARK = '#9b98ff';

const light = (o: Pick<Palette, 'bg' | 'surface' | 'surface2' | 'text' | 'muted' | 'line'>): Palette => ({
  dark: false,
  text2: mix(o.text, o.muted, 0.45),
  accent: ACCENT,
  accentSoft: mix(o.surface, ACCENT, 0.1),
  onAccent: '#ffffff',
  hero: [ACCENT, ACCENT],
  warn: '#a85a0c', warnSoft: '#fbefe2', good: '#18794e', goodSoft: '#e4f3ea', bad: '#c4320a', badSoft: '#fcebe5',
  ...o,
});
const dark = (o: Pick<Palette, 'bg' | 'surface' | 'surface2' | 'text' | 'muted' | 'line'>): Palette => ({
  dark: true,
  text2: mix(o.text, o.muted, 0.4),
  accent: ACCENT_DARK,
  accentSoft: mix(o.surface, ACCENT_DARK, 0.18),
  onAccent: '#11102a',
  hero: [ACCENT_DARK, ACCENT_DARK],
  warn: '#f0b36a', warnSoft: '#33281a', good: '#6bd39a', goodSoft: '#16301f', bad: '#ff8f84', badSoft: '#3a1c19',
  ...o,
});

/** Quatre thèmes sobres, tous avec l'accent indigo. */
export const THEMES: Record<ThemeId, { name: string; palette: Palette }> = {
  blanc: { name: 'Blanc', palette: light({ bg: '#ffffff', surface: '#f4f4f6', surface2: '#e9e9ee', text: '#111114', muted: '#85858f', line: '#e2e2e8' }) },
  creme: { name: 'Crème', palette: light({ bg: '#fbf8f1', surface: '#f2ede2', surface2: '#e8e1d3', text: '#1e1a14', muted: '#8a806f', line: '#e4dccc' }) },
  sombre: { name: 'Sombre', palette: dark({ bg: '#161618', surface: '#212124', surface2: '#2b2b2f', text: '#f2f2f4', muted: '#9898a1', line: '#2e2e33' }) },
  noir: { name: 'Noir', palette: dark({ bg: '#000000', surface: '#131315', surface2: '#1d1d20', text: '#f5f5f7', muted: '#8d8d95', line: '#222226' }) },
};

export const THEME_CHOICES: ThemeChoice[] = ['auto', 'blanc', 'creme', 'sombre', 'noir'];

export type ThemeState = { id: ThemeId; p: Palette; choice: ThemeChoice };

export const ThemeContext = createContext<ThemeState & { setChoice: (c: ThemeChoice) => void }>({
  id: 'blanc',
  p: THEMES.blanc.palette,
  choice: 'auto',
  setChoice: () => {},
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

const serif = (size: number, extra?: TextStyle): TextStyle => ({ fontFamily: 'Serif', fontSize: size, fontWeight: '700', ...extra });

/** Échelle typographique commune : titres à empattement (Source Serif 4), texte en Inter. */
export const type = {
  display: serif(34, { letterSpacing: -0.6, lineHeight: 40 }),
  title: serif(25, { letterSpacing: -0.3, lineHeight: 31 }),
  headline: font(18, '700', { letterSpacing: -0.3, lineHeight: 24 }),
  body: font(15.5, '400', { lineHeight: 23 }),
  bodyStrong: font(15.5, '600', { lineHeight: 22, letterSpacing: -0.1 }),
  callout: font(14, '500', { lineHeight: 20 }),
  caption: font(12.5, '500', { lineHeight: 17 }),
  overline: font(11.5, '700', { letterSpacing: 1.1, textTransform: 'uppercase' }),
  number: font(22, '800', { letterSpacing: -0.6, fontVariant: ['tabular-nums'] }),
};

/** Ombre douce des cartes (les thèmes sombres utilisent un contour à la place). */
// Design à plat : plus d'ombres, les surfaces se distinguent par leur teinte. Gardé pour les écrans qui l'appellent.
export const shadow = (_p: Palette, _level: 1 | 2 = 1) => ({});

/** Dégradé d'un cours pour les grandes cartes. */
export const courseHero = (c: string, p: Palette): [string, string] =>
  p.dark ? [mix(c, '#000000', 0.3), mix(mix(c, '#000000', 0.5), '#6a3fb8', 0.12)] : [c, mix(mix(c, '#000000', 0.22), '#6a3fb8', 0.15)];
