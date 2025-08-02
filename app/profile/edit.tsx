import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { Button } from '@/components/Button';
import { COLORS } from '@/constants/colors';
import { ArrowLeft, Camera, Save } from 'lucide-react-native';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const handleSave = async () => {
    if (!user) return;

    if (!formData.name.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie einen Namen ein.');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie eine E-Mail-Adresse ein.');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar,
      });

      Alert.alert(
        'Erfolg',
        'Ihr Profil wurde erfolgreich aktualisiert.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert(
        'Fehler',
        'Beim Aktualisieren Ihres Profils ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleAvatarPress = () => {
    Alert.alert(
      'Profilbild ändern',
      'Diese Funktion wird in einer zukünftigen Version verfügbar sein.',
      [{ text: 'OK' }]
    );
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Profil bearbeiten',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isLoading}>
              <Save size={20} color={isLoading ? COLORS.textMuted : COLORS.primary} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTitleStyle: {
            color: COLORS.text,
            fontSize: 18,
            fontWeight: '600',
          },
        }} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarContainer}>
            <Image
              source={{ 
                uri: formData.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200&auto=format&fit=crop' 
              }}
              style={styles.avatar}
            />
            <View style={styles.cameraOverlay}>
              <Camera size={20} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tippen Sie, um Ihr Profilbild zu ändern</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Ihr vollständiger Name"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-Mail *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="ihre.email@beispiel.de"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder="+49 123 456 7890"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          {user.role === 'consultant' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Über mich</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                placeholder="Erzählen Sie etwas über sich und Ihre Expertise..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}
        </View>

        <Button
          title={isLoading ? 'Wird gespeichert...' : 'Änderungen speichern'}
          onPress={handleSave}
          disabled={isLoading}
          style={styles.saveButtonLarge}
          testID="save-profile-button"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  saveButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarHint: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: COLORS.white,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.backgroundLight,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  saveButtonLarge: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
  },
});