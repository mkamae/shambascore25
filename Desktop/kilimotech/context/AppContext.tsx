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
import { getCurrentUser, getSession, onAuthStateChange, signOut } from '../services/authService';
import { User } from '@supabase/supabase-js';

interface AppContextType {
    userType: UserType;
    farmers: Farmer[];
    selectedFarmer: Farmer | null;
    loading: boolean;
    authUser: User | null;
    login: (type: UserType, farmerId?: string) => void;
    logout: () => Promise<void>;
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
    const [loading, setLoading] = useState<boolean>(true);
    const [authUser, setAuthUser] = useState<User | null>(null);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                const session = await getSession();
                const user = await getCurrentUser();
                
                if (session && user) {
                    setAuthUser(user);
                    await login('farmer');
                } else {
                    setUserType(null);
                }
            } catch (error) {
                console.error('Auth init error:', error);
                setUserType(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth state changes
        const { data: { subscription } } = onAuthStateChange((user) => {
            setAuthUser(user);
            if (user && !userType) {
                login('farmer');
            } else if (!user) {
                setUserType(null);
                setSelectedFarmer(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Fetch farmers from Supabase on mount and when authenticated
    useEffect(() => {
        if (authUser) {
            refreshFarmers();
        }
    }, [authUser]);

    const refreshFarmers = async () => {
        setLoading(true);
        try {
            const farmersData = await fetchAllFarmers();
            if (farmersData.length > 0) {
                setFarmers(farmersData);
                // Auto-select first farmer if none selected
                if (!selectedFarmer && farmersData.length > 0) {
                    setSelectedFarmer(farmersData[0]);
                }
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
        }
    };

    const logout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUserType(null);
            setSelectedFarmer(null);
            setAuthUser(null);
        }
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
        authUser,
        login,
        logout,
        selectFarmer,
        updateFarmerInsights,
        updateFarmerData,
        updateMpesaStatement,
        updateCreditProfile,
        refreshFarmers
    }), [userType, farmers, selectedFarmer, loading, authUser]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
