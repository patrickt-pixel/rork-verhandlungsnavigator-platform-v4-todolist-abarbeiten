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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Link } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { Button } from '@/components/Button';
import { COLORS } from '@/constants/colors';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';

export default function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    login(email, password);
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundPurple, COLORS.backgroundLight, COLORS.white]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Animated.View 
            entering={FadeInUp.delay(100)}
            style={styles.logoContainer}
          >
            <View style={styles.logoCircle}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200&auto=format&fit=crop' }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.logoText}>VerhandlungsNavigator</Text>
            <Text style={styles.logoSubtext}>Ihr Weg zum Verhandlungserfolg</Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(200)}
            style={styles.formCard}
          >
            <Text style={styles.title}>Willkommen zurück</Text>
            <Text style={styles.subtitle}>Melden Sie sich an, um fortzufahren</Text>

            {error && (
              <Animated.View 
                entering={FadeInDown.delay(300)}
                style={styles.errorContainer}
              >
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-Mail</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Ihre E-Mail-Adresse"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  testID="email-input"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Passwort</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 50 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Ihr Passwort"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showPassword}
                  testID="password-input"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={COLORS.textMuted} />
                  ) : (
                    <Eye size={20} color={COLORS.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Passwort vergessen?</Text>
            </TouchableOpacity>

            <Button
              title="Anmelden"
              onPress={handleLogin}
              variant="gradient"
              size="large"
              isLoading={isLoading}
              disabled={!email || !password}
              style={styles.button}
              testID="login-button"
            />

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Noch kein Konto?</Text>
              <Link href="/auth/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.registerLink}>Registrieren</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>

          {/* Demo credentials */}
          <Animated.View 
            entering={FadeInDown.delay(400)}
            style={styles.demoContainer}
          >
            <Text style={styles.demoTitle}>Demo-Zugangsdaten:</Text>
            <Text style={styles.demoText}>Klient: client@example.com / password123</Text>
            <Text style={styles.demoText}>Berater: consultant@example.com / password123</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  logoSubtext: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: COLORS.cardPink,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 16,
    paddingVertical: 16,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
    padding: 4,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    marginBottom: 24,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginRight: 4,
  },
  registerLink: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  demoContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  demoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});