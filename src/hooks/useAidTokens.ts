import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/backend/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSmartContracts } from '@/onchain/hooks/useSmartContracts';
import { toast } from 'sonner';

export interface AidToken {
  id: string;
  recipient_id: string;
  token_id: string;
  amount: number;
  token_type: string;
  contract_address: string;
  midnight_tx_hash?: string;
  restrictions?: any;
  expires_at?: string;
  is_active: boolean;
  used_amount: number;
  created_at: string;
  updated_at: string;
}

export const useAidTokens = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['aid-tokens', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('aid_tokens')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AidToken[];
    },
    enabled: !!user,
  });
};

export const useCreateAidToken = () => {
  const queryClient = useQueryClient();
  const { distributeTokens, initializeClient, isConnected, accountId } = useSmartContracts();

  return useMutation({
    mutationFn: async (token: Partial<AidToken> & { walletProvider: 'hashpack' | 'blade' }) => {
      // Ensure required fields are present
      if (!token.recipient_id || !token.amount || !token.token_type) {
        throw new Error('Recipient ID, amount, and token type are required');
      }

      // Get the active token (Hedera Token ID)
      const { data: tokens } = await supabase
        .from('tokens')
        .select('contract_address')
        .eq('is_active', true)
        .limit(1);

      if (!tokens || tokens.length === 0) {
        throw new Error('No active tokens found. Please create a token first.');
      }

      const tokenId = tokens[0].contract_address; // In Hedera, this is the Token ID

      // Initialize Hedera client if not connected
      if (!isConnected) {
        await initializeClient(token.walletProvider);
      }

      // Transfer tokens to the recipient using Hedera HTS
      const txHash = await distributeTokens({
        tokenId,
        recipientId: token.recipient_id!,
        amount: token.amount,
        memo: `${token.token_type} Aid Distribution`,
      });

      const aidTokenId = `AID_${Date.now()}`;
      
      const { data, error } = await supabase
        .from('aid_tokens')
        .insert({
          recipient_id: token.recipient_id,
          token_id: aidTokenId,
          amount: token.amount,
          token_type: token.token_type as any,
          contract_address: tokenId,
          midnight_tx_hash: txHash,
          restrictions: token.restrictions,
          expires_at: token.expires_at,
          is_active: token.is_active !== false,
          used_amount: token.used_amount || 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log the transaction on Hedera
      await supabase.from('midnight_transactions').insert({
        tx_hash: txHash,
        tx_type: 'token_transfer',
        from_address: accountId,
        to_address: token.recipient_id,
        amount: token.amount,
        shielded: false,
        status: 'confirmed',
        metadata: { 
          token_type: token.token_type,
          token_id: tokenId,
          aid_token_id: aidTokenId,
          network: 'hedera-testnet',
        },
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aid-tokens'] });
      toast.success('Aid tokens distributed on Hedera', {
        description: 'Transaction confirmed and logged on HCS',
      });
    },
    onError: (error) => {
      toast.error('Failed to create aid token', {
        description: error.message,
      });
    },
  });
};
