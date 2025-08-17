import { IsMongoId, IsOptional, IsInt, Min } from 'class-validator';

export class GetProductByCategoryDto {
  @IsMongoId()
  categoryId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
