import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminClient } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method === 'GET') {
            return res.status(200).json({ success: true, message: 'credit OK' });
        }
        if (req.method !== 'POST') {
            return res.status(405).json({ success: false, error: 'Method not allowed' });
        }

        const { farmerId, monthlyIncome = 0, repaymentHistory = 'average', riskInputs = {} } = req.body || {};
        if (!farmerId) return res.status(400).json({ success: false, error: 'Missing farmerId' });

        // Simple mock scoring
        const baseEligibility = Math.max(0, Number(monthlyIncome)) * 2; // KES
        const repaymentFactor = repaymentHistory === 'good' ? 1 : repaymentHistory === 'weak' ? 0.6 : 0.8;
        const riskPenalty = (riskInputs?.adverseEvents ? 0.2 : 0) + (riskInputs?.latePayments ? 0.15 : 0);
        const riskScore = Math.min(1, Math.max(0, 0.35 + (Math.random() * 0.3) + (1 - repaymentFactor) * 0.3 + riskPenalty));
        const loanEligibility = Math.round(baseEligibility * repaymentFactor);
        const repaymentAbilityScore = Math.round(repaymentFactor * 100);
        const summary = `Mock credit profile based on income=${monthlyIncome}, history=${repaymentHistory}`;

        const supabase = getAdminClient();
        const { data, error } = await supabase
            .from('credit_profiles')
            .insert({
                farmer_id: farmerId,
                loan_eligibility: loanEligibility,
                repayment_ability_score: repaymentAbilityScore,
                risk_score: riskScore,
                summary
            })
            .select()
            .single();
        if (error) return res.status(400).json({ success: false, error: error.message });
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
}


