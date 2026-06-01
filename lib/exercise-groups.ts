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

export function groupToSlug(group: string): string {
  return group.toLowerCase().replace(/\//g, '-');
}

export function slugToGroup(slug: string): GoldStandardGroup | null {
  const target = slug.toLowerCase();
  for (const g of GOLD_STANDARD_GROUPS) {
    if (groupToSlug(g) === target) return g;
  }
  return null;
}

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

export const PRIMARY_EQUIPMENT: readonly string[] = [
  'body weight',
  'dumbbell',
  'cable',
  'barbell',
  'leverage machine',
  'band',
  'smith machine',
  'kettlebell',
  'weighted',
  'stability ball',
  'ez barbell',
];

export const OTHER_EQUIPMENT_LABEL = 'Other';

export const DISPLAY_EQUIPMENT: readonly string[] = [
  ...PRIMARY_EQUIPMENT,
  OTHER_EQUIPMENT_LABEL,
];

const PRIMARY_EQUIPMENT_SET = new Set<string>(PRIMARY_EQUIPMENT);

export function toConsolidatedEquipment(raw: string): string {
  if (PRIMARY_EQUIPMENT_SET.has(raw)) return raw;
  return OTHER_EQUIPMENT_LABEL;
}

export function isOtherEquipment(raw: string): boolean {
  return !PRIMARY_EQUIPMENT_SET.has(raw);
}

export const OTHER_EQUIPMENT_TYPES: string[] = EQUIPMENT_TYPES.filter(
  (t) => !PRIMARY_EQUIPMENT_SET.has(t)
);

export function formatEquipmentLabel(type: string): string {
  if (type === OTHER_EQUIPMENT_LABEL) return type;
  return type
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
