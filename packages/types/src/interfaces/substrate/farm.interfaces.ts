import { IWallet } from '../global/wallet.interfaces';

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
    wallet?: IWallet;
    farm: IGqlFarm;
    nodes?: IGqlNode[];
}

export interface IFarmV2 {
    wallet: IWallet;
    name: string;
}
