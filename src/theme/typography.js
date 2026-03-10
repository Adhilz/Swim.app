// ─────────────────────────────────────────────
//  HyperLocal Delivery App – Typography System
// ─────────────────────────────────────────────

import { Platform } from 'react-native';

export const FontFamily = {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    semiBold: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
    extraBold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
};

export const FontSizes = {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
};

export const LineHeights = {
    xs: 14,
    sm: 16,
    base: 20,
    md: 24,
    lg: 26,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
    '4xl': 40,
};

export const Typography = {
    // Display
    displayLarge: { fontSize: FontSizes['5xl'], fontWeight: '800', lineHeight: LineHeights['4xl'] },
    displayMedium: { fontSize: FontSizes['4xl'], fontWeight: '700', lineHeight: 40 },
    displaySmall: { fontSize: FontSizes['3xl'], fontWeight: '700', lineHeight: 36 },

    // Headlines
    h1: { fontSize: FontSizes['3xl'], fontWeight: '700', lineHeight: 36 },
    h2: { fontSize: FontSizes['2xl'], fontWeight: '700', lineHeight: 32 },
    h3: { fontSize: FontSizes.xl, fontWeight: '600', lineHeight: 28 },
    h4: { fontSize: FontSizes.lg, fontWeight: '600', lineHeight: 26 },
    h5: { fontSize: FontSizes.md, fontWeight: '600', lineHeight: 24 },

    // Body
    bodyLarge: { fontSize: FontSizes.md, fontWeight: '400', lineHeight: 24 },
    bodyMedium: { fontSize: FontSizes.base, fontWeight: '400', lineHeight: 20 },
    bodySmall: { fontSize: FontSizes.sm, fontWeight: '400', lineHeight: 16 },

    // Label
    labelLarge: { fontSize: FontSizes.base, fontWeight: '600', lineHeight: 20 },
    labelMedium: { fontSize: FontSizes.sm, fontWeight: '600', lineHeight: 16 },
    labelSmall: { fontSize: FontSizes.xs, fontWeight: '600', lineHeight: 14 },

    // Caption
    caption: { fontSize: FontSizes.xs, fontWeight: '400', lineHeight: 14 },
};
