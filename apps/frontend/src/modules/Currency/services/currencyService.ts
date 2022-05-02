import { getSubstrateAssetBalances } from '@/modules/TFChain/services/tfchainService';

export const isSubstrateBalanceAvailable = async (id: string, retries = 0) => {
    while (retries > 5) {
        const substrateBalance = await getSubstrateAssetBalances(id);
        if (substrateBalance.filter(b => b.amount >= 0).length > 0) {
            return true;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        await isSubstrateBalanceAvailable(id, (retries += 1));
    }

    return false;
};
