import React from 'react';
import { StyleSheet, Text, TextStyle, StyleProp } from 'react-native';
import { Colors, FontFamily } from '../theme';

interface SectionLabelProps {
  children: string;
  style?: StyleProp<TextStyle>;
}

export default function SectionLabel({ children, style }: SectionLabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 10,
    letterSpacing: 4,
    color: Colors.goldDim,
    textTransform: 'uppercase',
    fontFamily: FontFamily.sansSemi,
  },
});
