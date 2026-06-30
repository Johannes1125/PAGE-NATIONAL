import { IsString, IsIn } from 'class-validator';

export class ChapterStatusDto {
  @IsString()
  @IsIn(['draft', 'published', 'archived'], {
    message: 'status must be one of: draft, published, archived',
  })
  status: 'draft' | 'published' | 'archived';
}
