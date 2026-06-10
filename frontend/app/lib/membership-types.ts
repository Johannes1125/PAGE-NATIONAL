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
