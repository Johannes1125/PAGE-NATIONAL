import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class UpdateCblArticleDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  article_number?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  article_name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  article_description?: string;

  @IsInt()
  @IsOptional()
  sort_order?: number;
}
