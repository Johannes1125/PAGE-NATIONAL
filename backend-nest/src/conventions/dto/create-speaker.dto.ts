import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSpeakerDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Role/position is required.' })
  role_position: string;

  @IsString()
  @IsNotEmpty({ message: 'Institution is required.' })
  institution: string;

  @IsString()
  @IsNotEmpty({ message: 'Presentation topic is required.' })
  presentation_topic: string;
}
