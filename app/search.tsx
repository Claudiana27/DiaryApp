import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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

export default function SearchScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState('');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  const loadEntries = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.entries);
    const list: DiaryEntry[] = saved ? JSON.parse(saved) : [];
    setEntries(list);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const results = entries.filter((entry, index) => {
    const matchKeyword = keyword
      ? `${entry.title} ${entry.text} ${entry.description ?? ''}`
          .toLowerCase()
          .includes(keyword.toLowerCase())
      : true;
    const matchDate = date ? entry.date.includes(date) : true;
    const matchPage = page ? index + 1 === Number(page) : true;
    return matchKeyword && matchDate && matchPage;
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={18} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text }]}>Recherche</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Mot clé</Text>
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="souvenir, lieu, personne"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
          />

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Date (ex: 12/03/2026)</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="jj/mm/aaaa"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
          />

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Numéro de page</Text>
          <TextInput
            value={page}
            onChangeText={setPage}
            placeholder="1"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="number-pad"
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Résultats</Text>
        {results.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              Aucun résultat.
            </Text>
          </View>
        ) : (
          results.map((entry, index) => (
            <Pressable
              key={entry.id}
              style={[styles.resultCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => router.push({ pathname: '/entry/[id]', params: { id: entry.id } })}
            >
              <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{entry.title}</Text>
              <Text style={[styles.resultMeta, { color: theme.colors.textMuted }]}
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
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
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
  resultCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultMeta: {
    fontSize: 11,
  },
});
