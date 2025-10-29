import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminClient } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const supabase = getAdminClient();

        if (req.method === 'GET') {
            const id = (req.query?.id as string) || undefined;
            const withProfile = (req.query?.withProfile as string) === 'true';
            if (id) {
                const { data: farmer, error } = await supabase.from('farmers').select('*').eq('id', id).single();
                if (error) return res.status(400).json({ success: false, error: error.message });
                if (!withProfile) return res.status(200).json({ success: true, data: farmer });
                const { data: profile } = await supabase.from('farmer_profiles').select('*').eq('farmer_id', id).single();
                return res.status(200).json({ success: true, data: { farmer, profile } });
            }
            const { data, error } = await supabase.from('farmers').select('*').order('created_at', { ascending: false }).limit(100);
            if (error) return res.status(400).json({ success: false, error: error.message });
            return res.status(200).json({ success: true, data });
        }

        if (req.method === 'POST') {
            const { name, phone, location, farmType, email, profile } = req.body || {};
            if (!name || !phone || !location || !farmType) {
                return res.status(400).json({ success: false, error: 'Missing required fields: name, phone, location, farmType' });
            }
            const { data: farmer, error } = await supabase
                .from('farmers')
                .insert({ name, phone, location, farm_type: farmType, email: email || null })
                .select()
                .single();
            if (error) return res.status(400).json({ success: false, error: error.message });
            if (profile) {
                await supabase.from('farmer_profiles').insert({ farmer_id: farmer.id, ...normalizeProfile(profile) });
            }
            return res.status(201).json({ success: true, data: farmer });
        }

        if (req.method === 'PUT') {
            const { id, ...updates } = req.body || {};
            if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
            const allowed: any = {};
            if (updates.name !== undefined) allowed.name = updates.name;
            if (updates.phone !== undefined) allowed.phone = updates.phone;
            if (updates.location !== undefined) allowed.location = updates.location;
            if (updates.farmType !== undefined) allowed.farm_type = updates.farmType;
            if (updates.email !== undefined) allowed.email = updates.email;
            const { data, error } = await supabase.from('farmers').update(allowed).eq('id', id).select().single();
            if (error) return res.status(400).json({ success: false, error: error.message });
            return res.status(200).json({ success: true, data });
        }

        if (req.method === 'DELETE') {
            const { id } = req.body || {};
            if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
            const { error } = await supabase.from('farmers').delete().eq('id', id);
            if (error) return res.status(400).json({ success: false, error: error.message });
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ success: false, error: 'Method not allowed' });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
}

function normalizeProfile(profile: any) {
    return {
        production_profile: profile.production_profile ?? {},
        financial_background: profile.financial_background ?? {},
        behavioral_background: profile.behavioral_background ?? {},
        risk_score: profile.risk_score ?? 0,
        risk_category: profile.risk_category ?? null,
        phone_number: profile.phone_number ?? null
    };
}


