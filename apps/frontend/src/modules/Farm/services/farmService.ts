import { Wallet, wallets } from '@/modules/Wallet/services/walletService';
import { Farm } from '@/modules/Farm/types/farms.types';
import axios from 'axios';
import { ref } from 'vue';
import { IGqlFarm } from 'shared-types/src/interfaces/substrate/farm.interfaces';
import { getAllFarmsFromWallets, getAllTwinIds } from 'tf-substrate/src/gql/calls/farms.calls';

export const v2Farms = ref<Farm[]>([]);

export const allStellarAddresses = ref<string[]>([]);
export const allSubstrateAddresses = ref<string[]>([]);

export const twinIds = ref<number[]>([]);

export const v3Farms = ref<IGqlFarm[]>([]);

export const v3PersonalFarms = ref<IGqlFarm[]>([]);
export const v3OtherFarms = ref<IGqlFarm[]>([]);

export const fetchAllFarms = async () => {
    allStellarAddresses.value = wallets.value.map((w: Wallet) => w.keyPair.getStellarKeyPair().publicKey());
    allSubstrateAddresses.value = wallets.value.map((w: Wallet) => w.keyPair.getSubstrateKeyring().address);

    v3Farms.value = await getAllFarmsFromWallets(allStellarAddresses.value);
    twinIds.value = await getAllTwinIds(allSubstrateAddresses.value);

    v3PersonalFarms.value = v3Farms.value.filter((farm: IGqlFarm) => twinIds.value.includes(farm.twinId));
    v3OtherFarms.value = v3Farms.value.filter((farm: IGqlFarm) => !twinIds.value.includes(farm.twinId));
};

const checkV2FarmsForWallets = async (v2Wallets: Wallet[]) => {
    for (const v2Wallet of v2Wallets) {
        const stellarKeyPair = v2Wallet.keyPair.getStellarKeyPair().publicKey();
        const result = await axios.get(`/api/v1/farms/address/${stellarKeyPair}`);

        if (!(result && result.status == 200)) {
            continue;
        }
        for (const farmName of result.data) {
            const f: Farm = {
                name: farmName,
                wallet_id: v2Wallet.keyPair.getBasePublicKey(),
                v3: false,
                wallet: v2Wallet,
            };

            const isMigrated = v3Farms.value.find(farm => farm.name == farmName);
            if (isMigrated) {
                continue;
            }

            const index = v2Farms.value.findIndex((farm: any) => farm.name === f.name);
            index === -1 ? v2Farms.value.push(f) : v2Farms.value.splice(index, 1, f);
        }
    }
};
