import { Wallet } from '@/modules/Wallet/services/walletService';

export interface Farm {
    name: string;
    wallet_id?: string; // wallet.keyPair.getBasePublicKey()
    v3: boolean;
    wallet: Wallet;
    twinId?: number;
    farmId?: number;

    // @TODO: make type for nodes
    nodes?: any;
}

export interface StellarPayoutResponse {
    farmId: number;
    stellarAddress: string;
}
