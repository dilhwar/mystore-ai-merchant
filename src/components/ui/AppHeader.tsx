import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/store/themeStore';
import { getUnreadCount } from '@/services/notifications.service';
import { getStoreUrl } from '@/services/store.service';
import { spacing } from '@/theme/spacing';

interface AppHeaderProps {
  title?: string;
  showNotifications?: boolean;
  showStoreLink?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showNotifications = true,
  showStoreLink = true,
}) => {
  const { t } = useTranslation(['common', 'header']);
  const { colors } = useTheme();
  const router = useRouter();

  const [unreadCount, setUnreadCount] = useState(0);
  const [storeUrl, setStoreUrl] = useState('');

  // Load unread notifications count
  useEffect(() => {
    if (showNotifications) {
      loadUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [showNotifications]);

  // Load store URL
  useEffect(() => {
    if (showStoreLink) {
      loadStoreUrl();
    }
  }, [showStoreLink]);

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      // Silently fail - notifications API may not be available yet
    }
  };

  const loadStoreUrl = async () => {
    try {
      const url = await getStoreUrl();
      setStoreUrl(url);
    } catch (error) {
      // Silently fail - store URL will be hidden if not available
    }
  };

  const handleNotificationsPress = () => {
    router.push('/notifications');
  };

  const handleStorePress = async () => {
    if (!storeUrl) {
      Alert.alert(t('header:store_not_available'), t('header:store_not_published'));
      return;
    }

    const supported = await Linking.canOpenURL(storeUrl);
    if (supported) {
      await Linking.openURL(storeUrl);
    } else {
      Alert.alert(t('common:error'), t('header:cannot_open_store'));
    }
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.container}>
        {/* Title */}
        {title && (
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Actions */}
        <View style={styles.actions}>
          {/* Store Link Button - Always show, just disable if no URL */}
          {showStoreLink && (
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: storeUrl ? colors.primary + '10' : colors.border + '30' }
              ]}
              onPress={handleStorePress}
              activeOpacity={0.7}
              disabled={!storeUrl}
            >
              <Text style={styles.icon}>🏪</Text>
            </TouchableOpacity>
          )}

          {/* Notifications Button */}
          {showNotifications && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.background }]}
              onPress={handleNotificationsPress}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>🔔</Text>
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: spacing.s,
    paddingHorizontal: spacing.m,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  iconButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
