export const MEMBERSHIP_FEES = {
  LIFE: 5000,
  REGULAR: 2000,
  ASSOCIATE: 500,
  INSTITUTIONAL: {
    TIERS: [
      { maxEnrollees: 499, fee: 1200 },
      { maxEnrollees: 999, fee: 2000 },
      { maxEnrollees: Infinity, fee: 3000 }
    ]
  }
};

export function calculateFee(type: string, enrolleeCount?: number): number {
  const t = type.toUpperCase();
  if (t === 'LIFE') return MEMBERSHIP_FEES.LIFE;
  if (t === 'REGULAR') return MEMBERSHIP_FEES.REGULAR;
  if (t === 'ASSOCIATE') return MEMBERSHIP_FEES.ASSOCIATE;
  if (t === 'INSTITUTIONAL') {
    const count = enrolleeCount || 0;
    const tier = MEMBERSHIP_FEES.INSTITUTIONAL.TIERS.find(t => count <= t.maxEnrollees);
    return tier ? tier.fee : 1200;
  }
  return 0;
}
