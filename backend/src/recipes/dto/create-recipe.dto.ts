import { ArrayMinSize, IsArray, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { FAMILY_MEMBERS, FamilyMember } from '../../common/constants/family-members';

export class CreateRecipeDto {
  @IsString() @IsNotEmpty() @MaxLength(150) title!: string;
  @IsOptional() @IsString() @MaxLength(4000) instructions?: string;
  @IsArray() @ArrayMinSize(1) @IsIn(FAMILY_MEMBERS, { each: true }) contributors!: FamilyMember[];
}
