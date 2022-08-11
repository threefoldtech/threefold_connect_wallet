import { getSubstrateApi } from '../services/core.substrate';
import { ITermsAndConditions } from 'shared-types/src/interfaces/substrate/tac.interfaces';

export const doesFarmExistByName = async (name: string): Promise<boolean> => {
    const api = await getSubstrateApi();
    const farm = await api.query.tfgridModule.farmIdByName(name);

    const readableFarm = farm.toJSON();
    return readableFarm != 0;
};

export const getTwinIdByAccountId = async (accountId: string): Promise<number> => {
    const api = await getSubstrateApi();

    const twin = await api.query.tfgridModule.twinIdByAccountID(accountId);
    const twinId = twin.toJSON();

    return twinId as number;
};

export const getEntityIdByAccountId = async (accountId: string): Promise<number> => {
    const api = await getSubstrateApi();

    const entity = await api.query.tfgridModule.entityIdByAccountID(accountId);
    const entityId = entity.toJSON();

    return entityId as number;
};

export const getUsersTermsAndConditionsByAccountId = async (accountId: string): Promise<ITermsAndConditions[] | []> => {
    const api = await getSubstrateApi();

    const userTermsAndConditions = (await api.query.tfgridModule.usersTermsAndConditions(accountId)).toJSON();

    if (!userTermsAndConditions) {
        return [];
    }

    //@ts-ignore
    return userTermsAndConditions.map((term: any) => {
        return {
            accountId: term.account_id,
            documentHash: term.document_hash,
            documentLink: term.document_link,
            timestamp: term.timestamp,
        };
    });
};
