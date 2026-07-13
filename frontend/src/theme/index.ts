export const Colors = {
  bg: '#0D0A08', // Ana arkaplan — derin koyu kahve
  surface: '#161210',
  card: '#1E1814', // Kart arkaplanı
  border: '#2A2218', // Kenarlık
  gold: '#C9A84C', // Ana aksan — antik altın
  goldDim: '#7A6330', // Soluk altın
  goldGlow: 'rgba(201,168,76,0.12)',
  cream: '#F2E8D9', // Ana metin
  mist: '#8A7E72', // İkincil metin
  black: '#0D0A08',
} as const;

export const FontFamily = {
  serif: 'PlayfairDisplay_700Bold',
  serifReg: 'PlayfairDisplay_400Regular',
  serifItalic: 'PlayfairDisplay_400Regular_Italic',
  sans: 'Inter_400Regular',
  sansMed: 'Inter_500Medium',
  sansSemi: 'Inter_600SemiBold',
  sansLight: 'Inter_300Light',
} as const;

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

export const Radius = { sm: 8, md: 12, lg: 16, xl: 20, full: 999 } as const;

// Uygulama boyunca tekrar eden altın gradient
export const GoldGradient = ['#C9A84C', '#A07830'] as const;

// Signature ornament — U+2726
export const Ornament = '✦';
