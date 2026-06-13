import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
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
import { FamilyMember } from '../../common/enums/family-member.enum';

export class MealDishDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(FamilyMember, { each: true })
  preparers!: FamilyMember[];

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
