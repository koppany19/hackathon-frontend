import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
});

const typography = {
  h1: {
    fontFamily,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  h3: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  label: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
};

export default typography;
