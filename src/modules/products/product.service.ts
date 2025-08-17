import { IsOptional, IsMongoId, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class ProductFilterDto {
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  max?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schema/product.schema';
import { CategoryService } from '../categories/category.service';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { CreateProductDto } from './dto/createProdcut';
import { UpdateProductDto } from './dto/update.product';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly redisService: RedisService,
    private readonly categoryService: CategoryService,
  ) {}

  async create(data: CreateProductDto): Promise<Product> {
    // Accept category as name (string), find or create category
    const categoryDoc = await this.categoryService.findByName(data.category);
    if (!categoryDoc) {
      // Optionally, create the category if not found, or throw error
      // For now, throw error
      throw new NotFoundException(`Category '${data.category}' not found`);
    }

    const created = new this.productModel({
      ...data,
      category: categoryDoc._id,
    });
    const saved = await created.save();
    // Invalidate all products and filter cache
    await this.redisService.del('products:all');
    await this.redisService.del('products:filter:*');
    return saved;
  }

  async findAll(): Promise<Product[]> {
    const cacheKey = 'products:all';
    const cached = await this.redisService.get(cacheKey);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (cached) return JSON.parse(cached);
    const products = await this.productModel.find().populate('category').exec();
    await this.redisService.set(cacheKey, JSON.stringify(products), 60 * 5); // cache 5 min
    return products;
  }

  async findOne(id: string): Promise<Product | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const cacheKey = `products:${id}`;
    const cached = await this.redisService.get(cacheKey);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (cached) return JSON.parse(cached);
    const product = await this.productModel
      .findById(id)
      .populate('category')
      .exec();
    if (product)
      await this.redisService.set(cacheKey, JSON.stringify(product), 60 * 5);
    return product;
  }

  async update(id: string, data: UpdateProductDto): Promise<Product | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const updateData: any = { ...data };
    if (data.category) {
      const categoryDoc = await this.categoryService.findByName(data.category);
      if (!categoryDoc) {
        throw new NotFoundException(`Category '${data.category}' not found`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      updateData.category = categoryDoc._id;
    }
    const updated = await this.productModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('category')
      .exec();
    // Invalidate cache for this product and all/filter
    await this.redisService.del(`products:${id}`);
    await this.redisService.del('products:all');
    await this.redisService.del('products:filter:*');
    return updated;
  }

  async delete(id: string): Promise<Product | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const deleted = await this.productModel.findByIdAndDelete(id).exec();
    // Invalidate cache for this product and all/filter
    await this.redisService.del(`products:${id}`);
    await this.redisService.del('products:all');
    await this.redisService.del('products:filter:*');
    return deleted;
  }

  async filterProducts(filter: ProductFilterDto): Promise<Product[]> {
    const query: any = {};
    if (filter.categoryId && Types.ObjectId.isValid(filter.categoryId)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      query.category = filter.categoryId;
    }
    if (filter.min !== undefined || filter.max !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      query.price = {};
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (filter.min !== undefined) query.price.$gte = filter.min;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (filter.max !== undefined) query.price.$lte = filter.max;
    }
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    // Use a cache key based on filters
    const filterKey = `products:filter:${JSON.stringify({
      categoryId: filter.categoryId,
      min: filter.min,
      max: filter.max,
      page,
      limit,
    })}`;
    const cached = await this.redisService.get(filterKey);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (cached) return JSON.parse(cached);
    const products = await this.productModel
      .find(query)
      .populate('category')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    await this.redisService.set(filterKey, JSON.stringify(products), 60 * 5);
    return products;
  }
}
