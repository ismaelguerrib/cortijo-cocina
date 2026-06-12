import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealAssignmentEntity } from './entities/meal-assignment.entity';
import { MealAssignmentsController } from './meal-assignments.controller';
import { MealAssignmentsService } from './meal-assignments.service';

@Module({
  imports: [TypeOrmModule.forFeature([MealAssignmentEntity])],
  controllers: [MealAssignmentsController],
  providers: [MealAssignmentsService],
  exports: [MealAssignmentsService]
})
export class MealAssignmentsModule {}
