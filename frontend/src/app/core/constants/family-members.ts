export const FAMILY_MEMBERS = [
  { value: 'BEATRICE', label: 'Béatrice', picture: 'beatrice.jpeg' },
  { value: 'IMAN', label: 'Iman', picture: 'iman.jpeg' },
  { value: 'AMEL', label: 'Amel', picture: 'amel.png' },
  { value: 'ZAKARIA', label: 'Zakaria', picture: 'zakaria.png' },
  { value: 'ISMAEL', label: 'Ismaël', picture: 'ismael.jpeg' },
  { value: 'SOFIA', label: 'Sofia', picture: 'sofia.jpeg' },
  { value: 'SOULEIMANE', label: 'Souleimane', picture: 'souleimane.jpeg' },
  { value: 'NOUR', label: 'Nour', picture: 'nour.png' },
  { value: 'LINA', label: 'Lina', picture: 'lina.jpeg' },
  { value: 'HIMA', label: 'Hima', picture: 'hima.png' },
  { value: 'ANOUK', label: 'Anouk', picture: 'anouk.png' },
  { value: 'CAROLE', label: 'Carole', picture: 'carole.jpeg' },
] as const;

export const FAMILY_MEMBER_LABELS = Object.fromEntries(
  FAMILY_MEMBERS.map((member) => [member.value, member.label]),
) as Record<(typeof FAMILY_MEMBERS)[number]['value'], string>;
