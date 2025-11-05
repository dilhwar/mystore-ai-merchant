import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { haptics } from '@/utils/haptics';
import { changeLanguage } from '@/locales/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Pressable,
  Input,
  InputField,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import {
  ArrowLeft,
  Globe,
  DollarSign,
  Clock,
  Languages,
  MapPin,
  ChevronDown,
  Save,
  Store,
  Mail,
  Phone,
  MapPinned,
  Link2,
  User,
  UserCircle,
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

// Timezone data - Major timezones
const TIMEZONES = [
  { value: 'Asia/Riyadh', label: 'Riyadh (GMT+3)', labelAr: 'الرياض (GMT+3)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)', labelAr: 'دبي (GMT+4)' },
  { value: 'Asia/Kuwait', label: 'Kuwait (GMT+3)', labelAr: 'الكويت (GMT+3)' },
  { value: 'Asia/Qatar', label: 'Doha (GMT+3)', labelAr: 'الدوحة (GMT+3)' },
  { value: 'Asia/Bahrain', label: 'Bahrain (GMT+3)', labelAr: 'البحرين (GMT+3)' },
  { value: 'Asia/Muscat', label: 'Muscat (GMT+4)', labelAr: 'مسقط (GMT+4)' },
  { value: 'Asia/Baghdad', label: 'Baghdad (GMT+3)', labelAr: 'بغداد (GMT+3)' },
  { value: 'Africa/Cairo', label: 'Cairo (GMT+2)', labelAr: 'القاهرة (GMT+2)' },
  { value: 'Asia/Amman', label: 'Amman (GMT+2)', labelAr: 'عمان (GMT+2)' },
  { value: 'Europe/London', label: 'London (GMT+0)', labelAr: 'لندن (GMT+0)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)', labelAr: 'باريس (GMT+1)' },
  { value: 'America/New_York', label: 'New York (GMT-5)', labelAr: 'نيويورك (GMT-5)' },
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

export default function RegionalSettingsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation('settings');
  const { colors } = useTheme();
  const currentLanguage = i18n.language;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Regional settings state
  const [currency, setCurrency] = useState('SAR');
  const [timezone, setTimezone] = useState('Asia/Riyadh');
  const [defaultLanguage, setDefaultLanguage] = useState('ar');
  const [defaultCountryCode, setDefaultCountryCode] = useState('+971');
  const [whatsappLanguage, setWhatsappLanguage] = useState('ar');

  // Store information state
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');

  // Profile information state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    loadRegionalSettings();
  }, []);

  const loadRegionalSettings = async () => {
    try {
      setLoading(true);

      // Load saved language from AsyncStorage
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) {
        setDefaultLanguage(savedLanguage);
      }

      // TODO: Fetch from API
      // const response = await getStoreSettings();
      // setCurrency(response.currency || 'SAR');
      // setTimezone(response.timezone || 'Asia/Riyadh');
      // setDefaultLanguage(response.language || 'ar');
      // setDefaultCountryCode(response.defaultCountryCode || '+971');
      // setWhatsappLanguage(response.whatsappLanguage || 'ar');

      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      Alert.alert(t('error'), t('failed_to_load_settings'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      haptics.light();

      // TODO: Save to API
      // await updateStoreSettings({
      //   currency,
      //   timezone,
      //   language: defaultLanguage,
      //   defaultCountryCode,
      //   whatsappLanguage,
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      haptics.success();
      Alert.alert(t('success'), t('settings_saved_successfully'));
    } catch (error) {
      haptics.error();
      Alert.alert(t('error'), t('failed_to_save_settings'));
    } finally {
      setSaving(false);
    }
  };

  const getCurrencyDisplay = (code: string) => {
    const curr = CURRENCIES.find(c => c.code === code);
    if (!curr) return code;
    return currentLanguage === 'ar'
      ? `${curr.nameAr} (${curr.symbol})`
      : `${curr.name} (${curr.symbol})`;
  };

  const getTimezoneDisplay = (value: string) => {
    const tz = TIMEZONES.find(t => t.value === value);
    if (!tz) return value;
    return currentLanguage === 'ar' ? tz.labelAr : tz.label;
  };

  const getLanguageDisplay = (code: string) => {
    const lang = LANGUAGES.find(l => l.code === code);
    if (!lang) return code;
    return currentLanguage === 'ar' ? lang.nameAr : lang.name;
  };

  const getCountryCodeDisplay = (code: string) => {
    const country = COUNTRY_CODES.find(c => c.code === code);
    if (!country) return code;
    return currentLanguage === 'ar'
      ? `${country.countryAr} (${code})`
      : `${country.country} (${code})`;
  };

  if (loading) {
    return (
      <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
        {/* Header */}
        <Box px="$4" pt="$12" pb="$4">
          <HStack alignItems="center" space="md">
            <Pressable
              onPress={() => {
                haptics.light();
                router.back();
              }}
              w={40}
              h={40}
              borderRadius="$full"
              bg="$surfaceLight"
              $dark-bg="$surfaceDark"
              alignItems="center"
              justifyContent="center"
            >
              <ArrowLeft size={20} color={colors.text} strokeWidth={2.5} />
            </Pressable>
            <Heading size="xl" color="$textLight" $dark-color="$textDark">
              {t('regional_settings')}
            </Heading>
          </HStack>
        </Box>

        <Box flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text mt="$4" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
            {t('loading')}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$backgroundLight" $dark-bg="$backgroundDark">
      {/* Header */}
      <Box px="$4" pt="$12" pb="$4">
        <HStack alignItems="center" space="md" mb="$2">
          <Pressable
            onPress={() => {
              haptics.light();
              router.back();
            }}
            w={40}
            h={40}
            borderRadius="$full"
            bg="$surfaceLight"
            $dark-bg="$surfaceDark"
            alignItems="center"
            justifyContent="center"
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={2.5} />
          </Pressable>
          <Heading size="xl" color="$textLight" $dark-color="$textDark">
            {t('regional_settings')}
          </Heading>
        </HStack>
        <Text fontSize="$sm" color="$textSecondaryLight" $dark-color="$textSecondaryDark" ml="$12">
          {t('regional_settings_description')}
        </Text>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="md" px="$4" pb="$24">
          {/* Profile Information Section */}
          <VStack space="sm" mt="$2">
            <Text fontSize="$lg" fontWeight="$bold" color="$textLight" $dark-color="$textDark" mb="$2">
              {t('profile_information')}
            </Text>

            {/* First Name */}
            <Box
              bg="$cardLight"
              $dark-bg="$cardDark"
              borderRadius="$xl"
              p="$4"
            >
              <VStack space="sm">
                <HStack alignItems="center" space="sm" mb="$2">
                  <Box
                    w={40}
                    h={40}
                    borderRadius="$full"
                    bg="$primary100"
                    $dark-bg="$primary950"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <User size={20} color={colors.primary500} strokeWidth={2.5} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$bold" color="$textLight" $dark-color="$textDark">
                      {t('first_name')}
                    </Text>
                    <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                      {t('first_name_required')}
                    </Text>
                  </VStack>
                </HStack>

                <Input variant="outline" size="lg">
                  <InputField
                    placeholder={t('enter_first_name')}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </Input>
              </VStack>
            </Box>

            {/* Last Name */}
            <Box
              bg="$cardLight"
              $dark-bg="$cardDark"
              borderRadius="$xl"
              p="$4"
            >
              <VStack space="sm">
                <HStack alignItems="center" space="sm" mb="$2">
                  <Box
                    w={40}
                    h={40}
                    borderRadius="$full"
                    bg="$info100"
                    $dark-bg="$info950"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <UserCircle size={20} color={colors.info500} strokeWidth={2.5} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$bold" color="$textLight" $dark-color="$textDark">
                      {t('last_name')}
                    </Text>
                    <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                      {t('enter_last_name')}
                    </Text>
                  </VStack>
                </HStack>

                <Input variant="outline" size="lg">
                  <InputField
                    placeholder={t('enter_last_name')}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </Input>
              </VStack>
            </Box>

            {/* User Email */}
            <Box
              bg="$cardLight"
              $dark-bg="$cardDark"
              borderRadius="$xl"
              p="$4"
            >
              <VStack space="sm">
                <HStack alignItems="center" space="sm" mb="$2">
                  <Box
                    w={40}
                    h={40}
                    borderRadius="$full"
                    bg="$success100"
                    $dark-bg="$success950"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Mail size={20} color={colors.success500} strokeWidth={2.5} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$bold" color="$textLight" $dark-color="$textDark">
                      {t('email')}
                    </Text>
                    <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                      {t('email_required')}
                    </Text>
                  </VStack>
                </HStack>

                <Input variant="outline" size="lg">
                  <InputField
                    placeholder={t('enter_email')}
                    value={userEmail}
                    onChangeText={setUserEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </Input>
              </VStack>
            </Box>
          </VStack>

          {/* Divider */}
          <Box h={1} bg="$borderLight" $dark-bg="$borderDark" my="$4" />

          {/* Store Information Section */}
          <VStack space="sm" mt="$2">
            <Text fontSize="$lg" fontWeight="$bold" color="$textLight" $dark-color="$textDark" mb="$2">
              {t('store_information')}
            </Text>

            {/* Store Name */}
            <Box
              bg="$cardLight"
              $dark-bg="$cardDark"
              borderRadius="$xl"
              p="$4"
            >
              <VStack space="sm">
                <HStack alignItems="center" space="sm" mb="$2">
                  <Box
                    w={40}
                    h={40}
                    borderRadius="$full"
                    bg="$primary100"
                    $dark-bg="$primary950"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Store size={20} color={colors.primary500} strokeWidth={2.5} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$bold" color="$textLight" $dark-color="$textDark">
                      {t('store_name')}
                    </Text>
                    <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                      {t('store_name_required')}
                    </Text>
                  </VStack>
                </HStack>

                <Input variant="outline" size="lg">
                  <InputField
                    placeholder={t('enter_store_name')}
                    value={storeName}
                    onChangeText={setStoreName}
                  />
                </Input>
              </VStack>
            </Box>

            {/* Store Slug */}
            <Box
              bg="$cardLight"
              $dark-bg="$cardDark"
              borderRadius="$xl"
              p="$4"
            >
              <VStack space="sm">
                <HStack alignItems="center" space="sm" mb="$2">
                  <Box
                    w={40}
                    h={40}
                    borderRadius="$full"
                    bg="$info100"
                    $dark-bg="$info950"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Link2 size={20} color={colors.info500} strokeWidth={2.5} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$bold" color="$textLight" $dark-color="$textDark">
                      {t('store_slug')}
                    </Text>
                    <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                      {t('slug_helper_text')}
                    </Text>
                  </VStack>
                </HStack>

                <Input variant="outline" size="lg">
                  <InputField
                    placeholder={t('enter_store_slug')}
                    value={storeSlug}
                    onChangeText={setStoreSlug}
                    autoCapitalize="none"
                  />
                </Input>
              </VStack>
            </Box>

            {/* Store Email */}
            <Box
              bg="$cardLight"
              $dark-bg="$cardDark"
              borderRadius="$xl"
              p="$4"
            >
              <VStack space="sm">
                <HStack alignItems="center" space="sm" mb="$2">
                  <Box
                    w={40}
                    h={40}
                    borderRadius="$full"
                    bg="$success100"
                    $dark-bg="$success950"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Mail size={20} color={colors.success500} strokeWidth={2.5} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$bold" color="$textLight" $dark-color="$textDark">
                      {t('email')}
                    </Text>
                    <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                      {t('enter_email')}
                    </Text>
                  </VStack>
                </HStack>

                <Input variant="outline" size="lg">
                  <InputField
                    placeholder={t('enter_email')}
                    value={storeEmail}
                    onChangeText={setStoreEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </Input>
              </VStack>
            </Box>

            {/* Store Phone */}
            <Box
              bg="$cardLight"
              $dark-bg="$cardDark"
              borderRadius="$xl"
              p="$4"
            >
              <VStack space="sm">
                <HStack alignItems="center" space="sm" mb="$2">
                  <Box
                    w={40}
                    h={40}
                    borderRadius="$full"
                    bg="$warning100"
                    $dark-bg="$warning950"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Phone size={20} color={colors.warning500} strokeWidth={2.5} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$bold" color="$textLight" $dark-color="$textDark">
                      {t('phone')}
                    </Text>
                    <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                      {t('enter_phone')}
                    </Text>
                  </VStack>
                </HStack>

                <Input variant="outline" size="lg">
                  <InputField
                    placeholder={t('enter_phone')}
                    value={storePhone}
                    onChangeText={setStorePhone}
                    keyboardType="phone-pad"
                  />
                </Input>
              </VStack>
            </Box>

            {/* Store Address */}
            <Box
              bg="$cardLight"
              $dark-bg="$cardDark"
              borderRadius="$xl"
              p="$4"
            >
              <VStack space="sm">
                <HStack alignItems="center" space="sm" mb="$2">
                  <Box
                    w={40}
                    h={40}
                    borderRadius="$full"
                    bg="$error100"
                    $dark-bg="$error950"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <MapPinned size={20} color={colors.error500} strokeWidth={2.5} />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$bold" color="$textLight" $dark-color="$textDark">
                      {t('address')}
                    </Text>
                    <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                      {t('enter_address')}
                    </Text>
                  </VStack>
                </HStack>

                <Input variant="outline" size="lg">
                  <InputField
                    placeholder={t('enter_address')}
                    value={storeAddress}
                    onChangeText={setStoreAddress}
                    multiline
                    numberOfLines={3}
                  />
                </Input>
              </VStack>
            </Box>
          </VStack>

          {/* Divider */}
          <Box h={1} bg="$borderLight" $dark-bg="$borderDark" my="$4" />

          {/* Regional Settings Section */}
          <VStack space="sm">
            <Text fontSize="$lg" fontWeight="$bold" color="$textLight" $dark-color="$textDark" mb="$2">
              {t('regional_settings')}
            </Text>

          {/* Currency Setting */}
          <Box
            bg="$cardLight"
            $dark-bg="$cardDark"
            borderRadius="$xl"
            p="$4"
          >
            <VStack space="sm">
              <HStack alignItems="center" space="sm" mb="$2">
                <Box
                  w={40}
                  h={40}
                  borderRadius="$full"
                  bg="$success100"
                  $dark-bg="$success950"
                  alignItems="center"
                  justifyContent="center"
                >
                  <DollarSign size={20} color={colors.success500} strokeWidth={2.5} />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="$md" fontWeight="$bold" color="$textLight" $dark-color="$textDark">
                    {t('currency')}
                  </Text>
                  <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                    {t('currency_description')}
                  </Text>
                </VStack>
              </HStack>

              <Select selectedValue={currency} onValueChange={setCurrency}>
                <SelectTrigger variant="outline" size="lg">
                  <SelectInput placeholder={t('select_currency')} />
                  <SelectIcon mr="$3">
                    <ChevronDown size={20} color={colors.text} />
                  </SelectIcon>
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {CURRENCIES.map((curr) => (
                      <SelectItem
                        key={curr.code}
                        label={currentLanguage === 'ar' ? `${curr.nameAr} (${curr.symbol})` : `${curr.name} (${curr.symbol})`}
                        value={curr.code}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </VStack>
          </Box>

          {/* Timezone Setting */}
          <Box
            bg="$cardLight"
            $dark-bg="$cardDark"
            borderRadius="$xl"
            p="$4"
          >
            <VStack space="sm">
              <HStack alignItems="center" space="sm" mb="$2">
                <Box
                  w={40}
                  h={40}
                  borderRadius="$full"
                  bg="$info100"
                  $dark-bg="$info950"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Clock size={20} color={colors.info500} strokeWidth={2.5} />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="$md" fontWeight="$bold" color="$textLight" $dark-color="$textDark">
                    {t('timezone')}
                  </Text>
                  <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                    {t('timezone_description')}
                  </Text>
                </VStack>
              </HStack>

              <Select selectedValue={timezone} onValueChange={setTimezone}>
                <SelectTrigger variant="outline" size="lg">
                  <SelectInput placeholder={t('select_timezone')} />
                  <SelectIcon mr="$3">
                    <ChevronDown size={20} color={colors.text} />
                  </SelectIcon>
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {TIMEZONES.map((tz) => (
                      <SelectItem
                        key={tz.value}
                        label={currentLanguage === 'ar' ? tz.labelAr : tz.label}
                        value={tz.value}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </VStack>
          </Box>

          {/* Default Language Setting */}
          <Box
            bg="$cardLight"
            $dark-bg="$cardDark"
            borderRadius="$xl"
            p="$4"
          >
            <VStack space="sm">
              <HStack alignItems="center" space="sm" mb="$2">
                <Box
                  w={40}
                  h={40}
                  borderRadius="$full"
                  bg="$primary100"
                  $dark-bg="$primary950"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Languages size={20} color={colors.primary500} strokeWidth={2.5} />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="$md" fontWeight="$bold" color="$textLight" $dark-color="$textDark">
                    {t('default_language')}
                  </Text>
                  <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                    {t('default_language_description')}
                  </Text>
                </VStack>
              </HStack>

              <Select
                selectedValue={defaultLanguage}
                onValueChange={async (value) => {
                  try {
                    // Save to AsyncStorage first
                    await AsyncStorage.setItem('appLanguage', value);

                    // Change language
                    const result = await changeLanguage(value as 'en' | 'ar');

                    setDefaultLanguage(value);
                    haptics.success();

                    // Show alert with reload option
                    Alert.alert(
                      value === 'ar' ? 'تم تغيير اللغة' : 'Language Changed',
                      value === 'ar'
                        ? 'هل تريد إعادة تشغيل التطبيق الآن لتطبيق التغييرات؟'
                        : 'Would you like to reload the app now to apply changes?',
                      [
                        {
                          text: value === 'ar' ? 'لاحقاً' : 'Later',
                          style: 'cancel',
                        },
                        {
                          text: value === 'ar' ? 'إعادة التشغيل' : 'Reload',
                          onPress: async () => {
                            try {
                              if (__DEV__) {
                                // In development, just show message
                                Alert.alert(
                                  value === 'ar' ? 'إعادة التشغيل' : 'Reload',
                                  value === 'ar'
                                    ? 'يرجى إعادة تشغيل التطبيق يدوياً في وضع التطوير'
                                    : 'Please manually restart the app in development mode'
                                );
                              } else {
                                // In production, reload the app
                                await Updates.reloadAsync();
                              }
                            } catch (error) {
                              console.error('Error reloading app:', error);
                            }
                          },
                        },
                      ]
                    );
                  } catch (error) {
                    haptics.error();
                    console.error('Error changing language:', error);
                    Alert.alert(
                      t('error'),
                      'Failed to change language / فشل تغيير اللغة'
                    );
                  }
                }}
              >
                <SelectTrigger variant="outline" size="lg">
                  <SelectInput placeholder={t('select_language')} />
                  <SelectIcon mr="$3">
                    <ChevronDown size={20} color={colors.text} />
                  </SelectIcon>
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {LANGUAGES.map((lang) => (
                      <SelectItem
                        key={lang.code}
                        label={currentLanguage === 'ar' ? lang.nameAr : lang.name}
                        value={lang.code}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </VStack>
          </Box>

          {/* Default Country Code Setting */}
          <Box
            bg="$cardLight"
            $dark-bg="$cardDark"
            borderRadius="$xl"
            p="$4"
          >
            <VStack space="sm">
              <HStack alignItems="center" space="sm" mb="$2">
                <Box
                  w={40}
                  h={40}
                  borderRadius="$full"
                  bg="$warning100"
                  $dark-bg="$warning950"
                  alignItems="center"
                  justifyContent="center"
                >
                  <MapPin size={20} color={colors.warning500} strokeWidth={2.5} />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="$md" fontWeight="$bold" color="$textLight" $dark-color="$textDark">
                    {t('default_country_code')}
                  </Text>
                  <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                    {t('default_country_code_description')}
                  </Text>
                </VStack>
              </HStack>

              <Select selectedValue={defaultCountryCode} onValueChange={setDefaultCountryCode}>
                <SelectTrigger variant="outline" size="lg">
                  <SelectInput placeholder={t('select_country_code')} />
                  <SelectIcon mr="$3">
                    <ChevronDown size={20} color={colors.text} />
                  </SelectIcon>
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {COUNTRY_CODES.map((country) => (
                      <SelectItem
                        key={country.code}
                        label={currentLanguage === 'ar' ? `${country.countryAr} (${country.code})` : `${country.country} (${country.code})`}
                        value={country.code}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </VStack>
          </Box>

          {/* WhatsApp Language Setting */}
          <Box
            bg="$cardLight"
            $dark-bg="$cardDark"
            borderRadius="$xl"
            p="$4"
          >
            <VStack space="sm">
              <HStack alignItems="center" space="sm" mb="$2">
                <Box
                  w={40}
                  h={40}
                  borderRadius="$full"
                  bg="$success100"
                  $dark-bg="$success950"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Globe size={20} color={colors.success500} strokeWidth={2.5} />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="$md" fontWeight="$bold" color="$textLight" $dark-color="$textDark">
                    {t('whatsapp_language')}
                  </Text>
                  <Text fontSize="$xs" color="$textSecondaryLight" $dark-color="$textSecondaryDark">
                    {t('whatsapp_language_description')}
                  </Text>
                </VStack>
              </HStack>

              <Select selectedValue={whatsappLanguage} onValueChange={setWhatsappLanguage}>
                <SelectTrigger variant="outline" size="lg">
                  <SelectInput placeholder={t('select_language')} />
                  <SelectIcon mr="$3">
                    <ChevronDown size={20} color={colors.text} />
                  </SelectIcon>
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {LANGUAGES.map((lang) => (
                      <SelectItem
                        key={lang.code}
                        label={currentLanguage === 'ar' ? lang.nameAr : lang.name}
                        value={lang.code}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </VStack>
          </Box>
          </VStack>

          {/* Save Button */}
          <Button
            size="lg"
            bg="$primary500"
            borderRadius="$xl"
            onPress={handleSave}
            isDisabled={saving}
            mt="$4"
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <HStack space="sm" alignItems="center">
                <Save size={20} color="#FFFFFF" strokeWidth={2.5} />
                <ButtonText fontSize="$md" fontWeight="$bold">
                  {t('save_changes')}
                </ButtonText>
              </HStack>
            )}
          </Button>
        </VStack>
      </ScrollView>
    </Box>
  );
}
