import { GoogleGenAI, Type } from "@google/genai";
import { Farmer, AIInsights, CreditProfile } from '../types';

// The API key is loaded from environment variables (Vite uses import.meta.env)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error('Missing Gemini API key. Please set VITE_GEMINI_API_KEY in your .env.local file');
}

const ai = new GoogleGenAI({ apiKey });

const insightsSchema = {
    type: Type.OBJECT,
    properties: {
        yieldAdvice: {
            type: Type.STRING,
            description: "Personalized advice for the farmer to improve their crop yield. Provide 2-3 actionable, concise bullet points."
        },
        riskAdvice: {
            type: Type.STRING,
            description: "Analysis of potential financial and operational risks based on the farmer's data. Provide 2-3 actionable, concise bullet points for mitigation."
        },
        loanAdvice: {
            type: Type.STRING,
            description: "Suggestions for the farmer to improve their loan eligibility and credit profile. Provide 2-3 actionable, concise bullet points."
        }
    },
    required: ["yieldAdvice", "riskAdvice", "loanAdvice"]
};

const creditScoreSchema = {
    type: Type.OBJECT,
    properties: {
        loanEligibility: {
            type: Type.NUMBER,
            description: "A revised loan eligibility amount in Kenyan Shillings (KES) based on the M-Pesa statement analysis."
        },
        repaymentAbilityScore: {
            type: Type.NUMBER,
            description: "A score from 0 to 100 representing the farmer's ability to repay the loan."
        },
        riskScore: {
            type: Type.NUMBER,
            description: "A score from 0 to 100 representing the credit risk. A lower score is better."
        },
        summary: {
            type: Type.STRING,
            description: "A concise, 1-2 sentence summary of the credit analysis, highlighting key positive or negative factors."
        }
    },
    required: ["loanEligibility", "repaymentAbilityScore", "riskScore", "summary"]
};

export const getFarmInsights = async (farmer: Farmer): Promise<AIInsights> => {
    const prompt = `
        Analyze the following farmer's data and provide personalized, actionable insights.
        The farmer is from ${farmer.location}.

        Farmer Profile:
        - Name: ${farmer.name}
        - Farm Type: ${farmer.farmType}

        Farm Data:
        - Crop: ${farmer.farmData.cropType}
        - Acreage: ${farmer.farmData.acreage} acres
        - Estimated Yield: ${farmer.farmData.yieldEstimate} tons/acre
        - Annual Expenses: KES ${farmer.farmData.annualExpenses}
        - Rainfall: ${farmer.farmData.rainfall}
        - Soil Health: ${farmer.farmData.soilHealth}

        Financial Profile:
        - Current Loan Eligibility: KES ${farmer.creditProfile.loanEligibility}
        - Repayment Score: ${farmer.creditProfile.repaymentAbilityScore}%
        - Risk Score: ${farmer.creditProfile.riskScore} (lower is better)
        - M-Pesa Statement Uploaded: ${farmer.mpesaStatement ? 'Yes' : 'No'}

        Based on this data, generate concise and practical advice for the farmer in three key areas:
        1.  **Improving Yield:** What can they do to increase their farm's productivity?
        2.  **Managing Risks:** What are the key financial or environmental risks, and how can they be mitigated?
        3.  **Boosting Loan Eligibility:** What steps can they take to improve their credit profile and access more capital?

        Format the response as a JSON object with keys "yieldAdvice", "riskAdvice", and "loanAdvice". The advice in each section should be a string containing a few bullet points.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Using gemini-2.5-flash for basic text tasks
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: insightsSchema,
                temperature: 0.5,
            },
        });

        const text = response.text;
        const insights = JSON.parse(text);

        if (insights.yieldAdvice && insights.riskAdvice && insights.loanAdvice) {
            return insights as AIInsights;
        } else {
            console.error("Received malformed insights from AI:", insights);
            throw new Error("AI response was not in the expected format.");
        }
    } catch (error) {
        console.error("Error fetching insights from Gemini API:", error);
        throw new Error("Failed to generate AI insights. Please check your connection or API key and try again.");
    }
};

export const scoreMpesaStatement = async (statementContent: string): Promise<CreditProfile> => {
    const prompt = `
       Act as a credit analyst for a Kenyan microfinance institution specializing in agricultural loans.
       Analyze the following M-Pesa statement data to assess the creditworthiness of a smallholder farmer.

       M-Pesa Statement Data:
       ---
       ${statementContent}
       ---

       Your task is to:
       1.  Identify patterns in income (e.g., from M-Shwari, business payments).
       2.  Identify patterns in expenses (e.g., payments to suppliers, utility bills like KPLC).
       3.  Note any existing loan repayments (e.g., to Fuliza, M-Shwari, Tala).
       4.  Identify any high-risk behavior like frequent transactions with betting companies (e.g., SportPesa).
       5.  Based on the overall financial health, calculate a new credit profile for the farmer.

       Provide the output as a JSON object with the following keys: "loanEligibility" (KES), "repaymentAbilityScore" (0-100), "riskScore" (0-100, lower is better), and "summary" (a brief analysis).
   `;

   try {
       const response = await ai.models.generateContent({
           model: "gemini-2.5-flash",
           contents: prompt,
           config: {
               responseMimeType: "application/json",
               responseSchema: creditScoreSchema,
               temperature: 0.2, // Lower temperature for more deterministic financial analysis
           },
       });

       const text = response.text;
       const profile = JSON.parse(text);

       if (profile.loanEligibility !== undefined && profile.repaymentAbilityScore !== undefined && profile.riskScore !== undefined && profile.summary) {
           return profile as CreditProfile;
       } else {
           console.error("Received malformed credit profile from AI:", profile);
           throw new Error("AI response was not in the expected format.");
       }
   } catch (error) {
       console.error("Error fetching credit score from Gemini API:", error);
       throw new Error("Failed to generate AI credit score. Please check your connection or API key and try again.");
   }
};