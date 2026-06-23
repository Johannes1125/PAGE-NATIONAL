import { IsArray, ValidateNested, IsString, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderItemDto {
  @IsString()
  id: string;

  @IsInt()
  sortOrder: number;

  @IsInt()
  @IsOptional()
  yearStart?: number;
}

export class ReorderHistoricalRecordsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  records: ReorderItemDto[];
}
