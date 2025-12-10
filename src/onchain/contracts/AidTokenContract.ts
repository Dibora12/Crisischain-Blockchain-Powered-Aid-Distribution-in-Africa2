
export interface AidTokenMetadata {
  name: string;
  symbol: string;
  description?: string;
  restrictions?: string[];
  expirationDate?: Date;
}

export interface TokenDistribution {
  recipient: string;
  amount: number;
  distributionDate: Date;
  restrictions?: string[];
  memo?: string;
}

export class AidTokenContract {
  private contractAddress: string;
  private cardanoClient: any;

  constructor(contractAddress: string, cardanoClient: any) {
    this.contractAddress = contractAddress;
    this.cardanoClient = cardanoClient;
  }

  async mint(recipient: string, amount: number, metadata?: AidTokenMetadata): Promise<string> {
    try {
      const transaction = await this.cardanoClient.submitTransaction({
        type: 'mint_tokens',
        contractAddress: this.contractAddress,
        data: {
          recipient,
          amount,
          metadata: metadata || {},
          timestamp: new Date().toISOString(),
        }
      });

      return transaction;
    } catch (error: any) {
      throw new Error(`Minting failed: ${error.message}`);
    }
  }

  async transfer(from: string, to: string, amount: number, memo?: string): Promise<string> {
    try {
      const transaction = await this.cardanoClient.submitTransaction({
        type: 'transfer_tokens',
        contractAddress: this.contractAddress,
        data: {
          from,
          to,
          amount,
          memo,
          timestamp: new Date().toISOString(),
        }
      });

      return transaction;
    } catch (error: any) {
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  async getBalance(address: string): Promise<number> {
    try {
      return await this.cardanoClient.getTokenBalance(this.contractAddress, address);
    } catch (error: any) {
      throw new Error(`Balance query failed: ${error.message}`);
    }
  }

  async getTokenInfo(): Promise<AidTokenMetadata> {
    return {
      name: 'Africa Aid Token',
      symbol: 'AAT',
      description: 'Cardano-based aid distribution token',
      restrictions: ['food', 'medical', 'shelter'],
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    };
  }

  async burn(owner: string, amount: number): Promise<string> {
    try {
      const transaction = await this.cardanoClient.submitTransaction({
        type: 'burn_tokens',
        contractAddress: this.contractAddress,
        data: {
          owner,
          amount,
          timestamp: new Date().toISOString(),
        }
      });

      return transaction;
    } catch (error: any) {
      throw new Error(`Burning failed: ${error.message}`);
    }
  }
}
