import {
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  Hbar,
  TokenAssociateTransaction,
} from '@hashgraph/sdk';

interface HederaConfig {
  network: 'testnet' | 'mainnet';
  operatorId?: string;
  operatorKey?: string;
}

interface TokenCreationParams {
  name: string;
  symbol: string;
  totalSupply: number;
  decimals?: number;
  treasuryAccountId: string;
}

interface TokenDistributionParams {
  tokenId: string;
  recipientId: string;
  amount: number;
  memo?: string;
}

interface ConsensusLogParams {
  topicId: string;
  message: string;
}

export class HederaClient {
  private client: Client;
  private config: HederaConfig;
  private walletProvider: any;

  constructor(config: HederaConfig) {
    this.config = config;
    
    // Initialize Hedera client for testnet or mainnet
    if (config.network === 'testnet') {
      this.client = Client.forTestnet();
    } else {
      this.client = Client.forMainnet();
    }

    // Set operator if provided (for server-side operations)
    if (config.operatorId && config.operatorKey) {
      this.client.setOperator(
        AccountId.fromString(config.operatorId),
        PrivateKey.fromString(config.operatorKey)
      );
    }
  }

  async connectWallet(provider: 'hashpack' | 'blade'): Promise<string> {
    try {
      if (provider === 'hashpack') {
        if (!window.hashpack) {
          throw new Error('HashPack wallet not installed');
        }
        this.walletProvider = await window.hashpack.connectToExtension();
        const accountId = this.walletProvider.getAccountId();
        return accountId;
      } else if (provider === 'blade') {
        if (!window.blade) {
          throw new Error('Blade wallet not installed');
        }
        this.walletProvider = window.blade;
        const accountInfo = await this.walletProvider.getAccountInfo();
        return accountInfo.accountId;
      }
      throw new Error('Unsupported wallet provider');
    } catch (error: any) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  /**
   * Create a fungible token using Hedera Token Service (HTS)
   * Cost: ~$1 USD on mainnet, much cheaper on testnet
   */
  async createToken(params: TokenCreationParams): Promise<{
    tokenId: string;
    transactionId: string;
  }> {
    try {
      const treasuryId = AccountId.fromString(params.treasuryAccountId);

      // Create the token with simplified key management
      const transaction = await new TokenCreateTransaction()
        .setTokenName(params.name)
        .setTokenSymbol(params.symbol)
        .setDecimals(params.decimals || 2)
        .setInitialSupply(params.totalSupply)
        .setTreasuryAccountId(treasuryId)
        .setTokenType(TokenType.FungibleCommon)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(params.totalSupply * 10) // Allow for future minting
        .setFreezeDefault(false)
        .freezeWith(this.client);

      // Sign with wallet provider
      const signedTx = await this.signWithWallet(transaction);
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      return {
        tokenId: receipt.tokenId!.toString(),
        transactionId: txResponse.transactionId.toString(),
      };
    } catch (error: any) {
      throw new Error(`Token creation failed: ${error.message}`);
    }
  }

  /**
   * Associate a token with an account (required before receiving tokens)
   * Cost: ~$0.05 USD
   */
  async associateToken(accountId: string, tokenId: string): Promise<string> {
    try {
      const transaction = await new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(accountId))
        .setTokenIds([tokenId])
        .freezeWith(this.client);

      const signedTx = await this.signWithWallet(transaction);
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      return txResponse.transactionId.toString();
    } catch (error: any) {
      throw new Error(`Token association failed: ${error.message}`);
    }
  }

  /**
   * Transfer tokens between accounts
   * Cost: ~$0.0001 USD per transfer (very cheap!)
   */
  async transferTokens(params: TokenDistributionParams): Promise<string> {
    try {
      const senderAccountId = this.walletProvider.getAccountId();
      
      const transaction = await new TransferTransaction()
        .addTokenTransfer(
          params.tokenId,
          AccountId.fromString(senderAccountId),
          -params.amount
        )
        .addTokenTransfer(
          params.tokenId,
          AccountId.fromString(params.recipientId),
          params.amount
        )
        .setTransactionMemo(params.memo || 'CrisisChain Aid Distribution')
        .freezeWith(this.client);

      const signedTx = await this.signWithWallet(transaction);
      const txResponse = await signedTx.execute(this.client);
      await txResponse.getReceipt(this.client);

      // Log to HCS for transparency
      await this.logToConsensus({
        topicId: HEDERA_CONFIG.transparencyTopicId,
        message: JSON.stringify({
          type: 'token_transfer',
          tokenId: params.tokenId,
          amount: params.amount,
          timestamp: new Date().toISOString(),
          memo: params.memo,
        }),
      });

      return txResponse.transactionId.toString();
    } catch (error: any) {
      throw new Error(`Token transfer failed: ${error.message}`);
    }
  }

  /**
   * Create a topic for transparent logging using Hedera Consensus Service (HCS)
   * Cost: ~$0.01 USD to create topic
   */
  async createTransparencyTopic(memo: string): Promise<string> {
    try {
      const transaction = await new TopicCreateTransaction()
        .setTopicMemo(memo)
        .setAdminKey(this.client.operatorPublicKey!)
        .freezeWith(this.client);

      const signedTx = await this.signWithWallet(transaction);
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      return receipt.topicId!.toString();
    } catch (error: any) {
      throw new Error(`Topic creation failed: ${error.message}`);
    }
  }

  /**
   * Log a message to HCS for transparent audit trail
   * Cost: ~$0.0001 USD per message (extremely cheap!)
   */
  async logToConsensus(params: ConsensusLogParams): Promise<string> {
    try {
      const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(params.topicId)
        .setMessage(params.message)
        .freezeWith(this.client);

      const signedTx = await this.signWithWallet(transaction);
      const txResponse = await signedTx.execute(this.client);
      await txResponse.getReceipt(this.client);

      return txResponse.transactionId.toString();
    } catch (error: any) {
      throw new Error(`Consensus logging failed: ${error.message}`);
    }
  }

  /**
   * Query token balance
   */
  async getTokenBalance(accountId: string, tokenId: string): Promise<number> {
    try {
      // Hedera SDK uses AccountBalanceQuery
      const balance = await new (await import('@hashgraph/sdk')).AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId))
        .execute(this.client);
      
      const tokenBalance = balance.tokens?.get(tokenId);
      return tokenBalance ? tokenBalance.toNumber() : 0;
    } catch (error: any) {
      throw new Error(`Balance query failed: ${error.message}`);
    }
  }

  /**
   * Sign transaction with connected wallet
   */
  private async signWithWallet(transaction: any): Promise<any> {
    if (!this.walletProvider) {
      throw new Error('Wallet not connected');
    }

    try {
      return await this.walletProvider.signTransaction(transaction);
    } catch (error: any) {
      throw new Error(`Transaction signing failed: ${error.message}`);
    }
  }

  disconnect(): void {
    this.walletProvider = null;
  }
}

// Hedera configuration for CrisisChain
export const HEDERA_CONFIG: HederaConfig & { transparencyTopicId: string } = {
  network: 'testnet',
  // Transparency topic for public audit logs (create this first)
  transparencyTopicId: '0.0.0', // Will be updated after creation
  // Operator credentials (optional, for server-side operations)
  operatorId: process.env.HEDERA_OPERATOR_ID,
  operatorKey: process.env.HEDERA_OPERATOR_KEY,
};

export type { TokenCreationParams, TokenDistributionParams, ConsensusLogParams };
