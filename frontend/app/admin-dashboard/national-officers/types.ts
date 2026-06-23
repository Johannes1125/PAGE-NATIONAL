export interface NationalOfficer {
  id: string;
  memberName: string;
  positionCategory: string;
  role: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNationalOfficerPayload {
  memberName: string;
  positionCategory: string;
  role: string;
  description?: string;
}

export interface UpdateNationalOfficerPayload {
  memberName?: string;
  positionCategory?: string;
  role?: string;
  description?: string;
}
