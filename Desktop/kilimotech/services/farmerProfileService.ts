/**
 * Farmer Profile Service
 * 
 * Handles CRUD operations for farmer profiles and risk assessments
 */

import { supabase } from './supabaseClient';
import { FarmerProfile, ProductionProfile, FinancialBackground, BehavioralBackground } from '../types';
import { calculateRiskScore, getRiskCategory, generateRiskInsights } from './riskCalculator';

/**
 * Fetch farmer profile by farmer ID
 */
export async function fetchFarmerProfile(farmerId: string): Promise<FarmerProfile | null> {
    try {
        const { data, error } = await supabase
            .from('farmer_profiles')
            .select('*')
            .eq('farmer_id', farmerId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No profile found
                return null;
            }
            console.error('Error fetching farmer profile:', error);
            return null;
        }

        if (!data) return null;

        return {
            id: data.id,
            farmerId: data.farmer_id,
            productionProfile: data.production_profile as ProductionProfile,
            financialBackground: data.financial_background as FinancialBackground,
            behavioralBackground: data.behavioral_background as BehavioralBackground,
            riskScore: data.risk_score || 0,
            riskCategory: data.risk_category || 'High',
            phoneNumber: data.phone_number,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    } catch (error) {
        console.error('Error in fetchFarmerProfile:', error);
        return null;
    }
}

/**
 * Create or update farmer profile
 * Automatically calculates risk score and category
 */
export async function saveFarmerProfile(
    farmerId: string,
    production: ProductionProfile,
    financial: FinancialBackground,
    behavioral: BehavioralBackground,
    phoneNumber?: string
): Promise<FarmerProfile | null> {
    try {
        // Calculate risk score
        const riskScore = calculateRiskScore(production, financial, behavioral);
        const riskCategory = getRiskCategory(riskScore);

        // Check if profile exists
        const existing = await fetchFarmerProfile(farmerId);

        if (existing) {
            // Update existing profile
            const { data, error } = await supabase
                .from('farmer_profiles')
                .update({
                    production_profile: production,
                    financial_background: financial,
                    behavioral_background: behavioral,
                    risk_score: riskScore,
                    risk_category: riskCategory,
                    phone_number: phoneNumber || existing.phoneNumber,
                    updated_at: new Date().toISOString()
                })
                .eq('farmer_id', farmerId)
                .select()
                .single();

            if (error) {
                console.error('Error updating farmer profile:', error);
                return null;
            }

            return {
                id: data.id,
                farmerId: data.farmer_id,
                productionProfile: production,
                financialBackground: financial,
                behavioralBackground: behavioral,
                riskScore: riskScore,
                riskCategory: riskCategory,
                phoneNumber: phoneNumber || existing.phoneNumber,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            };
        } else {
            // Create new profile
            const { data, error } = await supabase
                .from('farmer_profiles')
                .insert({
                    farmer_id: farmerId,
                    production_profile: production,
                    financial_background: financial,
                    behavioral_background: behavioral,
                    risk_score: riskScore,
                    risk_category: riskCategory,
                    phone_number: phoneNumber
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating farmer profile:', error);
                return null;
            }

            return {
                id: data.id,
                farmerId: data.farmer_id,
                productionProfile: production,
                financialBackground: financial,
                behavioralBackground: behavioral,
                riskScore: riskScore,
                riskCategory: riskCategory,
                phoneNumber: phoneNumber,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            };
        }
    } catch (error) {
        console.error('Error in saveFarmerProfile:', error);
        return null;
    }
}

/**
 * Get risk insights for a farmer profile
 */
export async function getRiskInsights(farmerId: string) {
    const profile = await fetchFarmerProfile(farmerId);
    if (!profile) {
        return null;
    }

    return generateRiskInsights(
        profile.riskScore,
        profile.riskCategory,
        profile.productionProfile,
        profile.financialBackground,
        profile.behavioralBackground
    );
}

/**
 * Export risk insights calculation (for use in components)
 */
export { generateRiskInsights, calculateRiskScore, getRiskCategory };

