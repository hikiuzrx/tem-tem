/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FileInterceptor } from '@nestjs/platform-express';
import {
  UploadedFile,
  UseInterceptors,
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/createCtegory.dto';
import { CloudinaryService } from 'src/infrastructure/cloudinary/cloudinary.service';
import { CategoryService } from './category.service';
import { Multer } from 'multer';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Create a new category (admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created' })
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file?: Multer.File,
  ) {
    const dto = { ...createCategoryDto };

    if (file?.buffer) {
      const uploadResult = await this.cloudinaryService.uploadImage({
        buffer: file.buffer,
      });

      dto.image = uploadResult.secure_url;
    }
    const category = await this.categoryService.create(dto);
    return { success: true, content: category };
  }
  // --- Additional endpoints below ---

  @Roles('admin')
  @Get('all')
  @ApiOperation({ summary: 'Get all categories (admin only)' })
  @ApiResponse({ status: 200, description: 'List all categories' })
  async findAll() {
    try {
      const categories = await this.categoryService.findAll();
      return { success: true, content: categories };
    } catch (error) {
      return {
        success: false,
        message: error?.message || 'Failed to fetch categories',
      };
    }
  }

  @Roles('admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get category by id (admin only)' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Body('id') id: string) {
    if (!id || typeof id !== 'string') {
      return { success: false, message: 'Invalid category id' };
    }
    try {
      const category = await this.categoryService.findOne(id);
      if (!category) {
        return { success: false, message: 'Category not found' };
      }
      return { success: true, content: category };
    } catch (error) {
      return {
        success: false,
        message: error?.message || 'Failed to fetch category',
      };
    }
  }

  @Roles('admin')
  @Put(':id')
  @ApiOperation({ summary: 'Update a category (admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateCategoryDto })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file?: Multer.File,
  ) {
    if (!id || typeof id !== 'string') {
      return { success: false, message: 'Invalid category id' };
    }
    try {
      const dto = { ...updateCategoryDto };
      if (file?.buffer) {
        const uploadResult = await this.cloudinaryService.uploadImage({
          buffer: file.buffer,
        });
        dto.image = uploadResult.secure_url;
      }

      const updated = await this.categoryService.update(id, dto);
      if (!updated) {
        return { success: false, message: 'Category not found' };
      }
      return { success: true, content: updated };
    } catch (error) {
      return {
        success: false,
        message: error?.message || 'Failed to update category',
      };
    }
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category (admin only)' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async delete(@Param('id') id: string) {
    if (!id || typeof id !== 'string') {
      return { success: false, message: 'Invalid category id' };
    }
    try {
      const deleted = await this.categoryService.delete(id);
      if (!deleted) {
        return { success: false, message: 'Category not found' };
      }
      return { success: true, content: deleted };
    } catch (error) {
      return {
        success: false,
        message: error?.message || 'Failed to delete category',
      };
    }
  }
}
