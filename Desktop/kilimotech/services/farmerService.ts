import { supabase } from './supabaseClient';
import { Farmer, FarmData, CreditProfile, AIInsights } from '../types';

/**
 * Fetch all farmers with their related data
 */
export async function fetchAllFarmers(): Promise<Farmer[]> {
    const { data: farmersData, error: farmersError } = await supabase
        .from('farmers')
        .select('*');

    if (farmersError) {
        console.error('Error fetching farmers:', farmersError);
        return [];
    }

    if (!farmersData) return [];

    // Fetch all related data for each farmer
    const farmers = await Promise.all(
        farmersData.map(async (farmer) => {
            const [farmData, creditProfile, insurance, insights] = await Promise.all([
                fetchFarmData(farmer.id),
                fetchCreditProfile(farmer.id),
                fetchInsurance(farmer.id),
                fetchAIInsights(farmer.id)
            ]);

            return {
                id: farmer.id,
                name: farmer.name,
                phone: farmer.phone,
                location: farmer.location,
                farmType: farmer.farm_type,
                farmData: farmData || {
                    cropType: '',
                    acreage: 0,
                    yieldEstimate: 0,
                    annualExpenses: 0,
                    rainfall: 'Average' as const,
                    soilHealth: 'Average' as const
                },
                creditProfile: creditProfile || {
                    loanEligibility: 0,
                    repaymentAbilityScore: 0,
                    riskScore: 0
                },
                insurance: insurance || { status: 'Inactive' as const },
                insights
            };
        })
    );

    return farmers;
}

/**
 * Fetch a single farmer by ID
 */
export async function fetchFarmerById(farmerId: string): Promise<Farmer | null> {
    const { data: farmer, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('id', farmerId)
        .single();

    if (error || !farmer) {
        console.error('Error fetching farmer:', error);
        return null;
    }

    const [farmData, creditProfile, insurance, insights] = await Promise.all([
        fetchFarmData(farmer.id),
        fetchCreditProfile(farmer.id),
        fetchInsurance(farmer.id),
        fetchAIInsights(farmer.id)
    ]);

    return {
        id: farmer.id,
        name: farmer.name,
        phone: farmer.phone,
        location: farmer.location,
        farmType: farmer.farm_type,
        farmData: farmData || {
            cropType: '',
            acreage: 0,
            yieldEstimate: 0,
            annualExpenses: 0,
            rainfall: 'Average' as const,
            soilHealth: 'Average' as const
        },
        creditProfile: creditProfile || {
            loanEligibility: 0,
            repaymentAbilityScore: 0,
            riskScore: 0
        },
        insurance: insurance || { status: 'Inactive' as const },
        insights
    };
}

/**
 * Create a new farmer
 */
export async function createFarmer(farmer: Omit<Farmer, 'id'>): Promise<string | null> {
    const { data, error } = await supabase
        .from('farmers')
        .insert({
            name: farmer.name,
            phone: farmer.phone,
            location: farmer.location,
            farm_type: farmer.farmType
        })
        .select()
        .single();

    if (error || !data) {
        console.error('Error creating farmer:', error);
        return null;
    }

    // Create related records
    await Promise.all([
        updateFarmData(data.id, farmer.farmData),
        updateCreditProfile(data.id, farmer.creditProfile),
        supabase.from('insurance').insert({
            farmer_id: data.id,
            status: farmer.insurance.status
        })
    ]);

    return data.id;
}

/**
 * Fetch farm data for a farmer
 */
async function fetchFarmData(farmerId: string): Promise<FarmData | null> {
    const { data, error } = await supabase
        .from('farm_data')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return null;

    return {
        cropType: data.crop_type,
        acreage: data.acreage,
        yieldEstimate: data.yield_estimate,
        annualExpenses: data.annual_expenses,
        rainfall: data.rainfall,
        soilHealth: data.soil_health
    };
}

/**
 * Update farm data for a farmer
 */
export async function updateFarmData(farmerId: string, farmData: FarmData): Promise<boolean> {
    const { error } = await supabase
        .from('farm_data')
        .insert({
            farmer_id: farmerId,
            crop_type: farmData.cropType,
            acreage: farmData.acreage,
            yield_estimate: farmData.yieldEstimate,
            annual_expenses: farmData.annualExpenses,
            rainfall: farmData.rainfall,
            soil_health: farmData.soilHealth
        });

    if (error) {
        console.error('Error updating farm data:', error);
        return false;
    }

    return true;
}

/**
 * Fetch credit profile for a farmer
 */
async function fetchCreditProfile(farmerId: string): Promise<CreditProfile | null> {
    const { data, error } = await supabase
        .from('credit_profiles')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return null;

    return {
        loanEligibility: data.loan_eligibility,
        repaymentAbilityScore: data.repayment_ability_score,
        riskScore: data.risk_score,
        summary: data.summary || undefined
    };
}

/**
 * Update credit profile for a farmer
 */
export async function updateCreditProfile(farmerId: string, profile: CreditProfile): Promise<boolean> {
    const { error } = await supabase
        .from('credit_profiles')
        .insert({
            farmer_id: farmerId,
            loan_eligibility: profile.loanEligibility,
            repayment_ability_score: profile.repaymentAbilityScore,
            risk_score: profile.riskScore,
            summary: profile.summary || null
        });

    if (error) {
        console.error('Error updating credit profile:', error);
        return false;
    }

    return true;
}

/**
 * Fetch insurance for a farmer
 */
async function fetchInsurance(farmerId: string) {
    const { data, error } = await supabase
        .from('insurance')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return null;

    return {
        status: data.status
    };
}


/**
 * Fetch AI insights for a farmer
 */
async function fetchAIInsights(farmerId: string): Promise<AIInsights | null> {
    const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return null;

    return {
        yieldAdvice: data.yield_advice,
        riskAdvice: data.risk_advice,
        loanAdvice: data.loan_advice
    };
}

/**
 * Update AI insights for a farmer
 */
export async function updateAIInsights(farmerId: string, insights: AIInsights): Promise<boolean> {
    const { error } = await supabase
        .from('ai_insights')
        .insert({
            farmer_id: farmerId,
            yield_advice: insights.yieldAdvice,
            risk_advice: insights.riskAdvice,
            loan_advice: insights.loanAdvice
        });

    if (error) {
        console.error('Error updating AI insights:', error);
        return false;
    }

    return true;
}

