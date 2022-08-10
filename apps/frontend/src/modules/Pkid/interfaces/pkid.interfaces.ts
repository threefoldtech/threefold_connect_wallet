import { PkidWalletTypes } from '@/modules/Pkid/enums/pkid.enums';

export interface PkidWallet {
    name: string;
    position?: number;
    seed: string;
    type: PkidWalletTypes;
    index?: number;
}

export interface PkidV2AppWallet {
    index: number;
    isConverted: boolean;
    position?: number;
    stellar: boolean;
    walletName: string;
}

export interface PkidV2ImportedWallet {
    index: number;
    isConverted: boolean;
    position?: number;
    seed: Buffer;
    stellar: boolean;
    walletName: string;
}
