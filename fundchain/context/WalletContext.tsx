
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

// Mocking the Plug Wallet window object for frontend development
if (typeof window !== 'undefined' && !(window as any).ic) {
  (window as any).ic = {
    plug: {
      requestConnect: async () => ({
        // This is a mock connection request
      }),
      agent: null,
      isConnected: async () => false,
      principalId: '',
      createActor: async () => ({}),
      requestBalance: async () => [{
        amount: 100000000, // 1 ICP
        canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        decimals: 8,
        image: "/images/icp.png",
        name: "ICP",
        symbol: "ICP",
      }],
      requestTransfer: async (options: {to: string, amount: number}) => {
        console.log('Mock transfer:', options);
        return { height: 12345 };
      },
    },
  };
}


interface WalletContextType {
  principal: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [principal, setPrincipal] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const connectWallet = useCallback(async () => {
    setLoading(true);
    try {
      // For real integration, you might need to whitelist canister IDs
      // await (window as any).ic.plug.requestConnect({
      //   whitelist: ['your_canister_id'],
      // });

      // Mocking the connection
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async
      const mockPrincipal = 'a1b2c-d3e4f-g5h6i-j7k8l-m9n0o-p1q2r-s3t4u-v5w6x-y7z8a-9b0c1-d2e';
      setPrincipal(mockPrincipal);
      setIsConnected(true);
       (window as any).ic.plug.principalId = mockPrincipal;


    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectWallet = () => {
    setPrincipal(null);
    setIsConnected(false);
    (window as any).ic.plug.principalId = '';
  };

  const value = { principal, isConnected, connectWallet, disconnectWallet, loading };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
