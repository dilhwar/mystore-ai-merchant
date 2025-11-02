import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput as RNTextInput,
} from 'react-native';
import { useTheme } from '@/store/themeStore';
import { useTranslation } from 'react-i18next';
import { COUNTRIES, Country } from '@/constants/countries';
import { spacing } from '@/theme/spacing';

interface CountryPickerProps {
  selectedCountry: Country | null;
  onSelectCountry: (country: Country) => void;
  error?: string;
}

export const CountryPicker: React.FC<CountryPickerProps> = ({
  selectedCountry,
  onSelectCountry,
  error,
}) => {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation('auth');
  const isRTL = i18n.language === 'ar';

  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES.filter((country) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      country.name.toLowerCase().includes(searchLower) ||
      country.nameAr.includes(searchQuery) ||
      country.phoneCode.includes(searchQuery)
    );
  });

  const handleSelect = (country: Country) => {
    onSelectCountry(country);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{t('country')}</Text>
      <TouchableOpacity
        style={[
          styles.pickerButton,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
            borderColor: error ? colors.error : 'transparent',
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.pickerText, { color: selectedCountry ? colors.text : colors.textSecondary }]}>
          {selectedCountry
            ? `${selectedCountry.phoneCode} ${isRTL ? selectedCountry.nameAr : selectedCountry.name}`
            : t('select_country')}
        </Text>
        <Text style={[styles.arrow, { color: colors.textSecondary }]}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('select_country')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <RNTextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  color: colors.text,
                },
              ]}
              placeholder={t('search_country')}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    { borderBottomColor: colors.border },
                    selectedCountry?.code === item.code && { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[styles.countryName, { color: colors.text }]}>
                    {isRTL ? item.nameAr : item.name}
                  </Text>
                  <Text style={[styles.phoneCode, { color: colors.textSecondary }]}>{item.phoneCode}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: spacing.m,
    borderRadius: 12,
    borderWidth: 2,
  },
  pickerText: {
    fontSize: 16,
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    marginLeft: spacing.s,
  },
  errorText: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.m,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.m,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 28,
    fontWeight: '300',
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: spacing.m,
    marginHorizontal: spacing.l,
    marginBottom: spacing.m,
    fontSize: 16,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 0.5,
  },
  countryName: {
    fontSize: 16,
    flex: 1,
  },
  phoneCode: {
    fontSize: 14,
    marginLeft: spacing.m,
  },
});
