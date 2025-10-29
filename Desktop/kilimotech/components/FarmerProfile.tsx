import React, { useState, useEffect } from 'react';
import { Farmer } from '../types';
import { ProductionProfile, FinancialBackground, BehavioralBackground, RiskInsights } from '../types';
import Card from './shared/Card';
import { 
    fetchFarmerProfile, 
    saveFarmerProfile, 
    getRiskInsights,
    generateRiskInsights,
    calculateRiskScore,
    getRiskCategory
} from '../services/farmerProfileService';
import Spinner from './shared/Spinner';

interface FarmerProfileProps {
    farmer: Farmer;
}

const FarmerProfile: React.FC<FarmerProfileProps> = ({ farmer }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<'production' | 'financial' | 'behavioral' | 'overview'>('overview');
    
    // Profile data
    const [production, setProduction] = useState<ProductionProfile>({
        cropTypes: [],
        acreage: 0,
        yieldHistory: [],
        inputCosts: {
            seeds: 0,
            fertilizer: 0,
            pesticides: 0,
            labor: 0
        },
        seasonality: {
            primarySeason: 'Long Rains',
            secondarySeason: 'Short Rains'
        }
    });

    const [financial, setFinancial] = useState<FinancialBackground>({
        incomeSources: [],
        monthlyIncome: 0,
        pastLoans: [],
        savingsBehavior: 'Irregular',
        repaymentRecord: 'Fair',
        bankAccount: false,
        mpesaUsage: 'Medium'
    });

    const [behavioral, setBehavioral] = useState<BehavioralBackground>({
        dataUpdateFrequency: 'Monthly',
        timelinessScore: 0.7,
        trainingParticipation: [],
        advisoryEngagement: 'Medium',
        appUsageFrequency: 'Weekly',
        profileCompleteness: 0.6
    });

    const [riskScore, setRiskScore] = useState<number>(0.5);
    const [riskCategory, setRiskCategory] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [insights, setInsights] = useState<RiskInsights | null>(null);
    const [profileExists, setProfileExists] = useState(false);

    // Load existing profile
    useEffect(() => {
        loadProfile();
    }, [farmer.id]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const profile = await fetchFarmerProfile(farmer.id);
            if (profile) {
                setProduction(profile.productionProfile);
                setFinancial(profile.financialBackground);
                setBehavioral(profile.behavioralBackground);
                setRiskScore(profile.riskScore);
                setRiskCategory(profile.riskCategory);
                setProfileExists(true);
                
                // Generate insights
                const calculatedInsights = generateRiskInsights(
                    profile.riskScore,
                    profile.riskCategory,
                    profile.productionProfile,
                    profile.financialBackground,
                    profile.behavioralBackground
                );
                setInsights(calculatedInsights);
            } else {
                // Initialize with farmer's existing data
                if (farmer.farmData) {
                    setProduction(prev => ({
                        ...prev,
                        cropTypes: [farmer.farmData.cropType],
                        acreage: farmer.farmData.acreage,
                        yieldHistory: [{
                            year: new Date().getFullYear() - 1,
                            yield: farmer.farmData.yieldEstimate,
                            crop: farmer.farmData.cropType
                        }]
                    }));
                }
                // Recalculate with default data
                updateRiskScore();
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateRiskScore = () => {
        const score = calculateRiskScore(production, financial, behavioral);
        const category = getRiskCategory(score);
        setRiskScore(score);
        setRiskCategory(category);
        
        // Update insights
        const newInsights = generateRiskInsights(score, category, production, financial, behavioral);
        setInsights(newInsights);
    };

    useEffect(() => {
        updateRiskScore();
    }, [production, financial, behavioral]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const saved = await saveFarmerProfile(
                farmer.id,
                production,
                financial,
                behavioral,
                farmer.phone
            );
            
            if (saved) {
                setProfileExists(true);
                alert('Profile saved successfully!');
            } else {
                alert('Failed to save profile. Please try again.');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Error saving profile. Please check your connection.');
        } finally {
            setSaving(false);
        }
    };

    const getRiskColor = (category: string) => {
        switch (category) {
            case 'Low': return 'bg-green-100 text-green-800 border-green-300';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'High': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getRiskScoreColor = (score: number) => {
        if (score <= 0.3) return 'text-green-600';
        if (score <= 0.7) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <Card title="Farmer Profile">
                <div className="flex items-center justify-center py-8">
                    <Spinner />
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Risk Score Overview Card */}
            <Card title="Risk Profile" className="bg-gradient-to-br from-green-50 to-blue-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Risk Score</p>
                        <p className={`text-4xl font-bold ${getRiskScoreColor(riskScore)}`}>
                            {(riskScore * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {riskScore <= 0.3 ? 'Low Risk' : riskScore <= 0.7 ? 'Medium Risk' : 'High Risk'}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Risk Category</p>
                        <span className={`inline-block px-4 py-2 rounded-lg border-2 font-semibold ${getRiskColor(riskCategory)}`}>
                            {riskCategory}
                        </span>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Credit Access</p>
                        {insights && (
                            <p className="text-lg font-semibold text-green-700">
                                {insights.creditTerms.interestRateRange}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Interest Rate Range</p>
                    </div>
                </div>

                {insights && (
                    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                        <p className="font-semibold text-gray-800 mb-2">{insights.summary}</p>
                        <p className="text-sm text-gray-600">{insights.creditTerms.eligibilityMessage}</p>
                    </div>
                )}
            </Card>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'production', label: 'Production' },
                    { key: 'financial', label: 'Financial' },
                    { key: 'behavioral', label: 'Behavioral' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveSection(tab.key as any)}
                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                            activeSection === tab.key
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Section */}
            {activeSection === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {insights && (
                        <>
                            <Card title="Credit Terms & Benefits">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Interest Rate Range</p>
                                        <p className="text-xl font-bold text-green-700">
                                            {insights.creditTerms.interestRateRange}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Loan Amount Range</p>
                                        <p className="text-lg font-semibold text-gray-800">
                                            {insights.creditTerms.loanAmountRange}
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="font-semibold text-gray-800 mb-2">Your Benefits:</p>
                                        <ul className="space-y-2">
                                            {insights.benefits.map((benefit, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <span className="text-green-600 mt-0.5">✓</span>
                                                    <span className="text-gray-700">{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Recommendations">
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-600 mb-3">
                                        Improve your profile to unlock better credit terms:
                                    </p>
                                    <ul className="space-y-2">
                                        {insights.recommendations.map((rec, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <span className="text-blue-600 mt-0.5">→</span>
                                                <span className="text-gray-700">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        </>
                    )}

                    {/* SMS Notification Placeholder */}
                    <Card title="SMS Notifications" className="lg:col-span-2">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-700 mb-2">
                                <strong>Phone Number:</strong> {farmer.phone}
                            </p>
                            <p className="text-xs text-gray-600 mb-3">
                                Future integration: Twilio or Africa's Talking API will enable:
                            </p>
                            <ul className="space-y-1 text-xs text-gray-600">
                                <li>• Weather alerts and farming tips</li>
                                <li>• Loan payment reminders</li>
                                <li>• Market price updates</li>
                                <li>• Training session notifications</li>
                            </ul>
                        </div>
                    </Card>
                </div>
            )}

            {/* Production Profile Section */}
            {activeSection === 'production' && (
                <Card title="Production Profile">
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Crop Types (select all that apply)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {['Maize', 'Beans', 'Wheat', 'Rice', 'Potatoes', 'Tomatoes', 'Coffee', 'Tea', 'Sugarcane'].map(crop => (
                                    <label key={crop} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={production.cropTypes.includes(crop)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setProduction(prev => ({
                                                        ...prev,
                                                        cropTypes: [...prev.cropTypes, crop]
                                                    }));
                                                } else {
                                                    setProduction(prev => ({
                                                        ...prev,
                                                        cropTypes: prev.cropTypes.filter(c => c !== crop)
                                                    }));
                                                }
                                            }}
                                        />
                                        <span className="text-sm">{crop}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Acreage
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={production.acreage}
                                onChange={(e) => setProduction(prev => ({ ...prev, acreage: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 mb-4">
                                Yield History
                            </label>
                            {production.yieldHistory.map((yieldRecord, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input
                                        type="number"
                                        placeholder="Year"
                                        value={yieldRecord.year}
                                        onChange={(e) => {
                                            const newHistory = [...production.yieldHistory];
                                            newHistory[idx].year = parseInt(e.target.value) || 0;
                                            setProduction(prev => ({ ...prev, yieldHistory: newHistory }));
                                        }}
                                        className="w-24 px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Crop"
                                        value={yieldRecord.crop}
                                        onChange={(e) => {
                                            const newHistory = [...production.yieldHistory];
                                            newHistory[idx].crop = e.target.value;
                                            setProduction(prev => ({ ...prev, yieldHistory: newHistory }));
                                        }}
                                        className="flex-1 px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="Yield (tons/acre)"
                                        value={yieldRecord.yield}
                                        onChange={(e) => {
                                            const newHistory = [...production.yieldHistory];
                                            newHistory[idx].yield = parseFloat(e.target.value) || 0;
                                            setProduction(prev => ({ ...prev, yieldHistory: newHistory }));
                                        }}
                                        className="w-32 px-3 py-2 border rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProduction(prev => ({
                                                ...prev,
                                                yieldHistory: prev.yieldHistory.filter((_, i) => i !== idx)
                                            }));
                                        }}
                                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    setProduction(prev => ({
                                        ...prev,
                                        yieldHistory: [...prev.yieldHistory, { year: new Date().getFullYear(), yield: 0, crop: '' }]
                                    }));
                                }}
                                className="text-sm text-green-600 hover:text-green-700 font-semibold"
                            >
                                + Add Yield Record
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Seeds Cost (KES)</label>
                                <input
                                    type="number"
                                    value={production.inputCosts.seeds}
                                    onChange={(e) => setProduction(prev => ({
                                        ...prev,
                                        inputCosts: { ...prev.inputCosts, seeds: parseFloat(e.target.value) || 0 }
                                    }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fertilizer Cost (KES)</label>
                                <input
                                    type="number"
                                    value={production.inputCosts.fertilizer}
                                    onChange={(e) => setProduction(prev => ({
                                        ...prev,
                                        inputCosts: { ...prev.inputCosts, fertilizer: parseFloat(e.target.value) || 0 }
                                    }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pesticides Cost (KES)</label>
                                <input
                                    type="number"
                                    value={production.inputCosts.pesticides}
                                    onChange={(e) => setProduction(prev => ({
                                        ...prev,
                                        inputCosts: { ...prev.inputCosts, pesticides: parseFloat(e.target.value) || 0 }
                                    }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Labor Cost (KES)</label>
                                <input
                                    type="number"
                                    value={production.inputCosts.labor}
                                    onChange={(e) => setProduction(prev => ({
                                        ...prev,
                                        inputCosts: { ...prev.inputCosts, labor: parseFloat(e.target.value) || 0 }
                                    }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Season</label>
                                <select
                                    value={production.seasonality.primarySeason}
                                    onChange={(e) => setProduction(prev => ({
                                        ...prev,
                                        seasonality: { ...prev.seasonality, primarySeason: e.target.value }
                                    }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option>Long Rains</option>
                                    <option>Short Rains</option>
                                    <option>Year Round</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Season</label>
                                <select
                                    value={production.seasonality.secondarySeason || ''}
                                    onChange={(e) => setProduction(prev => ({
                                        ...prev,
                                        seasonality: { ...prev.seasonality, secondarySeason: e.target.value }
                                    }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">None</option>
                                    <option>Long Rains</option>
                                    <option>Short Rains</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                        >
                            {saving ? 'Saving...' : 'Save Production Profile'}
                        </button>
                    </form>
                </Card>
            )}

            {/* Financial Background Section */}
            {activeSection === 'financial' && (
                <Card title="Financial Background">
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Income Sources (select all that apply)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {['Crop Sales', 'Livestock', 'Off-farm', 'Remittances', 'Business'].map(source => (
                                    <label key={source} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={financial.incomeSources.includes(source)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFinancial(prev => ({
                                                        ...prev,
                                                        incomeSources: [...prev.incomeSources, source]
                                                    }));
                                                } else {
                                                    setFinancial(prev => ({
                                                        ...prev,
                                                        incomeSources: prev.incomeSources.filter(s => s !== source)
                                                    }));
                                                }
                                            }}
                                        />
                                        <span className="text-sm">{source}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Monthly Income (KES)
                            </label>
                            <input
                                type="number"
                                value={financial.monthlyIncome}
                                onChange={(e) => setFinancial(prev => ({ ...prev, monthlyIncome: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 mb-4">
                                Past Loans
                            </label>
                            {financial.pastLoans.map((loan, idx) => (
                                <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
                                    <input
                                        type="number"
                                        placeholder="Year"
                                        value={loan.year}
                                        onChange={(e) => {
                                            const newLoans = [...financial.pastLoans];
                                            newLoans[idx].year = parseInt(e.target.value) || 0;
                                            setFinancial(prev => ({ ...prev, pastLoans: newLoans }));
                                        }}
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Amount (KES)"
                                        value={loan.amount}
                                        onChange={(e) => {
                                            const newLoans = [...financial.pastLoans];
                                            newLoans[idx].amount = parseFloat(e.target.value) || 0;
                                            setFinancial(prev => ({ ...prev, pastLoans: newLoans }));
                                        }}
                                        className="px-3 py-2 border rounded-lg"
                                    />
                                    <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={loan.repaid}
                                            onChange={(e) => {
                                                const newLoans = [...financial.pastLoans];
                                                newLoans[idx].repaid = e.target.checked;
                                                setFinancial(prev => ({ ...prev, pastLoans: newLoans }));
                                            }}
                                        />
                                        <span className="text-xs">Repaid</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer flex-1">
                                            <input
                                                type="checkbox"
                                                checked={loan.onTime}
                                                onChange={(e) => {
                                                    const newLoans = [...financial.pastLoans];
                                                    newLoans[idx].onTime = e.target.checked;
                                                    setFinancial(prev => ({ ...prev, pastLoans: newLoans }));
                                                }}
                                            />
                                            <span className="text-xs">On Time</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFinancial(prev => ({
                                                    ...prev,
                                                    pastLoans: prev.pastLoans.filter((_, i) => i !== idx)
                                                }));
                                            }}
                                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    setFinancial(prev => ({
                                        ...prev,
                                        pastLoans: [...prev.pastLoans, { year: 0, amount: 0, repaid: false, onTime: false }]
                                    }));
                                }}
                                className="text-sm text-green-600 hover:text-green-700 font-semibold"
                            >
                                + Add Loan Record
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Savings Behavior</label>
                                <select
                                    value={financial.savingsBehavior}
                                    onChange={(e) => setFinancial(prev => ({ ...prev, savingsBehavior: e.target.value as any }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option>None</option>
                                    <option>Irregular</option>
                                    <option>Regular</option>
                                    <option>Consistent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Repayment Record</label>
                                <select
                                    value={financial.repaymentRecord}
                                    onChange={(e) => setFinancial(prev => ({ ...prev, repaymentRecord: e.target.value as any }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option>Poor</option>
                                    <option>Fair</option>
                                    <option>Good</option>
                                    <option>Excellent</option>
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={financial.bankAccount}
                                        onChange={(e) => setFinancial(prev => ({ ...prev, bankAccount: e.target.checked }))}
                                    />
                                    <span className="text-sm">Has Bank Account</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Usage</label>
                                <select
                                    value={financial.mpesaUsage}
                                    onChange={(e) => setFinancial(prev => ({ ...prev, mpesaUsage: e.target.value as any }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                        >
                            {saving ? 'Saving...' : 'Save Financial Background'}
                        </button>
                    </form>
                </Card>
            )}

            {/* Behavioral Background Section */}
            {activeSection === 'behavioral' && (
                <Card title="Behavioral Background">
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data Update Frequency
                            </label>
                            <select
                                value={behavioral.dataUpdateFrequency}
                                onChange={(e) => setBehavioral(prev => ({ ...prev, dataUpdateFrequency: e.target.value as any }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                                <option>Rare</option>
                                <option>Monthly</option>
                                <option>Weekly</option>
                                <option>Daily</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Timeliness Score: {(behavioral.timelinessScore * 100).toFixed(0)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={behavioral.timelinessScore}
                                onChange={(e) => setBehavioral(prev => ({ ...prev, timelinessScore: parseFloat(e.target.value) }))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Poor</span>
                                <span>Excellent</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Training Participation (select all that apply)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {['Climate Smart', 'Financial Literacy', 'Market Access', 'Soil Management', 'Pest Control', 'Water Management'].map(training => (
                                    <label key={training} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={behavioral.trainingParticipation.includes(training)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setBehavioral(prev => ({
                                                        ...prev,
                                                        trainingParticipation: [...prev.trainingParticipation, training]
                                                    }));
                                                } else {
                                                    setBehavioral(prev => ({
                                                        ...prev,
                                                        trainingParticipation: prev.trainingParticipation.filter(t => t !== training)
                                                    }));
                                                }
                                            }}
                                        />
                                        <span className="text-sm">{training}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Advisory Engagement</label>
                                <select
                                    value={behavioral.advisoryEngagement}
                                    onChange={(e) => setBehavioral(prev => ({ ...prev, advisoryEngagement: e.target.value as any }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">App Usage Frequency</label>
                                <select
                                    value={behavioral.appUsageFrequency}
                                    onChange={(e) => setBehavioral(prev => ({ ...prev, appUsageFrequency: e.target.value as any }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option>Rare</option>
                                    <option>Weekly</option>
                                    <option>Daily</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Profile Completeness: {(behavioral.profileCompleteness * 100).toFixed(0)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={behavioral.profileCompleteness}
                                onChange={(e) => setBehavioral(prev => ({ ...prev, profileCompleteness: parseFloat(e.target.value) }))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Incomplete</span>
                                <span>Complete</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                        >
                            {saving ? 'Saving...' : 'Save Behavioral Background'}
                        </button>
                    </form>
                </Card>
            )}
        </div>
    );
};

export default FarmerProfile;

