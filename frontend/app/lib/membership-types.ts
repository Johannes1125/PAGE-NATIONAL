export interface MembershipCategory {
  id: 'life' | 'institutional' | 'associate' | 'regular';
  name: string;
  description: string;
  annualFee: string;
  requirements: string[];
}

export interface CommonProfileData {
  fullName: string;
  email: string;
  phone: string;
  region: string;
  homeAddress: string;
}

export interface InstitutionalProfileData extends CommonProfileData {
  enrolleeCount: number;
}

export interface CommonEducationJobData {
  institution: string;
  address: string;
  presentPosition: string;
}

export interface AcademicEducationJobData extends CommonEducationJobData {
  degreeObtained: string;
  specialization: string;
  degreeInstitution: string;
  yearObtained: string;
}

export interface AssociateEducationJobData extends CommonEducationJobData {
  currentEnrollmentStatus: string;
  expectedGraduationYear: string;
}

export interface InstitutionalEducationJobData extends CommonEducationJobData {
  accreditationDetails: string;
}

export interface ApplicationFormState {
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  address: string;
  membershipType: 'life' | 'institutional' | 'associate' | 'regular' | null;
  documents: Record<string, { name: string; size?: number; url?: string } | File | null>;
  
  region?: string;
  homeAddress?: string;
  whereEmployed?: string;
  businessAddress?: string;
  presentPosition?: string;
  
  // Institutional
  enrolleeCount?: string;
  accreditationDetails?: string;

  // Regular/Life
  degreeObtained?: string;
  specialization?: string;
  degreeInstitution?: string;
  yearObtained?: string;
  
  // Associate
  currentEnrollmentStatus?: string;
  expectedGraduationYear?: string;
  
  // Life
  yearsActiveInPAGE?: string;
  teachingExperience?: { institution: string; fromYear: string; toYear: string }[];
  administrativeExperience?: { institution: string; fromYear: string; toYear: string }[];
  recentPublications?: string[];
  professionalMemberships?: string[];
  characterReferences?: { name: string; position: string; address: string }[];
  regionalChapterBoardReference?: { name: string; address: string };
  name?: string;
  telMobileNo?: string;
  emailAddress?: string;

  teachingExp?: string;
  teachingInst?: string;
  teachingFrom?: string;
  teachingTo?: string;
  
  adminExp?: string;
  adminInst?: string;
  adminFrom?: string;
  adminTo?: string;
  
  pub1?: string;
  pub2?: string;
  pub3?: string;
  pub4?: string;
  
  assoc1?: string;
  assoc2?: string;
  assoc3?: string;
  
  ref1Name?: string;
  ref1Position?: string;
  ref1Address?: string;
  
  ref2Name?: string;
  ref2Position?: string;
  ref2Address?: string;
}

export interface ApplicationStatus {
  id: string;
  submittedAt: string;
  membershipType: string;
  currentStage: number; // 0 to 3
  stages: {
    label: string;
    description: string;
    timestamp: string | null;
  }[];
}

export interface MembershipApplicationDocument {
  id: string;
  applicationId: string;
  documentType: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
}

export interface MembershipApplication {
  id: string;
  membershipType: 'life' | 'institutional' | 'associate' | 'regular';
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  currentStep: number;
  profileData: Record<string, any> | null;
  educationJobData: Record<string, any> | null;
  experienceData: Record<string, any> | null;
  referencesData: Record<string, any> | null;
  feeAmount: number | string;
  applicantId?: number | null;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  rejectionReason?: string | null;
  documents: MembershipApplicationDocument[];
}

