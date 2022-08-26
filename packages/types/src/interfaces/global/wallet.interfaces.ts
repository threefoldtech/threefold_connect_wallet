import { IWalletKeyPair } from 'wallet-frontend/src/modules/Core/models/keypair.model';
import { PkidWalletTypes } from '../../enums/global/pkid.enums';

export interface IWallet {
    name: string;
    keyPair: IWalletKeyPair;
    meta: {
        position?: number;
        type: PkidWalletTypes;
        isPublic: boolean;
        index?: number;
    };
}

export interface IFlutterWallet {
    name: string;
    chain: string;
    address: string;
}
