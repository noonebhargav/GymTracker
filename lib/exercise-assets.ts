import { Platform, type ImageSourcePropType } from 'react-native';
import { EXERCISE_IMAGES, EXERCISE_GIFS } from '@/lib/asset-map';

export function getExerciseImage(
  assetId: string | null
): ImageSourcePropType | null {
  if (!assetId) return null;

  if (Platform.OS === 'web') {
    return { uri: `/exercises/images/${assetId}.jpg` };
  }

  return (EXERCISE_IMAGES[assetId] as ImageSourcePropType) ?? null;
}

export function getExerciseGif(
  assetId: string | null
): ImageSourcePropType | null {
  if (!assetId) return null;

  if (Platform.OS === 'web') {
    return { uri: `/exercises/videos/${assetId}.gif` };
  }

  return (EXERCISE_GIFS[assetId] as ImageSourcePropType) ?? null;
}
