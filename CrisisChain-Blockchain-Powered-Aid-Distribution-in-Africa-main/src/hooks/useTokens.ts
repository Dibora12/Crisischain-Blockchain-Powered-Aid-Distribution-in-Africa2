import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/backend/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSmartContracts } from '@/onchain/hooks/useSmartContracts';
import { toast } from 'sonner';

export interface Token {
  id: string;
  creator_id: string;
  name: string;
  symbol: string;
  supply: number;
  contract_address?: string;
  midnight_tx_hash?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useTokens = () => {
  return useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Token[];
    },
  });
};

export const useCreateToken = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { createToken, initializeClient, isConnected, accountId } = useSmartContracts();

  return useMutation({
    mutationFn: async (token: { name: string; symbol: string; supply: number; walletProvider: 'hashpack' | 'blade' }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Initialize Hedera client if not connected
      if (!isConnected) {
        await initializeClient(token.walletProvider);
      }

      // Create the token on Hedera
      const result = await createToken({
        name: token.name,
        symbol: token.symbol,
        totalSupply: token.supply,
        treasuryAccountId: accountId!,
      });

      // Save to database with Hedera details
      const { data, error } = await supabase
        .from('tokens')
        .insert({
          creator_id: user.id,
          name: token.name,
          symbol: token.symbol,
          supply: token.supply,
          contract_address: result.tokenId, // Hedera Token ID
          midnight_tx_hash: result.transactionId, // Hedera Transaction ID
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log to Hedera Consensus Service for transparency
      await supabase.from('midnight_transactions').insert({
        tx_hash: result.transactionId,
        tx_type: 'token_creation',
        from_address: accountId,
        amount: token.supply,
        block_height: 0, // Hedera doesn't use block height
        shielded: false, // Hedera is transparent by default
        status: 'confirmed',
        metadata: { 
          token_id: result.tokenId,
          token_name: token.name,
          token_symbol: token.symbol,
          network: 'hedera-testnet',
        },
      });
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      toast.success('Token created on Hedera', {
        description: `${data.name} (${data.symbol}) is now live on Hedera network`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to create token', {
        description: error.message,
      });
    },
  });
};
