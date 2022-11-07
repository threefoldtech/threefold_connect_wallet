import axios from 'axios';
import { ref } from 'vue';
import { IFarm, IFarmV2, IGqlFarm, IGqlNode, IGqlTwin } from 'shared-types/src/interfaces/substrate/farm.interfaces';
import { getAllFarmsFromWallets, getAllNodesOfFarms, getAllTwinIds } from 'tf-substrate';
import { IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';
import { wallets } from '@/modules/Wallet/services/wallet.service';

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

    allStellarAddresses.value = wallets.value.map((w: IWallet) => w.keyPair.getStellarKeyPair().publicKey());
    console.log('All Stellar Addresses: ', allStellarAddresses.value);
    allSubstrateAddresses.value = wallets.value.map((w: IWallet) => w.keyPair.getSubstrateKeyring().address);
    console.log('All Substrate Addresses: ', allSubstrateAddresses.value);

    twinIds.value = await getAllTwinIds(allSubstrateAddresses.value);
    console.log('Twin IDs: ', twinIds.value);

    const allTwinIds = twinIds.value.map((twinId: IGqlTwin) => twinId.twinId);
    console.log('Mapped Twin IDs: ', twinIds.value);

    v3Farms.value = await getAllFarmsFromWallets(allTwinIds, allStellarAddresses.value);
    console.log('All farms on V3: ', v3Farms.value);

    const allFarmIds = v3Farms.value.map((farm: IGqlFarm) => farm.farmId);
    if (allFarmIds.length <= 0) return;

    const allNodes = await getAllNodesOfFarms(allFarmIds);
    console.log('All nodes: ', allNodes);

    allDetailedFarms.value = v3Farms.value.map((farm: IGqlFarm) => {
        const nodes = allNodes.filter((node: IGqlNode) => node.farmId === farm.farmId);
        const twin = twinIds.value.find((twinId: IGqlTwin) => farm.twinId === twinId.twinId);

        const address = twin?.substrateAddress;
        const wallet = wallets.value.find((w: IWallet) => w.keyPair.getSubstrateKeyring().address === address);

        const fullFarm: IFarm = {
            farm: farm,
            nodes: nodes,
            wallet: wallet,
        };

        return fullFarm;
    });

    v3PersonalFarms.value = allDetailedFarms.value.filter((farm: IFarm) => farm.wallet != null);
    console.log('All V3 linked wallet farms: ', v3PersonalFarms.value);
    v3OtherFarms.value = allDetailedFarms.value.filter((farm: IFarm) => farm.wallet == null);
    console.log('All V3 other farms: ', v3OtherFarms.value);
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
