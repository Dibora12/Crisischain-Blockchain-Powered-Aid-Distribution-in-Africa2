import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/backend/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSmartContracts } from '@/onchain/hooks/useSmartContracts';
import { toast } from 'sonner';

export interface Distribution {
  id: string;
  aid_request_id: string;
  distributor_id: string;
  recipient_id: string;
  amount: number;
  token_contract_address?: string;
  midnight_tx_hash?: string;
  shielded_memo?: string;
  status: string;
  distributed_at?: string;
  created_at: string;
}

export const useDistributions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['distributions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('distributions')
        .select('*')
        .or(`distributor_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Distribution[];
    },
    enabled: !!user,
  });
};

export const useCreateDistribution = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { distributeTokens, initializeClient, isConnected, accountId } = useSmartContracts();

  return useMutation({
    mutationFn: async (distribution: Partial<Distribution> & { walletProvider: 'hashpack' | 'blade' }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Ensure required fields are present
      if (!distribution.aid_request_id || !distribution.recipient_id || !distribution.amount) {
        throw new Error('Aid request ID, recipient ID, and amount are required');
      }

      // Get the token ID (Hedera Token ID)
      const { data: tokens } = await supabase
        .from('tokens')
        .select('contract_address')
        .eq('is_active', true)
        .limit(1);

      if (!tokens || tokens.length === 0) {
        throw new Error('No active tokens found. Please create a token first.');
      }

      const tokenId = tokens[0].contract_address;

      // Initialize Hedera client if not connected
      if (!isConnected) {
        await initializeClient(distribution.walletProvider);
      }

      // Execute the distribution through Hedera HTS
      const txHash = await distributeTokens({
        tokenId,
        recipientId: distribution.recipient_id,
        amount: distribution.amount,
        memo: distribution.shielded_memo,
      });

      // Save distribution record to database
      const { data, error } = await supabase
        .from('distributions')
        .insert({
          aid_request_id: distribution.aid_request_id,
          distributor_id: user.id,
          recipient_id: distribution.recipient_id,
          amount: distribution.amount,
          token_contract_address: tokenId,
          midnight_tx_hash: txHash,
          shielded_memo: distribution.shielded_memo,
          status: 'completed',
          distributed_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log the transaction on Hedera
      await supabase.from('midnight_transactions').insert({
        tx_hash: txHash,
        tx_type: 'distribution',
        from_address: accountId,
        to_address: distribution.recipient_id,
        amount: distribution.amount,
        shielded: false,
        status: 'confirmed',
        metadata: {
          token_id: tokenId,
          aid_request_id: distribution.aid_request_id,
          network: 'hedera-testnet',
        },
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributions'] });
      toast.success('Distribution executed on Hedera', {
        description: 'Transparent and logged on Hedera Consensus Service',
      });
    },
    onError: (error) => {
      toast.error('Failed to execute distribution', {
        description: error.message,
      });
    },
  });
};
