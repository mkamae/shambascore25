/**
 * Chatbot Service
 * 
 * Handles AI chat functionality for farmer advisory
 * - Save chat messages to Supabase
 * - Generate AI responses using Gemini
 * - Context-aware advice based on farmer profile
 */

import { supabase } from './supabaseClient';
import { Farmer } from '../types';
import { fetchFarmerProfile } from './farmerProfileService';
import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
    id: string;
    farmerId: string;
    message: string;
    response: string;
    topic?: string;
    sentiment?: string;
    createdAt: string;
}

// Lazy initialization for Gemini client (reusing pattern from geminiService)
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
    if (aiInstance) {
        return aiInstance;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'undefined' || apiKey === '' || apiKey === undefined) {
        console.error('❌ GEMINI API KEY MISSING!');
        throw new Error('Gemini API key is missing. Please check your environment variables.');
    }

    try {
        aiInstance = new GoogleGenAI({ apiKey });
        console.log('✅ Chatbot Gemini AI initialized successfully');
        return aiInstance;
    } catch (error) {
        console.error('❌ Failed to initialize Gemini AI:', error);
        throw new Error('Failed to initialize AI client.');
    }
}

/**
 * Generate AI response based on farmer's question and profile
 */
async function generateAIResponse(
    question: string,
    farmer: Farmer,
    farmerProfile: any
): Promise<string> {
    const ai = getGeminiClient();

    // Build context from farmer profile
    const contextPrompt = buildContextPrompt(farmer, farmerProfile);

    const systemPrompt = `You are FarmAdvisorAI, an expert agricultural and financial assistant for smallholder farmers in Kenya. 

Your role:
- Provide simple, actionable guidance based on production data, risk level, and local conditions
- Keep responses under 100 words and conversational
- Always encourage sustainable farming practices
- Be supportive and encouraging, especially for high-risk farmers
- Reference specific data from the farmer's profile when relevant

${contextPrompt}

Remember:
- If risk is low → encourage growth and sustainable investments
- If risk is high → suggest saving tips, input optimization, or joining insurance
- If rainfall is low → suggest drought-resistant crops or irrigation methods
- Always provide practical, actionable advice
- Use simple language that farmers can understand
- Be empathetic and understanding`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${systemPrompt}\n\nFarmer's Question: ${question}\n\nPlease provide helpful advice:`,
            config: {
                temperature: 0.7,
                maxOutputTokens: 300,
            },
        });

        return response.text || 'I apologize, but I couldn\'t generate a response. Please try again.';
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw new Error('Failed to generate AI response. Please check your API key and try again.');
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

