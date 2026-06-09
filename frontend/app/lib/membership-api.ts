import { ApplicationFormState } from './membership-types';

/**
 * Submits the membership application form data.
 * Currently returns a mock application ID, simulating network latency.
 * When integrating with the backend, this can be swapped with:
 *   const formData = new FormData();
 *   // append fields & files...
 *   return api.postMultipart('/membership/apply', formData);
 */
export async function submitMembershipApplication(data: ApplicationFormState): Promise<{ id: string }> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Log data for debugging/mock verification purposes
  console.log('Submitting membership application with data:', {
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    institution: data.institution,
    address: data.address,
    membershipType: data.membershipType,
    documentNames: Object.keys(data.documents).map((key) => {
      const file = data.documents[key];
      return `${key}: ${file ? `${file.name} (${file.size} bytes)` : 'null'}`;
    }),
  });

  // Returns standard mock application tracking ID
  return { id: 'MOCK-2025-0042' };
}
