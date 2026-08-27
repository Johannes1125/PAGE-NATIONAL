import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class BatchDeleteNotificationsDto {
  @IsArray({ message: 'ids must be an array of notification IDs' })
  @ArrayNotEmpty({ message: 'ids array cannot be empty' })
  @IsString({ each: true, message: 'Each id in the ids array must be a string' })
  ids: string[];
}
