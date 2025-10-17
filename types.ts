export enum CropType {
  Wheat = 'Wheat',
  Corn = 'Corn',
  Rice = 'Rice',
  Soybean = 'Soybean',
  Cotton = 'Cotton',
  Sugarcane = 'Sugarcane',
  Potatoes = 'Potatoes',
}

export enum SoilType {
  Loamy = 'Loamy',
  Sandy = 'Sandy',
  Clay = 'Clay',
  Silty = 'Silty',
  Peaty = 'Peaty',
}

export enum FertilizerType {
  'Nitrogen-based' = 'Nitrogen-based',
  'Phosphorus-based' = 'Phosphorus-based',
  'Potassium-based' = 'Potassium-based',
  'Organic' = 'Organic',
  'None' = 'None',
}

export enum WaterSource {
  Rainfed = 'Rainfed',
  CanalIrrigation = 'Canal Irrigation',
  WellIrrigation = 'Well Irrigation',
  RiverLake = 'River/Lake',
  DripIrrigation = 'Drip Irrigation',
}

export interface PredictionFormData {
  cropType: CropType;
  fieldShape: string; // Will store GeoJSON string of the polygon
  soilType: SoilType;
  rainfall: number;
  temperature: number;
  fertilizerType: FertilizerType;
  area: number; // This will now be calculated from the map
  waterSource: WaterSource;
}

export interface Recommendation {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  potentialYieldIncrease?: number;
  fertilizerType?: FertilizerType;
}

export interface RiskFactor {
  risk: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface WeatherImpact {
  overallImpact: 'Positive' | 'Neutral' | 'Negative';
  temperatureEffect: string;
  rainfallEffect: string;
  keyWeatherRisks: string[];
}


export interface PredictionResult {
  predictedYieldWithPesticides: number;
  predictedYieldWithoutPesticides: number;
  yieldUnit: string;
  confidenceScore: number;
  summary: string;
  weatherImpactAnalysis: WeatherImpact;
  recommendations: Recommendation[];
  riskFactors: RiskFactor[];
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  formData: PredictionFormData;
  result: PredictionResult;
}

export interface CropInfo {
  cropName: string;
  description: string;
  idealConditions: {
    soilType: string[];
    temperatureRange: string;
    annualRainfall: string;
  };
  commonPests: string[];
  growingCycle: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export type Page = 'predict' | 'history' | 'explorer' | 'about';