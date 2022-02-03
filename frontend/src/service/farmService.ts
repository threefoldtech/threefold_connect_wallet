import { Wallet, wallets } from '@/service/walletService';
import { allFarms, fetchAllFarms, getSubstrateApi, getTwinId } from '@/service/substrateService';
import { toNumber } from 'lodash';
import { BCFarm, Farm } from '@/types/farms.types';
import { useDynamicBalance } from '@/util/useDynamicBalance';
import axios from 'axios';
import { ref } from 'vue';

export const v2Farms = ref<Farm[]>([]);
export const v3Farms = ref(<Farm[]>[]);
const checkV3FarmsForWallets = async (v3Wallets: Wallet[]) => {
    for (const v3Wallet of v3Wallets) {
        const api = await getSubstrateApi();

        const substrateAddress = v3Wallet.keyPair.getSubstrateKeyring().address;
        const twinId = await getTwinId(substrateAddress);

        if (!twinId) {
            continue; // can't have farm without twin id
        }
        // console.debug('twinId', twinId);
        // console.table([...allFarms.value.map((f: any) => ({ ...f }))], ['name', 'twin_id']);
        const allV3Farms = allFarms.value.filter((farm: { twin_id: Number }) => toNumber(farm.twin_id) === twinId);

        const farmIds = JSON.parse(JSON.stringify(allV3Farms.map((farm: BCFarm) => farm.id)));
        const bcNodes = await api.query.tfgridModule.nodes.entries();

        await useDynamicBalance(v3Wallet);

        const allNodes = bcNodes
            //@ts-ignore
            .filter(([, node]) => farmIds.includes(node.farm_id.words[0]))
            //@ts-ignore
            .map(([, node]) => node.toHuman(true));

        for (const farm of allV3Farms) {
            const f: Farm = {
                name: farm?.name,
                wallet_id: v3Wallet.keyPair.getBasePublicKey(),
                v3: true,
                wallet: v3Wallet,
                farmId: farm?.id,
                twinId: farm?.twin_id,
            };

            const index = v3Farms.value.findIndex((farm: any) => farm.name === f.name);

            index === -1 ? v3Farms.value.push(f) : v3Farms.value.splice(index, 1, f);
        }
    }
};
const checkV2FarmsForWallets = async (v2Wallets: Wallet[]) => {
    for (const v2Wallet of v2Wallets) {
        const stellarKeyPair = v2Wallet.keyPair.getStellarKeyPair().publicKey();
        const result = await axios.get(`/api/v1/farms/address/${stellarKeyPair}`);

        if (result && result.status == 200) {
            for (const farmName of result.data) {
                const f: Farm = {
                    name: farmName,
                    wallet_id: v2Wallet.keyPair.getBasePublicKey(),
                    v3: false,
                    wallet: v2Wallet,
                };

                const index = v2Farms.value.findIndex((farm: any) => farm.name === f.name);
                index === -1 ? v2Farms.value.push(f) : v2Farms.value.splice(index, 1, f);
            }
        }
    }
};
export const fetchFarms = async () => {
    await fetchAllFarms();
    await checkV2FarmsForWallets(wallets.value);
    await checkV3FarmsForWallets(wallets.value);
};
