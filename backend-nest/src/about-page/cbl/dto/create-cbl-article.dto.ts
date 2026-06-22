import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateCblArticleDto {
  @IsString()
  @IsNotEmpty()
  article_number: string;

  @IsString()
  @IsNotEmpty()
  article_name: string;

  @IsString()
  @IsNotEmpty()
  article_description: string;

  @IsInt()
  @IsOptional()
  sort_order?: number;
}
