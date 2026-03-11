export type AppTheme = {
  id: string;
  name: string;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    accent: string;
    accentSoft: string;
    border: string;
  };
};

export const APP_THEMES: AppTheme[] = [
  {
    id: 'dark-diary',
    name: 'Dark Diary',
    colors: {
      background: '#0F1116',
      surface: '#1B1F27',
      surfaceAlt: '#262C37',
      text: '#F5F5F7',
      textMuted: '#A7ADBA',
      accent: '#D4A373',
      accentSoft: '#3B2F22',
      border: '#2C3442',
    },
  },
  {
    id: 'paper-book',
    name: 'Paper Book',
    colors: {
      background: '#F7F5F0',
      surface: '#FFFFFF',
      surfaceAlt: '#FFF8EE',
      text: '#1D1B16',
      textMuted: '#6B6259',
      accent: '#2E5E4E',
      accentSoft: '#E6DCCB',
      border: '#E4DED5',
    },
  },
  {
    id: 'soft-pink',
    name: 'Soft Pink',
    colors: {
      background: '#FBEFF2',
      surface: '#FFFFFF',
      surfaceAlt: '#F9DEE4',
      text: '#2A1C22',
      textMuted: '#7C5D68',
      accent: '#C05C77',
      accentSoft: '#F1C9D2',
      border: '#F0D6DD',
    },
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    colors: {
      background: '#ECF4EE',
      surface: '#FFFFFF',
      surfaceAlt: '#DDEEE2',
      text: '#1E2A1F',
      textMuted: '#5B6A5E',
      accent: '#3A7F5A',
      accentSoft: '#CFE3D6',
      border: '#D3E2D6',
    },
  },
  {
    id: 'night-blue',
    name: 'Night Blue',
    colors: {
      background: '#0E1B2B',
      surface: '#162338',
      surfaceAlt: '#1C2E4A',
      text: '#F1F5FF',
      textMuted: '#9FB1D1',
      accent: '#6EA8FE',
      accentSoft: '#1C2E4A',
      border: '#243B5E',
    },
  },
];

export const getThemeById = (id?: string | null) => {
  if (!id) return APP_THEMES[1];
  return APP_THEMES.find((theme) => theme.id === id) ?? APP_THEMES[1];
};
