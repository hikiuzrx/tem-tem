import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDefined,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @ApiProperty({ example: 'Product Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @ApiProperty({ example: 'Product description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @ApiProperty({ example: 99.99, type: Number })
  @Type(() => Number)
  @IsNumber({}, { message: 'price must be a number' })
  @IsDefined({ message: 'price is required' })
  price: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/.../image.jpg' })
  @IsString()
  @IsOptional()
  image?: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  category: string;
}
