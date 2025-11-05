import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/store/themeStore';
import { Platform, View } from 'react-native';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '../../gluestack-ui.config';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changeLanguage } from '@/locales/i18n';
import { Provider as PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  const { colors, isDark } = useTheme();

  // Initialize push notifications (just get token, will send after login)
  usePushNotifications();

  // Load saved language on app start
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
          await changeLanguage(savedLanguage as 'en' | 'ar');
        }
      } catch (error) {
        console.error('Error loading saved language:', error);
      }
    };

    loadSavedLanguage();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <PaperProvider>
        <GluestackUIProvider config={config} colorMode={isDark ? 'dark' : 'light'}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: colors.background,
            },
            // Native animations and gestures
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            // iOS-specific
            ...(Platform.OS === 'ios' && {
              headerTransparent: false,
              headerBlurEffect: 'regular',
            }),
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/login"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="auth/register"
            options={{
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="auth/verify-otp"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="tabs"
            options={{
              headerShown: false,
              animation: 'fade',
              title: 'Back',
            }}
          />
          <Stack.Screen
            name="orders/[id]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
              title: 'Order Details',
            }}
          />
          </Stack>
        </GluestackUIProvider>
      </PaperProvider>
    </View>
  );
}
