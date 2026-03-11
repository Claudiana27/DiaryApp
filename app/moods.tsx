import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STORAGE_KEYS } from '../constants/storage';
import { useAppTheme } from '../hooks/use-app-theme';

type DiaryEntry = {
  id: string;
  title: string;
  text: string;
  description?: string;
  date: string;
  mood?: string;
  photoUri?: string;
};

export default function MoodsScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  useEffect(() => {
    const loadEntries = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.entries);
      setEntries(saved ? JSON.parse(saved) : []);
    };
    loadEntries();
  }, []);

  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((entry) => {
      if (entry.mood) {
        counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
      }
    });
    return counts;
  }, [entries]);

  const moods = Object.keys(moodCounts);

  const filteredEntries = selectedMood
    ? entries.filter((entry) => entry.mood === selectedMood)
    : entries;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={18} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text }]}>Humeurs</Text>
        </View>

        <View style={styles.moodRow}>
          <Pressable
            style={[
              styles.moodChip,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
              !selectedMood && { borderColor: theme.colors.accent },
            ]}
            onPress={() => setSelectedMood(null)}
          >
            <Text style={[styles.moodText, { color: theme.colors.text }]}>Toutes</Text>
          </Pressable>
          {moods.map((mood) => (
            <Pressable
              key={mood}
              style={[
                styles.moodChip,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
                selectedMood === mood && { borderColor: theme.colors.accent },
              ]}
              onPress={() => setSelectedMood(mood)}
            >
              <Text style={[styles.moodText, { color: theme.colors.text }]}>
                {mood} ({moodCounts[mood]})
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pages associées</Text>
        {filteredEntries.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>Aucune page.</Text>
          </View>
        ) : (
          filteredEntries.map((entry, index) => (
            <Pressable
              key={entry.id}
              style={[styles.entryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => router.push({ pathname: '/entry/[id]', params: { id: entry.id } })}
            >
              <Text style={[styles.entryTitle, { color: theme.colors.text }]}>{entry.title}</Text>
              <Text style={[styles.entryMeta, { color: theme.colors.textMuted }]}
              >Page {index + 1} • {entry.date}</Text>
            </Pressable>
          ))
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
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodChip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 16,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 12,
  },
  entryCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  entryMeta: {
    fontSize: 11,
  },
});
