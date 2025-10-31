import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHederaWallet } from '@/hooks/useHederaWallet';
import { Wallet, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function WalletSelector() {
  const { connectedWallet, accountId, isConnecting, getAvailableWallets, connectWallet, disconnectWallet } = useHederaWallet();
  const wallets = getAvailableWallets();
  const installedWallets = wallets.filter(w => w.isInstalled);

  const handleConnect = async (walletName: string) => {
    try {
      await connectWallet(walletName);
    } catch (error: any) {
      console.error('Connection failed:', error);
    }
  };

  if (connectedWallet && accountId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connected to {connectedWallet}
          </CardTitle>
          <CardDescription>
            Account ID: {accountId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={disconnectWallet} variant="outline" className="w-full">
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Hedera Wallet
        </CardTitle>
        <CardDescription>
          Choose a wallet to connect to the Hedera network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {installedWallets.length === 0 ? (
          <Alert>
            <AlertDescription>
              No Hedera wallets detected. Please install HashPack or Blade wallet extension.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            {installedWallets.map((wallet) => (
              <Button
                key={wallet.name}
                onClick={() => handleConnect(wallet.name)}
                disabled={isConnecting}
                variant="outline"
                className="w-full justify-start"
              >
                <span className="mr-2 text-xl">{wallet.icon}</span>
                {wallet.name}
              </Button>
            ))}
          </div>
        )}
        
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Don't have a wallet?</p>
          <div className="flex gap-2">
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={() => window.open('https://www.hashpack.app/', '_blank')}
            >
              Get HashPack <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
            <span className="text-muted-foreground">|</span>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={() => window.open('https://bladewallet.io/', '_blank')}
            >
              Get Blade <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
