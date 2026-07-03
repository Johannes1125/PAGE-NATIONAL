import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateSpeakerDto {
  @IsString()
  @IsNotEmpty({ message: 'Name must not be empty.' })
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty({ message: 'Role/position must not be empty.' })
  @IsOptional()
  role_position?: string;

  @IsString()
  @IsNotEmpty({ message: 'Institution must not be empty.' })
  @IsOptional()
  institution?: string;

  @IsString()
  @IsNotEmpty({ message: 'Presentation topic must not be empty.' })
  @IsOptional()
  presentation_topic?: string;
}
