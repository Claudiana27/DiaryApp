import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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

const MOODS = ['😀 Heureux', '😔 Triste', '😴 Fatigué', '😍 Amoureux', '😡 Énervé'];

export default function NewEntryScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const today = useMemo(() => new Date().toLocaleDateString('fr-FR'), []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', "Autorisez l'accès aux photos pour continuer.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', "Autorisez l'accès à la caméra pour continuer.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const saveEntry = async () => {
    if (!title.trim() || !text.trim()) {
      Alert.alert('Champs requis', 'Ajoutez au moins un titre et un texte.');
      return;
    }

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      title: title.trim(),
      text: text.trim(),
      description: description.trim(),
      date: today,
      mood: mood ?? undefined,
      photoUri: photoUri ?? undefined,
    };

    const existing = await AsyncStorage.getItem(STORAGE_KEYS.entries);
    const entries: DiaryEntry[] = existing ? JSON.parse(existing) : [];
    const updated = [newEntry, ...entries];
    await AsyncStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(updated));
    await AsyncStorage.setItem(STORAGE_KEYS.mood, mood ?? '');

    router.replace('/diary');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={18} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text }]}>Nouvelle page</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Titre</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Titre du souvenir"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
          />

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Texte</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Écrivez votre page..."
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.textArea, { color: theme.colors.text, borderColor: theme.colors.border }]}
            multiline
          />

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Détails supplémentaires"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
          />

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Humeur</Text>
          <View style={styles.moodRow}>
            {MOODS.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.moodChip,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt },
                  mood === item && { borderColor: theme.colors.accent },
                ]}
                onPress={() => setMood(item)}
              >
                <Text style={[styles.moodText, { color: theme.colors.text }]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Photo (optionnel)</Text>
          <View style={styles.photoRow}>
            <Pressable style={[styles.photoButton, { borderColor: theme.colors.border }]} onPress={takePhoto}>
              <Feather name="camera" size={16} color={theme.colors.text} />
              <Text style={[styles.photoButtonText, { color: theme.colors.text }]}>Caméra</Text>
            </Pressable>
            <Pressable style={[styles.photoButton, { borderColor: theme.colors.border }]} onPress={pickImage}>
              <Feather name="image" size={16} color={theme.colors.text} />
              <Text style={[styles.photoButtonText, { color: theme.colors.text }]}>Galerie</Text>
            </Pressable>
          </View>
          {photoUri && (
            <Image source={{ uri: photoUri }} style={styles.preview} />
          )}
        </View>

        <Pressable style={[styles.saveButton, { backgroundColor: theme.colors.accent }]} onPress={saveEntry}>
          <Text style={[styles.saveButtonText, { color: '#fff' }]}>Enregistrer</Text>
        </Pressable>
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
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 120,
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
  photoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  photoButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginTop: 10,
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
