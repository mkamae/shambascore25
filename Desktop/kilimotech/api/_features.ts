import { FEATURES } from '../config/features.js';

export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(name: FeatureKey): boolean {
    try {
        return !!FEATURES[name];
    } catch {
        return false;
    }
}


