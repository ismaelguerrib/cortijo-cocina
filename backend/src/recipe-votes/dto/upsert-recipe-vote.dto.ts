import { IsIn, IsInt, Max, Min } from 'class-validator';
import { FAMILY_MEMBERS, FamilyMember } from '../../common/constants/family-members';
export class UpsertRecipeVoteDto { @IsIn(FAMILY_MEMBERS) member!: FamilyMember; @IsInt() @Min(0) @Max(20) score!: number; }
