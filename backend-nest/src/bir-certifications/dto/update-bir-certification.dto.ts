import { PartialType } from '@nestjs/mapped-types';
import { CreateBirCertificationDto } from './create-bir-certification.dto';

export class UpdateBirCertificationDto extends PartialType(CreateBirCertificationDto) {}
