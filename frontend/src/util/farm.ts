import { allFarmNames } from '@/service/substrateService';
import axios from 'axios';
import { Wallet } from '@/service/walletService';
import { Farm } from '@/types/farms.types';

export const validateFarmName = async (farmName: any, stellarAddress: string, wallet: Wallet, v2farms: Farm[]) => {
    const wasFound = v2farms.find(farm => farm.name === farmName);
    console.log(wasFound);

    if (
        wasFound &&
        wasFound.wallet?.keyPair.getStellarKeyPair().publicKey() === wallet.keyPair.getStellarKeyPair().publicKey()
    ) {
        return;
    }

    if (wasFound) {
        return 'This name is already taken';
    }

    if (!farmName) {
        return 'Farm name is required';
    }

    if (farmName.length > 50) {
        return 'Farm name must be less than 50 characters';
    }

    // Check if the given farm name is already in the allFarms object
    if (allFarmNames.value.includes(farmName)) {
        return 'This name is already taken';
    }

    try {
        const res = await axios.get(`/api/v1/farms/${encodeURIComponent(farmName)}/${stellarAddress}`);

        if (res.data?.canuse !== true) {
            return 'This name is already taken';
        }
    } catch (e) {
        return 'Try again later';
    }

    return;
};

export const parseBCInt = (bcInt: string) => {
    return parseInt(bcInt.replace(',', ''));
};
