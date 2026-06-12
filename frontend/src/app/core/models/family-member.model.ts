import { FAMILY_MEMBERS } from '../constants/family-members';

export type FamilyMember = (typeof FAMILY_MEMBERS)[number]['value'];
