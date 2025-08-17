import { IsOptional, IsString } from 'class-validator';

export class FetchCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;
}
