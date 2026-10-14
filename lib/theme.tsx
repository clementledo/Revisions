import { createContext, useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';

export type Palette = {
  dark: boolean;
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  line: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  warn: string;
  warnSoft: string;
  good: string;
  goodSoft: string;
  bad: string;
  badSoft: string;
};

export type ThemeId = 'carnet' | 'papier' | 'sable' | 'nuit' | 'encre' | 'ardoise';

export const THEMES: Record<ThemeId, { name: string; palette: Palette }> = {
  carnet: {
    name: 'Carnet',
    palette: {
      dark: false, bg: '#f3f5f4', surface: '#ffffff', surface2: '#e9eeec', text: '#16202a', muted: '#586572',
      line: '#d9e0de', accent: '#0e6b63', accentSoft: '#e0f0ed', onAccent: '#ffffff', warn: '#a8560c',
      warnSoft: '#fbeedd', good: '#1d7a3a', goodSoft: '#e3f3e7', bad: '#b3261e', badSoft: '#fbe6e4',
    },
  },
  papier: {
    name: 'Papier',
    palette: {
      dark: false, bg: '#ffffff', surface: '#f7f7f5', surface2: '#efefec', text: '#191919', muted: '#6b6b6b',
      line: '#e6e6e3', accent: '#2f3437', accentSoft: '#ededeb', onAccent: '#ffffff', warn: '#b0602a',
      warnSoft: '#f7ebe1', good: '#2e7d4f', goodSoft: '#e6f2ea', bad: '#c0392b', badSoft: '#f8e5e2',
    },
  },
  sable: {
    name: 'Sable',
    palette: {
      dark: false, bg: '#faf6ef', surface: '#ffffff', surface2: '#f1eadf', text: '#2a2118', muted: '#76695a',
      line: '#e7dccb', accent: '#b4532a', accentSoft: '#f7e4d9', onAccent: '#ffffff', warn: '#8a6d1d',
      warnSoft: '#f5edd2', good: '#3f7a3a', goodSoft: '#e5f0e1', bad: '#b3261e', badSoft: '#f9e3e0',
    },
  },
  nuit: {
    name: 'Nuit',
    palette: {
      dark: true, bg: '#11171c', surface: '#182128', surface2: '#1f2a33', text: '#e4eae8', muted: '#9aa8b2',
      line: '#2b3741', accent: '#4cc2b3', accentSoft: '#163a37', onAccent: '#0b1714', warn: '#f0a75a',
      warnSoft: '#3a2a17', good: '#5fcf80', goodSoft: '#17331f', bad: '#ff8a80', badSoft: '#3d1c1a',
    },
  },
  encre: {
    name: 'Encre',
    palette: {
      dark: true, bg: '#000000', surface: '#111113', surface2: '#1b1b1f', text: '#f2f2f3', muted: '#9a9aa2',
      line: '#26262b', accent: '#8ab4ff', accentSoft: '#18233a', onAccent: '#0a1020', warn: '#ffb86b',
      warnSoft: '#33240f', good: '#6bd38d', goodSoft: '#132a1b', bad: '#ff8a80', badSoft: '#3a1714',
    },
  },
  ardoise: {
    name: 'Ardoise',
    palette: {
      dark: true, bg: '#1c1e26', surface: '#242733', surface2: '#2d3140', text: '#e8e6f0', muted: '#a3a1b5',
      line: '#363a4b', accent: '#b49cff', accentSoft: '#2f2a4a', onAccent: '#16112b', warn: '#f2b56b',
      warnSoft: '#3b2e1c', good: '#7dd3a0', goodSoft: '#1e3328', bad: '#ff9a8f', badSoft: '#43221f',
    },
  },
};

export const ThemeContext = createContext<{ id: ThemeId; p: Palette; set: (id: ThemeId) => void }>({
  id: 'carnet',
  p: THEMES.carnet.palette,
  set: () => {},
});

export const useTheme = () => useContext(ThemeContext);

/** Styles recalculés quand le thème change. */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(fn: (p: Palette) => T) {
  return () => {
    const { p } = useTheme();
    return useMemo(() => StyleSheet.create(fn(p)), [p]);
  };
}

/** Variables CSS des pages de révision, alignées sur le thème de l'app. */
export function pageCss(p: Palette) {
  return `html:root[data-theme][data-theme]{--bg:${p.bg};--surface:${p.surface};--ink:${p.text};--muted:${p.muted};--line:${p.line};` +
    `--accent:${p.accent};--accent-soft:${p.accentSoft};--reward:${p.warn};--reward-soft:${p.warnSoft};` +
    `--good:${p.good};--good-soft:${p.goodSoft};--bad:${p.bad};--bad-soft:${p.badSoft};` +
    // Noms utilisés par la page MGL805.
    `--paper:${p.bg};--surface-2:${p.surface2};--ink-2:${p.text}d9;--rule:${p.line};--flag:${p.bad};--flag-soft:${p.badSoft};` +
    `--ok:${p.good};--ok-soft:${p.goodSoft};color-scheme:${p.dark ? 'dark' : 'light'}}`;
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 22 };
