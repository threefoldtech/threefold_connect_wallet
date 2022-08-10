import { getSubstrateApi } from '../services/core.substrate';

export const getTwinIdByAccountId = async (accountId: string): Promise<number> => {
    const api = await getSubstrateApi();

    const twin = await api.query.tfgridModule.twinIdByAccountID(accountId);
    const twinId = twin.toJSON();

    return twinId as number;
};

export const getUsersTermsAndConditionsByAccountId = async (accountId: string): Promise<any> => {
    const api = await getSubstrateApi();

    const userTermsAndConditions = await api.query.tfgridModule.usersTermsAndConditions(accountId);
    console.log(userTermsAndConditions);
    // return <any>arr.map((term: any) => {
    //     const newTerm = JSON.parse(JSON.stringify(term));
    //     //@ts-ignore
    //     newTerm.document_link = bin2String(term.document_link);
    //     //@ts-ignore
    //     newTerm.document_hash = bin2String(term.document_hash);
    //     return newTerm;
    // });
};
