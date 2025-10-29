import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminClient } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method === 'GET') {
            return res.status(200).json({ success: true, message: 'ai-insights OK' });
        }
        if (req.method !== 'POST') {
            return res.status(405).json({ success: false, error: 'Method not allowed' });
        }

        const { farmerId, yieldAdvice, riskAdvice, loanAdvice } = req.body || {};
        if (!farmerId || !yieldAdvice || !riskAdvice || !loanAdvice) {
            return res.status(400).json({ success: false, error: 'Missing farmerId, yieldAdvice, riskAdvice, or loanAdvice' });
        }

        const supabase = getAdminClient();
        const { data, error } = await supabase
            .from('ai_insights')
            .insert({
                farmer_id: farmerId,
                yield_advice: yieldAdvice,
                risk_advice: riskAdvice,
                loan_advice: loanAdvice
            })
            .select()
            .single();
        if (error) return res.status(400).json({ success: false, error: error.message });
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
}


