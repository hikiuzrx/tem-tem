import { IsString, IsOptional, IsNumber, IsMongoId } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsMongoId()
  @IsOptional()
  category?: string;
}
