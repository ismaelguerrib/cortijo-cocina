export const FAMILY_MEMBERS = [
  { value: 'BEATRICE', label: 'Béatrice' },
  { value: 'IMAN', label: 'Iman' },
  { value: 'AMEL', label: 'Amel' },
  { value: 'ZAKARIA', label: 'Zakaria' },
  { value: 'ISMAEL', label: 'Ismaël' },
  { value: 'SOFIA', label: 'Sofia' },
  { value: 'SOULEIMANE', label: 'Souleimane' }
] as const;

export const FAMILY_MEMBER_LABELS = Object.fromEntries(
  FAMILY_MEMBERS.map((member) => [member.value, member.label])
) as Record<(typeof FAMILY_MEMBERS)[number]['value'], string>;
