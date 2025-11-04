/**
 * SmartSheet Component
 * Intelligent modal that appears from top or bottom based on available space
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
  LayoutChangeEvent,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { spacing } from '@/theme/spacing';
import { design } from '@/theme/design';
import { haptics } from '@/utils/haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SmartSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Y position where the trigger element is located (to calculate space) */
  triggerY?: number;
  showCloseButton?: boolean;
}

export function SmartSheet({
  visible,
  onClose,
  title,
  children,
  triggerY = SCREEN_HEIGHT / 2,
  showCloseButton = true,
}: SmartSheetProps) {
  const { colors } = useTheme();
  const [contentHeight, setContentHeight] = useState(300);
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  const slideAnim = useState(new Animated.Value(0))[0];

  // Calculate best position based on available space
  useEffect(() => {
    if (visible) {
      const spaceAbove = triggerY;
      const spaceBelow = SCREEN_HEIGHT - triggerY;
      const requiredHeight = contentHeight + 80; // Content + header padding

      // Smart positioning logic
      if (spaceBelow >= requiredHeight) {
        // Enough space below - show from bottom
        setPosition('bottom');
      } else if (spaceAbove >= requiredHeight) {
        // Not enough space below but enough above - show from top
        setPosition('top');
      } else if (spaceBelow > spaceAbove) {
        // Both tight, use larger space (below)
        setPosition('bottom');
      } else {
        // Both tight, use larger space (above)
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
      // Animate out
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, triggerY, contentHeight]);

  const handleClose = () => {
    haptics.light();
    onClose();
  };

  const handleContentLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
  };

  // Calculate transform based on position
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: position === 'bottom' ? [300, 0] : [-300, 0],
  });

  const maxHeight = position === 'bottom'
    ? SCREEN_HEIGHT - triggerY - spacing.xl
    : triggerY - spacing.xl;

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
            {
              backgroundColor: colors.surface,
              maxHeight,
              transform: [{ translateY }],
              [position === 'bottom' ? 'bottom' : 'top']: spacing.xl,
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
            onLayout={handleContentLayout}
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
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    width: '100%',
    borderRadius: design.radius.xl,
    ...design.shadow.xl,
    position: 'absolute',
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
