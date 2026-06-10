import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty({ message: 'title should not be empty' })
  @IsString({ message: 'title must be a string' })
  title: string;

  @IsNotEmpty({ message: 'author should not be empty' })
  @IsString({ message: 'author must be a string' })
  author: string;

  @IsNotEmpty({ message: 'abstract should not be empty' })
  @MinLength(20, { message: 'abstract must be at least 20 characters' })
  abstract: string;

  @IsNotEmpty({ message: 'keywords should not be empty' })
  keywords: any;
}
