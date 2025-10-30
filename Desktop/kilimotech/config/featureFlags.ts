import { FEATURES as defaultFeatures } from './features.js';

function coerceBoolean(value: any): boolean | undefined {
    if (value === undefined || value === null) return undefined;
    const v = String(value).toLowerCase().trim();
    if (['1', 'true', 'yes', 'on'].includes(v)) return true;
    if (['0', 'false', 'no', 'off'].includes(v)) return false;
    return undefined;
}

function readClientEnv(key: string): boolean | undefined {
    try {
        // Vite exposes env via import.meta.env
        // @ts-ignore
        const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : undefined;
        if (!env) return undefined;
        return coerceBoolean(env[key]);
    } catch {
        return undefined;
    }
}

function readServerEnv(key: string): boolean | undefined {
    try {
        return coerceBoolean(process.env[key]);
    } catch {
        return undefined;
    }
}

export const FEATURES = {
    plantDiagnosis:
        readClientEnv('VITE_FEATURE_PLANT_DIAGNOSIS') ??
        readServerEnv('FEATURE_PLANT_DIAGNOSIS') ??
        defaultFeatures.plantDiagnosis,
    aiAdvisory:
        readClientEnv('VITE_FEATURE_CHATBOT') ??
        readServerEnv('FEATURE_CHATBOT') ??
        defaultFeatures.aiAdvisory,
    weatherForecast:
        readClientEnv('VITE_FEATURE_WEATHER') ??
        readServerEnv('FEATURE_WEATHER') ??
        defaultFeatures.weatherForecast,
    farmerProfile: defaultFeatures.farmerProfile,
    creditScoring: defaultFeatures.creditScoring,
    insurerDashboard: defaultFeatures.insurerDashboard,
    reports: defaultFeatures.reports,
    wallets: defaultFeatures.wallets
};


