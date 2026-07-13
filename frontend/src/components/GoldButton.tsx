import React from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, FontFamily, Radius, Spacing, GoldGradient } from '../theme';

interface GoldButtonProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export default function GoldButton({
  label,
  onPress,
  style,
  disabled = false,
}: GoldButtonProps) {
  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrap,
        style,
        (pressed || disabled) && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={GoldGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
  gradient: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: Colors.black,
    fontFamily: FontFamily.sansSemi,
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
