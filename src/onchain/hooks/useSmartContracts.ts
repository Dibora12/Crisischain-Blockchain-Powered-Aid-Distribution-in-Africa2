
import { useState, useCallback } from 'react';
import { CardanoClient, CARDANO_CONFIG, type TokenCreationParams, type DistributionParams } from '@/onchain/contracts/CardanoClient';
import { AidTokenContract } from '@/onchain/contracts/AidTokenContract';
import { toast } from 'sonner';

export const useSmartContracts = () => {
  const [client, setClient] = useState<CardanoClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initializeClient = useCallback(async () => {
    try {
      setIsLoading(true);
      const cardanoClient = new CardanoClient(CARDANO_CONFIG);
      await cardanoClient.connectWallet();
      setClient(cardanoClient);
      setIsConnected(true);
      toast.success('Connected to Cardano blockchain');
    } catch (error: any) {
      toast.error('Failed to connect to Cardano blockchain', {
        description: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deployToken = useCallback(async (params: TokenCreationParams) => {
    if (!client) {
      throw new Error('Cardano client not initialized');
    }

    try {
      setIsLoading(true);
      const deployment = await client.deployTokenContract(params);
      toast.success('Smart contract deployed successfully', {
        description: `Contract Address: ${deployment.contractAddress.slice(0, 10)}...`,
      });
      return deployment;
    } catch (error: any) {
      toast.error('Failed to deploy smart contract', {
        description: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const distributeTokens = useCallback(async (params: DistributionParams) => {
    if (!client) {
      throw new Error('Cardano client not initialized');
    }

    try {
      setIsLoading(true);
      const txHash = await client.distributeTokens(params);
      toast.success('Tokens distributed successfully', {
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
      return txHash;
    } catch (error: any) {
      toast.error('Failed to distribute tokens', {
        description: error.message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getTokenContract = useCallback((contractAddress: string) => {
    if (!client) {
      throw new Error('Cardano client not initialized');
    }
    return new AidTokenContract(contractAddress, client);
  }, [client]);

  return {
    client,
    isConnected,
    isLoading,
    initializeClient,
    deployToken,
    distributeTokens,
    getTokenContract,
  };
};
