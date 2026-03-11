import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_THEMES } from '../constants/app-themes';
import { useAppTheme } from '../hooks/use-app-theme';

export default function ThemesScreen() {
  const router = useRouter();
  const { theme, themeId, updateTheme } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={18} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text }]}>Thèmes</Text>
        </View>

        {APP_THEMES.map((item) => (
          <Pressable
            key={item.id}
            style={[
              styles.themeCard,
              {
                backgroundColor: item.colors.surface,
                borderColor: themeId === item.id ? item.colors.accent : item.colors.border,
              },
            ]}
            onPress={() => updateTheme(item.id)}
          >
            <View style={styles.themeHeader}>
              <Text style={[styles.themeName, { color: item.colors.text }]}>{item.name}</Text>
              {themeId === item.id && (
                <Feather name="check" size={16} color={item.colors.accent} />
              )}
            </View>
            <View style={styles.swatchRow}>
              {[item.colors.background, item.colors.surfaceAlt, item.colors.accent].map((color) => (
                <View key={color} style={[styles.swatch, { backgroundColor: color }]} />
              ))}
            </View>
          </Pressable>
        ))}
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
    gap: 14,
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
  themeCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    gap: 10,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeName: {
    fontSize: 16,
    fontWeight: '700',
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
});
