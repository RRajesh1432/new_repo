import React from 'react';
import type { PredictionFormData } from '../types';
import { CROP_TYPES, SOIL_TYPES, FERTILIZER_TYPES, WATER_SOURCES, FERTILIZER_DESCRIPTIONS } from '../constants';

interface PredictionFormProps {
    formData: PredictionFormData;
    setFormData: React.Dispatch<React.SetStateAction<PredictionFormData>>;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
}

const InputField: React.FC<{label: string; children: React.ReactNode}> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children}
    </div>
);

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
    return (
      <div className="relative flex items-center group">
        {children}
        <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          {text}
        </div>
      </div>
    );
  };

const PredictionForm: React.FC<PredictionFormProps> = ({ formData, setFormData, onSubmit, isLoading }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        // FIX: `e.target` is not a stable reference for type narrowing. Assigning it to a
        // constant (`target`) allows TypeScript to correctly infer the type within the
        // conditional, resolving the error where the `checked` property was not found.
        const target = e.target;
        const { name, value } = target;
        
        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: target.checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: target.type === 'number' ? parseFloat(value) : value }));
        }
    };
    
    return (
        <form onSubmit={onSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField label="Crop Type">
                    <select name="cropType" value={formData.cropType} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm">
                        {CROP_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </InputField>

                <InputField label="Soil Type">
                    <select name="soilType" value={formData.soilType} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm">
                        {SOIL_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </InputField>

                <InputField label="Fertilizer Type">
                    <div className="flex items-center gap-2">
                        <select 
                            name="fertilizerType" 
                            value={formData.fertilizerType} 
                            onChange={handleChange} 
                            className="flex-grow mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm"
                        >
                            {FERTILIZER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <Tooltip text={FERTILIZER_DESCRIPTIONS[formData.fertilizerType]}>
                             <div className="mt-1 flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center cursor-help">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </Tooltip>
                    </div>
                </InputField>

                <InputField label="Source of Water">
                    <select name="waterSource" value={formData.waterSource} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm">
                        {WATER_SOURCES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </InputField>
                
                <InputField label="Average Annual Rainfall (mm)">
                    <input type="number" name="rainfall" value={formData.rainfall} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"/>
                </InputField>

                <InputField label="Average Temperature (°C)">
                    <input type="number" name="temperature" value={formData.temperature} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"/>
                </InputField>

                <InputField label="Area (hectares)">
                    <>
                        <input 
                           type="number" 
                           name="area" 
                           value={formData.area} 
                           onChange={handleChange}
                           required
                           min="0.01"
                           step="0.01"
                           className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                         <p className="mt-1 text-xs text-gray-500">Enter field area or draw it on the map to calculate automatically.</p>
                    </>
                </InputField>
            </div>
            
            <div className="pt-4">
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200">
                    {isLoading ? 'Generating Prediction...' : 'Get Yield Prediction'}
                </button>
            </div>
        </form>
    );
};

export default PredictionForm;