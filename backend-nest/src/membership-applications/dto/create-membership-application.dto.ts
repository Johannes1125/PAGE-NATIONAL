import { IsEnum, IsNotEmpty } from 'class-validator';
import { MembershipType } from '@prisma/client';

export class CreateMembershipApplicationDto {
  @IsNotEmpty()
  @IsEnum(MembershipType)
  membershipType: MembershipType;
}
