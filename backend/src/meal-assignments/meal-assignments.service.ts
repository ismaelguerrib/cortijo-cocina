import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { FAMILY_MEMBERS, FamilyMember } from '../common/constants/family-members';
import { CreateMealAssignmentDto, MealDishDto } from './dto/create-meal-assignment.dto';
import { UpdateMealAssignmentDto } from './dto/update-meal-assignment.dto';
import { MealAssignmentEntity } from './entities/meal-assignment.entity';

const UNIQUE_VIOLATION_CODE = '23505';

@Injectable()
export class MealAssignmentsService {
  constructor(
    @InjectRepository(MealAssignmentEntity)
    private readonly mealAssignmentsRepository: Repository<MealAssignmentEntity>
  ) {}

  async findAll(): Promise<MealAssignmentEntity[]> {
    return this.mealAssignmentsRepository.find({
      order: {
        mealDate: 'ASC'
      }
    });
  }

  async create(createMealAssignmentDto: CreateMealAssignmentDto): Promise<MealAssignmentEntity> {
    this.assertDishes(createMealAssignmentDto.dishes);

    try {
      const mealAssignment = this.mealAssignmentsRepository.create(
        this.normalizeMealPayload(createMealAssignmentDto)
      );

      return await this.mealAssignmentsRepository.save(mealAssignment);
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async update(
    id: string,
    updateMealAssignmentDto: UpdateMealAssignmentDto
  ): Promise<MealAssignmentEntity> {
    const existingAssignment = await this.findOneOrThrow(id);

    if (updateMealAssignmentDto.dishes) {
      this.assertDishes(updateMealAssignmentDto.dishes);
    }

    try {
      const mergedAssignment = this.mealAssignmentsRepository.merge(existingAssignment, {
        ...this.normalizeMealPayload(updateMealAssignmentDto),
        description:
          updateMealAssignmentDto.description === undefined
            ? existingAssignment.description
            : updateMealAssignmentDto.description?.trim() || null
      });

      return await this.mealAssignmentsRepository.save(mergedAssignment);
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async remove(id: string): Promise<void> {
    const mealAssignment = await this.findOneOrThrow(id);
    await this.mealAssignmentsRepository.remove(mealAssignment);
  }

  private assertDishes(dishes: MealDishDto[]): void {
    if (dishes.length === 0) {
      throw new BadRequestException('At least one dish is required.');
    }
  }

  private normalizeMealPayload(
    payload: Partial<CreateMealAssignmentDto>
  ): Partial<MealAssignmentEntity> {
    return {
      ...payload,
      description: payload.description?.trim() || null,
      dishes: payload.dishes?.map((dish) => ({
        cookers: dish.cookers
          .map((cooker) => cooker.trim())
          .filter((cooker): cooker is FamilyMember =>
            FAMILY_MEMBERS.includes(cooker as FamilyMember),
          ),
        title: dish.title.trim(),
        recipe: dish.recipe.trim(),
        photoUrls: dish.photoUrls.map((url) => url.trim()).filter(Boolean),
        votes: dish.votes
      }))
    };
  }

  private async findOneOrThrow(id: string): Promise<MealAssignmentEntity> {
    const mealAssignment = await this.mealAssignmentsRepository.findOneBy({ id });

    if (!mealAssignment) {
      throw new NotFoundException(`Meal assignment ${id} was not found.`);
    }

    return mealAssignment;
  }

  private handlePersistenceError(error: unknown): never {
    if (error instanceof QueryFailedError && error.driverError?.code === UNIQUE_VIOLATION_CODE) {
      throw new ConflictException('A meal already exists for this date.');
    }

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === UNIQUE_VIOLATION_CODE) {
      throw new ConflictException('A meal already exists for this date.');
    }

    throw error;
  }
}
