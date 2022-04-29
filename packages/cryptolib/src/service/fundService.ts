import axios from 'axios';
import { getConfig } from './stellarService';
import { Asset, Operation, xdr } from 'stellar-sdk';

export type Condition = {
    asset: string;
    fee_account_id: string;
    fee_fixed: string;
};

export const fetchFundDetails = async (asset: Asset): Promise<Condition> => {
    const { serviceUrl } = getConfig();

    const response = await axios.get(`${serviceUrl}/transactionfunding_service/conditions`);

    return response.data.find((condition: any) => condition.asset === `${asset.code}:${asset.issuer}`);
};

export const makeFundPayment = async (sourceAddress: string, asset: Asset): Promise<xdr.Operation> => {
    const condition = await fetchFundDetails(asset);

    return Operation.payment({
        destination: condition.fee_account_id,
        asset: asset,
        amount: condition.fee_fixed,
        source: sourceAddress,
    });
};
