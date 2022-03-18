import { wallets } from '@/service/walletService';
import { ChainTypes } from '@/enums/chains.enums';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';
import { StrKey } from 'stellar-sdk';
import { ValidateWalletAddress } from '@/types/wallet.types';

export function validateWalletName(name: string, selectedWalletName: string): string | null {
    // Case when they just click change without changing the name
    if (name.toLowerCase() == selectedWalletName.toLowerCase()) {
        return null;
    }

    if (name.length >= 50) {
        return 'maximum';
    }

    if (name.length <= 0) {
        return 'empty';
    }

    const walletNames: string[] = wallets.value.map(wallet => wallet.name.toLowerCase());

    if (walletNames.includes(name.toLowerCase())) {
        return 'inUse';
    }

    return null;
}

export const validateWalletAddress = (walletAddress: string | undefined): ValidateWalletAddress => {
    if (!walletAddress) {
        return {
            type: ChainTypes.UNKNOWN,
            valid: false,
        };
    }

    const isValidStellarAddress = StrKey.isValidEd25519PublicKey(walletAddress);
    if (isValidStellarAddress) {
        return {
            type: ChainTypes.STELLAR,
            valid: true,
        };
    }

    const isValidSubstrateAddress = validateSubstrateAddress(walletAddress);
    if (isValidSubstrateAddress) {
        return {
            type: ChainTypes.SUBSTRATE,
            valid: true,
        };
    }

    return {
        type: ChainTypes.UNKNOWN,
        valid: false,
    };
};

export const validateSubstrateAddress = (walletAddress: string | undefined) => {
    if (!walletAddress) return false;

    try {
        const address = walletAddress.trim().replace('0x', '');
        encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));
        return true;
    } catch (error) {
        return false;
    }
};

export const validateStellarAddress = (walletAddress: string | undefined) => {
    if (!walletAddress) return false;
    return StrKey.isValidEd25519PublicKey(walletAddress);
};

export const isValidMemoOfTransaction = (memo: string) => {
    return memo.trim().length <= 29;
};
