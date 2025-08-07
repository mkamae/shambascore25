import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HttpAgent } from '@dfinity/agent';

interface PlugWalletContextProps {
  principal: string | null;
  balance: number | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendICP: (to: string, amount: number) => Promise<string | null>;
  refreshBalance: () => Promise<void>;
}

const PlugWalletContext = createContext<PlugWalletContextProps | undefined>(undefined);

export const usePlugWallet = () => {
  const ctx = useContext(PlugWalletContext);
  if (!ctx) throw new Error('usePlugWallet must be used within PlugWalletProvider');
  return ctx;
};

export const PlugWalletProvider = ({ children }: { children: ReactNode }) => {
  const [principal, setPrincipal] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check if Plug is installed
  const isPlugInstalled = () => typeof window !== 'undefined' && (window as any).ic && (window as any).ic.plug;

  // Connect to Plug Wallet
  const connect = async () => {
    if (!isPlugInstalled()) {
      alert('Plug Wallet is not installed!');
      return;
    }
    try {
      const plug = (window as any).ic.plug;
      const connected = await plug.requestConnect();
      if (connected) {
        setIsConnected(true);
        const principalId = await plug.getPrincipal();
        setPrincipal(principalId);
        await refreshBalance();
      }
    } catch (e) {
      alert('Failed to connect to Plug Wallet');
    }
  };

  // Disconnect (just clear state)
  const disconnect = () => {
    setIsConnected(false);
    setPrincipal(null);
    setBalance(null);
  };

  // Refresh ICP balance
  const refreshBalance = async () => {
    if (!isPlugInstalled() || !principal) return;
    try {
      const plug = (window as any).ic.plug;
      // Plug's getBalance returns e8s (1 ICP = 100_000_000 e8s)
      const res = await plug.requestBalance();
      // Find ICP balance (token symbol XTC or ICP)
      const icp = res.find((t: any) => t.symbol === 'ICP');
      setBalance(icp ? Number(icp.amount) / 1e8 : 0);
    } catch (e) {
      setBalance(null);
    }
  };

  // Send ICP to a principal/account
  const sendICP = async (to: string, amount: number) => {
    if (!isPlugInstalled()) return null;
    try {
      const plug = (window as any).ic.plug;
      // Plug expects amount in e8s
      const tx = await plug.requestTransfer({
        to,
        amount: BigInt(Math.floor(amount * 1e8)),
        token: { symbol: 'ICP' },
      });
      await refreshBalance();
      return tx?.transactionId || null;
    } catch (e) {
      alert('Failed to send ICP');
      return null;
    }
  };

  // Auto-connect if already connected
  useEffect(() => {
    if (isPlugInstalled()) {
      (window as any).ic.plug.isConnected().then((connected: boolean) => {
        if (connected) {
          setIsConnected(true);
          (window as any).ic.plug.getPrincipal().then((pid: string) => setPrincipal(pid));
          refreshBalance();
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <PlugWalletContext.Provider value={{ principal, balance, isConnected, connect, disconnect, sendICP, refreshBalance }}>
      {children}
    </PlugWalletContext.Provider>
  );
};