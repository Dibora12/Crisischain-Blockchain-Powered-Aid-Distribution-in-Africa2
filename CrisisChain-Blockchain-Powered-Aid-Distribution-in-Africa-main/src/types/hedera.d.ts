// Hedera wallet type definitions
interface HashConnectProvider {
  getAccountId(): string;
  getAccountInfo(): Promise<any>;
  signTransaction(transaction: any): Promise<any>;
  executeTransaction(transaction: any): Promise<any>;
}

interface HashPackWallet {
  connectToExtension(): Promise<HashConnectProvider>;
  disconnect(): Promise<void>;
}

interface BladeWallet {
  createAccount(): Promise<any>;
  getAccountInfo(): Promise<any>;
  associateToken(tokenId: string): Promise<any>;
  transferTokens(tokenId: string, recipientId: string, amount: number): Promise<any>;
}

interface Window {
  hashpack?: HashPackWallet;
  blade?: BladeWallet;
}
