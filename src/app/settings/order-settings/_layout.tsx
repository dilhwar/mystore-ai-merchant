import { Stack } from 'expo-router';
import { useTheme } from '@/store/themeStore';
import { useTranslation } from 'react-i18next';

export default function OrderSettingsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation('settings');

  return (
    <Stack
      screenOptions={{
        headerShown: false,
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
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: t('order_settings'),
        }}
      />
      <Stack.Screen
        name="shipping"
        options={{
          headerShown: false,
          title: t('shipping_methods'),
        }}
      />
      <Stack.Screen
        name="shipping/add"
        options={{
          headerShown: false,
          title: t('add_shipping_method'),
        }}
      />
      <Stack.Screen
        name="shipping/edit/[id]"
        options={{
          headerShown: false,
          title: t('edit_shipping_method'),
        }}
      />
      <Stack.Screen
        name="payment-methods"
        options={{
          headerShown: false,
          title: t('payment_methods'),
        }}
      />
      <Stack.Screen
        name="payment-methods/add"
        options={{
          headerShown: false,
          title: t('add_payment_method'),
        }}
      />
      <Stack.Screen
        name="payment-methods/edit/[id]"
        options={{
          headerShown: false,
          title: t('edit_payment_method'),
        }}
      />
      <Stack.Screen
        name="form-fields"
        options={{
          headerShown: false,
          title: t('form_fields'),
        }}
      />
      <Stack.Screen
        name="whatsapp"
        options={{
          headerShown: false,
          title: t('whatsapp_settings'),
        }}
      />
    </Stack>
  );
}
