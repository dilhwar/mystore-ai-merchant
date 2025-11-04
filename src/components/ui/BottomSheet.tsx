/**
 * BottomSheet Component
 * Smart modal that appears from top or bottom based on available space
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { haptics } from '@/utils/haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number | string;
  showCloseButton?: boolean;
  /** Enable smart positioning (auto top/bottom based on space) */
  smart?: boolean;
  /** Y position of trigger element for smart positioning */
  triggerY?: number;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  height = 'auto',
  showCloseButton = true,
  smart = true,
  triggerY = SCREEN_HEIGHT / 2,
}: BottomSheetProps) {
  const { colors } = useTheme();
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const slideAnim = useState(new Animated.Value(0))[0];

  // Smart positioning calculation
  useEffect(() => {
    if (visible && smart) {
      const spaceAbove = triggerY;
      const spaceBelow = SCREEN_HEIGHT - triggerY;

      // Choose position based on available space
      if (spaceBelow >= 300 || spaceBelow > spaceAbove) {
        setPosition('bottom');
      } else {
        setPosition('top');
      }

      // Animate in
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    } else {
      setPosition('bottom');

      if (visible) {
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }).start();
      }
    }
  }, [visible, smart, triggerY]);

  const handleClose = () => {
    haptics.light();
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const sheetHeight =
    height === 'auto'
      ? undefined
      : typeof height === 'string'
      ? (parseInt(height) / 100) * SCREEN_HEIGHT
      : height;

  // Calculate transform based on position
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: position === 'bottom' ? [400, 0] : [-400, 0],
  });

  const sheetStyle = position === 'bottom'
    ? styles.sheetBottom
    : styles.sheetTop;

  const borderRadius = position === 'bottom'
    ? {
        borderTopLeftRadius: design.radius.xl,
        borderTopRightRadius: design.radius.xl,
      }
    : {
        borderBottomLeftRadius: design.radius.xl,
        borderBottomRightRadius: design.radius.xl,
      };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            borderRadius,
            {
              backgroundColor: colors.surface,
              height: sheetHeight,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View
              style={[
                styles.header,
                {
                  borderBottomColor: colors.border,
                },
              ]}
            >
              {title && (
                <Text
                  style={[
                    styles.title,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {title}
                </Text>
              )}

              {showCloseButton && (
                <TouchableOpacity
                  onPress={handleClose}
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: colors.surfaceSecondary,
                    },
                  ]}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={20} color={colors.text} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    maxHeight: SCREEN_HEIGHT * 0.8,
    ...design.shadow.xl,
  },
  sheetBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheetTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.m,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.l,
  },
});
