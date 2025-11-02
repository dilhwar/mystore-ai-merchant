import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Keyboard,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useAuth } from '@/store/authStore';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';
import { spacing } from '@/theme/spacing';
import { getTextAlign, getFlexDirection } from '@/utils/i18n.helper';
import { LogIn } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import { sendPushToken } from '@/services/notifications.service';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const { colors } = useTheme();
  const { login, isLoading, error: authError } = useAuth();

  const passwordInputRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    if (!email) {
      newErrors.email = t('email_required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('email_invalid');
    }

    // Password validation
    if (!password) {
      newErrors.password = t('password_required');
    } else if (password.length < 6) {
      newErrors.password = t('password_min_length');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log('🔐 Attempting login...');
      await login(email, password);
      console.log('✅ Login successful, navigating to dashboard...');

      // Register push token after successful login
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted') {
          const tokenData = await Notifications.getDevicePushTokenAsync();
          const token = `ExponentPushToken[${tokenData.data}]`;
          await sendPushToken(token);
          console.log('✅ Push token registered after login');
        }
      } catch (tokenError) {
        console.log('⚠️  Could not register push token:', tokenError);
        // Don't fail login if push token registration fails
      }

      // Navigate to dashboard on successful login
      router.replace('/tabs/dashboard');
      console.log('📍 Navigation triggered');
    } catch (error: any) {
      // Show error message from the caught error, not from store
      console.error('❌ Login error:', error);
      const errorMessage = error.message || t('login_error');
      Alert.alert(t('error'), errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
          {/* Logo/Brand Area */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoText}>M</Text>
            </View>
            <Text style={[styles.brandName, { color: colors.text }]}>
              MyStore AI
            </Text>
            <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>
              {t('welcome_subtitle')}
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Input
              placeholder={t('email_placeholder')}
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />

            <Input
              ref={passwordInputRef}
              placeholder={t('password_placeholder')}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={[
                styles.loginButton,
                { backgroundColor: colors.primary },
                isLoading && styles.loginButtonDisabled,
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? t('common:loading', 'Loading...') : t('login')}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => {/* TODO: Implement forgot password */}}
              style={styles.forgotPassword}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                {t('forgot_password')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
              {t('common:or', 'or')}
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            style={[styles.registerButton, { borderColor: colors.border }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.registerButtonText, { color: colors.primary }]}>
              {t('signup_now')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  brandTagline: {
    fontSize: 15,
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    marginBottom: 24,
  },
  loginButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  forgotPasswordText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 0.5,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  registerButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
