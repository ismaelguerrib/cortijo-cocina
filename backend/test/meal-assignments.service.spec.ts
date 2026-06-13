import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FamilyMember } from '../src/common/enums/family-member.enum';
import { CreateMealAssignmentDto } from '../src/meal-assignments/dto/create-meal-assignment.dto';
import { UpdateMealAssignmentDto } from '../src/meal-assignments/dto/update-meal-assignment.dto';
import { MealAssignmentEntity } from '../src/meal-assignments/entities/meal-assignment.entity';
import { MealAssignmentsService } from '../src/meal-assignments/meal-assignments.service';

interface MockRepository {
  create: jest.Mock<MealAssignmentEntity, [Partial<MealAssignmentEntity>]>;
  save: jest.Mock<Promise<MealAssignmentEntity>, [MealAssignmentEntity]>;
  findOneBy: jest.Mock<Promise<MealAssignmentEntity | null>, [{ id: string }]>;
  merge: jest.Mock<MealAssignmentEntity, [MealAssignmentEntity, Partial<MealAssignmentEntity>]>;
  remove: jest.Mock<Promise<MealAssignmentEntity>, [MealAssignmentEntity]>;
}

const buildMeal = (): MealAssignmentEntity => ({
  id: 'meal-1',
  mealDate: '2026-08-15',
  description: 'Prévoir les grillades',
  dishes: [
    {
      preparers: [FamilyMember.MAMIE, FamilyMember.THOMAS],
      title: 'Brochettes',
      recipe: 'Mariner puis griller.',
      photoUrls: ['https://images.example.com/brochettes-1.jpg'],
      votes: [15, 18]
    }
  ],
  createdAt: new Date('2026-01-01T10:00:00.000Z'),
  updatedAt: new Date('2026-01-01T10:00:00.000Z')
});

describe('MealAssignmentsService', () => {
  let repository: MockRepository;
  let service: MealAssignmentsService;

  beforeEach(() => {
    repository = {
      create: jest.fn((value) => value as MealAssignmentEntity),
      save: jest.fn(),
      findOneBy: jest.fn(),
      merge: jest.fn((entity, value) => ({ ...entity, ...value })),
      remove: jest.fn()
    };

    service = new MealAssignmentsService(repository as unknown as Repository<MealAssignmentEntity>);
  });

  it('creates a meal assignment', async () => {
    const dto: CreateMealAssignmentDto = {
      mealDate: '2026-08-15',
      description: 'Prévoir les grillades',
      dishes: [
        {
          preparers: [FamilyMember.MAMIE, FamilyMember.THOMAS],
          title: 'Brochettes',
          recipe: 'Mariner puis griller.',
          photoUrls: ['https://images.example.com/brochettes-1.jpg'],
          votes: [15, 18]
        }
      ]
    };
    const meal = buildMeal();

    repository.save.mockResolvedValue(meal);

    await expect(service.create(dto)).resolves.toEqual(meal);
    expect(repository.create).toHaveBeenCalled();
  });

  it('updates a meal assignment', async () => {
    const existingMeal = buildMeal();
    const updatedMeal = {
      ...existingMeal,
      description: 'Mise à jour'
    };
    const dto: UpdateMealAssignmentDto = {
      description: 'Mise à jour'
    };

    repository.findOneBy.mockResolvedValue(existingMeal);
    repository.save.mockResolvedValue(updatedMeal);

    await expect(service.update(existingMeal.id, dto)).resolves.toEqual(updatedMeal);
    expect(repository.merge).toHaveBeenCalled();
  });

  it('removes a meal assignment', async () => {
    const existingMeal = buildMeal();

    repository.findOneBy.mockResolvedValue(existingMeal);
    repository.remove.mockResolvedValue(existingMeal);

    await expect(service.remove(existingMeal.id)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(existingMeal);
  });

  it('rejects a duplicate date', async () => {
    repository.save.mockRejectedValue({ code: '23505' });

    await expect(
      service.create({
        mealDate: '2026-08-15',
        dishes: [
          {
            preparers: [FamilyMember.MAMIE],
            title: 'Salade',
            recipe: 'Tout mélanger.',
            photoUrls: [],
            votes: []
          }
        ]
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects a meal without dishes', async () => {
    await expect(
      service.create({
        mealDate: '2026-08-15',
        dishes: []
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when a meal assignment does not exist', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.update('missing-id', {})).rejects.toBeInstanceOf(NotFoundException);
  });
});
