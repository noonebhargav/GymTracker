export const GOLD_STANDARD_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Core/Abs',
  'Cardio',
] as const;

export type GoldStandardGroup = (typeof GOLD_STANDARD_GROUPS)[number];

export function toGoldStandardGroup(
  bodyPart: string,
  target?: string | null
): GoldStandardGroup | null {
  switch (bodyPart) {
    case 'chest':
      return 'Chest';
    case 'back':
      return 'Back';
    case 'shoulders':
      return 'Shoulders';
    case 'cardio':
      return 'Cardio';
    case 'waist':
      return 'Core/Abs';
    case 'upper legs':
    case 'lower legs':
      return 'Legs';
    case 'upper arms':
      if (target === 'biceps') return 'Biceps';
      if (target === 'triceps') return 'Triceps';
      return null;
    default:
      return null;
  }
}

export const EQUIPMENT_TYPES = [
  'assisted',
  'band',
  'barbell',
  'body weight',
  'bosu ball',
  'cable',
  'dumbbell',
  'elliptical machine',
  'ez barbell',
  'hammer',
  'kettlebell',
  'leverage machine',
  'medicine ball',
  'olympic barbell',
  'resistance band',
  'roller',
  'rope',
  'skierg machine',
  'sled machine',
  'smith machine',
  'stability ball',
  'stationary bike',
  'stepmill machine',
  'tire',
  'trap bar',
  'upper body ergometer',
  'weighted',
  'wheel roller',
] as const;

export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];

export function formatEquipmentLabel(type: string): string {
  return type
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
