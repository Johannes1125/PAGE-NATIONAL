import { api } from './api-client';
import { ApplicationFormState, MembershipApplication } from './membership-types';

export interface MembershipApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

/**
 * Creates an initial membership application draft in the database.
 */
export async function createMembershipDraft(membershipType: string): Promise<MembershipApplication> {
  const res = await api.post<MembershipApiResponse<MembershipApplication>>('/membership-applications', {
    membershipType: membershipType.toUpperCase(),
  });
  if (!res.success || !res.data) {
    throw new Error(res.message || 'Failed to create application draft');
  }
  return res.data;
}

/**
 * Saves step data to the backend draft database record.
 */
export async function saveMembershipStep(
  id: string,
  stepName: string,
  data: Record<string, any>,
  currentStep?: number
): Promise<MembershipApplication> {
  const res = await api.patch<MembershipApiResponse<MembershipApplication>>(
    `/membership-applications/${id}/step/${stepName}`,
    { data, currentStep }
  );
  if (!res.success || !res.data) {
    throw new Error(res.message || `Failed to save ${stepName} step data`);
  }
  return res.data;
}

/**
 * Uploads a document file to the backend, associated with a specific slot type.
 */
export async function uploadMembershipDocument(
  id: string,
  file: File,
  documentType: string
): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);

  const res = await api.postMultipart<MembershipApiResponse>(
    `/membership-applications/${id}/documents`,
    formData
  );
  if (!res.success || !res.data) {
    throw new Error(res.message || 'Failed to upload document');
  }
  return res.data;
}

/**
 * Submits the completed application for admin review, executing type-aware validation.
 */
export async function submitMembershipApplication(
  id: string
): Promise<MembershipApiResponse<MembershipApplication>> {
  return api.post<MembershipApiResponse<MembershipApplication>>(
    `/membership-applications/${id}/submit`,
    {}
  );
}

/**
 * Retrieves a single application by ID to track or resume.
 */
export async function getMembershipApplication(id: string): Promise<MembershipApplication> {
  const res = await api.get<MembershipApiResponse<MembershipApplication>>(`/membership-applications/${id}`);
  if (!res.success || !res.data) {
    throw new Error(res.message || 'Failed to retrieve application');
  }
  return res.data;
}

/**
 * Retrieves all membership applications (admin panel).
 */
export async function listMembershipApplications(): Promise<MembershipApplication[]> {
  const res = await api.get<MembershipApiResponse<MembershipApplication[]>>('/membership-applications');
  if (!res.success || !res.data) {
    throw new Error(res.message || 'Failed to retrieve applications');
  }
  return res.data;
}

/**
 * Updates application status (approve/reject) (admin panel).
 */
export async function updateMembershipApplicationStatus(
  id: string,
  status: 'approved' | 'rejected' | 'under_review',
  rejectionReason?: string
): Promise<MembershipApplication> {
  const res = await api.patch<MembershipApiResponse<MembershipApplication>>(
    `/membership-applications/${id}/status`,
    { status, rejectionReason }
  );
  if (!res.success || !res.data) {
    throw new Error(res.message || 'Failed to update application status');
  }
  return res.data;
}
