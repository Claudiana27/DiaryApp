import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { APP_THEMES, getThemeById } from '../constants/app-themes';
import { STORAGE_KEYS } from '../constants/storage';

export const useAppTheme = () => {
  const [themeId, setThemeId] = useState<string>(APP_THEMES[1].id);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.theme);
      if (saved) {
        setThemeId(saved);
      }
      setReady(true);
    };
    loadTheme();
  }, []);

  const theme = useMemo(() => getThemeById(themeId), [themeId]);

  const updateTheme = async (id: string) => {
    setThemeId(id);
    await AsyncStorage.setItem(STORAGE_KEYS.theme, id);
  };

  return { theme, themeId, updateTheme, ready };
};
