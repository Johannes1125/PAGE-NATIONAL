export const MEMBERSHIP_FEES = {
  LIFE: 5000,
  REGULAR: 2000,
  ASSOCIATE: 500,
};

export function computeInstitutionalFee(enrollmentCount: number): number {
  if (enrollmentCount <= 100) {
    return 1200;
  }
  if (enrollmentCount <= 200) {
    return 2000;
  }
  return 3000;
}

export function calculateFee(type: string, enrolleeCount?: number): number {
  const t = type.toUpperCase();
  if (t === 'LIFE') return MEMBERSHIP_FEES.LIFE;
  if (t === 'REGULAR') return MEMBERSHIP_FEES.REGULAR;
  if (t === 'ASSOCIATE') return MEMBERSHIP_FEES.ASSOCIATE;
  if (t === 'INSTITUTIONAL') {
    return computeInstitutionalFee(enrolleeCount || 0);
  }
  return 0;
}

