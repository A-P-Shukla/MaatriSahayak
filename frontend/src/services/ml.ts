import axios from 'axios';

// ML API Configuration
const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'https://maatrisahyak-ml.onrender.com';

// ML API client (no auth required for external ML service)
const mlApiClient = axios.create({
    baseURL: ML_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface MLPredictionInput {
    Age: number;
    Systolic_BP: number;
    Diastolic: number;
    BS: number; // Blood Sugar in mmol/L
    Body_Temp: number; // Fahrenheit
    BMI: number;
    Previous_Complications: number; // 0 or 1
    Preexisting_Diabetes: number; // 0 or 1
    Gestational_Diabetes: number; // 0 or 1
    Mental_Health: number; // 0 or 1
    Heart_Rate: number;
}

export interface MLPredictionResult {
    prediction: number; // 0 = Low risk, 1 = High risk
    risk_level: 'Low' | 'High';
}

/**
 * Call ML API to predict pregnancy risk
 */
export const predictRisk = async (input: MLPredictionInput): Promise<MLPredictionResult> => {
    try {
        const response = await mlApiClient.post<MLPredictionResult>('/predict', input);
        return response.data;
    } catch (error) {
        console.error('ML API prediction error:', error);
        throw new Error('Failed to get ML risk prediction');
    }
};

/**
 * Check if ML API is available
 */
export const checkMLApiHealth = async (): Promise<boolean> => {
    try {
        const response = await mlApiClient.get('/');
        return response.status === 200;
    } catch (error) {
        console.error('ML API health check failed:', error);
        return false;
    }
};

/**
 * Helper to convert pregnancy and vitals data to ML input format
 */
export const prepareMLInput = (
    pregnancy: any,
    vitals: any
): MLPredictionInput => {
    return {
        Age: pregnancy.age || 25,
        Systolic_BP: vitals.bp_systolic || 120,
        Diastolic: vitals.bp_diastolic || 80,
        BS: vitals.blood_sugar || 5.5,
        Body_Temp: vitals.temperature || 98.6,
        BMI: pregnancy.bmi || 22.0,
        Previous_Complications: pregnancy.previous_complications ? 1 : 0,
        Preexisting_Diabetes: pregnancy.medical_history?.diabetes ? 1 : 0,
        Gestational_Diabetes: pregnancy.gestational_diabetes ? 1 : 0,
        Mental_Health: pregnancy.mental_health_concerns ? 1 : 0,
        Heart_Rate: vitals.heart_rate || 75,
    };
};
