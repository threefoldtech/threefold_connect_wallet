import { getSubstrateApi } from '../services/core.service.substrate';
import { ITermsAndConditions } from 'shared-types/src/interfaces/substrate/tac.interfaces';
import { bin2String } from 'wallet-frontend/src/modules/Core/utils/crypto';

export const getEntityIdByAccountId = async (accountId: string): Promise<number> => {
    const api = await getSubstrateApi();

    const entity = await api.query.tfgridModule.entityIdByAccountID(accountId);
    const entityId = entity.toJSON();

    return entityId as number;
};

// User terms and conditions not available on GQL
export const getUsersTermsAndConditionsByAccountId = async (accountId: string): Promise<ITermsAndConditions[] | []> => {
    const api = await getSubstrateApi();

    const userTermsAndConditions = await api.query.tfgridModule.usersTermsAndConditions(accountId);

    if (!userTermsAndConditions) {
        return [];
    }

    //@ts-ignore
    return userTermsAndConditions.map((term: any) => {
        return {
            documentHash: bin2String(term.document_hash),
            documentLink: bin2String(term.document_link),
        };
    });
};

export const getFarmIdByName = async (name: string): Promise<number> => {
    const api = await getSubstrateApi();

    const farm = await api.query.tfgridModule.farmIdByName(name);

    const readableFarm = farm.toJSON();

    return readableFarm as number;
};
