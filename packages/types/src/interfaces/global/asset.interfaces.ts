import { ChainTypes } from '../../enums/chain.enums';

export interface IAssetBalance {
    name: string;
    amount: number;
    type: ChainTypes;
    issuer?: string;
}

export interface IAllowedAsset {
    name: string;
    type: ChainTypes;
    asset_code: string;
    issuer?: string;
}
