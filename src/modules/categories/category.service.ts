import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RedisService } from 'src/infrastructure/redis/redis.service';

import { Category, CategoryDocument } from './schema/category.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/createCtegory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private redisService: RedisService,
  ) {}

  async create(categoryDto: CreateCategoryDto): Promise<Category> {
    const createdCategory = new this.categoryModel(categoryDto);
    await createdCategory.save();
    await this.redisService.set(
      `category:${createdCategory._id as string}`,
      JSON.stringify(createdCategory),
    );
    return createdCategory;
  }

  async findOne(id: string): Promise<Category | null> {
    // Try cache first
    const cached = await this.redisService.get(`category:${id}`);
    if (cached) {
      return JSON.parse(cached) as Category;
    }
    const category = await this.categoryModel.findById(id).exec();
    if (category) {
      await this.redisService.set(`category:${id}`, JSON.stringify(category));
    }
    return category;
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async update(
    id: string,
    updateDto: UpdateCategoryDto,
  ): Promise<Category | null> {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (updatedCategory) {
      await this.redisService.set(
        `category:${id}`,
        JSON.stringify(updatedCategory),
      );
    }
    return updatedCategory;
  }

  async delete(id: string): Promise<Category | null> {
    const deletedCategory = await this.categoryModel
      .findByIdAndDelete(id)
      .exec();
    await this.redisService.del(`category:${id}`);
    return deletedCategory;
  }
  async findByName(name: string): Promise<Category | null> {
    return this.categoryModel.findOne({ name }).exec();
  }
}
