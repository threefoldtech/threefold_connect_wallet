import { Wallet } from 'wallet-frontend/src/modules/Wallet/services/walletService';

export interface IGqlFarm {
    farmId: number;
    name: string;
    twinId?: number;
    stellarAddress: string;
    nodeIds?: number[];
}

export interface IGqlNode {
    nodeId: number;
    farmId: number;
    isOnline?: boolean;
}

export interface IGqlTwin {
    twinId: number;
    substrateAddress: string;
}

export interface IFarm {
    wallet?: Wallet;
    farm: IGqlFarm;
    nodes?: IGqlNode[];
}

export interface IFarmV2 {
    wallet: Wallet;
    name: string;
}
