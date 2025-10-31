import { useState, useCallback } from 'react';

interface WalletInfo {
  name: string;
  icon: string;
  isInstalled: boolean;
  provider: 'hashpack' | 'blade';
}

export const useHederaWallet = () => {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [walletProvider, setWalletProvider] = useState<'hashpack' | 'blade' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const getAvailableWallets = useCallback((): WalletInfo[] => {
    const wallets: WalletInfo[] = [];

    if (typeof window !== 'undefined') {
      wallets.push({
        name: 'HashPack',
        icon: '🔷',
        isInstalled: !!window.hashpack,
        provider: 'hashpack',
      });

      wallets.push({
        name: 'Blade',
        icon: '⚔️',
        isInstalled: !!window.blade,
        provider: 'blade',
      });
    }

    return wallets;
  }, []);

  const connectWallet = useCallback(async (walletName: string) => {
    setIsConnecting(true);
    try {
      const wallets = getAvailableWallets();
      const wallet = wallets.find(w => w.name === walletName && w.isInstalled);
      
      if (!wallet) {
        throw new Error(`${walletName} wallet not found or not installed`);
      }

      let connectedAccountId: string;

      if (wallet.provider === 'hashpack') {
        if (!window.hashpack) {
          throw new Error('HashPack not available');
        }
        const provider = await window.hashpack.connectToExtension();
        connectedAccountId = provider.getAccountId();
      } else if (wallet.provider === 'blade') {
        if (!window.blade) {
          throw new Error('Blade not available');
        }
        const accountInfo = await window.blade.getAccountInfo();
        connectedAccountId = accountInfo.accountId;
      } else {
        throw new Error('Unsupported wallet');
      }

      setAccountId(connectedAccountId);
      setConnectedWallet(walletName);
      setWalletProvider(wallet.provider);
      
      return { accountId: connectedAccountId, provider: wallet.provider };
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [getAvailableWallets]);

  const disconnectWallet = useCallback(() => {
    setConnectedWallet(null);
    setAccountId(null);
    setWalletProvider(null);
  }, []);

  return {
    connectedWallet,
    accountId,
    walletProvider,
    isConnecting,
    getAvailableWallets,
    connectWallet,
    disconnectWallet,
  };
};
