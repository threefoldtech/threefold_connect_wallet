import { ChainTypes } from '@/enums/chains.enums';

export type ValidateWalletAddress = {
    type: ChainTypes;
    valid: boolean;
};
