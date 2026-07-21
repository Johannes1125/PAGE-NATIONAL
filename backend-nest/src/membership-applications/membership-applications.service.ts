import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateMembershipApplicationDto } from './dto/create-membership-application.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { ValidateMembershipApplicationDto } from './dto/validate-membership-application.dto';
import { calculateFee } from './constants/membership-fees';
import { validate } from 'class-validator';
import { MembershipApplicationStatus } from '@prisma/client';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MembershipApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createDraft(dto: CreateMembershipApplicationDto, user?: any) {
    const fee = calculateFee(dto.membershipType);
    const applicantId = user?.id ? BigInt(user.id) : null;

    const record = await this.prisma.membershipApplication.create({
      data: {
        membershipType: dto.membershipType,
        status: 'draft',
        currentStep: 1,
        feeAmount: fee,
        applicantId,
        profileData: {},
        educationJobData: {},
        experienceData: {},
        referencesData: {},
      },
    });

    return {
      success: true,
      data: record,
      message: 'Membership application draft created successfully',
    };
  }

  async updateStep(id: string, stepName: string, dto: UpdateStepDto) {
    const existing = await this.prisma.membershipApplication.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Membership application with ID ${id} not found.`);
    }

    const dataToUpdate: any = {};
    const stepNameClean = stepName.toLowerCase();

    if (stepNameClean === 'profile') {
      dataToUpdate.profileData = {
        ...(existing.profileData as any || {}),
        ...dto.data,
      };
      // Re-evaluate fee for Institutional if enrolleeCount changes
      if (existing.membershipType === 'INSTITUTIONAL') {
        const enrolleeCount = dto.data?.enrolleeCount !== undefined ? Number(dto.data.enrolleeCount) : 0;
        dataToUpdate.feeAmount = calculateFee('INSTITUTIONAL', enrolleeCount);
      }
    } else if (stepNameClean === 'education-job' || stepNameClean === 'academic-info' || stepNameClean === 'academic-information') {
      dataToUpdate.educationJobData = {
        ...(existing.educationJobData as any || {}),
        ...dto.data,
      };
      // Re-evaluate fee for Institutional if currentEnrollmentCount changes
      if (existing.membershipType === 'INSTITUTIONAL') {
        const count = dto.data?.currentEnrollmentCount !== undefined ? Number(dto.data.currentEnrollmentCount) : undefined;
        if (count !== undefined) {
          dataToUpdate.feeAmount = calculateFee('INSTITUTIONAL', count);
        }
      }
    } else if (stepNameClean === 'experience') {
      const expData = {
        ...(existing.experienceData as any || {}),
        ...dto.data,
      };
      if (existing.membershipType === 'LIFE' || existing.membershipType === 'REGULAR') {
        expData.teachingExperience = expData.teachingExperience || [];
        expData.administrativeExperience = expData.administrativeExperience || [];
        expData.recentPublications = expData.recentPublications || [];
        expData.professionalMemberships = expData.professionalMemberships || [];
      }
      dataToUpdate.experienceData = expData;
    } else if (stepNameClean === 'references') {
      dataToUpdate.referencesData = {
        ...(existing.referencesData as any || {}),
        ...dto.data,
      };
    } else {
      throw new BadRequestException(`Invalid step name: ${stepName}`);
    }

    if (dto.currentStep !== undefined) {
      dataToUpdate.currentStep = dto.currentStep;
    }

    const updated = await this.prisma.membershipApplication.update({
      where: { id },
      data: dataToUpdate,
    });

    return {
      success: true,
      data: updated,
      message: `Step ${stepName} saved successfully`,
    };
  }

  async uploadDocument(id: string, file: Express.Multer.File, documentType: string) {
    const existing = await this.prisma.membershipApplication.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Membership application with ID ${id} not found.`);
    }

    const uploadResult = await this.cloudinaryService.uploadWithPublicId(file, 'membership_applications');
    if (!uploadResult) {
      throw new BadRequestException('Failed to upload file to Cloudinary');
    }

    // Check if there is an existing document with the same documentType
    const existingDoc = await this.prisma.membershipApplicationDocument.findFirst({
      where: { applicationId: id, documentType: documentType as any },
    });

    if (existingDoc && existingDoc.filePublicId) {
      // Clean up previous file in Cloudinary
      await this.cloudinaryService.delete(existingDoc.filePublicId);
    }

    let docRecord;
    if (existingDoc) {
      docRecord = await this.prisma.membershipApplicationDocument.update({
        where: { id: existingDoc.id },
        data: {
          fileUrl: uploadResult.imageUrl,
          fileName: file.originalname,
          filePublicId: uploadResult.imagePublicId,
          uploadedAt: new Date(),
        },
      });
    } else {
      docRecord = await this.prisma.membershipApplicationDocument.create({
        data: {
          applicationId: id,
          documentType: documentType as any,
          fileUrl: uploadResult.imageUrl,
          fileName: file.originalname,
          filePublicId: uploadResult.imagePublicId,
        },
      });
    }

    return {
      success: true,
      data: docRecord,
      message: 'Document uploaded successfully',
    };
  }

  async submit(id: string, user?: any, ipAddress?: string) {
    const application = await this.prisma.membershipApplication.findUnique({
      where: { id },
      include: { documents: true },
    });

    if (!application) {
      throw new NotFoundException(`Membership application with ID ${id} not found.`);
    }

    if (application.status !== 'draft') {
      throw new BadRequestException('Application has already been submitted.');
    }

    const profile = (application.profileData as any) || {};
    const eduJob = (application.educationJobData as any) || {};
    const exp = (application.experienceData as any) || {};
    const refs = (application.referencesData as any) || {};

    const validateDto = new ValidateMembershipApplicationDto();
    validateDto.membershipType = application.membershipType;

    if (application.membershipType === 'LIFE' || application.membershipType === 'REGULAR') {
      validateDto.name = profile.name || profile.fullName;
      validateDto.telMobileNo = profile.telMobileNo || profile.phone;
      validateDto.emailAddress = profile.emailAddress || profile.email;
      validateDto.lifeRegion = profile.region;
      validateDto.lifeHomeAddress = profile.homeAddress;

      validateDto.whereEmployed = eduJob.whereEmployed || eduJob.institution;
      validateDto.businessAddress = eduJob.businessAddress || eduJob.address;
      validateDto.presentPosition = eduJob.presentPosition;
      validateDto.degreeObtained = eduJob.degreeObtained;
      validateDto.specialization = eduJob.specialization;
      validateDto.institution = eduJob.institution || eduJob.degreeInstitution; // degree university
      validateDto.yearObtained = eduJob.yearObtained;

      validateDto.yearsActiveInPAGE = exp.yearsActiveInPAGE;
      validateDto.teachingExperience = exp.teachingExperience || [];
      validateDto.administrativeExperience = exp.administrativeExperience || [];
      validateDto.recentPublications = exp.recentPublications || [];
      validateDto.professionalMemberships = exp.professionalMemberships || [];

      validateDto.characterReferences = refs.characterReferences || [];
      validateDto.regionalChapterBoardReference = refs.regionalChapterBoardReference;
      validateDto.privacyPolicyConsent = refs.privacyPolicyConsent || refs.consent;
    } else if (application.membershipType === 'ASSOCIATE') {
      // Profile data
      validateDto.fullName = profile.fullName;
      validateDto.email = profile.email;
      validateDto.phone = profile.phone;
      validateDto.region = profile.region;
      validateDto.homeAddress = profile.homeAddress;

      // Graduate Program Info data (stored in educationJobData)
      validateDto.currentGraduateSchool = eduJob.currentGraduateSchool;
      validateDto.degreeProgram = eduJob.degreeProgram;
      validateDto.institution = eduJob.institution;
      validateDto.expectedGraduationYear = eduJob.expectedGraduationYear;

      // Academic Information data (stored in educationJobData)
      validateDto.currentAcademicStatus = eduJob.currentAcademicStatus;
      validateDto.researchInterests = eduJob.researchInterests;

      // References & Consent (stored in referencesData)
      validateDto.characterReferences = refs.characterReferences || [];
      validateDto.regionalChapterBoardReference = refs.regionalChapterBoardReference;
      validateDto.privacyPolicyConsent = refs.privacyPolicyConsent || refs.consent;
    } else if (application.membershipType === 'INSTITUTIONAL') {
      // Institution Profile
      validateDto.collegeUniversityName = profile.collegeUniversityName;
      validateDto.institutionAddress = profile.institutionAddress;
      validateDto.telMobileNo = profile.telMobileNo;
      validateDto.emailAddress = profile.emailAddress;
      validateDto.presidentName = profile.presidentName;
      validateDto.deanHeadGraduateSchool = profile.deanHeadGraduateSchool;

      // Academic Information
      validateDto.educationCoursesOffered = eduJob.educationCoursesOffered;
      validateDto.graduateCoursesOffered = eduJob.graduateCoursesOffered;
      validateDto.totalGraduateFaculty = eduJob.totalGraduateFaculty !== undefined ? Number(eduJob.totalGraduateFaculty) : undefined;
      validateDto.currentEnrollmentCount = eduJob.currentEnrollmentCount !== undefined ? Number(eduJob.currentEnrollmentCount) : undefined;
      validateDto.enrollmentYearRange = eduJob.enrollmentYearRange;

      // Professional Affiliations
      validateDto.professionalAffiliations = exp.professionalAffiliations;

      // References & Consent
      validateDto.characterReferences = refs.characterReferences || [];
      validateDto.regionalChapterBoardReference = refs.regionalChapterBoardReference;
      validateDto.privacyPolicyConsent = refs.privacyPolicyConsent || refs.consent;
    } else {
      // Profile data
      validateDto.fullName = profile.fullName;
      validateDto.email = profile.email;
      validateDto.phone = profile.phone;
      validateDto.region = profile.region;
      validateDto.homeAddress = profile.homeAddress;

      // Job/Education data
      validateDto.institution = eduJob.institution;
      validateDto.address = eduJob.address;
      validateDto.presentPosition = eduJob.presentPosition;

      // Institutional specific
      validateDto.enrolleeCount = profile.enrolleeCount;
      validateDto.accreditationDetails = eduJob.accreditationDetails;
    }

    // Run validator after transforming plain objects to DTO instances
    const transformedDto = plainToInstance(ValidateMembershipApplicationDto, validateDto);
    const errors = await validate(transformedDto);
    const errorMap: Record<string, string> = {};

    if (errors.length > 0) {
      for (const err of errors) {
        if (err.children && err.children.length > 0) {
          const childErrors: string[] = [];
          err.children.forEach(child => {
            if (child.constraints) {
              childErrors.push(...Object.values(child.constraints));
            }
            if (child.children) {
              child.children.forEach(grandchild => {
                if (grandchild.constraints) {
                  childErrors.push(...Object.values(grandchild.constraints));
                }
              });
            }
          });
          errorMap[err.property] = childErrors[0] || 'Invalid reference details.';
        } else {
          errorMap[err.property] = Object.values(err.constraints || {})[0];
        }
      }
    }

    // Check required documents depending on type
    const docTypes = application.documents.map(d => d.documentType.toString());
    if (application.membershipType === 'LIFE' || application.membershipType === 'REGULAR' || application.membershipType === 'ASSOCIATE') {
      if (!docTypes.includes('photo_1x1')) {
        errorMap['photo_1x1'] = `1x1 Photo is required.`;
      }
      if (application.membershipType === 'LIFE' && !docTypes.includes('active_member_id')) {
        errorMap['active_member_id'] = 'Active-member ID/certification is required for Life membership.';
      }
    }

    if (application.membershipType === 'ASSOCIATE') {
      if (!docTypes.includes('current_enrollment_proof')) {
        errorMap['current_enrollment_proof'] = 'Current enrollment proof is required for Associate membership.';
      }
    } else if (application.membershipType === 'INSTITUTIONAL' && !docTypes.includes('registrar_certification')) {
      errorMap['registrar_certification'] = 'Registrar certification of enrolment is required for Institutional membership.';
    }

    if (Object.keys(errorMap).length > 0) {
      throw new BadRequestException({
        success: false,
        message: 'Validation failed. Please complete all required fields.',
        errors: errorMap,
      });
    }

    const updated = await this.prisma.membershipApplication.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
      },
    });

    if (user?.id) {
      await this.logActivity(BigInt(user.id), 'SUBMIT_MEMBERSHIP_APPLICATION', ipAddress || '127.0.0.1');
    }

    return {
      success: true,
      data: updated,
      message: 'Membership application submitted successfully.',
    };
  }

  async updateStatus(id: string, status: MembershipApplicationStatus, rejectionReason?: string, user?: any, ipAddress?: string) {
    const existing = await this.prisma.membershipApplication.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Membership application with ID ${id} not found.`);
    }

    const updated = await this.prisma.membershipApplication.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
      },
    });

    const actionType = status === 'approved' ? 'APPROVE_MEMBERSHIP_APPLICATION' : 'REJECT_MEMBERSHIP_APPLICATION';
    if (user?.id) {
      await this.logActivity(BigInt(user.id), actionType, ipAddress || '127.0.0.1');
    }

    return {
      success: true,
      data: updated,
      message: `Membership application has been ${status} successfully.`,
    };
  }

  async findOne(id: string) {
    const record = await this.prisma.membershipApplication.findUnique({
      where: { id },
      include: { documents: true },
    });
    if (!record) {
      throw new NotFoundException(`Membership application with ID ${id} not found.`);
    }

    return {
      success: true,
      data: record,
      message: 'Membership application retrieved successfully',
    };
  }

  async findAll() {
    const records = await this.prisma.membershipApplication.findMany({
      include: { documents: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: records,
      message: 'Membership applications retrieved successfully',
    };
  }

  private async logActivity(userId: bigint, action: string, ipAddress: string) {
    try {
      await this.prisma.user_activities.create({
        data: {
          user_id: userId,
          action,
          ip_address: ipAddress,
        },
      });
    } catch (err) {
      console.error('Failed to log user activity:', err);
    }
  }
}
