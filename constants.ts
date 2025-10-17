import { CropType, SoilType, FertilizerType, WaterSource } from './types';

export const CROP_TYPES: CropType[] = Object.values(CropType);
export const SOIL_TYPES: SoilType[] = Object.values(SoilType);
export const FERTILIZER_TYPES: FertilizerType[] = Object.values(FertilizerType);
export const WATER_SOURCES: WaterSource[] = Object.values(WaterSource);

export const FERTILIZER_DESCRIPTIONS: Record<FertilizerType, string> = {
  [FertilizerType['Nitrogen-based']]: 'Promotes vigorous leaf and stem growth. Essential for overall plant health.',
  [FertilizerType['Phosphorus-based']]: 'Crucial for root development, flower and seed production, and energy transfer.',
  [FertilizerType['Potassium-based']]: 'Improves overall plant hardiness, disease resistance, and water regulation.',
  [FertilizerType.Organic]: 'Improves soil structure and provides a slow release of a wide range of nutrients.',
  [FertilizerType.None]: 'No artificial or supplementary nutrients are being added to the soil.'
};