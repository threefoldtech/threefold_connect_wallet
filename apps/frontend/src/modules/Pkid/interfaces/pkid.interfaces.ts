import { PkidWalletTypes } from '@/modules/Pkid/enums/pkid.enums';

export interface PkidWallet {
    name: string;
    position?: number;
    seed: string;
    type: PkidWalletTypes;
    index?: number;
}
