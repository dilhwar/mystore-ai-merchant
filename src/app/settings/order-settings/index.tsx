import React from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { useRouter } from 'expo-router';
import { haptics } from '@/utils/haptics';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Pressable,
} from '@gluestack-ui/themed';
import {
  Truck,
  CreditCard,
  FileText,
  MessageCircle,
  ChevronRight,
} from 'lucide-react-native';

export default function OrderSettingsScreen() {
  const { t, i18n } = useTranslation('settings');
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const orderSettingsSections = [
    {
      id: 'shipping',
      title: t('shipping_methods'),
      description: t('shipping_methods_brief'),
      icon: Truck,
      route: '/settings/order-settings/shipping',
      iconColor: '$blue500',
      iconBg: '$blue50',
      iconBgDark: 'rgba(59, 130, 246, 0.15)',
    },
    {
      id: 'payment',
      title: t('payment_methods'),
      description: t('payment_methods_brief'),
      icon: CreditCard,
      route: '/settings/order-settings/payment-methods',
      iconColor: '$green500',
      iconBg: '$green50',
      iconBgDark: 'rgba(34, 197, 94, 0.15)',
    },
    {
      id: 'form-fields',
      title: t('form_fields'),
      description: t('form_fields_brief'),
      icon: FileText,
      route: '/settings/order-settings/form-fields',
      iconColor: '$purple500',
      iconBg: '$purple50',
      iconBgDark: 'rgba(139, 92, 246, 0.15)',
    },
    {
      id: 'whatsapp',
      title: t('whatsapp_settings'),
      description: t('whatsapp_settings_brief'),
      icon: MessageCircle,
      route: '/settings/order-settings/whatsapp',
      iconColor: '$amber500',
      iconBg: '$amber50',
      iconBgDark: 'rgba(245, 158, 11, 0.15)',
    },
  ];

  const handlePress = (route: string) => {
    haptics.light();
    router.push(route as any);
  };

  return (
    <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 100 }}
      >
        <Box px="$4">
          <VStack space="md">
            {orderSettingsSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Pressable
                  key={section.id}
                  onPress={() => handlePress(section.route)}
                  bg="$surfaceLight"
                  $dark-bg="$surfaceDark"
                  borderRadius="$2xl"
                  overflow="hidden"
                  $hover-bg="$backgroundHoverLight"
                  $dark-hover-bg="$backgroundHoverDark"
                  $active-opacity={0.8}
                >
                  <HStack
                    px="$4"
                    py="$4"
                    alignItems="center"
                    space="md"
                    flexDirection={isRTL ? 'row-reverse' : 'row'}
                  >
                    {/* Icon */}
                    <Box
                      w={56}
                      h={56}
                      borderRadius="$xl"
                      bg={isDark ? undefined : section.iconBg}
                      alignItems="center"
                      justifyContent="center"
                      style={
                        isDark
                          ? {
                              backgroundColor: section.iconBgDark,
                            }
                          : undefined
                      }
                    >
                      <Icon
                        size={28}
                        color={colors[section.iconColor?.replace('$', '') as keyof typeof colors] || colors.primary}
                        strokeWidth={2}
                      />
                    </Box>

                    {/* Text Content */}
                    <VStack flex={1} space="xs">
                      <Text
                        fontSize="$md"
                        fontWeight="$semibold"
                        color="$textLight"
                        $dark-color="$textDark"
                        textAlign={isRTL ? 'right' : 'left'}
                      >
                        {section.title}
                      </Text>
                      <Text
                        fontSize="$xs"
                        color="$textSecondaryLight"
                        $dark-color="$textSecondaryDark"
                        textAlign={isRTL ? 'right' : 'left'}
                        numberOfLines={1}
                      >
                        {section.description}
                      </Text>
                    </VStack>

                    {/* Chevron */}
                    <ChevronRight
                      size={22}
                      color={colors.textSecondary}
                      style={{
                        transform: [{ scaleX: isRTL ? -1 : 1 }],
                      }}
                    />
                  </HStack>
                </Pressable>
              );
            })}
          </VStack>
        </Box>
      </ScrollView>
    </Box>
  );
}
