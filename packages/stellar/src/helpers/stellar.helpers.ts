import flagsmith from 'flagsmith';
import { Networks } from 'stellar-sdk';

export const getStellarNet = (): null | Networks => {
    const stellarUrl = flagsmith.getValue('stellar-network');
    if (!stellarUrl) return null;

    if (stellarUrl.toString() === Networks.PUBLIC) return Networks.PUBLIC;
    if (stellarUrl.toString() === Networks.TESTNET) return Networks.TESTNET;

    return null;
};
