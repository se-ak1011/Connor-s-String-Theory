import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

/**
 * The illustrated Connor + Pickles mark (a "C" window-frame seal).
 * Detailed painterly illustration — only use it where it can breathe
 * (splash, About/Contact). Too fine-detailed for small UI like the nav
 * bar; use the plain text BrandMark there instead.
 */

const ASPECT_RATIO = 814 / 887;

type BrandEmblemProps = {
  width?: number;
};

export function BrandEmblem({ width = 160 }: BrandEmblemProps) {
  return (
    <Image
      source={require('@/assets/images/brand/mark.png')}
      style={[styles.image, { width, aspectRatio: ASPECT_RATIO }]}
      contentFit="contain"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
  },
});
