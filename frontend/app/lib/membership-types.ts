export interface MembershipCategory {
  id: 'life' | 'institutional' | 'associate' | 'regular';
  name: string;
  description: string;
  annualFee: string;
  requirements: string[];
}

export interface ApplicationFormState {
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  address: string;
  membershipType: 'life' | 'institutional' | 'associate' | 'regular' | null;
  documents: Record<string, File | null>;
  
  // Additional fields for print form alignment
  region?: string;
  homeAddress?: string;
  whereEmployed?: string;
  businessAddress?: string;
  presentPosition?: string;
  degreeObtained?: string;
  specialization?: string;
  degreeInstitution?: string;
  yearObtained?: string;
  
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

export interface MembershipApplication {
  id: string;
  applicantName: string;
  email: string;
  membershipType: 'life' | 'institutional' | 'associate' | 'regular';
  submittedAt: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  formData: {
    fullName: string;
    email: string;
    phone: string;
    institution: string;
    address: string;
    membershipType: 'life' | 'institutional' | 'associate' | 'regular';
    documents: Record<string, { name: string; size: number } | null>;
  };
  rejectionReason?: string;
}
