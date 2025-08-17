import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './schema/product.schema';
import { CacheModule } from 'src/infrastructure/redis/redis.module';
import { Category, CategorySchema } from '../categories/schema/category.schema';
import { CategoryService } from '../categories/category.service';

@Module({
  imports: [
    CloudinaryModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    CacheModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, CategoryService],
})
export class ProductModule {}
