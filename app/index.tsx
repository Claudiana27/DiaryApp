import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { STORAGE_KEYS } from '../constants/storage';

const PIN_LENGTH = 4;

const EMOJI_CATEGORIES = [
  { title: 'Humeurs', values: ['😀', '😔', '😴', '😍', '😡', '😎'] },
  { title: 'Nature', values: ['🌿', '🌸', '🌙', '⭐️', '🌊', '🔥'] },
  { title: 'Objets', values: ['🔒', '📖', '🖊️', '📷', '🕯️', '🎧'] },
  { title: 'Symboles', values: ['❤️', '💫', '✨', '🔮', '💎', '🧿'] },
];

const CONTACT = {
  name: 'RAJOMA Nomenjanahary Claudiana',
  phone: '+261 34 56 233 02 ',
  email: 'nomenjanaharydiana27@gmail.com',
  instagram: '@nomenjanahary',
  portfolio: 'https://diana27-portfolio.vercel.app',
  location: 'Fianarantsoa, MG',
};

const colors = {
  ink: '#0E1016',
  paper: '#F7F5F0',
  sand: '#E9E2D6',
  gold: '#D6B068',
  night: '#1A2130',
  teal: '#1F7A8C',
  coral: '#E07A5F',
  mist: '#CDC4B7',
  white: '#FFFFFF',
};

type PinStage = 'setup' | 'confirm' | 'unlock';

export default function HomeScreen() {
  const [pinStage, setPinStage] = useState<PinStage>('setup');
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState<string[]>([]);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const tempPinRef = useRef<string | null>(null);
  const appState = useRef(AppState.currentState);
  const router = useRouter();

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

  useEffect(() => {
    const loadPin = async () => {
      const savedPin = await AsyncStorage.getItem(STORAGE_KEYS.emojiPin);
      const locked = await AsyncStorage.getItem(STORAGE_KEYS.locked);
      if (savedPin) {
        setStoredPin(savedPin);
        setPinStage('unlock');
      } else {
        setPinStage('setup');
      }
      setIsLocked(locked !== 'false');
    };
    loadPin();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState.match(/inactive|background/)) {
        setIsLocked(true);
        setPinInput([]);
      }
      if (nextState === 'active' && storedPin) {
        setIsLocked(true);
        setPinInput([]);
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [storedPin]);

  const handleEmojiPress = async (emoji: string) => {
    if (pinInput.length >= PIN_LENGTH) return;

    const nextInput = [...pinInput, emoji];
    setPinInput(nextInput);

    if (nextInput.length !== PIN_LENGTH) return;

    const candidate = nextInput.join('');

    if (pinStage === 'setup') {
      tempPinRef.current = candidate;
      setPinInput([]);
      setPinStage('confirm');
      setPinError(null);
      return;
    }

    if (pinStage === 'confirm') {
      if (tempPinRef.current === candidate) {
        await AsyncStorage.setItem(STORAGE_KEYS.emojiPin, candidate);
        await AsyncStorage.setItem(STORAGE_KEYS.locked, 'false');
        setStoredPin(candidate);
        setIsLocked(false);
        setPinError(null);
        setPinInput([]);
        router.replace('/diary');
      } else {
        setPinError('Les codes ne correspondent pas. Réessayez.');
        setPinInput([]);
        setPinStage('setup');
      }
      return;
    }

    if (pinStage === 'unlock') {
      if (storedPin === candidate) {
        await AsyncStorage.setItem(STORAGE_KEYS.locked, 'false');
        setIsLocked(false);
        setPinError(null);
        setPinInput([]);
        router.replace('/diary');
      } else {
        setPinError('Code incorrect.');
        setPinInput([]);
      }
    }
  };

  const handleBackspace = () => {
    if (pinInput.length === 0) return;
    setPinInput(pinInput.slice(0, -1));
  };

  const handleResetPin = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.emojiPin);
    setStoredPin(null);
    setPinStage('setup');
    setPinInput([]);
    setPinError(null);
    setIsLocked(true);
    Alert.alert('PIN réinitialisé', 'Créez un nouveau PIN emoji.');
  };

  const lockTitle =
    pinStage === 'setup'
      ? 'Créez votre PIN emoji'
      : pinStage === 'confirm'
        ? 'Confirmez votre PIN'
        : 'Déverrouiller DiaryLock';

  const lockSubtitle =
    pinStage === 'setup'
      ? `Choisissez ${PIN_LENGTH} emojis.`
      : pinStage === 'confirm'
        ? 'Répétez exactement les mêmes emojis.'
        : 'Entrez votre PIN emoji pour continuer.';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.background}>
        <View style={[styles.orb, styles.orbOne]} />
        <View style={[styles.orb, styles.orbTwo]} />
        <View style={[styles.orb, styles.orbThree]} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.brandBadge}>
            <Feather name="lock" size={18} color={colors.night} />
          </View>
          <Text style={styles.brandText}>DiaryLock</Text>
          <View style={styles.headerSpacer} />
          <Pressable
            style={styles.iconButton}
            accessibilityLabel="Profil"
            onPress={() => Alert.alert('Profil', 'Section profil à venir.')}
          >
            <Feather name="user" size={18} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.kicker}>Journal intime sécurisé</Text>
          <Text style={styles.title}>Vos souvenirs, protégés par votre code emoji.</Text>
          <Text style={styles.subtitle}>
            Votre empreinte ne fonctionne plus ? Créez un code visuel unique et personnel.
          </Text>
          <View style={styles.lockButton}>
            <View style={styles.lockButtonIcon}>
              <Feather name="lock" size={26} color={colors.paper} />
            </View>
            <View style={styles.lockButtonText}>
              <Text style={styles.lockButtonTitle}>PIN Emoji</Text>
              <Text style={styles.lockButtonSubtitle}>
                {storedPin ? 'Saisissez votre code pour déverrouiller.' : 'Créez votre code en 4 emojis.'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Humeur du jour</Text>
            <Text style={styles.sectionAction}>Voir l’historique</Text>
          </View>
          <View style={styles.moodRow}>
            {[
              { label: 'Heureux', icon: 'sun', color: colors.gold },
              { label: 'Fatigué', icon: 'moon', color: colors.night },
              { label: 'Triste', icon: 'cloud-drizzle', color: colors.coral },
              { label: 'Amoureux', icon: 'heart', color: colors.teal },
            ].map((mood) => (
              <Pressable
                key={mood.label}
                style={[styles.moodChip, selectedMood === mood.label && styles.moodChipActive]}
                onPress={() => {
                  setSelectedMood(mood.label);
                  Alert.alert('Humeur enregistrée', `Vous avez choisi: ${mood.label}`);
                }}
              >
                <View style={[styles.moodIcon, { backgroundColor: mood.color }]}> 
                  <Feather name={mood.icon as keyof typeof Feather.glyphMap} size={14} color="#fff" />
                </View>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos du développeur</Text>
          <View style={styles.aboutCard}>
            <View style={styles.aboutBadge}>
              <Feather name="code" size={20} color={colors.paper} />
            </View>
            <View style={styles.aboutContent}>
              <Text style={styles.aboutTitle}>Créé par {CONTACT.name}</Text>
              <Text style={styles.aboutSubtitle}>
                Passionné par les applications mobiles sécurisées et les expériences élégantes.
              </Text>
              <View style={styles.aboutMetaRow}>
                <Feather name="map-pin" size={14} color={colors.coral} />
                <Text style={styles.aboutMeta}>{CONTACT.location}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact & QR Code</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{CONTACT.name}</Text>
              <Text style={styles.contactLine}>{CONTACT.phone}</Text>
              <Text style={styles.contactLine}>{CONTACT.email}</Text>
              <Text style={styles.contactLine}>{CONTACT.instagram}</Text>
            </View>
            <View style={styles.qrWrapper}>
              <QRCode value={contactPayload} size={90} color={colors.night} backgroundColor={colors.white} />
            </View>
          </View>
        </View>
      </ScrollView>

      {isLocked && (
        <View style={styles.lockOverlay}>
          <View style={styles.lockCard}>
            <View style={styles.lockIcon}>
              <Feather name="key" size={24} color={colors.paper} />
            </View>
            <Text style={styles.lockTitle}>{lockTitle}</Text>
            <Text style={styles.lockSubtitle}>{lockSubtitle}</Text>

            <View style={styles.pinDots}>
              {Array.from({ length: PIN_LENGTH }).map((_, index) => (
                <View
                  key={index}
                  style={[styles.pinDot, pinInput[index] ? styles.pinDotActive : null]}
                />
              ))}
            </View>

            {pinError && <Text style={styles.pinError}>{pinError}</Text>}

            <ScrollView contentContainerStyle={styles.emojiGrid}>
              {EMOJI_CATEGORIES.map((category) => (
                <View key={category.title} style={styles.categoryBlock}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <View style={styles.emojiRow}>
                    {category.values.map((emoji) => (
                      <Pressable
                        key={emoji}
                        style={styles.emojiButton}
                        onPress={() => handleEmojiPress(emoji)}
                      >
                        <Text style={styles.emojiText}>{emoji}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.lockActions}>
              <Pressable style={styles.secondaryButton} onPress={handleBackspace}>
                <Feather name="delete" size={16} color={colors.night} />
                <Text style={styles.secondaryButtonText}>Effacer</Text>
              </Pressable>
              {storedPin && (
                <Pressable style={styles.ghostButton} onPress={handleResetPin}>
                  <Text style={styles.ghostButtonText}>Réinitialiser PIN</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.18,
  },
  orbOne: {
    width: 280,
    height: 280,
    backgroundColor: colors.gold,
    top: -80,
    left: -80,
  },
  orbTwo: {
    width: 230,
    height: 230,
    backgroundColor: colors.teal,
    top: 140,
    right: -70,
  },
  orbThree: {
    width: 260,
    height: 260,
    backgroundColor: colors.coral,
    bottom: -110,
    left: 20,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 0.4,
    fontFamily: 'serif',
  },
  headerSpacer: {
    flex: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF90',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#FFF8EE',
    borderWidth: 1,
    borderColor: colors.mist,
    gap: 12,
  },
  kicker: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.night,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.ink,
    fontFamily: 'serif',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: '#3C3A35',
    lineHeight: 20,
  },
  lockButton: {
    marginTop: 8,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mist,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lockButtonIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.night,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockButtonText: {
    flex: 1,
    gap: 4,
  },
  lockButtonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  lockButtonSubtitle: {
    fontSize: 12,
    color: '#4E4740',
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    fontFamily: 'serif',
  },
  sectionAction: {
    fontSize: 12,
    color: colors.night,
    fontWeight: '600',
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mist,
  },
  moodChipActive: {
    borderColor: colors.night,
    borderWidth: 1.5,
    backgroundColor: '#F1EFEB',
  },
  moodIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodLabel: {
    fontSize: 12,
    color: colors.ink,
    fontWeight: '600',
  },
  aboutCard: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mist,
  },
  aboutBadge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.night,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutContent: {
    flex: 1,
    gap: 6,
  },
  aboutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  aboutSubtitle: {
    fontSize: 12,
    color: '#4E4740',
    lineHeight: 18,
  },
  aboutMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aboutMeta: {
    fontSize: 12,
    color: colors.coral,
    fontWeight: '600',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.mist,
    gap: 16,
  },
  contactInfo: {
    flex: 1,
    gap: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  contactLine: {
    fontSize: 12,
    color: '#4E4740',
  },
  qrWrapper: {
    padding: 10,
    borderRadius: 16,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.mist,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 11, 16, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  lockCard: {
    width: '100%',
    maxHeight: '88%',
    borderRadius: 24,
    backgroundColor: colors.white,
    padding: 20,
    gap: 12,
  },
  lockIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.night,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  lockSubtitle: {
    fontSize: 12,
    color: '#4E4740',
  },
  pinDots: {
    flexDirection: 'row',
    gap: 10,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E4DED5',
  },
  pinDotActive: {
    backgroundColor: colors.night,
  },
  pinError: {
    fontSize: 12,
    color: colors.coral,
    fontWeight: '600',
  },
  emojiGrid: {
    gap: 12,
  },
  categoryBlock: {
    gap: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.night,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F4F1EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 22,
  },
  lockActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.mist,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.night,
  },
  ghostButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  ghostButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.coral,
  },
});
