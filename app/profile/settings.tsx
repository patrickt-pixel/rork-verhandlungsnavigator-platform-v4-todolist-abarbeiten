import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { ArrowLeft, Bell, Moon, Globe, Shield, Smartphone } from 'lucide-react-native';
import { DatabaseStatus } from '@/components/DatabaseStatus';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    autoBackup: true,
    biometricAuth: false,
  });

  const handleBack = () => {
    router.back();
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLanguagePress = () => {
    Alert.alert(
      'Sprache',
      'Diese Funktion wird in einer zukünftigen Version verfügbar sein.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyPress = () => {
    Alert.alert(
      'Datenschutz',
      'Diese Funktion wird in einer zukünftigen Version verfügbar sein.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Konto löschen',
      'Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Löschen', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Funktion nicht verfügbar',
              'Diese Funktion wird in einer zukünftigen Version verfügbar sein.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Einstellungen',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.text} />
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
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benachrichtigungen</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Push-Benachrichtigungen</Text>
                <Text style={styles.settingDescription}>
                  Erhalten Sie Benachrichtigungen über neue Nachrichten und Termine
                </Text>
              </View>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={() => toggleSetting('pushNotifications')}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconPlaceholder}>
                <Text style={styles.iconText}>@</Text>
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>E-Mail-Benachrichtigungen</Text>
                <Text style={styles.settingDescription}>
                  Erhalten Sie wichtige Updates per E-Mail
                </Text>
              </View>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={() => toggleSetting('emailNotifications')}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Smartphone size={20} color={COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>SMS-Benachrichtigungen</Text>
                <Text style={styles.settingDescription}>
                  Erhalten Sie wichtige Erinnerungen per SMS
                </Text>
              </View>
            </View>
            <Switch
              value={settings.smsNotifications}
              onValueChange={() => toggleSetting('smsNotifications')}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Darstellung</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Moon size={20} color={COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Dunkler Modus</Text>
                <Text style={styles.settingDescription}>
                  Verwenden Sie ein dunkles Design für die App
                </Text>
              </View>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={() => toggleSetting('darkMode')}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={handleLanguagePress}>
            <View style={styles.settingLeft}>
              <Globe size={20} color={COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Sprache</Text>
                <Text style={styles.settingDescription}>Deutsch</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sicherheit</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Shield size={20} color={COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Biometrische Authentifizierung</Text>
                <Text style={styles.settingDescription}>
                  Verwenden Sie Fingerabdruck oder Face ID
                </Text>
              </View>
            </View>
            <Switch
              value={settings.biometricAuth}
              onValueChange={() => toggleSetting('biometricAuth')}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacyPress}>
            <View style={styles.settingLeft}>
              <Shield size={20} color={COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Datenschutz</Text>
                <Text style={styles.settingDescription}>
                  Verwalten Sie Ihre Datenschutzeinstellungen
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daten</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconPlaceholder}>
                <Text style={styles.iconText}>↑</Text>
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Automatische Sicherung</Text>
                <Text style={styles.settingDescription}>
                  Sichern Sie Ihre Daten automatisch
                </Text>
              </View>
            </View>
            <Switch
              value={settings.autoBackup}
              onValueChange={() => toggleSetting('autoBackup')}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Database Status */}
        <DatabaseStatus showDetails={true} />

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Gefahrenbereich</Text>
          
          <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
            <Text style={styles.dangerText}>Konto löschen</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textMuted,
    fontWeight: '300',
  },
  dangerSection: {
    backgroundColor: COLORS.white,
    marginTop: 32,
    marginBottom: 32,
    paddingVertical: 8,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dangerItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.error,
  },
});