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

// Weather forecast types
export interface WeatherForecast {
    date: string;
    temperature: {
        high: number;
        low: number;
        unit: 'celsius' | 'fahrenheit';
    };
    precipitation: {
        probability: number;
        amount?: number;
    };
    wind: {
        speed: number;
        direction?: number;
    };
    condition: string;
    icon?: string;
}

export interface WeatherLocation {
    name: string;
    coordinates: {
        lat: number;
        lon: number;
    };
}

// Wallet types
export interface Wallet {
    id: string;
    farmerId: string;
    balance: number;
    currency: string;
    phoneNumber: string;
    status: 'Active' | 'Suspended' | 'Closed';
    createdAt: string;
    updatedAt: string;
}

export interface WalletTransaction {
    id: string;
    walletId: string;
    type: 'deposit' | 'withdrawal' | 'payment_in' | 'payment_out';
    amount: number;
    balanceAfter: number;
    description?: string;
    reference?: string;
    phoneNumber?: string;
    status: 'pending' | 'completed' | 'failed';
    metadata?: any;
    createdAt: string;
}

// Farmer Profile and Risk Assessment Types
export interface ProductionProfile {
    cropTypes: string[];
    acreage: number;
    yieldHistory: Array<{
        year: number;
        yield: number; // tons/acre
        crop: string;
    }>;
    inputCosts: {
        seeds: number;
        fertilizer: number;
        pesticides: number;
        labor: number;
        total?: number;
    };
    seasonality: {
        primarySeason: string; // e.g., "Long Rains", "Short Rains"
        secondarySeason?: string;
    };
}

export interface FinancialBackground {
    incomeSources: string[]; // ["Crop Sales", "Livestock", "Off-farm"]
    monthlyIncome: number; // KES
    pastLoans: Array<{
        year: number;
        amount: number;
        repaid: boolean;
        onTime: boolean;
    }>;
    savingsBehavior: 'None' | 'Irregular' | 'Regular' | 'Consistent';
    repaymentRecord: 'Poor' | 'Fair' | 'Good' | 'Excellent';
    bankAccount: boolean;
    mpesaUsage: 'Low' | 'Medium' | 'High';
}

export interface BehavioralBackground {
    dataUpdateFrequency: 'Rare' | 'Monthly' | 'Weekly' | 'Daily';
    lastUpdateDate?: string;
    timelinessScore: number; // 0-1
    trainingParticipation: string[]; // ["Climate Smart", "Financial Literacy"]
    advisoryEngagement: 'Low' | 'Medium' | 'High';
    appUsageFrequency: 'Rare' | 'Weekly' | 'Daily';
    profileCompleteness: number; // 0-1
}

export interface FarmerProfile {
    id: string;
    farmerId: string;
    productionProfile: ProductionProfile;
    financialBackground: FinancialBackground;
    behavioralBackground: BehavioralBackground;
    riskScore: number; // 0-1, lower is better
    riskCategory: 'Low' | 'Medium' | 'High';
    phoneNumber?: string; // For SMS notifications
    createdAt: string;
    updatedAt: string;
}

export interface RiskInsights {
    summary: string;
    recommendations: string[];
    creditTerms: {
        interestRateRange: string;
        loanAmountRange: string;
        eligibilityMessage: string;
    };
    benefits: string[];
}
