import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const THEMES = {
  dark:     { name: 'Noapte',    bg: '#020817', surface: '#0f172a', border: '#1e293b', text: '#ffffff', muted: '#475569', accent: '#eab308', accentFg: '#020817', chord: '#facc15', grad: ['#1e293b', '#0f172a'] },
  light:    { name: 'Zi',        bg: '#f1f5f9', surface: '#ffffff', border: '#e2e8f0', text: '#0f172a', muted: '#94a3b8', accent: '#d97706', accentFg: '#ffffff', chord: '#b45309', grad: ['#f8fafc', '#cbd5e1'] },
  ocean:    { name: 'Ocean',     bg: '#030d1a', surface: '#061828', border: '#0c2d50', text: '#dbeafe', muted: '#3d6d96', accent: '#38bdf8', accentFg: '#030d1a', chord: '#38bdf8', grad: ['#0369a1', '#7dd3fc'] },
  forest:   { name: 'Pădure',   bg: '#071a0e', surface: '#0e2b17', border: '#1a4d2e', text: '#dcfce7', muted: '#3d7a52', accent: '#4ade80', accentFg: '#071a0e', chord: '#4ade80', grad: ['#166534', '#86efac'] },
  sunset:   { name: 'Apus',     bg: '#1a0800', surface: '#2d1200', border: '#4d2200', text: '#fff7ed', muted: '#8a5030', accent: '#fb923c', accentFg: '#1a0800', chord: '#fb923c', grad: ['#9a3412', '#fdba74'] },
  lavender: { name: 'Lavandă',  bg: '#120920', surface: '#1e1038', border: '#3b1f72', text: '#ede8ff', muted: '#6b5a9a', accent: '#a78bfa', accentFg: '#120920', chord: '#a78bfa', grad: ['#5b21b6', '#c4b5fd'] },
  rose:     { name: 'Trandafir',bg: '#1a080f', surface: '#2d0d18', border: '#4d1528', text: '#ffe4e6', muted: '#8a3a50', accent: '#fb7185', accentFg: '#1a080f', chord: '#fb7185', grad: ['#9f1239', '#fda4af'] },
};

export const FONTS = [
  { id: 'mono',  label: 'Mono',  css: "'Courier New', monospace" },
  { id: 'sans',  label: 'Sans',  css: "system-ui, -apple-system, sans-serif" },
  { id: 'serif', label: 'Serif', css: "Georgia, 'Times New Roman', serif" },
];

export const FONT_SIZES = [
  { id: 'sm', label: 'S',  lyric: '1rem',    chord: '0.75rem' },
  { id: 'md', label: 'M',  lyric: '1.25rem', chord: '0.875rem' },
  { id: 'lg', label: 'L',  lyric: '1.5rem',  chord: '1rem' },
  { id: 'xl', label: 'XL', lyric: '1.875rem',chord: '1.125rem' },
];

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useLocalStorage('isworship_settings', {
    theme: 'dark',
    fontId: 'mono',
    sizeId: 'lg',
    layout: 'scroll',
  });

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));
  const theme = THEMES[settings.theme] ?? THEMES.dark;
  const font  = FONTS.find((f) => f.id === settings.fontId) ?? FONTS[0];
  const size  = FONT_SIZES.find((s) => s.id === settings.sizeId) ?? FONT_SIZES[2];

  return (
    <SettingsContext.Provider value={{ settings, update, theme, font, size }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
