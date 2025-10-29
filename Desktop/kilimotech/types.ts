export type UserType = 'farmer' | null;

export interface FarmData {
    cropType: string;
    acreage: number;
    yieldEstimate: number; // in tons/acre
    annualExpenses: number; // in KES
    rainfall: 'Low' | 'Average' | 'High';
    soilHealth: 'Poor' | 'Average' | 'Good';
}

export interface CreditProfile {
    loanEligibility: number; // in KES
    repaymentAbilityScore: number; // percentage
    riskScore: number; // percentage or a score
    summary?: string;
}

export interface Insurance {
    status: 'Active' | 'Inactive';
}

export interface MpesaStatement {
    fileName: string;
    uploadDate: string;
}

export interface AIInsights {
    yieldAdvice: string;
    riskAdvice: string;
    loanAdvice: string;
}

export interface Farmer {
    id: string;
    name: string;
    phone: string;
    location: string;
    farmType: string;
    farmData: FarmData;
    creditProfile: CreditProfile;
    insurance: Insurance;
    mpesaStatement: MpesaStatement | null;
    insights: AIInsights | null;
}
