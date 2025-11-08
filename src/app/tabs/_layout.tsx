import { Tabs } from 'expo-router';
import React from 'react';
import { Text, I18nManager, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  const { t, i18n } = useTranslation('common');
  const { colors, isDark } = useTheme();

  // Check RTL dynamically based on current language
  const isRTL = i18n.language === 'ar';

  // Tab order: for RTL, reverse the visual order
  const tabScreens = isRTL
    ? [
        { name: 'settings', title: t('store'), Icon: SettingsIcon },
        { name: 'products', title: t('products'), Icon: ProductsIcon },
        { name: 'categories', title: t('categories'), Icon: CategoriesIcon },
        { name: 'orders', title: t('orders'), Icon: OrdersIcon },
        { name: 'dashboard', title: t('home'), Icon: HomeIcon },
      ]
    : [
        { name: 'dashboard', title: t('home'), Icon: HomeIcon },
        { name: 'orders', title: t('orders'), Icon: OrdersIcon },
        { name: 'categories', title: t('categories'), Icon: CategoriesIcon },
        { name: 'products', title: t('products'), Icon: ProductsIcon },
        { name: 'settings', title: t('store'), Icon: SettingsIcon },
      ];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isDark ? 'rgba(18, 18, 18, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderTopWidth: 1,
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.2 : 0.08,
          shadowRadius: 8,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
          backdropFilter: 'blur(20px)',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
          gap: 4,
        },
        headerShown: false, // Hide default header
      }}
    >
      {tabScreens.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <tab.Icon color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}

// Icon Components (using emojis for now)
function HomeIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 26, color }}>☰</Text>;
}

function OrdersIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 26, color }}>📦</Text>;
}

function CategoriesIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 26, color }}>🏷️</Text>;
}

function ProductsIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 26, color }}>🎁</Text>;
}

function SettingsIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 26, color }}>⚙️</Text>;
}
