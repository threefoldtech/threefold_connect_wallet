import { IAssetBalance } from './asset.interfaces';

export interface IBalance {
    id: string;
    assets: IAssetBalance[];
}
