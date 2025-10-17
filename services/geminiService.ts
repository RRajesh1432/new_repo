import { GoogleGenAI, Type } from "@google/genai";
import type { PredictionFormData, PredictionResult, CropInfo, ChatMessage } from '../types';

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
        weatherImpactAnalysis: {
            type: Type.OBJECT,
            properties: {
                overallImpact: { type: Type.STRING, description: "Overall impact of weather: 'Positive', 'Neutral', or 'Negative'." },
                temperatureEffect: { type: Type.STRING, description: "Detailed analysis of the temperature's effect on the crop." },
                rainfallEffect: { type: Type.STRING, description: "Detailed analysis of the rainfall's effect on the crop." },
                keyWeatherRisks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of specific, key weather-related risks (e.g., 'Drought risk'). Can be empty if none." }
            },
            required: ["overallImpact", "temperatureEffect", "rainfallEffect", "keyWeatherRisks"]
        },
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

const chatbotResponseSchema = {
    type: Type.OBJECT,
    properties: {
        response: { type: Type.STRING, description: "The text response for the user." },
        action: { type: Type.STRING, description: "An optional action to perform, e.g., 'navigate'.", nullable: true },
        page: { type: Type.STRING, description: "The page to navigate to, e.g., 'history'.", nullable: true }
    },
    required: ["response"]
};


const generatePrompt = (data: PredictionFormData, language: string): string => {
    const languageInstruction = `
      IMPORTANT: All text in the response (summary, weatherImpactAnalysis properties, recommendation titles and descriptions, risk descriptions) MUST be in the following language code: ${language}.
    `;

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

    const weatherAnalysisGuidance = `
      - **Weather Impact Analysis**: You MUST provide a structured analysis of the weather.
        - Provide a detailed 'temperatureEffect' explaining how the average temperature of ${data.temperature}°C impacts ${data.cropType}.
        - Provide a detailed 'rainfallEffect' explaining how the annual rainfall of ${data.rainfall}mm impacts ${data.cropType}.
        - List specific 'keyWeatherRisks' such as 'Drought risk' or 'Heat stress'. If conditions are ideal, this can be an empty array.
        - Determine the 'overallImpact' as 'Positive', 'Neutral', or 'Negative' based on the combined effects of temperature and rainfall for the specified crop.
    `;


    return `
      Analyze the following agricultural data to predict crop yield and provide recommendations.
      The output must be a JSON object matching the provided schema.
      ${languageInstruction}

      **Critical Interpretation Guidance:**
      - **Dual Prediction Scenarios**: ${dualPredictionGuidance}
      - **Water Source**: ${waterSourceGuidance}
      - **Weather Analysis**: ${weatherAnalysisGuidance}
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

export const predictYield = async (formData: PredictionFormData, language: string): Promise<PredictionResult> => {
    try {
        if (formData.area <= 0) {
            throw new Error("Please provide a field area. You can enter it manually or draw the field on the map to calculate it.");
        }
        const prompt = generatePrompt(formData, language);
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
        if (!parsedResult.predictedYieldWithPesticides || !parsedResult.summary || !parsedResult.weatherImpactAnalysis) {
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

export const getCropInfo = async (cropName: string, language: string): Promise<CropInfo> => {
    try {
        const prompt = `Provide detailed information about the crop: ${cropName}. The output must be a JSON object matching the provided schema. All descriptive text MUST be in the following language code: ${language}. Include ideal growing conditions, common pests, and the typical growing cycle duration.`;

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

export const getChatbotResponse = async (history: ChatMessage[], latestMessage: string, language: string): Promise<{ response: string; page?: 'predict' | 'history' | 'explorer' | 'about'}> => {
    try {
        const systemInstruction = `
            You are AgriBot, a friendly and helpful AI assistant for the AgriYield-AI website. Your purpose is to greet users, answer their questions about the application, help them navigate, and provide general farming advice based on the knowledge base below.
            Your responses MUST be in the language with this code: ${language}.
            
            **Core Capabilities:**
            1.  **Answering FAQs & Providing Advice:** Use the detailed knowledge base below to answer user questions.
            2.  **Navigation:** If a user asks to go to a specific page (like 'history', 'prediction', 'crop explorer', or 'about'), you MUST respond with a JSON object where the 'action' is 'navigate' and the 'page' is the target. The 'response' field should be a confirmation like "Taking you to the history page...".
                - Valid pages are: 'predict', 'history', 'explorer', 'about'.
            3.  **General Conversation:** For any other question or greeting, provide a concise and helpful text response. The 'action' and 'page' fields should be null.

            Always keep your answers brief and to the point.

            ---
            **KNOWLEDGE BASE**

            **About the App:**
            - **What it is:** AgriYield-AI is a web app that uses Google's Gemini AI to predict crop yields.
            - **How to use:** Users input farm data (crop, soil, weather) and can draw their field on a map. The app then gives a yield prediction, risks, and recommendations.
            - **Supported Crops:** Wheat, Corn, Rice, Soybean, Cotton, Sugarcane, Potatoes.

            **Specific Crop Requirements:**
            - **Wheat:** Prefers loamy soil, temperatures between 15-25°C, and annual rainfall of 300-900mm.
            - **Corn (Maize):** Thrives in well-drained loamy soil, temperatures of 20-30°C, and rainfall of 500-1000mm. Very sensitive to frost.
            - **Rice:** Needs clayey or loamy soil that can hold water. Ideal temperatures are 20-37°C. Requires high rainfall or irrigation (1000-2500mm).

            **Pest Identification:**
            - **Aphids:** Small, pear-shaped insects, often green, black, or yellow. They suck sap from leaves, causing yellowing, distorted growth, and a sticky "honeydew" substance.
            - **Corn Borer:** A caterpillar that tunnels into corn stalks and ears, causing the plant to weaken and break, and damaging kernels. Look for small holes in the stalk and sawdust-like frass.
            - **Spider Mites:** Tiny, spider-like pests that are hard to see. They cause fine webbing on leaves and tiny yellow or white spots. Leaves may turn bronze and die.

            **Troubleshooting Common Farming Issues:**
            - **Yellowing Leaves (Chlorosis):**
                - **Cause:** Often a nutrient deficiency, especially Nitrogen (if older, lower leaves are yellow) or Iron (if new, upper leaves are yellow). Can also be caused by overwatering (root rot).
                - **Solution:** Check soil moisture. If soil is not waterlogged, consider applying a balanced fertilizer or a specific nutrient supplement.
            - **Stunted Growth:**
                - **Cause:** Could be poor soil compaction, lack of nutrients (especially Phosphorus for root development), pest infestation, or incorrect soil pH.
                - **Solution:** Aerate the soil if compacted. Test soil pH and amend if necessary. Ensure balanced fertilization. Inspect for pests.
            - **Wilting Plants:**
                - **Cause:** Usually lack of water. However, it can also be a sign of overwatering, which damages roots and prevents water uptake. Certain diseases can also cause wilting.
                - **Solution:** Check soil moisture deeply. Water thoroughly if dry. If soil is wet, allow it to dry out and check for root rot.
            ---
        `;
        
        const contents = [
            ...history.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            })),
            { role: 'user', parts: [{ text: latestMessage }] }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: chatbotResponseSchema,
            },
        });

        const jsonString = response.text.trim();
        const parsed = JSON.parse(jsonString);
        
        return {
          response: parsed.response,
          page: parsed.page
        };

    } catch (error) {
        console.error("Error calling Gemini API for chatbot response:", error);
        // Fallback response
        return { response: "Sorry, I'm having a little trouble connecting right now. Please try again in a moment." };
    }
};