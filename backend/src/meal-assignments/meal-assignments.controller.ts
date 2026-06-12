import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateMealAssignmentDto } from './dto/create-meal-assignment.dto';
import { UpdateMealAssignmentDto } from './dto/update-meal-assignment.dto';
import { MealAssignmentEntity } from './entities/meal-assignment.entity';
import { MealAssignmentsService } from './meal-assignments.service';

@Controller('meal-assignments')
export class MealAssignmentsController {
  constructor(private readonly mealAssignmentsService: MealAssignmentsService) {}

  @Get()
  findAll(): Promise<MealAssignmentEntity[]> {
    return this.mealAssignmentsService.findAll();
  }

  @Post()
  create(@Body() createMealAssignmentDto: CreateMealAssignmentDto): Promise<MealAssignmentEntity> {
    return this.mealAssignmentsService.create(createMealAssignmentDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMealAssignmentDto: UpdateMealAssignmentDto
  ): Promise<MealAssignmentEntity> {
    return this.mealAssignmentsService.update(id, updateMealAssignmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.mealAssignmentsService.remove(id);
  }
}
