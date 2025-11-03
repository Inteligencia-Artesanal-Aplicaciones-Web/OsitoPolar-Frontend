/**
 * @fileoverview Theme Configuration for Ositopolar Frontend
 * @description Centralized color palette configuration for Light and Dark themes
 * Maintains the primary brand color #0079c2 (Azul Osito Polar) across both themes
 */

export const THEME_COLORS = {
  /**
   * Light Theme Colors
   * Primary brand color: #0079c2 (Azul Osito Polar)
   */
  LIGHT: {
    // Primary Colors - Azul Osito Polar
    primary: '#0079c2',
    primaryDark: '#005a94',
    primaryLight: '#0085cd',
    primaryHover: '#056a9d',

    // Background & Surface
    background: '#f5f7fa',
    backgroundAlt: '#ffffff',
    surface: '#ffffff',
    surfaceAlt: '#f8f9fa',
    surfaceHover: '#f2f7fa',

    // Text Colors
    text: '#333333',
    textSecondary: '#7f8c8d',
    textTertiary: '#95a5a6',
    textInverse: '#ffffff',

    // Border & Divider
    border: '#e0e7eb',
    borderLight: '#ecf0f1',
    divider: '#e9ecef',

    // Status Colors
    success: '#4CAF50',
    successLight: '#d1e7dd',
    successBorder: '#badbcc',
    warning: '#FFC107',
    warningLight: '#fff3cd',
    error: '#FF5252',
    errorLight: '#f8d7da',
    errorBorder: '#f5c2c7',
    info: '#0ea5e9',
    infoLight: '#dbeafe',
    infoDark: '#1e3a8a',

    // Card & Component Specific
    cardBackground: '#ffffff',
    cardBorder: '#e0e7eb',
    cardHover: 'rgba(0, 0, 0, 0.04)',

    // Dialog & Modal
    dialogBackground: '#ffffff',
    dialogHeaderBg: '#f8f9fa',
    dialogBorder: '#e9ecef',

    // Button
    buttonPrimaryBg: '#0884c4',
    buttonPrimaryHover: '#056a9d',
    buttonSecondaryBg: '#f8fafc',
    buttonSecondaryText: '#1e293b',
    buttonSecondaryBorder: '#cbd5e1',
    buttonSecondaryHover: '#e2e8f0',

    // Gradient
    gradientStart: '#0079c2',
    gradientEnd: '#005a94',

    // Shadow
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowMedium: 'rgba(0, 0, 0, 0.15)',
    shadowLarge: 'rgba(0, 0, 0, 0.2)',
  },

  /**
   * Dark Theme Colors
   * Adjusted for dark backgrounds while maintaining brand identity
   * Primary adjusted to #0ea5e9 for better visibility on dark backgrounds
   */
  DARK: {
    // Primary Colors - Lighter variant for dark mode visibility
    primary: '#0ea5e9',
    primaryDark: '#0369a1',
    primaryLight: '#38bdf8',
    primaryHover: '#0284c7',

    // Background & Surface
    background: '#0f172a',
    backgroundAlt: '#1e293b',
    surface: '#1e293b',
    surfaceAlt: '#334155',
    surfaceHover: '#475569',

    // Text Colors
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textInverse: '#0f172a',

    // Border & Divider
    border: '#334155',
    borderLight: '#475569',
    divider: '#475569',

    // Status Colors
    success: '#22c55e',
    successLight: '#166534',
    successBorder: '#15803d',
    warning: '#fbbf24',
    warningLight: '#713f12',
    error: '#ef4444',
    errorLight: '#7f1d1d',
    errorBorder: '#991b1b',
    info: '#38bdf8',
    infoLight: '#075985',
    infoDark: '#0ea5e9',

    // Card & Component Specific
    cardBackground: '#1e293b',
    cardBorder: '#334155',
    cardHover: 'rgba(255, 255, 255, 0.05)',

    // Dialog & Modal
    dialogBackground: '#1e293b',
    dialogHeaderBg: '#334155',
    dialogBorder: '#475569',

    // Button
    buttonPrimaryBg: '#0ea5e9',
    buttonPrimaryHover: '#0284c7',
    buttonSecondaryBg: '#334155',
    buttonSecondaryText: '#f1f5f9',
    buttonSecondaryBorder: '#475569',
    buttonSecondaryHover: '#475569',

    // Gradient
    gradientStart: '#0ea5e9',
    gradientEnd: '#0369a1',

    // Shadow
    shadow: 'rgba(0, 0, 0, 0.4)',
    shadowMedium: 'rgba(0, 0, 0, 0.5)',
    shadowLarge: 'rgba(0, 0, 0, 0.6)',
  }
};

/**
 * Theme types enumeration
 */
export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark'
};

/**
 * Helper function to get color value by theme and color name
 * @param {string} theme - Theme type ('light' or 'dark')
 * @param {string} colorName - Color property name
 * @returns {string} Color value
 */
export function getThemeColor(theme, colorName) {
  const themeKey = theme.toUpperCase();
  return THEME_COLORS[themeKey]?.[colorName] || '';
}

/**
 * Generates CSS custom properties object for a given theme
 * @param {string} theme - Theme type ('light' or 'dark')
 * @returns {Object} CSS custom properties
 */
export function generateCSSVariables(theme) {
  const themeKey = theme.toUpperCase();
  const colors = THEME_COLORS[themeKey];
  const cssVars = {};

  for (const [key, value] of Object.entries(colors)) {
    const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    cssVars[cssVarName] = value;
  }

  return cssVars;
}
