import { PartialType } from '@nestjs/mapped-types';
import { CreateMealAssignmentDto } from './create-meal-assignment.dto';

export class UpdateMealAssignmentDto extends PartialType(CreateMealAssignmentDto) {}
