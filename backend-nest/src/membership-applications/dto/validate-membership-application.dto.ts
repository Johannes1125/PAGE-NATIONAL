import { IsString, IsNotEmpty, IsEmail, ValidateIf, IsEnum, IsOptional, IsArray, ArrayMinSize, ArrayMaxSize, ValidateNested, Equals } from 'class-validator';
import { Type } from 'class-transformer';
import { MembershipType } from '@prisma/client';
import { VALIDATION_MESSAGES } from '../constants/validation-messages';

export class ExperienceItemDto {
  @IsNotEmpty({ message: 'Institution is required.' })
  @IsString()
  institution: string;

  @IsNotEmpty({ message: 'From year is required.' })
  @IsString()
  fromYear: string;

  @IsNotEmpty({ message: 'To year is required.' })
  @IsString()
  toYear: string;
}

export class CharacterReferenceDto {
  @IsNotEmpty({ message: 'Reference name is required.' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Reference position is required.' })
  @IsString()
  position: string;

  @IsNotEmpty({ message: 'Reference address is required.' })
  @IsString()
  address: string;
}

export class BoardReferenceDto {
  @IsNotEmpty({ message: 'Board member name is required.' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Board member address is required.' })
  @IsString()
  address: string;
}

const isLifeOrRegular = (o: any) =>
  o.membershipType === MembershipType.LIFE || o.membershipType === MembershipType.REGULAR;

const isNotLifeOrRegular = (o: any) =>
  o.membershipType !== MembershipType.LIFE && o.membershipType !== MembershipType.REGULAR;

export class ValidateMembershipApplicationDto {
  @IsNotEmpty()
  @IsEnum(MembershipType)
  membershipType: MembershipType;

  // --- Non-LIFE and Non-REGULAR fields ---
  @ValidateIf(isNotLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.FULL_NAME_REQUIRED })
  @IsString()
  fullName?: string;

  @ValidateIf(isNotLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.EMAIL_REQUIRED })
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  email?: string;

  @ValidateIf(isNotLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.PHONE_REQUIRED })
  @IsString()
  phone?: string;

  @ValidateIf(isNotLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REGION_REQUIRED })
  @IsString()
  region?: string;

  @ValidateIf(isNotLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.HOME_ADDRESS_REQUIRED })
  @IsString()
  homeAddress?: string;

  @IsNotEmpty({ message: VALIDATION_MESSAGES.INSTITUTION_REQUIRED })
  @IsString()
  institution: string;

  @ValidateIf(isNotLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.ADDRESS_REQUIRED })
  @IsString()
  address?: string;

  @IsNotEmpty({ message: VALIDATION_MESSAGES.PRESENT_POSITION_REQUIRED })
  @IsString()
  presentPosition: string;

  // --- Institutional fields ---
  @ValidateIf(o => o.membershipType === MembershipType.INSTITUTIONAL)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.ENROLLEE_COUNT_REQUIRED })
  enrolleeCount?: string | number;

  @ValidateIf(o => o.membershipType === MembershipType.INSTITUTIONAL)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.ACCREDITATION_DETAILS_REQUIRED })
  @IsString()
  accreditationDetails?: string;

  // --- Life & Regular fields ---
  @ValidateIf(isLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.DEGREE_OBTAINED_REQUIRED })
  @IsString()
  degreeObtained?: string;

  @ValidateIf(isLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.SPECIALIZATION_REQUIRED })
  @IsString()
  specialization?: string;

  @ValidateIf(isLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.YEAR_OBTAINED_REQUIRED })
  @IsString()
  yearObtained?: string;

  // --- Associate fields ---
  @ValidateIf(o => o.membershipType === MembershipType.ASSOCIATE)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.CURRENT_ENROLLMENT_REQUIRED })
  @IsString()
  currentEnrollmentStatus?: string;

  @ValidateIf(o => o.membershipType === MembershipType.ASSOCIATE)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.EXPECTED_GRADUATION_REQUIRED })
  @IsString()
  expectedGraduationYear?: string;

  // --- Life fields ---
  @ValidateIf(o => o.membershipType === MembershipType.LIFE)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.LIFE_YEARS_ACTIVE_REQUIRED })
  yearsActiveInPAGE?: string | number;

  // --- LIFE & REGULAR Specific profile/job fields ---
  @ValidateIf(isLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.LIFE_NAME_REQUIRED })
  @IsString()
  name?: string;

  @ValidateIf(isLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.LIFE_TEL_MOBILE_REQUIRED })
  @IsString()
  telMobileNo?: string;

  @ValidateIf(isLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.LIFE_EMAIL_REQUIRED })
  @IsEmail({}, { message: VALIDATION_MESSAGES.LIFE_EMAIL_INVALID })
  emailAddress?: string;

  @ValidateIf(isLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.LIFE_REGION_REQUIRED })
  @IsString()
  lifeRegion?: string;

  @ValidateIf(isLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.LIFE_HOME_ADDRESS_REQUIRED })
  @IsString()
  lifeHomeAddress?: string;

  @ValidateIf(isLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.LIFE_WHERE_EMPLOYED_REQUIRED })
  @IsString()
  whereEmployed?: string;

  @ValidateIf(isLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.LIFE_BUSINESS_ADDRESS_REQUIRED })
  @IsString()
  businessAddress?: string;

  // --- LIFE & REGULAR Experience Arrays ---
  @ValidateIf(isLifeOrRegular)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceItemDto)
  teachingExperience?: ExperienceItemDto[];

  @ValidateIf(isLifeOrRegular)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceItemDto)
  administrativeExperience?: ExperienceItemDto[];

  @ValidateIf(isLifeOrRegular)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recentPublications?: string[];

  @ValidateIf(isLifeOrRegular)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  professionalMemberships?: string[];

  // --- LIFE & REGULAR References and Consent ---
  @ValidateIf(isLifeOrRegular)
  @IsArray()
  @ArrayMinSize(2, { message: VALIDATION_MESSAGES.LIFE_CHARACTER_REFERENCES_LIMIT })
  @ArrayMaxSize(2, { message: VALIDATION_MESSAGES.LIFE_CHARACTER_REFERENCES_LIMIT })
  @ValidateNested({ each: true })
  @Type(() => CharacterReferenceDto)
  characterReferences?: CharacterReferenceDto[];

  @ValidateIf(isLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.LIFE_BOARD_REFERENCE_REQUIRED })
  @ValidateNested()
  @Type(() => BoardReferenceDto)
  regionalChapterBoardReference?: BoardReferenceDto;

  @ValidateIf(isLifeOrRegular)
  @Equals(true, { message: VALIDATION_MESSAGES.LIFE_PRIVACY_CONSENT_REQUIRED })
  privacyPolicyConsent?: boolean;
}
