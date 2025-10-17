

import { GoogleGenAI, Type } from "@google/genai";
import type { PredictionFormData, PredictionResult, CropInfo } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const predictionSchema = {
    type: Type.OBJECT,
    properties: {
        predictedYieldWithPesticides: { type: Type.NUMBER, description: "Predicted yield in tons per hectare assuming effective pesticide usage." },
        predictedYieldWithoutPesticides: { type: Type.NUMBER, description: "Predicted yield in tons per hectare assuming NO pesticide usage." },
        yieldUnit: { type: Type.STRING, description: "The unit for the predicted yield, e.g., 'tons/hectare'." },
        confidenceScore: { type: Type.NUMBER, description: "A score from 0.0 to 1.0 indicating model confidence." },
        summary: { type: Type.STRING, description: "A brief summary comparing the two prediction scenarios and key factors." },
        weatherImpactAnalysis: { type: Type.STRING, description: "Analysis of how weather conditions impact the yield." },
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "Title of the recommendation." },
                    description: { type: Type.STRING, description: "Detailed description of the recommendation." },
                    impact: { type: Type.STRING, description: "Potential impact (High, Medium, Low)." },
                    potentialYieldIncrease: { type: Type.NUMBER, description: "Estimated percentage increase in yield if recommendation is followed." },
                    fertilizerType: { type: Type.STRING, description: "If the recommendation is about fertilizer, specify the recommended type (e.g., 'Nitrogen-based')." }
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
    required: ["predictedYieldWithPesticides", "predictedYieldWithoutPesticides", "yieldUnit", "confidenceScore", "summary", "weatherImpactAnalysis", "recommendations", "riskFactors"]
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
    const dualPredictionGuidance = `
You MUST provide two separate yield predictions:
1. 'predictedYieldWithPesticides': Model a higher yield potential assuming effective pesticide use, which prevents crop loss.
2. 'predictedYieldWithoutPesticides': Model a lower yield potential, factoring in a notable yield reduction (e.g., a 5-15% decrease from the 'with pesticides' baseline) due to unmitigated pest damage.
For the 'without pesticides' scenario, you MUST also include a risk factor: { "risk": "High risk of pest infestation", "severity": "High" }.
The summary should clearly explain and compare both yield scenarios.
`;

    let waterSourceGuidance = '';
    switch (data.waterSource) {
        case 'Rainfed':
            waterSourceGuidance = "The crop is rainfed. This makes it highly dependent on natural rainfall. If rainfall is low or inconsistent, this MUST be considered a HIGH risk factor for yield reduction.";
            break;
        case 'Canal Irrigation':
        case 'Well Irrigation':
        case 'River/Lake':
        case 'Drip Irrigation':
            waterSourceGuidance = `The crop uses a reliable irrigation method (${data.waterSource}). This significantly mitigates risks associated with low rainfall and should be considered a positive factor for yield stability and potential.`;
            break;
    }

    return `
      Analyze the following agricultural data to predict crop yield and provide recommendations.
      The output must be a JSON object matching the provided schema.

      **Critical Interpretation Guidance:**
      - **Dual Prediction Scenarios**: ${dualPredictionGuidance}
      - **Water Source**: ${waterSourceGuidance}
      - For riskFactors, provide a 'risk' description and a 'severity' level ('High', 'Medium', 'Low') for each identified risk.
      - For recommendations related to fertilization, you MUST suggest a specific 'fertilizerType' from the available options.

      Farm Data:
      - Crop Type: ${data.cropType}
      - Field Shape (GeoJSON): ${data.fieldShape || 'Not provided'}
      - Soil Type: ${data.soilType}
      - Water Source: ${data.waterSource}
      - Annual Rainfall (mm): ${data.rainfall}
      - Average Temperature (°C): ${data.temperature}
      - Fertilizer Type: ${data.fertilizerType}
      - Area (hectares): ${data.area}

      Based on this data, provide a detailed analysis including predicted yield, risk factors, and actionable recommendations.
      The confidence score should reflect the quality and completeness of the input data.
      For example, for Wheat in Loamy soil with 450mm rainfall and 22°C, you might predict around 2.8 tons/hectare with pesticides and 2.5 without.
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
        if (!parsedResult.predictedYieldWithPesticides || !parsedResult.summary) {
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