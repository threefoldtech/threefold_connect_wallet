import { ChainTypes } from '../../enums/global/chain.enums';

export interface INamespaceData {
    name: string;
    address: string;
}

export interface INamespace {
    name: string;
    chains: {
        [ChainTypes.STELLAR]: string;
        [ChainTypes.SUBSTRATE]: string;
    };
}

export interface IAccount {
    doublename: string;
    publicKey: string;
}
