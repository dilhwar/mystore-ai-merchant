import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/store/themeStore';

export default function IndexScreen() {
  const { isAuthenticated, initializeAuth } = useAuth();
  const { colors } = useTheme();
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    initializeAuth().finally(() => setIsInitialized(true));
  }, []);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect based on auth status
  if (isAuthenticated) {
    return <Redirect href="/tabs/dashboard" />;
  }

  return <Redirect href="/auth/login" />;
}
