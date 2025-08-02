import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { Button } from '@/components/Button';
import { COLORS } from '@/constants/colors';
import { UserRole } from '@/types';

export default function RegisterScreen() {
  const { register, isLoading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleRegister = () => {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setValidationError('Bitte füllen Sie alle Felder aus.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (password.length < 8) {
      setValidationError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    setValidationError(null);
    register(email, password, name, role);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200&auto=format&fit=crop' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>VerhandlungsNavigator</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Konto erstellen</Text>
          <Text style={styles.subtitle}>Registrieren Sie sich, um die Plattform zu nutzen</Text>

          {(error || validationError) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error || validationError}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ihr vollständiger Name"
              autoCapitalize="words"
              testID="name-input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-Mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Ihre E-Mail-Adresse"
              keyboardType="email-address"
              autoCapitalize="none"
              testID="email-input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Passwort</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Mindestens 8 Zeichen"
              secureTextEntry
              testID="password-input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Passwort bestätigen</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Passwort wiederholen"
              secureTextEntry
              testID="confirm-password-input"
            />
          </View>

          <View style={styles.roleContainer}>
            <Text style={styles.label}>Ich bin ein:</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'client' && styles.roleButtonActive
                ]}
                onPress={() => setRole('client')}
                testID="client-role-button"
              >
                <Text 
                  style={[
                    styles.roleButtonText,
                    role === 'client' && styles.roleButtonTextActive
                  ]}
                >
                  Klient
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'consultant' && styles.roleButtonActive
                ]}
                onPress={() => setRole('consultant')}
                testID="consultant-role-button"
              >
                <Text 
                  style={[
                    styles.roleButtonText,
                    role === 'consultant' && styles.roleButtonTextActive
                  ]}
                >
                  Berater
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title="Registrieren"
            onPress={handleRegister}
            isLoading={isLoading}
            disabled={!name || !email || !password || !confirmPassword}
            style={styles.button}
            testID="register-button"
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Bereits ein Konto?</Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Anmelden</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.white,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 10,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  roleButtonText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  roleButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  button: {
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  loginText: {
    color: COLORS.textLight,
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});