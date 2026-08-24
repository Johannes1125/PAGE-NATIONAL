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

  @IsOptional()
  @IsString()
  position?: string;

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

const isAssociate = (o: any) =>
  o.membershipType === MembershipType.ASSOCIATE;

const isLifeRegularOrAssociate = (o: any) =>
  o.membershipType === MembershipType.LIFE ||
  o.membershipType === MembershipType.REGULAR ||
  o.membershipType === MembershipType.ASSOCIATE;

const isLifeRegularAssociateOrInstitutional = (o: any) =>
  o.membershipType === MembershipType.LIFE ||
  o.membershipType === MembershipType.REGULAR ||
  o.membershipType === MembershipType.ASSOCIATE ||
  o.membershipType === MembershipType.INSTITUTIONAL;

export class ValidateMembershipApplicationDto {
  @IsNotEmpty()
  @IsEnum(MembershipType)
  membershipType: MembershipType;

  // --- Non-LIFE, Non-REGULAR, Non-INSTITUTIONAL fields ---
  @ValidateIf(isAssociate)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.FULL_NAME_REQUIRED })
  @IsString()
  fullName?: string;

  @ValidateIf(isAssociate)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.EMAIL_REQUIRED })
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  email?: string;

  @ValidateIf(isAssociate)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.PHONE_REQUIRED })
  @IsString()
  phone?: string;

  @ValidateIf(isAssociate)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.REGION_REQUIRED })
  @IsString()
  region?: string;

  @ValidateIf(isAssociate)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.HOME_ADDRESS_REQUIRED })
  @IsString()
  homeAddress?: string;

  @ValidateIf(o => o.membershipType !== MembershipType.INSTITUTIONAL)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.INSTITUTION_REQUIRED })
  @IsString()
  institution?: string;

  @ValidateIf(isLifeOrRegular)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.PRESENT_POSITION_REQUIRED })
  @IsString()
  presentPosition?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  enrolleeCount?: string | number;

  @IsOptional()
  @IsString()
  accreditationDetails?: string;

  // --- Institutional fields ---
  @ValidateIf(o => o.membershipType === MembershipType.INSTITUTIONAL)
  @IsNotEmpty({ message: 'College/University Name is required.' })
  @IsString()
  collegeUniversityName?: string;

  @ValidateIf(o => o.membershipType === MembershipType.INSTITUTIONAL)
  @IsNotEmpty({ message: 'Institution Address is required.' })
  @IsString()
  institutionAddress?: string;

  @ValidateIf(o => o.membershipType === MembershipType.INSTITUTIONAL)
  @IsNotEmpty({ message: 'President of College/University is required.' })
  @IsString()
  presidentName?: string;

  @ValidateIf(o => o.membershipType === MembershipType.INSTITUTIONAL)
  @IsNotEmpty({ message: 'Dean/Head of Graduate School is required.' })
  @IsString()
  deanHeadGraduateSchool?: string;

  @ValidateIf(o => o.membershipType === MembershipType.INSTITUTIONAL)
  @IsNotEmpty({ message: 'Education courses offered is required.' })
  educationCoursesOffered?: string | string[];

  @ValidateIf(o => o.membershipType === MembershipType.INSTITUTIONAL)
  @IsNotEmpty({ message: 'Graduate courses offered is required.' })
  graduateCoursesOffered?: string | string[];

  @ValidateIf(o => o.membershipType === MembershipType.INSTITUTIONAL)
  @IsNotEmpty({ message: 'Total Graduate Faculty is required.' })
  totalGraduateFaculty?: number;

  @ValidateIf(o => o.membershipType === MembershipType.INSTITUTIONAL)
  @IsNotEmpty({ message: 'Current Enrollment Count is required.' })
  currentEnrollmentCount?: number;

  @ValidateIf(o => o.membershipType === MembershipType.INSTITUTIONAL)
  @IsNotEmpty({ message: 'Enrollment Year Range is required.' })
  @IsString()
  enrollmentYearRange?: string;

  @ValidateIf(o => o.membershipType === MembershipType.INSTITUTIONAL)
  @IsOptional()
  professionalAffiliations?: string | string[];

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
  @IsNotEmpty({ message: 'Current Graduate School is required.' })
  @IsString()
  currentGraduateSchool?: string;

  @ValidateIf(o => o.membershipType === MembershipType.ASSOCIATE)
  @IsNotEmpty({ message: 'Degree Program is required.' })
  @IsString()
  degreeProgram?: string;

  @ValidateIf(o => o.membershipType === MembershipType.ASSOCIATE)
  @IsNotEmpty({ message: 'Current Academic Status is required.' })
  @IsString()
  currentAcademicStatus?: string;

  @ValidateIf(o => o.membershipType === MembershipType.ASSOCIATE)
  @IsOptional()
  @IsString()
  researchInterests?: string;

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

  @ValidateIf(o => o.membershipType === MembershipType.LIFE || o.membershipType === MembershipType.REGULAR || o.membershipType === MembershipType.INSTITUTIONAL)
  @IsNotEmpty({
    message: (args) => {
      const obj = args.object as any;
      if (obj.membershipType === MembershipType.INSTITUTIONAL) {
        return 'Telephone/Mobile Number is required.';
      }
      return VALIDATION_MESSAGES.LIFE_TEL_MOBILE_REQUIRED;
    }
  })
  @IsString()
  telMobileNo?: string;

  @ValidateIf(o => o.membershipType === MembershipType.LIFE || o.membershipType === MembershipType.REGULAR || o.membershipType === MembershipType.INSTITUTIONAL)
  @IsNotEmpty({
    message: (args) => {
      const obj = args.object as any;
      if (obj.membershipType === MembershipType.INSTITUTIONAL) {
        return 'Email Address is required.';
      }
      return VALIDATION_MESSAGES.LIFE_EMAIL_REQUIRED;
    }
  })
  @IsEmail({}, {
    message: (args) => {
      const obj = args.object as any;
      if (obj.membershipType === MembershipType.INSTITUTIONAL) {
        return 'Please enter a valid email address.';
      }
      return VALIDATION_MESSAGES.LIFE_EMAIL_INVALID;
    }
  })
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

  // --- LIFE, REGULAR, ASSOCIATE & INSTITUTIONAL References and Consent ---
  @ValidateIf(isLifeRegularOrAssociate)
  @IsArray()
  @ArrayMinSize(2, { message: VALIDATION_MESSAGES.LIFE_CHARACTER_REFERENCES_LIMIT })
  @ArrayMaxSize(2, { message: VALIDATION_MESSAGES.LIFE_CHARACTER_REFERENCES_LIMIT })
  @ValidateNested({ each: true })
  @Type(() => CharacterReferenceDto)
  characterReferences?: CharacterReferenceDto[];

  @ValidateIf(isLifeRegularOrAssociate)
  @IsNotEmpty({ message: VALIDATION_MESSAGES.LIFE_BOARD_REFERENCE_REQUIRED })
  @ValidateNested()
  @Type(() => BoardReferenceDto)
  regionalChapterBoardReference?: BoardReferenceDto;

  @ValidateIf(isLifeRegularAssociateOrInstitutional)
  @Equals(true, { message: VALIDATION_MESSAGES.LIFE_PRIVACY_CONSENT_REQUIRED })
  privacyPolicyConsent?: boolean;
}
