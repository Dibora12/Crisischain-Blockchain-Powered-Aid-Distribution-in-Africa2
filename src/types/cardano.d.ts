
interface CardanoAPI {
  enable(): Promise<any>;
  getUsedAddresses(): Promise<string[]>;
  getUnusedAddresses(): Promise<string[]>;
  getBalance(): Promise<string>;
}

interface Cardano {
  lace?: CardanoAPI;
  nami?: CardanoAPI;
  flint?: CardanoAPI;
}

declare global {
  interface Window {
    cardano?: Cardano;
  }
}

export {};
