import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty({ message: 'conversation_id should not be empty' })
  @IsString({ message: 'conversation_id must be a string' })
  conversation_id: string;

  @IsOptional()
  receiver_id?: string; // Can be string because of form-data parsing

  @IsNotEmpty({ message: 'text should not be empty' })
  @IsString({ message: 'text must be a string' })
  text: string;

  @IsOptional()
  @IsString({ message: 'subject must be a string' })
  subject?: string;
}
