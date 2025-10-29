import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { Farmer, UserType, AIInsights, FarmData, MpesaStatement, CreditProfile } from '../types';
import { MOCK_FARMERS } from '../constants';
import {
    fetchAllFarmers,
    fetchFarmerById,
    updateFarmData as updateFarmDataService,
    updateCreditProfile as updateCreditProfileService,
    updateMpesaStatement as updateMpesaStatementService,
    updateAIInsights
} from '../services/farmerService';

interface AppContextType {
    userType: UserType;
    farmers: Farmer[];
    selectedFarmer: Farmer | null;
    loading: boolean;
    login: (type: UserType, farmerId?: string) => void;
    logout: () => void;
    selectFarmer: (farmerId: string) => void;
    updateFarmerInsights: (farmerId: string, insights: AIInsights) => void;
    updateFarmerData: (farmerId: string, data: FarmData) => void;
    updateMpesaStatement: (farmerId: string, statement: MpesaStatement) => void;
    updateCreditProfile: (farmerId: string, profile: CreditProfile) => void;
    refreshFarmers: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userType, setUserType] = useState<UserType>(null);
    const [farmers, setFarmers] = useState<Farmer[]>(MOCK_FARMERS);
    const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Fetch farmers from Supabase on mount
    useEffect(() => {
        refreshFarmers();
    }, []);

    const refreshFarmers = async () => {
        setLoading(true);
        try {
            const farmersData = await fetchAllFarmers();
            if (farmersData.length > 0) {
                setFarmers(farmersData);
            }
            // If no farmers in Supabase, keep mock data
        } catch (error) {
            console.error('Error loading farmers:', error);
            // Keep using mock data on error
        } finally {
            setLoading(false);
        }
    };

    const login = async (type: UserType, farmerId: string = 'farmer-1') => {
        setUserType(type);
        if (type === 'farmer') {
            // Try to fetch from Supabase first
            const farmer = await fetchFarmerById(farmerId);
            if (farmer) {
                setSelectedFarmer(farmer);
            } else {
                const localFarmer = farmers.find(f => f.id === farmerId);
                setSelectedFarmer(localFarmer || farmers[0]);
            }
        } else {
            setSelectedFarmer(farmers[0] || null);
        }
    };

    const logout = () => {
        setUserType(null);
        setSelectedFarmer(null);
    };

    const selectFarmer = async (farmerId: string) => {
        // Try to fetch fresh data from Supabase
        const farmer = await fetchFarmerById(farmerId);
        if (farmer) {
            setSelectedFarmer(farmer);
            // Update local farmers list
            setFarmers(prevFarmers =>
                prevFarmers.map(f => f.id === farmerId ? farmer : f)
            );
        } else {
            // Fallback to local data
            const localFarmer = farmers.find(f => f.id === farmerId);
            setSelectedFarmer(localFarmer || null);
        }
    };

    const updateFarmerInsights = async (farmerId: string, insights: AIInsights) => {
        // Update in Supabase
        await updateAIInsights(farmerId, insights);
        
        // Update local state
        setFarmers(prevFarmers =>
            prevFarmers.map(farmer =>
                farmer.id === farmerId ? { ...farmer, insights } : farmer
            )
        );
        if (selectedFarmer?.id === farmerId) {
            setSelectedFarmer(prev => prev ? { ...prev, insights } : null);
        }
    };

    const updateFarmerData = async (farmerId: string, data: FarmData) => {
        // Update in Supabase
        await updateFarmDataService(farmerId, data);
        
        // Update local state
        setFarmers(prevFarmers =>
            prevFarmers.map(farmer =>
                farmer.id === farmerId ? { ...farmer, farmData: data } : farmer
            )
        );
         if (selectedFarmer?.id === farmerId) {
            setSelectedFarmer(prev => prev ? { ...prev, farmData: data } : null);
        }
    };

    const updateMpesaStatement = async (farmerId: string, statement: MpesaStatement) => {
        // Update in Supabase
        await updateMpesaStatementService(farmerId, statement);
        
        // Update local state
        setFarmers(prevFarmers =>
            prevFarmers.map(farmer =>
                farmer.id === farmerId ? { ...farmer, mpesaStatement: statement } : farmer
            )
        );
         if (selectedFarmer?.id === farmerId) {
            setSelectedFarmer(prev => prev ? { ...prev, mpesaStatement: statement } : null);
        }
    };

    const updateCreditProfile = async (farmerId: string, profile: CreditProfile) => {
        // Update in Supabase
        await updateCreditProfileService(farmerId, profile);
        
        // Update local state
        setFarmers(prevFarmers =>
            prevFarmers.map(farmer =>
                farmer.id === farmerId ? { ...farmer, creditProfile: profile } : farmer
            )
        );
         if (selectedFarmer?.id === farmerId) {
            setSelectedFarmer(prev => prev ? { ...prev, creditProfile: profile } : null);
        }
    };

    const value = useMemo(() => ({
        userType,
        farmers,
        selectedFarmer,
        loading,
        login,
        logout,
        selectFarmer,
        updateFarmerInsights,
        updateFarmerData,
        updateMpesaStatement,
        updateCreditProfile,
        refreshFarmers
    }), [userType, farmers, selectedFarmer, loading]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};