import { BadRequestException, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { RecipePhotoEntity } from './entities/recipe-photo.entity';
@Controller('recipes/:recipeId/photos') export class RecipePhotosController {
  constructor(@InjectRepository(RecipePhotoEntity) private readonly photos: Repository<RecipePhotoEntity>) {}
  @Get() list(@Param('recipeId') recipeId: string): Promise<RecipePhotoEntity[]> { return this.photos.find({ where: { recipeId }, order: { createdAt: 'ASC' } }); }
  @Post() @UseInterceptors(FileInterceptor('photo', { storage: diskStorage({ destination: 'uploads/recipes', filename: (_req, file, done) => done(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`) }), limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (_req, file, done) => done(null, file.mimetype.startsWith('image/')) }))
  async upload(@Param('recipeId') recipeId: string, @UploadedFile() file?: { filename: string; mimetype: string }): Promise<RecipePhotoEntity> { if (!file) throw new BadRequestException('An image file is required.'); return this.photos.save(this.photos.create({ recipeId, storageKey: `recipes/${file.filename}`, contentType: file.mimetype })); }
}
