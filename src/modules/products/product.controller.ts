/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  ParseFloatPipe,
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
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService, ProductFilterDto } from './product.service';
import { CreateProductDto } from './dto/createProdcut';
import { UpdateProductDto } from './dto/update.product';
import { CloudinaryService } from 'src/infrastructure/cloudinary/cloudinary.service';
import { File as MulterFile } from 'multer';
import { Types } from 'mongoose';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created' })
  @UseInterceptors(FileInterceptor('image'))
  // @UseGuards(RolesGuard) // Uncomment and implement for admin/user
  async create(
    @Body() data: CreateProductDto,
    @UploadedFile() file?: MulterFile,
    @Body('price', ParseFloatPipe) price?: number,
  ) {
    try {
      const dto: CreateProductDto = { ...data, price: price ?? data.price };

      if (file && file.buffer) {
        const uploadResult = await this.cloudinaryService.uploadImage({
          buffer: file.buffer,
        });

        dto.image = uploadResult.secure_url;
      }
      // Convert category to ObjectId for the service call
      const product = await this.productService.create({
        ...dto,
      });
      return { success: true, content: product };
    } catch (error: any) {
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        (error && (error as Error).message) || 'Failed to create product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List all products' })
  async findAll() {
    try {
      const products = await this.productService.findAll();
      return { success: true, content: products };
    } catch (error) {
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        error?.message || 'Failed to fetch products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('filter')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Filter products' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'min', required: false })
  @ApiQuery({ name: 'max', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Filtered products' })
  async filter(@Query() query: ProductFilterDto) {
    try {
      const products = await this.productService.filterProducts(query);
      return { success: true, content: products };
    } catch (error) {
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        error?.message || 'Failed to filter products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid product id');
    }
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return { success: true, content: product };
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProductDto })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @UseInterceptors(FileInterceptor('image'))
  // @UseGuards(RolesGuard) // Uncomment and implement for admin/user
  async update(
    @Param('id') id: string,
    @Body() data: UpdateProductDto,
    @UploadedFile() file?: MulterFile,
    @Body('price', ParseFloatPipe) price?: number,
  ) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid product id');
    }
    try {
      const dto: UpdateProductDto = { ...data, price: price ?? data.price };
      if (file && file.buffer) {
        const uploadResult = await this.cloudinaryService.uploadImage({
          buffer: file.buffer,
        });
        dto.image = uploadResult.secure_url;
      }
      // Always convert category to ObjectId if present
      const updatePayload: any = { ...dto };
      if (dto.category) {
        updatePayload.category = new Types.ObjectId(dto.category);
      }
      const updated = await this.productService.update(id, updatePayload);
      if (!updated) {
        throw new NotFoundException('Product not found');
      }
      return { success: true, content: updated };
    } catch (error: any) {
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        (error && (error as Error).message) || 'Failed to update product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid product id');
    }
    try {
      const deleted = await this.productService.delete(id);
      if (!deleted) {
        throw new NotFoundException('Product not found');
      }
      return { success: true, content: deleted };
    } catch (error: any) {
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        error?.message || 'Failed to delete product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
