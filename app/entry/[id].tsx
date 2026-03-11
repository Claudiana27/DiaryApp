import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STORAGE_KEYS } from '../../constants/storage';
import { useAppTheme } from '../../hooks/use-app-theme';

type DiaryEntry = {
  id: string;
  title: string;
  text: string;
  description?: string;
  date: string;
  mood?: string;
  photoUri?: string;
};

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useAppTheme();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);

  useEffect(() => {
    const loadEntry = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.entries);
      const list: DiaryEntry[] = saved ? JSON.parse(saved) : [];
      const found = list.find((item) => item.id === id);
      setEntry(found ?? null);
    };
    loadEntry();
  }, [id]);

  if (!entry) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <View style={styles.container}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={18} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>Page introuvable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={18} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text }]}>{entry.title}</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={[styles.headerButton, { backgroundColor: theme.colors.surfaceAlt }]}
              onPress={() => router.push({ pathname: '/edit-entry/[id]', params: { id: entry.id } })}
            >
              <Feather name="edit-3" size={16} color={theme.colors.accent} />
            </Pressable>
            <Pressable
              style={[styles.headerButton, { backgroundColor: theme.colors.surfaceAlt }]}
              onPress={() =>
                Alert.alert('Supprimer', 'Supprimer cette page ?', [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                      const saved = await AsyncStorage.getItem(STORAGE_KEYS.entries);
                      const list: DiaryEntry[] = saved ? JSON.parse(saved) : [];
                      const updated = list.filter((item) => item.id !== entry.id);
                      await AsyncStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(updated));
                      router.replace('/diary');
                    },
                  },
                ])
              }
            >
              <Feather name="trash-2" size={16} color={theme.colors.accent} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{entry.date}</Text>
          {entry.mood && (
            <View style={[styles.moodPill, { backgroundColor: theme.colors.accentSoft }]}
            >
              <Text style={[styles.moodText, { color: theme.colors.text }]}>{entry.mood}</Text>
            </View>
          )}
          {entry.description ? (
            <Text style={[styles.description, { color: theme.colors.textMuted }]}
            >{entry.description}</Text>
          ) : null}
          <Text style={[styles.body, { color: theme.colors.text }]}>{entry.text}</Text>
        </View>

        {entry.photoUri && (
          <Image source={{ uri: entry.photoUri }} style={styles.photo} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  meta: {
    fontSize: 11,
  },
  moodPill: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  moodText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 18,
  },
  emptyText: {
    fontSize: 12,
  },
});
