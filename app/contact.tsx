import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/use-app-theme';

const CONTACT = {
  name: 'RAJOMA Nomenjanahary Claudiana',
  phone: '+261 34 56 233 02 ',
  email: 'nomenjanaharydiana27@gmail.com',
  instagram: '@nomenjanahary',
  portfolio: 'https://diana27-portfolio.vercel.app',
  location: 'Fianarantsoa, MG',
};

export default function ContactScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  const contactPayload = useMemo(() => {
    return `BEGIN:VCARD
VERSION:3.0
FN:${CONTACT.name}
TEL;TYPE=CELL:${CONTACT.phone}
EMAIL:${CONTACT.email}
ITEM1.SOCIALPROFILE;TYPE=instagram:${CONTACT.instagram}
ADR;TYPE=HOME:;;${CONTACT.location}
END:VCARD`;
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={18} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text }]}>Contact</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Text style={[styles.name, { color: theme.colors.text }]}>{CONTACT.name}</Text>
          <Text style={[styles.line, { color: theme.colors.textMuted }]}>{CONTACT.phone}</Text>
          <Text style={[styles.line, { color: theme.colors.textMuted }]}>{CONTACT.email}</Text>
          <Text style={[styles.line, { color: theme.colors.textMuted }]}>{CONTACT.instagram}</Text>
          <Text style={[styles.line, { color: theme.colors.textMuted }]}>{CONTACT.portfolio}</Text>
          <Text style={[styles.line, { color: theme.colors.textMuted }]}>{CONTACT.location}</Text>
        </View>

        <View style={[styles.qrCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Text style={[styles.qrTitle, { color: theme.colors.text }]}>QR Code</Text>
          <QRCode value={contactPayload} size={140} color={theme.colors.text} backgroundColor={theme.colors.surface} />
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
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  line: {
    fontSize: 12,
  },
  qrCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  qrTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
});
