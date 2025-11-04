/**
 * Avatar Component
 * Reusable avatar with text, image, or icon support
 */

import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { useTheme } from '@/store/themeStore';
import { design } from '@/theme/design';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface AvatarProps {
  text?: string;
  source?: ImageSourcePropType;
  icon?: React.ReactNode;
  size?: AvatarSize;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
}

export function Avatar({
  text,
  source,
  icon,
  size = 'md',
  backgroundColor,
  textColor,
  style: customStyle,
}: AvatarProps) {
  const { colors } = useTheme();

  const avatarSize = design.avatar[size];
  const fontSize = {
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
  };

  return (
    <View
      style={[
        styles.avatar,
        {
          width: avatarSize,
          height: avatarSize,
          backgroundColor: backgroundColor || colors.primary,
        },
        customStyle,
      ]}
    >
      {source ? (
        <Image source={source} style={styles.image} />
      ) : icon ? (
        icon
      ) : (
        <Text
          style={[
            styles.text,
            {
              fontSize: fontSize[size],
              color: textColor || colors.white,
            },
          ]}
        >
          {text?.charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: design.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontWeight: '600',
  },
});
