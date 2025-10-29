/**
 * Chatbot Service
 * 
 * Handles AI chat functionality for farmer advisory
 * - Save chat messages to Supabase
 * - Generate AI responses using Gemini
 * - Context-aware advice based on farmer profile
 */

/**
 * Chatbot Service - Frontend Client
 * 
 * This service now calls secure backend API routes instead of using API keys directly.
 * The API key is stored server-side for security.
 */

import { supabase } from './supabaseClient';
import { Farmer } from '../types';
import { fetchFarmerProfile } from './farmerProfileService';

export interface ChatMessage {
    id: string;
    farmerId: string;
    message: string;
    response: string;
    topic?: string;
    sentiment?: string;
    createdAt: string;
}

/**
 * Generate AI response via secure backend API
 */
async function generateAIResponse(
    question: string,
    farmer: Farmer,
    farmerProfile: any
): Promise<string> {
    try {
        const response = await fetch('/api/gemini/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question,
                farmer,
                farmerProfile
            })
        });

        if (!response.ok) {
            // Provide helpful message for 404 in development
            if (response.status === 404 && import.meta.env.DEV) {
                throw new Error('API route not found. In local development, use `npm run dev:api` or `vercel dev` to enable API routes. Regular `npm run dev` does not support API routes.');
            }
            
            const error = await response.json().catch(() => ({ error: 'Failed to get response' }));
            throw new Error(error.error || 'Failed to generate AI response');
        }

        const result = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.error || 'Invalid response from AI service');
        }

        return result.data.response;
    } catch (error: any) {
        console.error('Error generating AI response:', error);
        throw new Error(error.message || 'Failed to generate AI response. Please try again.');
    }
}

/**
 * Build context prompt from farmer profile data
 */
function buildContextPrompt(farmer: Farmer, farmerProfile: any): string {
    let context = `Current Farmer Profile:\n`;
    
    // Basic farmer info
    context += `- Name: ${farmer.name}\n`;
    context += `- Location: ${farmer.location}\n`;
    context += `- Farm Type: ${farmer.farmType}\n\n`;

    // Farm data
    if (farmer.farmData) {
        context += `Farm Production:\n`;
        context += `- Crop: ${farmer.farmData.cropType}\n`;
        context += `- Acreage: ${farmer.farmData.acreage} acres\n`;
        context += `- Yield Estimate: ${farmer.farmData.yieldEstimate} tons/acre\n`;
        context += `- Annual Expenses: KES ${farmer.farmData.annualExpenses.toLocaleString()}\n`;
        context += `- Rainfall Pattern: ${farmer.farmData.rainfall}\n`;
        context += `- Soil Health: ${farmer.farmData.soilHealth}\n\n`;
    }

    // Financial data
    if (farmer.creditProfile) {
        context += `Financial Status:\n`;
        context += `- Loan Eligibility: KES ${farmer.creditProfile.loanEligibility.toLocaleString()}\n`;
        context += `- Repayment Ability: ${farmer.creditProfile.repaymentAbilityScore}%\n`;
        context += `- Risk Score: ${farmer.creditProfile.riskScore} (lower is better)\n\n`;
    }

    // Risk profile if available
    if (farmerProfile) {
        context += `Risk Assessment:\n`;
        context += `- Risk Category: ${farmerProfile.riskCategory || 'Not assessed'}\n`;
        context += `- Risk Score: ${(farmerProfile.riskScore * 100).toFixed(1)}%\n\n`;

        // Production profile details
        if (farmerProfile.productionProfile) {
            const prod = farmerProfile.productionProfile;
            context += `Detailed Production:\n`;
            context += `- Crop Types: ${prod.cropTypes?.join(', ') || 'Not specified'}\n`;
            context += `- Total Acreage: ${prod.acreage} acres\n`;
            if (prod.yieldHistory && prod.yieldHistory.length > 0) {
                const latestYield = prod.yieldHistory[prod.yieldHistory.length - 1];
                context += `- Latest Yield: ${latestYield.yield} ${latestYield.crop || 'crop'} (${latestYield.year})\n`;
            }
            context += `\n`;
        }

        // Financial background
        if (farmerProfile.financialBackground) {
            const fin = farmerProfile.financialBackground;
            context += `Financial Background:\n`;
            context += `- Monthly Income: KES ${fin.monthlyIncome?.toLocaleString() || '0'}\n`;
            context += `- Savings Behavior: ${fin.savingsBehavior || 'Not specified'}\n`;
            context += `- Repayment Record: ${fin.repaymentRecord || 'Not specified'}\n`;
            context += `- M-Pesa Usage: ${fin.mpesaUsage || 'Not specified'}\n\n`;
        }
    }

    return context;
}

/**
 * Save chat message to database
 */
export async function saveChatMessage(
    farmerId: string,
    message: string,
    response: string,
    topic?: string
): Promise<ChatMessage | null> {
    try {
        const { data, error } = await supabase
            .from('farmer_chats')
            .insert({
                farmer_id: farmerId,
                message,
                response,
                topic,
                sentiment: 'positive' // Could be enhanced with sentiment analysis
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving chat message:', error);
            return null;
        }

        return {
            id: data.id,
            farmerId: data.farmer_id,
            message: data.message,
            response: data.response,
            topic: data.topic,
            sentiment: data.sentiment,
            createdAt: data.created_at
        };
    } catch (error) {
        console.error('Error in saveChatMessage:', error);
        return null;
    }
}

/**
 * Get chat history for a farmer
 */
export async function getChatHistory(
    farmerId: string,
    limit: number = 50
): Promise<ChatMessage[]> {
    try {
        const { data, error } = await supabase
            .from('farmer_chats')
            .select('*')
            .eq('farmer_id', farmerId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching chat history:', error);
            return [];
        }

        return (data || []).map(msg => ({
            id: msg.id,
            farmerId: msg.farmer_id,
            message: msg.message,
            response: msg.response,
            topic: msg.topic,
            sentiment: msg.sentiment,
            createdAt: msg.created_at
        }));
    } catch (error) {
        console.error('Error in getChatHistory:', error);
        return [];
    }
}

/**
 * Send message to AI and get response
 */
export async function sendMessage(
    farmer: Farmer,
    message: string
): Promise<string> {
    try {
        // Fetch farmer profile for context
        let farmerProfile = null;
        try {
            farmerProfile = await fetchFarmerProfile(farmer.id);
        } catch (error) {
            console.warn('Could not fetch farmer profile, using basic data:', error);
        }

        // Generate AI response
        const response = await generateAIResponse(message, farmer, farmerProfile);

        // Save to database (async, don't wait)
        saveChatMessage(farmer.id, message, response).catch(err => {
            console.error('Failed to save chat message:', err);
        });

        return response;
    } catch (error: any) {
        console.error('Error in sendMessage:', error);
        throw new Error(error.message || 'Failed to send message. Please try again.');
    }
}

