import { IsInt, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class UpdateStepDto {
  @IsNotEmpty()
  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsInt()
  currentStep?: number;
}
