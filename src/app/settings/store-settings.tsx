import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, RefreshControl, Modal, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { haptics } from '@/utils/haptics';
import { apiGet, apiPut } from '@/services/api';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Pressable,
  Button,
  ButtonText,
  Spinner,
  Input,
  InputField,
} from '@gluestack-ui/themed';
import {
  ArrowLeft,
  Globe,
  DollarSign,
  Languages,
  MapPin,
  ChevronDown,
  Save,
  Check,
  X,
  Search,
} from 'lucide-react-native';

// Currency data
const CURRENCIES = [
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', nameAr: 'ريال سعودي' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', nameAr: 'درهم إماراتي' },
  { code: 'USD', name: 'US Dollar', symbol: '$', nameAr: 'دولار أمريكي' },
  { code: 'EUR', name: 'Euro', symbol: '€', nameAr: 'يورو' },
  { code: 'GBP', name: 'British Pound', symbol: '£', nameAr: 'جنيه إسترليني' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', nameAr: 'ريال قطري' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', nameAr: 'دينار كويتي' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', nameAr: 'دينار بحريني' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع', nameAr: 'ريال عماني' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', nameAr: 'جنيه مصري' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.أ', nameAr: 'دينار أردني' },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'د.ع', nameAr: 'دينار عراقي' },
];

// Language options
const LANGUAGES = [
  { code: 'en', name: 'English', nameAr: 'الإنجليزية' },
  { code: 'ar', name: 'Arabic', nameAr: 'العربية' },
];

// Country codes
const COUNTRY_CODES = [
  { code: '+966', country: 'Saudi Arabia', countryAr: 'السعودية' },
  { code: '+971', country: 'UAE', countryAr: 'الإمارات' },
  { code: '+965', country: 'Kuwait', countryAr: 'الكويت' },
  { code: '+974', country: 'Qatar', countryAr: 'قطر' },
  { code: '+973', country: 'Bahrain', countryAr: 'البحرين' },
  { code: '+968', country: 'Oman', countryAr: 'عمان' },
  { code: '+964', country: 'Iraq', countryAr: 'العراق' },
  { code: '+20', country: 'Egypt', countryAr: 'مصر' },
  { code: '+962', country: 'Jordan', countryAr: 'الأردن' },
  { code: '+1', country: 'USA/Canada', countryAr: 'أمريكا/كندا' },
  { code: '+44', country: 'UK', countryAr: 'بريطانيا' },
];

// Types
interface StoreSettings {
  id: string;
  storeId: string;
  currency: string;
  language: string;
  defaultCountryCode: string;
  whatsappLanguage?: string;
}

interface StoreWithSettings {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  isPublished: boolean;
  settings: StoreSettings;
}

interface UpdateStoreSettingsData {
  currency?: string;
  language?: string;
  defaultCountryCode?: string;
  whatsappLanguage?: string;
}

export default function StoreSettingsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation('settings');
  const { colors, isDark } = useTheme();
  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === 'ar';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [storeId, setStoreId] = useState<string>('');

  // Regional settings state
  const [currency, setCurrency] = useState('SAR');
  const [defaultLanguage, setDefaultLanguage] = useState('ar');
  const [defaultCountryCode, setDefaultCountryCode] = useState('+966');
  const [whatsappLanguage, setWhatsappLanguage] = useState('ar');

  // Modal states
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [countryCodeModalVisible, setCountryCodeModalVisible] = useState(false);
  const [whatsappLanguageModalVisible, setWhatsappLanguageModalVisible] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Track if settings have been modified
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState({
    currency: 'SAR',
    defaultLanguage: 'ar',
    defaultCountryCode: '+966',
    whatsappLanguage: 'ar',
  });

  useEffect(() => {
    loadStoreSettings();
  }, []);

  // Check if settings have changed
  useEffect(() => {
    const changed =
      currency !== originalSettings.currency ||
      defaultLanguage !== originalSettings.defaultLanguage ||
      defaultCountryCode !== originalSettings.defaultCountryCode ||
      whatsappLanguage !== originalSettings.whatsappLanguage;

    setHasChanges(changed);
  }, [currency, defaultLanguage, defaultCountryCode, whatsappLanguage, originalSettings]);

  const loadStoreSettings = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        haptics.light();
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch store with settings
      const response = await apiGet<{ message: string; data: StoreWithSettings[] | StoreWithSettings }>('/stores');
      const storeData = Array.isArray(response.data.data)
        ? response.data.data[0]
        : response.data.data;

      if (!storeData) {
        throw new Error('No store found');
      }

      setStoreId(storeData.id);

      if (storeData.settings) {
        const loadedSettings = {
          currency: storeData.settings.currency || 'SAR',
          defaultLanguage: storeData.settings.language || 'ar',
          defaultCountryCode: storeData.settings.defaultCountryCode || '+966',
          whatsappLanguage: storeData.settings.whatsappLanguage || 'ar',
        };

        setCurrency(loadedSettings.currency);
        setDefaultLanguage(loadedSettings.defaultLanguage);
        setDefaultCountryCode(loadedSettings.defaultCountryCode);
        setWhatsappLanguage(loadedSettings.whatsappLanguage);

        // Store original settings
        setOriginalSettings(loadedSettings);
        setHasChanges(false);
      }

      if (isRefresh) haptics.success();
    } catch (error: any) {
      console.error('Error loading store settings:', error);
      if (isRefresh) haptics.error();
      Alert.alert(t('error'), error.message || t('failed_to_load_settings'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      haptics.light();

      const updates: UpdateStoreSettingsData = {
        currency,
        language: defaultLanguage,
        defaultCountryCode,
        whatsappLanguage,
      };

      // Update store settings
      await apiPut(`/stores/${storeId}/settings`, updates);

      haptics.success();
      Alert.alert(t('success'), t('settings_saved_successfully'));
    } catch (error: any) {
      haptics.error();
      Alert.alert(t('error'), error.message || t('failed_to_save_settings'));
    } finally {
      setSaving(false);
    }
  };

  // Helper function to get currency label
  const getCurrencyLabel = (code: string) => {
    const curr = CURRENCIES.find(c => c.code === code);
    if (!curr) return code;
    return currentLanguage === 'ar' ? `${curr.nameAr} (${curr.symbol})` : `${curr.name} (${curr.symbol})`;
  };

  // Helper function to get language label
  const getLanguageLabel = (code: string) => {
    const lang = LANGUAGES.find(l => l.code === code);
    if (!lang) return code;
    return currentLanguage === 'ar' ? lang.nameAr : lang.name;
  };

  // Helper function to get country code label
  const getCountryCodeLabel = (code: string) => {
    const country = COUNTRY_CODES.find(c => c.code === code);
    if (!country) return code;
    return currentLanguage === 'ar' ? `${country.countryAr} (${country.code})` : `${country.country} (${country.code})`;
  };

  // Render picker modal with smart filtering
  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    items: any[],
    selectedValue: string,
    onSelect: (value: string) => void,
    labelKey: (item: any) => string,
    valueKey: string,
    title: string,
    showSearch: boolean = true,
    maxHeight: string = '99%'
  ) => {
    // Filter items based on search query
    const filteredItems = searchQuery
      ? items.filter((item) =>
          labelKey(item).toLowerCase().includes(searchQuery.toLowerCase())
        )
      : items;

    // Smart sorting: only show sections if there are many items
    const shouldShowSections = filteredItems.length > 4;

    // Disable search for small lists (2-4 items)
    const showSearchBox = showSearch && filteredItems.length > 4;

    // Find selected item for section headers
    const selectedItem = filteredItems.find((item) => item[valueKey] === selectedValue);

    // Sort items: selected first if showing sections, otherwise keep original order
    let sortedItems: any[];
    if (shouldShowSections) {
      const otherItems = filteredItems.filter((item) => item[valueKey] !== selectedValue);
      sortedItems = selectedItem ? [selectedItem, ...otherItems] : filteredItems;
    } else {
      // For small lists, just show all items in original order
      sortedItems = filteredItems;
    }

    const handleClose = () => {
      setSearchQuery('');
      onClose();
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable
          flex={1}
          bg="rgba(0,0,0,0.6)"
          onPress={handleClose}
          justifyContent="center"
          px="$5"
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Box
              bg="$surfaceLight"
              $dark-bg="$surfaceDark"
              borderRadius="$3xl"
              overflow="hidden"
              maxHeight={maxHeight}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.4 : 0.15,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              {/* Header */}
              <Box
                px="$5"
                py="$4"
                borderBottomWidth={1}
                borderBottomColor="$borderLight"
                $dark-borderBottomColor="$borderDark"
                bg="$backgroundLight"
                $dark-bg="$backgroundDark"
              >
                <HStack
                  alignItems="center"
                  justifyContent="space-between"
                  flexDirection={isRTL ? 'row-reverse' : 'row'}
                  mb={showSearchBox ? '$3' : 0}
                >
                  <Heading size="lg" color="$textLight" $dark-color="$textDark">
                    {title}
                  </Heading>
                  <Pressable
                    onPress={handleClose}
                    w={36}
                    h={36}
                    borderRadius="$full"
                    alignItems="center"
                    justifyContent="center"
                    bg="$borderLight"
                    $dark-bg="$borderDark"
                    $hover-bg="$backgroundHoverLight"
                    $dark-hover-bg="$backgroundHoverDark"
                  >
                    <X size={20} color={colors.text} strokeWidth={2.5} />
                  </Pressable>
                </HStack>

                {/* Search Input */}
                {showSearchBox && (
                  <Box
                    borderRadius="$xl"
                    borderWidth={1}
                    borderColor="$borderLight"
                    $dark-borderColor="$borderDark"
                    bg="$backgroundLight"
                    $dark-bg="$backgroundDark"
                    px="$3"
                    py="$2"
                  >
                    <HStack alignItems="center" space="sm" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                      <Search size={18} color={colors.textSecondary} />
                      <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder={currentLanguage === 'ar' ? 'بحث...' : 'Search...'}
                        placeholderTextColor={colors.textSecondary}
                        style={{
                          flex: 1,
                          fontSize: 15,
                          color: colors.text,
                          textAlign: isRTL ? 'right' : 'left',
                          paddingVertical: 4,
                        }}
                      />
                      {searchQuery !== '' && (
                        <Pressable onPress={() => setSearchQuery('')}>
                          <X size={16} color={colors.textSecondary} />
                        </Pressable>
                      )}
                    </HStack>
                  </Box>
                )}
              </Box>

              {/* List */}
              {filteredItems.length === 0 ? (
                <Box py="$8" alignItems="center">
                  <Text color="$textSecondaryLight" $dark-color="$textSecondaryDark" fontSize="$sm">
                    {currentLanguage === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                  </Text>
                </Box>
              ) : (
                <FlatList
                  data={sortedItems}
                  keyExtractor={(item) => item[valueKey]}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => {
                    const isSelected = item[valueKey] === selectedValue;
                    const isFirst = index === 0 && isSelected;
                    const isLast = index === sortedItems.length - 1;
                    return (
                      <Box>
                        {shouldShowSections && isFirst && sortedItems.length > 1 && (
                          <Box
                            px="$4"
                            py="$2"
                            bg="$backgroundLight"
                            $dark-bg="$backgroundDark"
                          >
                            <Text
                              fontSize="$xs"
                              fontWeight="$semibold"
                              color="$textSecondaryLight"
                              $dark-color="$textSecondaryDark"
                              textTransform="uppercase"
                              textAlign={isRTL ? 'right' : 'left'}
                            >
                              {currentLanguage === 'ar' ? 'الحالي' : 'Current'}
                            </Text>
                          </Box>
                        )}
                        {shouldShowSections && index === 1 && selectedItem && (
                          <Box
                            px="$4"
                            py="$2"
                            bg="$backgroundLight"
                            $dark-bg="$backgroundDark"
                          >
                            <Text
                              fontSize="$xs"
                              fontWeight="$semibold"
                              color="$textSecondaryLight"
                              $dark-color="$textSecondaryDark"
                              textTransform="uppercase"
                              textAlign={isRTL ? 'right' : 'left'}
                            >
                              {currentLanguage === 'ar' ? 'الكل' : 'All Options'}
                            </Text>
                          </Box>
                        )}
                        <TouchableOpacity
                          onPress={() => {
                            haptics.light();
                            onSelect(item[valueKey]);
                            setTimeout(() => {
                              haptics.success();
                              handleClose();
                            }, 150);
                          }}
                          style={{
                            marginHorizontal: shouldShowSections ? 12 : 16,
                            marginTop: shouldShowSections ? 6 : (index === 0 ? 16 : 8),
                            marginBottom: shouldShowSections ? 2 : (isLast ? 16 : 0),
                            paddingHorizontal: 20,
                            paddingVertical: shouldShowSections ? 14 : 18,
                            borderRadius: 16,
                            backgroundColor: isSelected
                              ? (isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.12)')
                              : (isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'),
                            borderWidth: isSelected ? 2 : 1,
                            borderColor: isSelected
                              ? (isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)')
                              : (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'),
                          }}
                        >
                          <HStack
                            alignItems="center"
                            justifyContent="space-between"
                            flexDirection={isRTL ? 'row-reverse' : 'row'}
                          >
                            <Text
                              fontSize={shouldShowSections ? '$md' : '$lg'}
                              color={isSelected ? '$primary500' : '$textLight'}
                              $dark-color={isSelected ? '$primary300' : '$textDark'}
                              fontWeight={isSelected ? '$bold' : '$medium'}
                              flex={1}
                            >
                              {labelKey(item)}
                            </Text>
                            {isSelected && (
                              <Box
                                w={shouldShowSections ? 24 : 28}
                                h={shouldShowSections ? 24 : 28}
                                borderRadius="$full"
                                bg="$primary500"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Check size={shouldShowSections ? 14 : 16} color="#FFFFFF" strokeWidth={3} />
                              </Box>
                            )}
                          </HStack>
                        </TouchableOpacity>
                      </Box>
                    );
                  }}
                  contentContainerStyle={{
                    paddingBottom: shouldShowSections ? 12 : 0,
                  }}
                />
              )}
            </Box>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  if (loading) {
    return (
      <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$primary500" />
        <Text mt="$4" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
          {t('loading')}
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadStoreSettings(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Box px="$4" pt="$4" pb="$4">
          <VStack space="lg">
            {/* Currency */}
            <Box bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$2xl" p="$4">
              <VStack space="md">
                <HStack alignItems="center" space="md" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                  <Box
                    w={48}
                    h={48}
                    borderRadius="$xl"
                    alignItems="center"
                    justifyContent="center"
                    style={{ backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)' }}
                  >
                    <DollarSign size={24} color="#16a34a" strokeWidth={2.5} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$semibold" color="$textLight" $dark-color="$textDark" textAlign={isRTL ? 'right' : 'left'}>
                      {t('currency')}
                    </Text>
                    <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textAlign={isRTL ? 'right' : 'left'}>
                      {t('currency_description')}
                    </Text>
                  </VStack>
                </HStack>
                <Pressable
                  onPress={() => {
                    haptics.light();
                    setCurrencyModalVisible(true);
                  }}
                  borderRadius="$xl"
                  borderWidth={1}
                  borderColor="$borderLight"
                  $dark-borderColor="$borderDark"
                  bg="$backgroundLight"
                  $dark-bg="$backgroundDark"
                  px="$4"
                  py="$3.5"
                >
                  <HStack alignItems="center" justifyContent="space-between" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                    <Text fontSize="$md" color="$textLight" $dark-color="$textDark">
                      {getCurrencyLabel(currency)}
                    </Text>
                    <ChevronDown size={20} color={colors.text} />
                  </HStack>
                </Pressable>
              </VStack>
            </Box>

            {/* Default Language */}
            <Box bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$2xl" p="$4">
              <VStack space="md">
                <HStack alignItems="center" space="md" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                  <Box
                    w={48}
                    h={48}
                    borderRadius="$xl"
                    alignItems="center"
                    justifyContent="center"
                    style={{ backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' }}
                  >
                    <Globe size={24} color="#8b5cf6" strokeWidth={2.5} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$semibold" color="$textLight" $dark-color="$textDark" textAlign={isRTL ? 'right' : 'left'}>
                      {t('default_language')}
                    </Text>
                    <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textAlign={isRTL ? 'right' : 'left'}>
                      {t('default_language_description')}
                    </Text>
                  </VStack>
                </HStack>
                <Pressable
                  onPress={() => {
                    haptics.light();
                    setLanguageModalVisible(true);
                  }}
                  borderRadius="$xl"
                  borderWidth={1}
                  borderColor="$borderLight"
                  $dark-borderColor="$borderDark"
                  bg="$backgroundLight"
                  $dark-bg="$backgroundDark"
                  px="$4"
                  py="$3.5"
                >
                  <HStack alignItems="center" justifyContent="space-between" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                    <Text fontSize="$md" color="$textLight" $dark-color="$textDark">
                      {getLanguageLabel(defaultLanguage)}
                    </Text>
                    <ChevronDown size={20} color={colors.text} />
                  </HStack>
                </Pressable>
              </VStack>
            </Box>

            {/* Country Code */}
            <Box bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$2xl" p="$4">
              <VStack space="md">
                <HStack alignItems="center" space="md" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                  <Box
                    w={48}
                    h={48}
                    borderRadius="$xl"
                    alignItems="center"
                    justifyContent="center"
                    style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)' }}
                  >
                    <MapPin size={24} color="#f59e0b" strokeWidth={2.5} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$semibold" color="$textLight" $dark-color="$textDark" textAlign={isRTL ? 'right' : 'left'}>
                      {t('default_country_code')}
                    </Text>
                    <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textAlign={isRTL ? 'right' : 'left'}>
                      {t('default_country_code_description')}
                    </Text>
                  </VStack>
                </HStack>
                <Pressable
                  onPress={() => {
                    haptics.light();
                    setCountryCodeModalVisible(true);
                  }}
                  borderRadius="$xl"
                  borderWidth={1}
                  borderColor="$borderLight"
                  $dark-borderColor="$borderDark"
                  bg="$backgroundLight"
                  $dark-bg="$backgroundDark"
                  px="$4"
                  py="$3.5"
                >
                  <HStack alignItems="center" justifyContent="space-between" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                    <Text fontSize="$md" color="$textLight" $dark-color="$textDark">
                      {getCountryCodeLabel(defaultCountryCode)}
                    </Text>
                    <ChevronDown size={20} color={colors.text} />
                  </HStack>
                </Pressable>
              </VStack>
            </Box>

            {/* WhatsApp Language */}
            <Box bg="$surfaceLight" $dark-bg="$surfaceDark" borderRadius="$2xl" p="$4">
              <VStack space="md">
                <HStack alignItems="center" space="md" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                  <Box
                    w={48}
                    h={48}
                    borderRadius="$xl"
                    alignItems="center"
                    justifyContent="center"
                    style={{ backgroundColor: isDark ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.1)' }}
                  >
                    <Languages size={24} color="#ec4899" strokeWidth={2.5} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$semibold" color="$textLight" $dark-color="$textDark" textAlign={isRTL ? 'right' : 'left'}>
                      {t('whatsapp_language')}
                    </Text>
                    <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark" textAlign={isRTL ? 'right' : 'left'}>
                      {t('whatsapp_language_description')}
                    </Text>
                  </VStack>
                </HStack>
                <Pressable
                  onPress={() => {
                    haptics.light();
                    setWhatsappLanguageModalVisible(true);
                  }}
                  borderRadius="$xl"
                  borderWidth={1}
                  borderColor="$borderLight"
                  $dark-borderColor="$borderDark"
                  bg="$backgroundLight"
                  $dark-bg="$backgroundDark"
                  px="$4"
                  py="$3.5"
                >
                  <HStack alignItems="center" justifyContent="space-between" flexDirection={isRTL ? 'row-reverse' : 'row'}>
                    <Text fontSize="$md" color="$textLight" $dark-color="$textDark">
                      {getLanguageLabel(whatsappLanguage)}
                    </Text>
                    <ChevronDown size={20} color={colors.text} />
                  </HStack>
                </Pressable>
              </VStack>
            </Box>

            {/* Save Button */}
            <Button
              size="lg"
              bg="$primary500"
              borderRadius="$2xl"
              onPress={handleSave}
              isDisabled={saving || !hasChanges}
              $active-bg="$primary600"
              mt="$2"
              opacity={!hasChanges && !saving ? 0.5 : 1}
            >
              {saving ? (
                <Spinner color="#FFFFFF" />
              ) : (
                <HStack space="sm" alignItems="center">
                  <Save size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <ButtonText fontSize="$md" fontWeight="$bold" color="$white">
                    {t('save_changes')}
                  </ButtonText>
                </HStack>
              )}
            </Button>
          </VStack>
        </Box>
      </ScrollView>

      {/* Modals */}
      {renderPickerModal(
        currencyModalVisible,
        () => setCurrencyModalVisible(false),
        CURRENCIES,
        currency,
        setCurrency,
        (item) => currentLanguage === 'ar' ? `${item.nameAr} (${item.symbol})` : `${item.name} (${item.symbol})`,
        'code',
        t('select_currency'),
        true,
        '75%'
      )}

      {renderPickerModal(
        languageModalVisible,
        () => setLanguageModalVisible(false),
        LANGUAGES,
        defaultLanguage,
        setDefaultLanguage,
        (item) => currentLanguage === 'ar' ? item.nameAr : item.name,
        'code',
        t('select_language')
      )}

      {renderPickerModal(
        countryCodeModalVisible,
        () => setCountryCodeModalVisible(false),
        COUNTRY_CODES,
        defaultCountryCode,
        setDefaultCountryCode,
        (item) => currentLanguage === 'ar' ? `${item.countryAr} (${item.code})` : `${item.country} (${item.code})`,
        'code',
        t('select_country_code'),
        true,
        '75%'
      )}

      {renderPickerModal(
        whatsappLanguageModalVisible,
        () => setWhatsappLanguageModalVisible(false),
        LANGUAGES,
        whatsappLanguage,
        setWhatsappLanguage,
        (item) => currentLanguage === 'ar' ? item.nameAr : item.name,
        'code',
        t('select_language')
      )}
    </Box>
  );
}
