import { IGqlTwin } from 'shared-types/src/interfaces/substrate/farm.interfaces';
import { IKeyringPair } from '@polkadot/types/types/interfaces';
import { getAllTwinIds } from '../gql/calls/farms.calls';
import { getSubstrateAssetBalances } from './balance.service.substrate';
import { getFarmIdByName, getUsersTermsAndConditionsByAccountId } from '../states/grid.state';
import { ITermsAndConditions } from 'shared-types/src/interfaces/substrate/tac.interfaces';
import { allSubstrateAddresses } from 'wallet-frontend/src/modules/Farm/services/farm.service';

const maxRetries = 20;
const timeout = 2000;

export const isTwinCreated = async (keyRing: IKeyringPair, retries = 0): Promise<boolean> => {
    const allTwinIds = await getAllTwinIds(allSubstrateAddresses.value);

    if (retries <= maxRetries) {
        const twinId = allTwinIds.find((twin: IGqlTwin) => twin.substrateAddress === keyRing.address);

        if (twinId) {
            return true;
        }

        await new Promise(resolve => setTimeout(resolve, timeout));
        return await isTwinCreated(keyRing, retries + 1);
    }

    return false;
};

export const isAccountActivated = async (accountId: string, retries = 0): Promise<boolean> => {
    if (retries <= maxRetries) {
        const substrateBalance = await getSubstrateAssetBalances(accountId);

        const balance = substrateBalance[0];

        if (balance.amount > 0) {
            return true;
        }

        await new Promise(resolve => setTimeout(resolve, timeout));
        return await isAccountActivated(accountId, retries + 1);
    }
    return false;
};

export const isTermsAndConditionsAccepted = async (accountId: string, url: string, retries = 0): Promise<boolean> => {
    if (retries <= maxRetries) {
        const termsAndConditions = await getUsersTermsAndConditionsByAccountId(accountId);
        if (termsAndConditions.filter((t: ITermsAndConditions) => t.documentLink === url).length !== 0) return true;

        await new Promise(resolve => setTimeout(resolve, timeout));
        return await isTermsAndConditionsAccepted(accountId, url, retries + 1);
    }

    return false;
};

export const isFarmCreated = async (name: string, retries = 0): Promise<boolean> => {
    if (retries <= maxRetries) {
        const farmId = await getFarmIdByName(name);

        if (farmId != 0) {
            return true;
        }

        await new Promise(resolve => setTimeout(resolve, timeout));
        return await isFarmCreated(name, retries + 1);
    }

    return true;
};
