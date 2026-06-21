import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { FAMILY_MEMBERS, FamilyMember } from '../../common/constants/family-members';

export class MealDishDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsIn(FAMILY_MEMBERS, { each: true })
  cookers!: FamilyMember[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  recipe!: string;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  photoUrls!: string[];

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(20, { each: true })
  votes!: number[];
}

export class CreateMealAssignmentDto {
  @IsDateString()
  mealDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MealDishDto)
  dishes!: MealDishDto[];
}
