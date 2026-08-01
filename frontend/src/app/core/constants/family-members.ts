export const FAMILY_MEMBERS = [
  { id: 'beatrice', name: 'Béatrice' },
  { id: 'iman', name: 'Iman' },
  { id: 'amel', name: 'Amel' },
  { id: 'zakaria', name: 'Zakaria' },
  { id: 'ismael', name: 'Ismaël' },
  { id: 'sophia', name: 'Sophia' },
  { id: 'souleimane', name: 'Souleimane' },
  { id: 'anouk', name: 'Anouk' },
  { id: 'carole', name: 'Carole' },
  { id: 'benjamin', name: 'Benjamin' },
] as const;

export const FAMILY_MEMBER_LABELS = Object.fromEntries(
  FAMILY_MEMBERS.map((member) => [member.id, member.name]),
) as Record<(typeof FAMILY_MEMBERS)[number]['id'], string>;
