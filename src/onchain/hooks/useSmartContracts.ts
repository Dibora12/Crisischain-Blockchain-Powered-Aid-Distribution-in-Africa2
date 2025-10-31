
import { useState, useCallback } from 'react';
import { HederaClient, HEDERA_CONFIG, type TokenCreationParams, type TokenDistributionParams } from '@/onchain/contracts/HederaClient';
import { toast } from 'sonner';
import { useHederaWallet } from '@/hooks/useHederaWallet';

export const useSmartContracts = () => {
  const [client, setClient] = useState<HederaClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { connectedWallet, accountId } = useHederaWallet();

  const initializeClient = useCallback(async (walletProvider: 'hashpack' | 'blade') => {
    try {
      setIsLoading(true);
      const hederaClient = new HederaClient(HEDERA_CONFIG);
      await hederaClient.connectWallet(walletProvider);
      setClient(hederaClient);
      setIsConnected(true);
      toast.success('Connected to Hedera network', {
        description: 'Your wallet is ready for transactions',
      });
    } catch (error: any) {
      toast.error('Failed to connect to Hedera', {
        description: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createToken = useCallback(async (params: TokenCreationParams) => {
    if (!client) {
      throw new Error('Hedera client not initialized');
    }

    if (!accountId) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      const result = await client.createToken({
        ...params,
        treasuryAccountId: accountId,
      });
      toast.success('Token created on Hedera', {
        description: `Token ID: ${result.tokenId}`,
      });
      return result;
    } catch (error: any) {
      toast.error('Failed to create token', {
        description: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, accountId]);

  const distributeTokens = useCallback(async (params: TokenDistributionParams) => {
    if (!client) {
      throw new Error('Hedera client not initialized');
    }

    try {
      setIsLoading(true);
      const txId = await client.transferTokens(params);
      toast.success('Tokens distributed successfully', {
        description: `Transaction ID: ${txId}`,
      });
      return txId;
    } catch (error: any) {
      toast.error('Failed to distribute tokens', {
        description: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getTokenBalance = useCallback(async (tokenId: string, accountId: string) => {
    if (!client) {
      throw new Error('Hedera client not initialized');
    }
    return await client.getTokenBalance(accountId, tokenId);
  }, [client]);

  const logToConsensus = useCallback(async (message: string) => {
    if (!client) {
      throw new Error('Hedera client not initialized');
    }
    return await client.logToConsensus({
      topicId: HEDERA_CONFIG.transparencyTopicId,
      message,
    });
  }, [client]);

  return {
    client,
    isConnected,
    isLoading,
    accountId,
    initializeClient,
    createToken,
    distributeTokens,
    getTokenBalance,
    logToConsensus,
  };
};
