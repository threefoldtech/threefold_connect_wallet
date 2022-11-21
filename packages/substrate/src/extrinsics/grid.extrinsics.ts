import { IKeyringPair } from '@polkadot/types/types/interfaces';
import { getSubstrateApi, submitExtrinsic } from '../services/core.service.substrate';
import { fetchAllFarms } from 'wallet-frontend/src/modules/Farm/services/farm.service';
import { ExtrinsicCallbackMethod } from 'shared-types/src/enums/substrate/substrate.enums';
export const createTwinOnSubstrate = async (keyRing: IKeyringPair): Promise<boolean> => {
    try {
        const api = await getSubstrateApi();

        const submittableExtrinsic = await api.tx.tfgridModule.createTwin('::1');
        await submitExtrinsic(submittableExtrinsic, keyRing, callbackExtrinsic);

        return true;
    } catch (e) {
        console.error(e + '[CreateTwin]');
        return false;
    }
};

export const createFarmOnSubstrate = async (keyRing: IKeyringPair, farmName: string): Promise<boolean> => {
    try {
        const api = await getSubstrateApi();

        const submittableExtrinsic = await api.tx.tfgridModule.createFarm(farmName, []);
        await submitExtrinsic(submittableExtrinsic, keyRing, callbackExtrinsic);

        return true;
    } catch (e) {
        console.error(e + '[CreateFarm]');
        return false;
    }
};

export const deleteFarmOnSubstrate = async (keyRing: IKeyringPair, farmId: number): Promise<boolean> => {
    try {
        const api = await getSubstrateApi();

        const submittableExtrinsic = await api.tx.tfgridModule.deleteFarm(farmId);
        await submitExtrinsic(submittableExtrinsic, keyRing, callbackExtrinsic);

        return true;
    } catch (e) {
        console.error(e + '[DeleteFarm]');
        return false;
    }
};

export const addStellarPayoutAddressOnSubstrate = async (
    ring: IKeyringPair,
    address: string,
    id: number
): Promise<boolean> => {
    try {
        const api = await getSubstrateApi();

        const submittableExtrinsic = await api.tx.tfgridModule.addStellarPayoutV2address(id, address);
        await submitExtrinsic(submittableExtrinsic, ring, callbackExtrinsic);

        return true;
    } catch (e) {
        console.error(e + '[AddPayout]');
        return false;
    }
};

export const signUsersTermsAndConditionsOnSubstrate = async (keyRing: IKeyringPair, url: string) => {
    try {
        const api = await getSubstrateApi();

        const submittableExtrinsic = await api.tx.tfgridModule.userAcceptTc(url, 'NO_HASH');
        await submitExtrinsic(submittableExtrinsic, keyRing, await callbackExtrinsic);

        return true;
    } catch (e) {
        console.error(e + '[SignTAC]');
        return false;
    }
};

const callbackExtrinsic = async (method: string) => {
    switch (method) {
        case ExtrinsicCallbackMethod.FARM_DELETED:
            await fetchAllFarms();
            break;
        case ExtrinsicCallbackMethod.FARM_CREATED:
            await fetchAllFarms();
            break;
    }
};
