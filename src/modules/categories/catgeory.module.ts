import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from 'src/infrastructure/redis/redis.module';
import { Category, CategorySchema } from './schema/category.schema';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CloudinaryModule } from 'src/infrastructure/cloudinary/cloudinary.module';

@Module({
  imports: [
    CacheModule,
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    CloudinaryModule,
  ],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
