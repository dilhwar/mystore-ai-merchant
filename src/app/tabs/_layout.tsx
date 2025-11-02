import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';

export default function TabLayout() {
  const { t } = useTranslation('common');
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        headerShown: false, // Hide default header
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('home'),
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('orders'),
          tabBarIcon: ({ color }) => <OrdersIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t('categories'),
          tabBarIcon: ({ color }) => <CategoriesIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: t('products'),
          tabBarIcon: ({ color }) => <ProductsIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('store'),
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

// Icon Components (using emojis for now)
function HomeIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 24, color }}>📊</Text>;
}

function OrdersIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 24, color }}>📦</Text>;
}

function CategoriesIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 24, color }}>🏷️</Text>;
}

function ProductsIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 24, color }}>🎁</Text>;
}

function SettingsIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 24, color }}>⚙️</Text>;
}
