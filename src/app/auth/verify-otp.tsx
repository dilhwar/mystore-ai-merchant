import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useAuth } from '@/store/authStore';
import { OTPInput } from '@/components/forms/OTPInput';
import { sendOTP, verifyOTP, resendOTP } from '@/services/otp.service';
import { spacing } from '@/theme/spacing';
import type { UserData } from '@/store/authStore';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, i18n } = useTranslation('auth');
  const { colors, isDark } = useTheme();
  const { setUser, setTokens } = useAuth();

  const phoneNumber = params.phoneNumber as string;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto-verify when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError(t('otp_length'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await verifyOTP({
        phoneNumber,
        otpCode: otp,
        purpose: 'registration',
      });

      if (result.success) {
        // If backend returns authentication tokens, set them in auth store
        if (result.data?.accessToken) {
          await setTokens(result.data.accessToken, result.data.refreshToken);

          // Set user data if available
          if (result.data.user || result.data.merchant) {
            const userData = result.data.user || result.data.merchant;
            const mappedUser: UserData = {
              id: userData.id,
              email: userData.email,
              firstName: userData.firstName || userData.storeName || '',
              lastName: userData.lastName || '',
            } as UserData;
            setUser(mappedUser);
          }
        }

        Alert.alert(
          t('otp_verified'),
          t('register_success'),
          [
            {
              text: 'OK',
              onPress: () => router.replace('/tabs/dashboard'),
            },
          ]
        );
      }
    } catch (error: any) {
      setError(error.message || t('otp_invalid'));
      setOtp(''); // Clear OTP on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setError('');

    try {
      await resendOTP({
        phoneNumber,
        purpose: 'registration',
        language: i18n.language as 'ar' | 'en',
      });

      Alert.alert(t('otp_sent'), '');
      setResendTimer(60);
      setCanResend(false);
    } catch (error: any) {
      setError(error.message || t('error'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>M</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          {t('otp_title')}
        </Text>

        {/* Subtitle with phone number */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('otp_subtitle')}
        </Text>
        <Text style={[styles.phoneNumber, { color: colors.text }]}>
          {phoneNumber}
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            error={!!error}
          />
        </View>

        {/* Error Message */}
        {error && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        )}

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerify}
          disabled={isLoading || otp.length !== 6}
          style={[
            styles.verifyButton,
            { backgroundColor: colors.primary },
            (isLoading || otp.length !== 6) && styles.buttonDisabled,
          ]}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('verify')}</Text>
          )}
        </TouchableOpacity>

        {/* Resend Section */}
        <View style={styles.resendContainer}>
          <Text style={[styles.didntReceive, { color: colors.textSecondary }]}>
            {t('didnt_receive')}
          </Text>

          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              {isResending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.resendButton, { color: colors.primary }]}>
                  {t('resend_otp')}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={[styles.timer, { color: colors.textSecondary }]}>
              {t('resend_in')} {resendTimer} {t('seconds')}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 40,
    textAlign: 'center',
  },
  otpContainer: {
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  verifyButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    gap: spacing.s,
  },
  didntReceive: {
    fontSize: 14,
  },
  resendButton: {
    fontSize: 15,
    fontWeight: '600',
  },
  timer: {
    fontSize: 14,
  },
});
