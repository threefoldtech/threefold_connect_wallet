import { Wallet } from '@/service/walletService';

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

export interface BCFarm {
    certification_type: string;
    id: string;
    name: string;
    pricing_policy_id: string;
    public_ips: string[];
    twin_id: string;
    version: string;
}

export interface StellarPayoutResponse {
    farmId: number;
    stellarAddress: string;
}
