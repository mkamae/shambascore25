/**
 * Gemini Service - Frontend Client
 * 
 * This service now calls secure backend API routes instead of using API keys directly.
 * The API key is stored server-side for security.
 */

import { Farmer, AIInsights, CreditProfile } from '../types';

/**
 * Get AI-powered farm insights from backend API
 */
export const getFarmInsights = async (farmer: Farmer): Promise<AIInsights> => {
    try {
        const response = await fetch('/api/gemini/insights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ farmer })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to fetch insights' }));
            throw new Error(error.error || 'Failed to generate AI insights');
        }

        const result = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.error || 'Invalid response from AI service');
        }

        return result.data as AIInsights;
    } catch (error: any) {
        console.error('Error fetching insights:', error);
        throw new Error(error.message || 'Failed to generate AI insights. Please try again.');
    }
};

/**
 * Score M-Pesa statement for credit analysis from backend API
 */
export const scoreMpesaStatement = async (statementContent: string): Promise<CreditProfile> => {
    try {
        const response = await fetch('/api/gemini/credit-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ statementContent })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Failed to score statement' }));
            throw new Error(error.error || 'Failed to generate credit score');
        }

        const result = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.error || 'Invalid response from AI service');
        }

        return result.data as CreditProfile;
    } catch (error: any) {
        console.error('Error scoring M-Pesa statement:', error);
        throw new Error(error.message || 'Failed to generate credit score. Please try again.');
    }
};
