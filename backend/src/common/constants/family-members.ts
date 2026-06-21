export const FAMILY_MEMBERS = [
  'beatrice',
  'iman',
  'amel',
  'zakaria',
  'ismael',
  'sophia',
  'souleimane',
  'anouk',
  'carole',
] as const;

export type FamilyMember = (typeof FAMILY_MEMBERS)[number];
