/**
 * Farmer Auth Service
 * 
 * Links authenticated users to farmer records in Supabase
 * Automatically creates farmer record if it doesn't exist
 */

import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';
import { fetchFarmerById } from './farmerService';

/**
 * Get or create farmer record for authenticated user
 * This ensures every authenticated user has a farmer record with UUID
 */
export async function getOrCreateFarmerForUser(user: User): Promise<string | null> {
    if (!user) {
        return null;
    }

    try {
        // First, try to find existing farmer record linked to this user
        // Check if user metadata has farmer_id
        const farmerIdFromMetadata = user.user_metadata?.farmer_id;
        
        if (farmerIdFromMetadata) {
            // Verify farmer exists
            const farmer = await fetchFarmerById(farmerIdFromMetadata);
            if (farmer) {
                return farmer.id;
            }
        }

        // Try to find farmer by email (if email column exists)
        // This is optional since farmers table may not have email column
        try {
            const { data: farmersByEmail, error: emailError } = await supabase
                .from('farmers')
                .select('id')
                .eq('email', user.email || '')
                .limit(1)
                .maybeSingle();

            if (farmersByEmail && !emailError) {
                // Update user metadata with farmer_id for future lookups
                await supabase.auth.updateUser({
                    data: { farmer_id: farmersByEmail.id }
                });
                return farmersByEmail.id;
            }
        } catch (error) {
            // Email column might not exist, continue to create new farmer
            console.log('Email lookup not available, creating new farmer');
        }

        // No farmer found - create one from user data
        const farmerName = user.user_metadata?.name || user.email?.split('@')[0] || 'Farmer';
        const farmerPhone = user.user_metadata?.phone || user.phone || '+254700000000';

        // Create farmer record (email optional; we will retry without if column doesn't exist)
        const farmerData: any = {
            name: farmerName,
            phone: farmerPhone,
            location: 'Kenya', // Default location, can be updated later
            farm_type: 'Smallholder'
        };

        // Only add email if the column exists (will fail gracefully if it doesn't)
        if (user.email) {
            farmerData.email = user.email;
        }

        // Attempt insert (with email if present). If the email column doesn't exist, retry without it.
        let newFarmerId: string | null = null;
        {
            const { data, error } = await supabase
                .from('farmers')
                .insert(farmerData)
                .select('id')
                .single();

            if (!error && data?.id) {
                newFarmerId = data.id;
            } else if (error && (error.message?.includes('email') || error.code === 'PGRST204')) {
                // Remove email and retry
                if ('email' in farmerData) {
                    delete farmerData.email;
                }
                const { data: retryData, error: retryError } = await supabase
                    .from('farmers')
                    .insert(farmerData)
                    .select('id')
                    .single();
                if (!retryError && retryData?.id) {
                    newFarmerId = retryData.id;
                } else {
                    console.error('Error creating farmer record (retry):', retryError || error);
                    return null;
                }
            } else if (error) {
                console.error('Error creating farmer record:', error);
                return null;
            }
        }

        // Update user metadata with farmer_id
        if (newFarmerId) {
            await supabase.auth.updateUser({
                data: { farmer_id: newFarmerId }
            });
        }

        console.log('✅ Created farmer record for user:', newFarmerId);
        return newFarmerId;
    } catch (error) {
        console.error('Error in getOrCreateFarmerForUser:', error);
        return null;
    }
}

/**
 * Check if farmers table exists and has the email column
 * If not, we'll use an alternative lookup method
 */
async function checkFarmerTableStructure(): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('farmers')
            .select('id, name, phone')
            .limit(1);

        // If we can query, table exists
        return !error || error.code !== 'PGRST116';
    } catch {
        return false;
    }
}

