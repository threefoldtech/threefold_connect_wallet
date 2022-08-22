import { v2Farms } from '@/modules/Farm/services/farm.service';
import { doesFarmExistByName } from 'tf-substrate';
import axios from 'axios';

export const validateFarmName = async (name: string, stellarAddress: string): Promise<Object | undefined> => {
    const strippedName = name.trim();

    if (!strippedName || strippedName == '') {
        return {
            farmName: 'Farm name is required',
        };
    }

    if (strippedName.length > 50) {
        return {
            farmName: 'Farm name must be less than 50 characters',
        };
    }

    const doesFarmNameExist = await doesFarmExistByName(strippedName);
    if (doesFarmNameExist) {
        return {
            farmName: 'This name is already taken',
        };
    }

    const wasFound = v2Farms.value.find(farm => farm.name.toLowerCase() === strippedName.toLowerCase());
    if (wasFound && wasFound.wallet?.keyPair.getStellarKeyPair().publicKey() === stellarAddress) {
        return;
    }

    const res = await axios.get(`/api/v1/farms/${encodeURIComponent(strippedName)}/${stellarAddress}`);
    if (res.data?.canUse !== true) {
        return {
            farmName: 'This name is already taken',
        };
    }

    return;
};
