import { PkidWalletTypes } from '../../enums/global/pkid.enums';

export interface IPkidWallet {
    name: string;
    position?: number;
    seed: string;
    type: PkidWalletTypes;
    index?: number;
}

export interface IPkidV2AppWallet {
    index: number;
    isConverted: boolean;
    position?: number;
    stellar: boolean;
    walletName: string;
}

export interface IPkidV2ImportedWallet {
    index: number;
    isConverted: boolean;
    position?: number;
    seed: Buffer;
    stellar: boolean;
    walletName: string;
}
