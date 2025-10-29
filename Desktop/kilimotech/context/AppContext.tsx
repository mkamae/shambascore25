import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { Farmer, UserType, AIInsights, FarmData, CreditProfile } from '../types';
import { MOCK_FARMERS } from '../constants';
import {
    fetchAllFarmers,
    fetchFarmerById,
    updateFarmData as updateFarmDataService,
    updateCreditProfile as updateCreditProfileService,
    updateAIInsights
} from '../services/farmerService';
import { getCurrentUser, getSession, onAuthStateChange, signOut } from '../services/authService';
import { getOrCreateFarmerForUser } from '../services/farmerAuthService';
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

    // Check for existing session on mount (only in browser)
    useEffect(() => {
        // Skip auth initialization during build/SSR
        if (typeof window === 'undefined') {
            setLoading(false);
            return;
        }

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
        let subscription: { unsubscribe: () => void } | null = null;
        
        try {
            const authSubscription = onAuthStateChange((user) => {
                setAuthUser(user);
                if (user && !userType) {
                    login('farmer');
                } else if (!user) {
                    setUserType(null);
                    setSelectedFarmer(null);
                }
            });
            subscription = authSubscription.data?.subscription || null;
        } catch (error) {
            console.error('Auth state listener error:', error);
        }

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, []);

    // Fetch farmers from Supabase on mount and when authenticated
    useEffect(() => {
        if (authUser && typeof window !== 'undefined') {
            // First ensure user has a farmer record, then refresh
            const setupFarmer = async () => {
                try {
                    const farmerId = await getOrCreateFarmerForUser(authUser);
                    if (farmerId) {
                        // Load the farmer we just created/linked
                        const farmer = await fetchFarmerById(farmerId);
                        if (farmer) {
                            setSelectedFarmer(farmer);
                        }
                    }
                } catch (error) {
                    console.error('Error setting up farmer for user:', error);
                }
                // Refresh all farmers
                await refreshFarmers();
            };
            setupFarmer();
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

    const login = async (type: UserType, farmerId?: string) => {
        setUserType(type);
        if (type === 'farmer') {
            // If farmerId provided, try to fetch it
            if (farmerId) {
                try {
                    const farmer = await fetchFarmerById(farmerId);
                    if (farmer) {
                        setSelectedFarmer(farmer);
                        return;
                    }
                } catch (error) {
                    console.error('Error fetching farmer:', error);
                }
            }

            // If authenticated user exists, get/create their farmer record
            if (authUser) {
                try {
                    const userFarmerId = await getOrCreateFarmerForUser(authUser);
                    if (userFarmerId) {
                        const farmer = await fetchFarmerById(userFarmerId);
                        if (farmer) {
                            setSelectedFarmer(farmer);
                            return;
                        }
                    }
                } catch (error) {
                    console.error('Error getting farmer for authenticated user:', error);
                }
            }

            // Fallback: Use first farmer from Supabase or mock data
            if (farmers.length > 0) {
                // Prefer Supabase farmers (UUIDs) over mock farmers (string IDs)
                const supabaseFarmer = farmers.find(f => 
                    f.id && f.id.includes('-') && f.id.length > 20 // UUID check
                );
                setSelectedFarmer(supabaseFarmer || farmers[0]);
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
        try {
            const farmer = await fetchFarmerById(farmerId);
            if (farmer) {
                setSelectedFarmer(farmer);
                // Update local farmers list
                setFarmers(prevFarmers =>
                    prevFarmers.map(f => f.id === farmerId ? farmer : f)
                );
                return;
            }
        } catch (error) {
            console.error('Error fetching farmer:', error);
        }
        // Fallback to local data
        const localFarmer = farmers.find(f => f.id === farmerId);
        setSelectedFarmer(localFarmer || null);
    };

    const updateFarmerInsights = async (farmerId: string, insights: AIInsights) => {
        try {
            // Update in Supabase
            await updateAIInsights(farmerId, insights);
        } catch (error) {
            console.error('Error updating insights:', error);
        }
        
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
        try {
            // Update in Supabase
            await updateFarmDataService(farmerId, data);
        } catch (error) {
            console.error('Error updating farm data:', error);
        }
        
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

    const updateCreditProfile = async (farmerId: string, profile: CreditProfile) => {
        try {
            // Update in Supabase
            await updateCreditProfileService(farmerId, profile);
        } catch (error) {
            console.error('Error updating credit profile:', error);
        }
        
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
