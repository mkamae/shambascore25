import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

export interface AuthUser {
    id: string;
    email: string;
    phone?: string;
    name?: string;
}

/**
 * Sign up a new farmer
 */
export async function signUp(email: string, password: string, phone?: string, name?: string) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    phone,
                    name,
                    role: 'farmer'
                }
            }
        });

        if (error) throw error;
        
        return {
            user: data.user,
            session: data.session
        };
    } catch (error) {
        console.error('Sign up error:', error);
        throw error;
    }
}

/**
 * Sign in an existing farmer
 */
export async function signIn(email: string, password: string) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        
        return {
            user: data.user,
            session: data.session
        };
    } catch (error) {
        console.error('Sign in error:', error);
        throw error;
    }
}

/**
 * Sign out current user
 */
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
}

/**
 * Get current user session
 */
export async function getCurrentUser(): Promise<User | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

/**
 * Get current session
 */
export async function getSession() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    } catch (error) {
        console.error('Get session error:', error);
        return null;
    }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null);
    });
}

