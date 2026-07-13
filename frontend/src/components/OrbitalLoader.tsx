import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { Colors } from '../theme';

interface OrbitalLoaderProps {
  size?: number;
}

interface FloatingSymbol {
  char: string;
  left: number;
  top: number;
  delay: number;
}

const SYMBOLS: FloatingSymbol[] = [
  { char: '✦', left: 0.1, top: 0.15, delay: 0 },
  { char: '☽', left: 0.82, top: 0.25, delay: 1300 },
  { char: '⭐', left: 0.28, top: 0.78, delay: 2600 },
];

function useLoop(
  toValue: number,
  duration: number,
  easing: (v: number) => number = Easing.linear
): Animated.Value {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(value, {
        toValue,
        duration,
        easing,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [value, toValue, duration, easing]);
  return value;
}

export default function OrbitalLoader({ size = 200 }: OrbitalLoaderProps) {
  // Halka dönüşleri (0 -> 1 -> derece)
  const outer = useLoop(1, 2800);
  const mid = useLoop(1, 5000);
  const inner = useLoop(1, 1800);

  // Merkez fincan salınımı ve ambient glow easeInOut ile
  const float = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    const glowAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    floatAnim.start();
    glowAnim.start();
    return () => {
      floatAnim.stop();
      glowAnim.stop();
    };
  }, [float, glow]);

  const spin = (v: Animated.Value, clockwise: boolean) =>
    v.interpolate({
      inputRange: [0, 1],
      outputRange: clockwise ? ['0deg', '360deg'] : ['0deg', '-360deg'],
    });

  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  const ringOuter = size;
  const ringMid = size * 0.82;
  const ringInner = size * 0.64;
  const cup = size * 0.48;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Ambient glow */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: ringOuter,
            height: ringOuter,
            borderRadius: ringOuter / 2,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      {/* Floating symbols */}
      {SYMBOLS.map((s) => (
        <FloatingGlyph key={s.char} symbol={s} size={size} />
      ))}

      {/* Outer ring — clockwise */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: ringOuter,
            height: ringOuter,
            borderRadius: ringOuter / 2,
            transform: [{ rotate: spin(outer, true) }],
          },
        ]}
      />

      {/* Mid ring — counter-clockwise, dashed */}
      <Animated.View
        style={[
          styles.ring,
          styles.dashed,
          {
            width: ringMid,
            height: ringMid,
            borderRadius: ringMid / 2,
            transform: [{ rotate: spin(mid, false) }],
          },
        ]}
      />

      {/* Inner ring — clockwise */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: ringInner,
            height: ringInner,
            borderRadius: ringInner / 2,
            borderColor: Colors.gold,
            transform: [{ rotate: spin(inner, true) }],
          },
        ]}
      />

      {/* Center cup — floats up/down */}
      <Animated.View
        style={[
          styles.cup,
          {
            width: cup,
            height: cup,
            borderRadius: cup / 2,
            transform: [{ translateY: floatY }],
          },
        ]}
      >
        <Animated.Text style={styles.cupIcon}>☕</Animated.Text>
      </Animated.View>
    </View>
  );
}

function FloatingGlyph({ symbol, size }: { symbol: FloatingSymbol; size: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 4000,
        delay: symbol.delay,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [progress, symbol.delay]);

  const opacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.4, 0],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  return (
    <Animated.Text
      style={[
        styles.glyph,
        {
          left: symbol.left * size,
          top: symbol.top * size,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {symbol.char}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: Colors.goldGlow,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: Colors.goldDim,
  },
  dashed: {
    borderStyle: 'dashed',
    borderColor: Colors.gold,
  },
  cup: {
    position: 'absolute',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cupIcon: {
    fontSize: 34,
  },
  glyph: {
    position: 'absolute',
    fontSize: 16,
    color: Colors.gold,
  },
});
