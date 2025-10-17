

import { GoogleGenAI, Type } from "@google/genai";
import type { PredictionFormData, PredictionResult, CropInfo } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const predictionSchema = {
    type: Type.OBJECT,
    properties: {
        predictedYield: { type: Type.NUMBER, description: "Predicted yield in tons per hectare." },
        yieldUnit: { type: Type.STRING, description: "The unit for the predicted yield, e.g., 'tons/hectare'." },
        confidenceScore: { type: Type.NUMBER, description: "A score from 0.0 to 1.0 indicating model confidence." },
        summary: { type: Type.STRING, description: "A brief summary of the prediction and key factors." },
        weatherImpactAnalysis: { type: Type.STRING, description: "Analysis of how weather conditions impact the yield." },
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "Title of the recommendation." },
                    description: { type: Type.STRING, description: "Detailed description of the recommendation." },
                    impact: { type: Type.STRING, description: "Potential impact (High, Medium, Low)." },
                    potentialYieldIncrease: { type: Type.NUMBER, description: "Estimated percentage increase in yield if recommendation is followed." }
                },
                required: ["title", "description", "impact"]
            }
        },
        riskFactors: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    risk: { type: Type.STRING, description: "Description of the potential risk." },
                    severity: { type: Type.STRING, description: "Severity of the risk (High, Medium, or Low)." }
                },
                required: ["risk", "severity"]
            }
        }
    },
    required: ["predictedYield", "yieldUnit", "confidenceScore", "summary", "weatherImpactAnalysis", "recommendations", "riskFactors"]
};

const cropInfoSchema = {
    type: Type.OBJECT,
    properties: {
        cropName: { type: Type.STRING },
        description: { type: Type.STRING },
        idealConditions: {
            type: Type.OBJECT,
            properties: {
                soilType: { type: Type.ARRAY, items: { type: Type.STRING } },
                temperatureRange: { type: Type.STRING },
                annualRainfall: { type: Type.STRING }
            },
            required: ["soilType", "temperatureRange", "annualRainfall"]
        },
        commonPests: { type: Type.ARRAY, items: { type: Type.STRING } },
        growingCycle: { type: Type.STRING }
    },
    required: ["cropName", "description", "idealConditions", "commonPests", "growingCycle"]
};


const generatePrompt = (data: PredictionFormData): string => {
    const pesticideGuidance = data.pesticideUsage
        ? "Pesticide Usage is 'Yes'. This is a critical protective measure that actively prevents crop loss. You MUST model a higher yield potential (e.g., a 5-15% increase over the baseline) due to effective pest control. Risks from common pests should be considered minimal."
        : "Pesticide Usage is 'No'. This exposes the crop to significant risk. You MUST factor in a notable yield reduction (e.g., a 5-15% decrease from the baseline) due to unmitigated pest damage. You MUST also list a risk factor with the risk 'High risk of pest infestation' and severity 'High'.";
        
    return `
      Analyze the following agricultural data to predict crop yield and provide recommendations.
      The output must be a JSON object matching the provided schema.

      **Critical Interpretation Guidance:**
      - **Pesticide Usage**: ${pesticideGuidance}
      - For riskFactors, provide a 'risk' description and a 'severity' level ('High', 'Medium', 'Low') for each identified risk.

      Farm Data:
      - Crop Type: ${data.cropType}
      - Field Shape (GeoJSON): ${data.fieldShape || 'Not provided'}
      - Soil Type: ${data.soilType}
      - Annual Rainfall (mm): ${data.rainfall}
      - Average Temperature (°C): ${data.temperature}
      - Pesticide Usage: ${data.pesticideUsage ? 'Yes' : 'No'}
      - Fertilizer Type: ${data.fertilizerType}
      - Area (hectares): ${data.area}

      Based on this data, provide a detailed analysis including predicted yield, risk factors, and actionable recommendations.
      The confidence score should reflect the quality and completeness of the input data.
      For example, for Wheat in Loamy soil with 450mm rainfall and 22°C, you might predict around 2.8 tons/hectare.
    `;
};

export const predictYield = async (formData: PredictionFormData): Promise<PredictionResult> => {
    try {
        if (formData.area <= 0) {
            throw new Error("Please provide a field area. You can enter it manually or draw the field on the map to calculate it.");
        }
        const prompt = generatePrompt(formData);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: predictionSchema,
            },
        });

        const jsonString = response.text.trim();
        // Add robust parsing with validation
        const parsedResult = JSON.parse(jsonString);
        
        // Basic validation
        if (!parsedResult.predictedYield || !parsedResult.summary) {
            throw new Error("Invalid JSON schema received from API.");
        }

        return parsedResult as PredictionResult;

    } catch (error) {
        console.error("Error calling Gemini API for yield prediction:", error);
        if (error instanceof Error && error.message.includes("Please provide a field area")) {
            throw error;
        }
        throw new Error("Failed to get prediction from AgriYield-AI. Please check your inputs and API key.");
    }
};

export const getCropInfo = async (cropName: string): Promise<CropInfo> => {
    try {
        const prompt = `Provide detailed information about the crop: ${cropName}. The output must be a JSON object matching the provided schema. Include ideal growing conditions, common pests, and the typical growing cycle duration.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: cropInfoSchema,
            },
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as CropInfo;
        
    } catch (error) {
        console.error("Error calling Gemini API for crop information:", error);
        throw new Error("Failed to get crop information from AgriYield-AI.");
    }
};