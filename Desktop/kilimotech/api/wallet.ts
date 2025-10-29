import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminClient } from './_supabase';

const ENABLE_WALLET = process.env.ENABLE_WALLET === 'true';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!ENABLE_WALLET) {
        return res.status(410).json({ success: false, error: 'Wallet feature is disabled' });
    }

    try {
        const supabase = getAdminClient();

        if (req.method === 'GET') {
            const farmerId = (req.query?.farmerId as string) || '';
            if (!farmerId) return res.status(400).json({ success: false, error: 'Missing farmerId' });
            const { data: wallet, error } = await supabase.from('wallets').select('*').eq('farmer_id', farmerId).single();
            if (error) return res.status(400).json({ success: false, error: error.message });
            const { data: txns } = await supabase.from('wallet_transactions').select('*').eq('wallet_id', wallet.id).order('created_at', { ascending: false }).limit(50);
            return res.status(200).json({ success: true, data: { wallet, transactions: txns || [] } });
        }

        if (req.method === 'POST') {
            const { farmerId, type, amount, description } = req.body || {};
            if (!farmerId || !type || !amount) return res.status(400).json({ success: false, error: 'Missing farmerId, type, or amount' });
            const { data: wallet, error: wErr } = await supabase.from('wallets').select('*').eq('farmer_id', farmerId).single();
            if (wErr) return res.status(400).json({ success: false, error: wErr.message });
            const newBalance = calcNewBalance(wallet.balance, type, Number(amount));
            const { error: upErr } = await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);
            if (upErr) return res.status(400).json({ success: false, error: upErr.message });
            const { data: txn, error: tErr } = await supabase.from('wallet_transactions').insert({ wallet_id: wallet.id, type, amount, balance_after: newBalance, description: description || null }).select().single();
            if (tErr) return res.status(400).json({ success: false, error: tErr.message });
            return res.status(200).json({ success: true, data: { balance: newBalance, transaction: txn } });
        }

        return res.status(405).json({ success: false, error: 'Method not allowed' });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
}

function calcNewBalance(current: number, type: string, amount: number) {
    if (type === 'deposit' || type === 'payment_in') return current + amount;
    if (type === 'withdrawal' || type === 'payment_out') return Math.max(0, current - amount);
    return current;
}


