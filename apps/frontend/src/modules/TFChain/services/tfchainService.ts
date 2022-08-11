import { ref } from 'vue';
import flagsmith from 'flagsmith';
import axios from 'axios';
import { getSubstrateAssetBalances } from 'tf-substrate/src/services/balance.substrate';
import { IGqlFarm } from 'shared-types/src/interfaces/substrate/farm.interfaces';

export const allPersonalFarms = ref<IGqlFarm[]>([]);
export const twinIds = ref<Set<number>>(new Set());

export const activationServiceForSubstrate = async (id: string) => {
    const headers = { 'Content-Type': 'application/json' };

    const url = `${flagsmith.getValue('tfchain_activation_base_url')}/activation/activate`;
    const data = { substrateAccountID: id };

    await axios.post(url, data, { headers });

    while (true) {
        const balances = await getSubstrateAssetBalances(id);
        if (balances[0].amount > 0) {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
};
