import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';

export default function RootLayout() {
  const router = useRouter();

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState.match(/inactive|background/)) {
        await AsyncStorage.setItem(STORAGE_KEYS.locked, 'true');
      }
      if (nextState === 'active') {
        const locked = await AsyncStorage.getItem(STORAGE_KEYS.locked);
        if (locked === 'true') {
          router.replace('/');
        }
      }
    });
    return () => subscription.remove();
  }, [router]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
