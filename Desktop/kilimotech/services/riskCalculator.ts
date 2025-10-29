/**
 * Risk Calculator Service
 * 
 * Calculates farmer risk scores based on three dimensions:
 * - Production stability (30% weight)
 * - Financial health (40% weight)
 * - Behavioral consistency (30% weight)
 * 
 * Lower risk score = better credit terms and lower interest rates
 */

import { ProductionProfile, FinancialBackground, BehavioralBackground, RiskInsights } from '../types';

/**
 * Calculate production stability score (0-1, lower is better/riskier)
 */
function calculateProductionScore(profile: ProductionProfile): number {
    let score = 0;
    let factors = 0;

    // Factor 1: Yield stability (variation in yield history)
    if (profile.yieldHistory.length >= 2) {
        const yields = profile.yieldHistory.map(y => y.yield);
        const avgYield = yields.reduce((a, b) => a + b, 0) / yields.length;
        const variance = yields.reduce((sum, y) => sum + Math.pow(y - avgYield, 2), 0) / yields.length;
        const coefficientOfVariation = Math.sqrt(variance) / avgYield;
        
        // Lower variation = lower risk (higher score closer to 1)
        // High variation (>30%) = higher risk
        const stabilityScore = Math.max(0, 1 - coefficientOfVariation);
        score += stabilityScore * 0.4;
        factors += 0.4;
    }

    // Factor 2: Crop diversification (more crops = lower risk)
    const diversificationScore = Math.min(1, profile.cropTypes.length / 3); // 3+ crops = max score
    score += diversificationScore * 0.3;
    factors += 0.3;

    // Factor 3: Input cost ratio (lower cost relative to income = better)
    const totalInputCost = profile.inputCosts.seeds + profile.inputCosts.fertilizer + 
                          profile.inputCosts.pesticides + profile.inputCosts.labor;
    // Assume annual income = monthlyIncome * 12 for calculation
    // This will be normalized when combined with financial score
    const costRatio = Math.min(1, totalInputCost / 500000); // Normalize to reasonable range
    const costEfficiencyScore = Math.max(0, 1 - (costRatio / 2)); // Lower cost = higher score
    score += costEfficiencyScore * 0.3;
    factors += 0.3;

    // Normalize if factors < 1
    return factors > 0 ? score / factors : 0.5;
}

/**
 * Calculate financial health score (0-1, lower is better/riskier)
 */
function calculateFinancialScore(background: FinancialBackground): number {
    let score = 0;

    // Factor 1: Repayment record (40%)
    const repaymentScores: Record<string, number> = {
        'Poor': 0.2,
        'Fair': 0.5,
        'Good': 0.8,
        'Excellent': 1.0
    };
    score += (repaymentScores[background.repaymentRecord] || 0.5) * 0.4;

    // Factor 2: Loan history (30%)
    if (background.pastLoans.length > 0) {
        const repaymentRate = background.pastLoans.filter(l => l.repaid).length / background.pastLoans.length;
        const onTimeRate = background.pastLoans.filter(l => l.onTime).length / background.pastLoans.length;
        const loanScore = (repaymentRate * 0.6 + onTimeRate * 0.4);
        score += loanScore * 0.3;
    } else {
        score += 0.6 * 0.3; // No loan history = neutral score
    }

    // Factor 3: Savings behavior (20%)
    const savingsScores: Record<string, number> = {
        'None': 0.2,
        'Irregular': 0.4,
        'Regular': 0.7,
        'Consistent': 1.0
    };
    score += (savingsScores[background.savingsBehavior] || 0.5) * 0.2;

    // Factor 4: Financial infrastructure (10%)
    const infrastructureScore = (background.bankAccount ? 0.5 : 0) + 
                               (background.mpesaUsage === 'High' ? 0.5 : background.mpesaUsage === 'Medium' ? 0.3 : 0.1);
    score += infrastructureScore * 0.1;

    return score;
}

/**
 * Calculate behavioral consistency score (0-1, lower is better/riskier)
 */
function calculateBehavioralScore(background: BehavioralBackground): number {
    let score = 0;

    // Factor 1: Data update frequency (30%)
    const frequencyScores: Record<string, number> = {
        'Rare': 0.2,
        'Monthly': 0.5,
        'Weekly': 0.8,
        'Daily': 1.0
    };
    score += (frequencyScores[background.dataUpdateFrequency] || 0.5) * 0.3;

    // Factor 2: Timeliness score (30%)
    score += background.timelinessScore * 0.3;

    // Factor 3: Training participation (20%)
    const trainingScore = Math.min(1, background.trainingParticipation.length / 3); // 3+ trainings = max
    score += trainingScore * 0.2;

    // Factor 4: Engagement (20%)
    const engagementScores: Record<string, number> = {
        'Low': 0.3,
        'Medium': 0.6,
        'High': 1.0
    };
    score += (engagementScores[background.advisoryEngagement] || 0.5) * 0.2;

    return score;
}

/**
 * Calculate overall risk score
 * Risk score: 0 (lowest risk, best credit terms) to 1 (highest risk)
 */
export function calculateRiskScore(
    production: ProductionProfile,
    financial: FinancialBackground,
    behavioral: BehavioralBackground
): number {
    const prodScore = calculateProductionScore(production);
    const finScore = calculateFinancialScore(financial);
    const behScore = calculateBehavioralScore(behavioral);

    // Weighted combination: Production (30%), Financial (40%), Behavioral (30%)
    const riskScore = prodScore * 0.3 + finScore * 0.4 + behScore * 0.3;

    // Invert: lower score = lower risk
    // Convert to risk score where 0 = low risk, 1 = high risk
    return 1 - riskScore;
}

/**
 * Determine risk category based on risk score
 */
export function getRiskCategory(riskScore: number): 'Low' | 'Medium' | 'High' {
    if (riskScore <= 0.3) {
        return 'Low';
    } else if (riskScore <= 0.7) {
        return 'Medium';
    } else {
        return 'High';
    }
}

/**
 * Generate risk insights and recommendations
 */
export function generateRiskInsights(
    riskScore: number,
    riskCategory: 'Low' | 'Medium' | 'High',
    production: ProductionProfile,
    financial: FinancialBackground,
    behavioral: BehavioralBackground
): RiskInsights {
    const recommendations: string[] = [];
    let summary = '';
    let interestRateRange = '';
    let loanAmountRange = '';
    let eligibilityMessage = '';
    const benefits: string[] = [];

    if (riskCategory === 'Low') {
        summary = 'Excellent profile! You qualify for the best credit terms and lowest interest rates.';
        interestRateRange = '8-12%';
        loanAmountRange = 'KES 100,000 - 500,000';
        eligibilityMessage = 'You have access to premium credit products with favorable terms.';
        benefits.push('Lower interest rates (8-12% APR)');
        benefits.push('Higher loan amounts available');
        benefits.push('Flexible repayment terms');
        benefits.push('Priority support from financial partners');

        if (production.cropTypes.length < 2) {
            recommendations.push('Consider diversifying your crops to further reduce production risk');
        }
        if (financial.savingsBehavior !== 'Consistent') {
            recommendations.push('Increase savings consistency to maintain your excellent profile');
        }
    } else if (riskCategory === 'Medium') {
        summary = 'Good profile with room for improvement. You qualify for standard credit terms.';
        interestRateRange = '12-18%';
        loanAmountRange = 'KES 50,000 - 200,000';
        eligibilityMessage = 'You have access to standard credit products. Improving your profile can unlock better rates.';
        benefits.push('Standard interest rates (12-18% APR)');
        benefits.push('Access to medium-term loans');
        benefits.push('Financial advisory support');
        benefits.push('SMS-based farming tips and reminders');

        if (production.yieldHistory.length < 2) {
            recommendations.push('Keep detailed yield records to demonstrate production stability');
        }
        if (financial.repaymentRecord === 'Fair' || financial.repaymentRecord === 'Poor') {
            recommendations.push('Improve repayment history by paying loans on time');
        }
        if (behavioral.dataUpdateFrequency !== 'Weekly') {
            recommendations.push('Update your farm data more frequently to improve your profile');
        }
    } else {
        summary = 'Your profile needs improvement. Focus on building a stronger track record for better credit access.';
        interestRateRange = '18-24%';
        loanAmountRange = 'KES 20,000 - 100,000';
        eligibilityMessage = 'You have limited credit access. Building your profile will unlock better terms.';
        benefits.push('Structured loan products available');
        benefits.push('Intensive advisory support');
        benefits.push('Graduated credit access as profile improves');
        benefits.push('SMS reminders and farming best practices');

        recommendations.push('Start building a repayment history with small loans');
        recommendations.push('Update your farm data regularly to show engagement');
        recommendations.push('Participate in training programs to improve your skills');
        if (production.yieldHistory.length === 0) {
            recommendations.push('Begin tracking your yields to demonstrate production capability');
        }
        if (!financial.bankAccount) {
            recommendations.push('Open a bank account to improve financial infrastructure');
        }
        if (behavioral.trainingParticipation.length === 0) {
            recommendations.push('Join training programs offered through the platform');
        }
    }

    // Add category-specific recommendations
    if (riskScore > 0.5) {
        recommendations.push('Consider crop insurance for external risk protection');
    }
    if (financial.mpesaUsage === 'Low') {
        recommendations.push('Increase M-Pesa usage for better transaction records');
    }
    if (behavioral.profileCompleteness < 0.8) {
        recommendations.push('Complete your profile to improve your risk assessment');
    }

    return {
        summary,
        recommendations,
        creditTerms: {
            interestRateRange,
            loanAmountRange,
            eligibilityMessage
        },
        benefits
    };
}

