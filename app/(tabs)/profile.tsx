import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '@/hooks/auth-store';
import { Button } from '@/components/Button';
import { COLORS } from '@/constants/colors';
import { User, Settings, HelpCircle, Shield, Bell } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Abmelden',
      'Möchten Sie sich wirklich abmelden?',
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Abmelden',
          onPress: () => logout(),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: user.avatar || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200&auto=format&fit=crop' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>
          {user.role === 'client' ? 'Klient' : 'Berater'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Konto</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/edit')}
        >
          <User size={20} color={COLORS.primary} />
          <Text style={styles.menuText}>Persönliche Daten</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/profile/settings')}
        >
          <Settings size={20} color={COLORS.primary} />
          <Text style={styles.menuText}>Einstellungen</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/notifications')}
        >
          <Bell size={20} color={COLORS.primary} />
          <Text style={styles.menuText}>Benachrichtigungen</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <HelpCircle size={20} color={COLORS.primary} />
          <Text style={styles.menuText}>Hilfe & FAQ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Shield size={20} color={COLORS.primary} />
          <Text style={styles.menuText}>Datenschutz</Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Abmelden"
        onPress={handleLogout}
        variant="outline"
        style={styles.logoutButton}
        textStyle={styles.logoutButtonText}
        testID="logout-button"
      />

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  role: {
    fontSize: 14,
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  logoutButtonText: {
    color: COLORS.error,
  },
  version: {
    textAlign: 'center',
    color: COLORS.textLighter,
    fontSize: 12,
    marginTop: 16,
    marginBottom: 24,
  },
});