
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Wallet, Database, Cpu } from 'lucide-react';
import { supabase } from '@/backend/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSmartContracts } from '@/onchain/hooks/useSmartContracts';
import { useHederaWallet } from '@/hooks/useHederaWallet';
import { WalletSelector } from '@/components/WalletSelector';
import { toast } from 'sonner';

export function ConnectionStatus() {
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const { user } = useAuth();
  const { connectedWallet, accountId } = useHederaWallet();
  const { isConnected: smartContractConnected, isLoading: contractLoading } = useSmartContracts();

  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('count'). limit(1);
      setSupabaseConnected(!error);
    } catch (error) {
      setSupabaseConnected(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Database className="h-5 w-5" />
            System Connections
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Monitor the status of critical system connections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">Supabase Database</span>
            </div>
            {supabaseConnected ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">Hedera Wallet</span>
            </div>
            <div className="flex items-center gap-2">
              {connectedWallet && accountId ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-xs text-muted-foreground">
                    {accountId}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <Button 
                    size="sm" 
                    onClick={() => setShowWalletSelector(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Connect
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">Hedera Network</span>
            </div>
            <div className="flex items-center gap-2">
              {smartContractConnected ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-xs text-muted-foreground">
                    Testnet Connected
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  {contractLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span className="text-xs text-muted-foreground">
                    {connectedWallet ? 'Ready' : 'Requires Wallet'}
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showWalletSelector && !connectedWallet && (
        <WalletSelector />
      )}
    </div>
  );
}
