import { FEATURES as defaultFeatures } from '../config/features.js';

export type FeatureKey = keyof typeof defaultFeatures;

function coerceBoolean(value: any): boolean | undefined {
    if (value === undefined || value === null) return undefined;
    const v = String(value).toLowerCase().trim();
    if (['1', 'true', 'yes', 'on'].includes(v)) return true;
    if (['0', 'false', 'no', 'off'].includes(v)) return false;
    return undefined;
}

export function isFeatureEnabled(name: FeatureKey): boolean {
    const envMap: Record<string, string> = {
        plantDiagnosis: 'FEATURE_PLANT_DIAGNOSIS',
        aiAdvisory: 'FEATURE_CHATBOT',
        weatherForecast: 'FEATURE_WEATHER',
        farmerProfile: '',
        creditScoring: '',
        insurerDashboard: '',
        reports: '',
        wallets: ''
    };
    const envKey = envMap[name];
    const envVal = envKey ? coerceBoolean(process.env[envKey]) : undefined;
    if (envVal !== undefined) return envVal;
    // fallback to defaults
    return !!(defaultFeatures as any)[name];
}


