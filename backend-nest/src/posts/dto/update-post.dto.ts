import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsNotEmpty({ message: 'title should not be empty' })
  @IsString({ message: 'title must be a string' })
  title: string;

  @IsNotEmpty({ message: 'category should not be empty' })
  @IsIn(['article', 'research', 'journal', 'announcement'], {
    message: 'category must be either article, research, journal, or announcement',
  })
  category: string;

  @IsNotEmpty({ message: 'content_html should not be empty' })
  @IsString({ message: 'content_html must be a string' })
  content_html: string;

  @IsOptional()
  @IsString({ message: 'excerpt must be a string' })
  excerpt?: string;

  @IsOptional()
  @IsString({ message: 'assigned_members must be a string' })
  assigned_members?: string;

  @IsNotEmpty({ message: 'status should not be empty' })
  @IsIn(['draft', 'pending', 'published'], {
    message: 'status must be either draft, pending, or published',
  })
  status: string;
}
