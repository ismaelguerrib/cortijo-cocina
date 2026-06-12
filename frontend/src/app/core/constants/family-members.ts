export const FAMILY_MEMBERS = [
  { value: 'MAMIE', label: 'Mamie' },
  { value: 'PAPI', label: 'Papi' },
  { value: 'JULIE', label: 'Julie' },
  { value: 'THOMAS', label: 'Thomas' },
  { value: 'CLAIRE', label: 'Claire' }
] as const;

export const FAMILY_MEMBER_LABELS = Object.fromEntries(
  FAMILY_MEMBERS.map((member) => [member.value, member.label])
) as Record<(typeof FAMILY_MEMBERS)[number]['value'], string>;
