
import { Farmer } from './types';

export const MOCK_FARMERS: Farmer[] = [
    {
        id: 'farmer-1',
        name: 'Juma Wasonga',
        phone: '+254 712 345 678',
        location: 'Kisumu, Kenya',
        farmType: 'Smallholder',
        farmData: {
            cropType: 'Maize',
            acreage: 5,
            yieldEstimate: 1.5,
            annualExpenses: 50000,
            rainfall: 'Average',
            soilHealth: 'Good',
        },
        creditProfile: {
            loanEligibility: 150000,
            repaymentAbilityScore: 85,
            riskScore: 20,
        },
        insurance: {
            status: 'Active',
        },
        insights: null,
    },
    {
        id: 'farmer-2',
        name: 'Asha Nabwire',
        phone: '+254 723 456 789',
        location: 'Kakamega, Kenya',
        farmType: 'Smallholder',
        farmData: {
            cropType: 'Sugarcane',
            acreage: 10,
            yieldEstimate: 60,
            annualExpenses: 120000,
            rainfall: 'High',
            soilHealth: 'Average',
        },
        creditProfile: {
            loanEligibility: 300000,
            repaymentAbilityScore: 78,
            riskScore: 35,
        },
        insurance: {
            status: 'Inactive',
        },
        insights: null,
    },
    {
        id: 'farmer-3',
        name: 'David Kirui',
        phone: '+254 734 567 890',
        location: 'Kericho, Kenya',
        farmType: 'Commercial',
        farmData: {
            cropType: 'Tea',
            acreage: 25,
            yieldEstimate: 2, // tons of processed tea
            annualExpenses: 500000,
            rainfall: 'High',
            soilHealth: 'Good',
        },
        creditProfile: {
            loanEligibility: 1200000,
            repaymentAbilityScore: 92,
            riskScore: 15,
        },
        insurance: {
            status: 'Active',
        },
        insights: null,
    },
];
