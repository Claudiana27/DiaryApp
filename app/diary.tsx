import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

export default function DiaryScreen() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'book'>('list');
  const { theme } = useAppTheme();
  const router = useRouter();

  const loadData = useCallback(async () => {
    const savedEntries = await AsyncStorage.getItem(STORAGE_KEYS.entries);
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    } else {
      setEntries([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Votre journal</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={[styles.headerBadge, { backgroundColor: theme.colors.surfaceAlt }]}
              onPress={() => setViewMode(viewMode === 'list' ? 'book' : 'list')}
            >
              <Feather
                name={viewMode === 'list' ? 'book-open' : 'list'}
                size={18}
                color={theme.colors.accent}
              />
            </Pressable>
            <Pressable
              style={[styles.headerBadge, { backgroundColor: theme.colors.surfaceAlt }]}
              onPress={() => router.push('/themes')}
            >
              <Feather name="droplet" size={18} color={theme.colors.accent} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.quickRow, { backgroundColor: theme.colors.surface }]}
        >
          <Pressable
            style={[styles.quickCard, { borderColor: theme.colors.border }]}
            onPress={() => router.push('/new-entry')}
          >
            <Feather name="edit-3" size={18} color={theme.colors.accent} />
            <Text style={[styles.quickTitle, { color: theme.colors.text }]}>Nouvelle page</Text>
            <Text style={[styles.quickMeta, { color: theme.colors.textMuted }]}>Écrire un souvenir</Text>
          </Pressable>
          <Pressable
            style={[styles.quickCard, { borderColor: theme.colors.border }]}
            onPress={() => router.push('/search')}
          >
            <Feather name="search" size={18} color={theme.colors.accent} />
            <Text style={[styles.quickTitle, { color: theme.colors.text }]}>Recherche</Text>
            <Text style={[styles.quickMeta, { color: theme.colors.textMuted }]}>Mot, date, page</Text>
          </Pressable>
          <Pressable
            style={[styles.quickCard, { borderColor: theme.colors.border }]}
            onPress={() => router.push('/moods')}
          >
            <Feather name="smile" size={18} color={theme.colors.accent} />
            <Text style={[styles.quickTitle, { color: theme.colors.text }]}>Humeurs</Text>
            <Text style={[styles.quickMeta, { color: theme.colors.textMuted }]}>Suivre vos émotions</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {viewMode === 'list' ? 'Pages récentes' : 'Vue livre'}
          </Text>
          {entries.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}
            >
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}
              >Aucune page enregistrée pour l’instant.</Text>
            </View>
          ) : viewMode === 'list' ? (
            entries.slice(0, 5).map((entry, index) => (
              <Pressable
                key={entry.id}
                style={[styles.entryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => router.push({ pathname: '/entry/[id]', params: { id: entry.id } })}
              >
                <View style={styles.entryHeader}>
                  <Text style={[styles.entryTitle, { color: theme.colors.text }]}>{entry.title}</Text>
                  <Text style={[styles.entryPage, { color: theme.colors.textMuted }]}>Page {index + 1}</Text>
                </View>
                <Text style={[styles.entryMeta, { color: theme.colors.textMuted }]}>{entry.date}</Text>
                {entry.mood && (
                  <View style={[styles.moodPill, { backgroundColor: theme.colors.accentSoft }]}
                  >
                    <Text style={[styles.moodPillText, { color: theme.colors.text }]}>{entry.mood}</Text>
                  </View>
                )}
              </Pressable>
            ))
          ) : (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bookRow}
            >
              {entries.map((entry, index) => (
                <Pressable
                  key={entry.id}
                  style={[
                    styles.bookPage,
                    {
                      width: Dimensions.get('window').width - 64,
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => router.push({ pathname: '/entry/[id]', params: { id: entry.id } })}
                >
                  <Text style={[styles.bookPageTitle, { color: theme.colors.text }]}>{entry.title}</Text>
                  <Text style={[styles.bookPageMeta, { color: theme.colors.textMuted }]}>
                    Page {index + 1} • {entry.date}
                  </Text>
                  <Text style={[styles.bookPageText, { color: theme.colors.text }]}>
                    {entry.text.slice(0, 180)}{entry.text.length > 180 ? '…' : ''}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Outils</Text>
          <View style={styles.toolRow}>
            <Pressable
              style={[styles.toolCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => router.push('/themes')}
            >
              <Feather name="layers" size={18} color={theme.colors.accent} />
              <Text style={[styles.toolTitle, { color: theme.colors.text }]}>Thèmes</Text>
            </Pressable>
            <Pressable
              style={[styles.toolCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => router.push('/contact')}
            >
              <Feather name="qr-code" size={18} color={theme.colors.accent} />
              <Text style={[styles.toolTitle, { color: theme.colors.text }]}>Contact</Text>
            </Pressable>
          </View>
        </View>
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
    gap: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 20,
  },
  quickCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  quickTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  quickMeta: {
    fontSize: 11,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  entryPage: {
    fontSize: 11,
  },
  entryMeta: {
    fontSize: 11,
  },
  moodPill: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  moodPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bookRow: {
    gap: 16,
  },
  bookPage: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    marginRight: 16,
  },
  bookPageTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  bookPageMeta: {
    fontSize: 11,
  },
  bookPageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  toolRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toolCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  toolTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
});
