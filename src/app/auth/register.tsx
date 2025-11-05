import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useAuth } from '@/store/authStore';
import { Input } from '@/components/forms/Input';
import { CountryPicker } from '@/components/forms/CountryPicker';
import { PhoneInput } from '@/components/forms/PhoneInput';
import { Country, detectCountryFromLocale } from '@/constants/countries';
import { spacing } from '@/theme/spacing';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const { colors } = useTheme();
  const { register, isLoading, error: authError } = useAuth();

  const emailInputRef = useRef<TextInput>(null);
  const whatsappInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<any>({});

  // Auto-detect country on mount
  useEffect(() => {
    const loadCountry = async () => {
      const country = await detectCountryFromLocale();
      if (country) {
        setSelectedCountry(country);
      }
    };
    loadCountry();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!storeName.trim()) {
      newErrors.storeName = t('store_name_required');
    }

    if (!email) {
      newErrors.email = t('email_required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('email_invalid');
    }

    if (!selectedCountry) {
      newErrors.country = t('country_required');
    }

    if (!whatsappNumber) {
      newErrors.whatsapp = t('whatsapp_required');
    } else if (whatsappNumber.replace(/\D/g, '').length < 9) {
      newErrors.whatsapp = t('whatsapp_invalid');
    }

    if (!password) {
      newErrors.password = t('password_required');
    } else if (password.length < 6) {
      newErrors.password = t('password_min_length');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('password_required');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('password_mismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      // Format WhatsApp number with country code
      const fullWhatsappNumber = `${selectedCountry?.phoneCode}${whatsappNumber.replace(/\D/g, '')}`;

      // Call register API
      await register(storeName, email, selectedCountry!.name, fullWhatsappNumber, password);

      // Navigate to OTP verification with phone number
      router.push({
        pathname: '/auth/verify-otp',
        params: { phoneNumber: fullWhatsappNumber },
      });
    } catch (error: any) {
      // Show error message from the caught error, not from store
      const errorMessage = error.message || t('register_error');
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
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>M</Text>
          </View>
          <Text style={[styles.brandName, { color: colors.text }]}>{t('register_title')}</Text>
          <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>{t('register_subtitle')}</Text>
        </View>

        <View style={styles.formCard}>
          <Input
            placeholder={t('store_name_placeholder')}
            value={storeName}
            onChangeText={setStoreName}
            error={errors.storeName}
            autoComplete="name"
            textContentType="organizationName"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => emailInputRef.current?.focus()}
          />

          <Input
            ref={emailInputRef}
            placeholder={t('email_placeholder')}
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => whatsappInputRef.current?.focus()}
          />

          <CountryPicker
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
            error={errors.country}
          />

          <PhoneInput
            ref={whatsappInputRef}
            countryCode={selectedCountry?.phoneCode || '+1'}
            placeholder={t('whatsapp_placeholder')}
            value={whatsappNumber}
            onChangeText={setWhatsappNumber}
            error={errors.whatsapp}
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
            autoComplete="new-password"
            textContentType="newPassword"
            passwordRules="minlength: 6;"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
          />

          <Input
            ref={confirmPasswordInputRef}
            placeholder={t('confirm_password_placeholder')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            passwordRules="minlength: 6;"
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            style={[
              styles.registerButton,
              { backgroundColor: colors.primary },
              isLoading && styles.buttonDisabled,
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Loading...' : t('register')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>{t('common:or')}</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity
          onPress={() => router.push('/auth/login')}
          style={[styles.loginButton, { borderColor: colors.border }]}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>{t('login_now')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  brandName: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  brandTagline: { fontSize: 14, textAlign: 'center' },
  formCard: { width: '100%', marginBottom: 20 },
  registerButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divider: { flex: 1, height: 0.5, opacity: 0.3 },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  loginButton: {
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
