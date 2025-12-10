import { useState, useCallback } from 'react';

interface WalletInfo {
  name: string;
  icon: string;
  isInstalled: boolean;
  api?: any;
}

export const useWallet = () => {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [walletApi, setWalletApi] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const getAvailableWallets = useCallback((): WalletInfo[] => {
    const wallets: WalletInfo[] = [];

    if (typeof window !== 'undefined' && window.cardano) {
      wallets.push({
        name: 'Lace',
        icon: '🃏',
        isInstalled: !!window.cardano.lace,
        api: window.cardano.lace
      });

      wallets.push({
        name: 'Nami',
        icon: '🌊',
        isInstalled: !!window.cardano.nami,
        api: window.cardano.nami
      });

      wallets.push({
        name: 'Flint',
        icon: '🔥',
        isInstalled: !!window.cardano.flint,
        api: window.cardano.flint
      });
    }

    return wallets;
  }, []);

  const connectWallet = useCallback(async (walletName: string) => {
    setIsConnecting(true);
    try {
      const wallets = getAvailableWallets();
      const wallet = wallets.find(w => w.name === walletName && w.isInstalled);
      
      if (!wallet || !wallet.api) {
        throw new Error(`${walletName} wallet not found or not installed`);
      }

      const api = await wallet.api.enable();
      setWalletApi(api);
      setConnectedWallet(walletName);
      
      return api;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [getAvailableWallets]);

  const disconnectWallet = useCallback(() => {
    setConnectedWallet(null);
    setWalletApi(null);
  }, []);

  return {
    connectedWallet,
    walletApi,
    isConnecting,
    getAvailableWallets,
    connectWallet,
    disconnectWallet
  };
};