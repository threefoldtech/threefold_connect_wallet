import { Wallet, wallets } from '@/modules/Wallet/services/walletService';
import axios from 'axios';
import { ref } from 'vue';
import { IFarm, IFarmV2, IGqlFarm, IGqlNode, IGqlTwin } from 'shared-types/src/interfaces/substrate/farm.interfaces';
import { getAllFarmsFromWallets, getAllNodesOfFarms, getAllTwinIds } from 'tf-substrate/src/gql/calls/farms.calls';

export const v2Farms = ref<IFarmV2[]>([]);

export const allStellarAddresses = ref<string[]>([]);
export const allSubstrateAddresses = ref<string[]>([]);

export const twinIds = ref<IGqlTwin[]>([]);

export const v3Farms = ref<IGqlFarm[]>([]);

export const v3PersonalFarms = ref<IFarm[]>([]);
export const v3OtherFarms = ref<IFarm[]>([]);

export const allDetailedFarms = ref<IFarm[]>([]);

export const fetchAllFarms = async () => {
    await getAllV2Farms();

    allStellarAddresses.value = wallets.value.map((w: Wallet) => w.keyPair.getStellarKeyPair().publicKey());
    allSubstrateAddresses.value = wallets.value.map((w: Wallet) => w.keyPair.getSubstrateKeyring().address);

    twinIds.value = await getAllTwinIds(allSubstrateAddresses.value);

    const allTwinIds = twinIds.value.map((twinId: IGqlTwin) => twinId.twinId);

    v3Farms.value = await getAllFarmsFromWallets(allTwinIds, allStellarAddresses.value);

    const allFarmIds = v3Farms.value.map((farm: IGqlFarm) => farm.farmId);
    if (allFarmIds.length <= 0) return;

    const allNodes = await getAllNodesOfFarms(allFarmIds);

    allDetailedFarms.value = v3Farms.value.map((farm: IGqlFarm) => {
        const nodes = allNodes.filter((node: IGqlNode) => node.farmId === farm.farmId);
        const twin = twinIds.value.find((twinId: IGqlTwin) => farm.twinId === twinId.twinId);

        const address = twin?.substrateAddress;
        const wallet = wallets.value.find((w: Wallet) => w.keyPair.getSubstrateKeyring().address === address);

        const fullFarm: IFarm = {
            farm: farm,
            nodes: nodes,
            wallet: wallet,
        };

        return fullFarm;
    });

    v3PersonalFarms.value = allDetailedFarms.value.filter((farm: IFarm) => farm.wallet != null);
    v3OtherFarms.value = allDetailedFarms.value.filter((farm: IFarm) => farm.wallet == null);
};

const getAllV2Farms = async () => {
    for (const wallet of wallets.value) {
        const address = wallet.keyPair.getStellarKeyPair().publicKey();
        const result = await axios.get(`/api/v1/farms/address/${address}`);

        if (!(result && result.status == 200)) {
            continue;
        }

        for (const farmName of result.data) {
            const v2Farm: IFarmV2 = {
                wallet: wallet,
                name: farmName,
            };

            const isMigrated = v3Farms.value.find((farm: IGqlFarm) => farm.name == farmName);

            if (isMigrated) {
                continue;
            }

            const index = v2Farms.value.findIndex((farm: IFarmV2) => farm.name === v2Farm.name);
            index === -1 ? v2Farms.value.push(v2Farm) : v2Farms.value.splice(index, 1, v2Farm);
        }
    }
};
