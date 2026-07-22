import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Fonts, ThemeColor } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'display'
    | 'title'
    | 'subtitle'
    | 'small'
    | 'smallBold'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

const HEADING_TYPES = new Set(['display', 'title', 'subtitle']);

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const defaultColor = HEADING_TYPES.has(type) ? 'heading' : 'text';

  return (
    <Text
      style={[
        { color: Colors[themeColor ?? defaultColor] },
        type === 'default' && styles.default,
        type === 'display' && styles.display,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  smallBold: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    lineHeight: 24,
  },
  default: {
    fontFamily: Fonts.sans,
    fontSize: 19,
    lineHeight: 28,
  },
  display: {
    fontFamily: Fonts.displayBold,
    fontSize: 30,
    lineHeight: 36,
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 40,
    lineHeight: 46,
  },
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: 24,
    lineHeight: 32,
  },
  link: {
    fontFamily: Fonts.sans,
    lineHeight: 26,
    fontSize: 16,
  },
  linkPrimary: {
    fontFamily: Fonts.sansMedium,
    lineHeight: 26,
    fontSize: 16,
    color: Colors.complement,
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
});
