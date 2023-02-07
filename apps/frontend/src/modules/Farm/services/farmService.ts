import { Wallet, wallets } from '@/modules/Wallet/services/walletService';
import {
    allFarms,
    fetchAllFarms,
    getSubstrateApi,
    getTwinId,
    twinIds,
} from '@/modules/TFChain/services/tfchainService';
import toNumber from 'lodash/toNumber';
import { Farm, StellarPayoutResponse } from '@/modules/Farm/types/farms.types';
import axios from 'axios';
import { ref } from 'vue';
import { SubstrateFarmDto } from '@/modules/Core/types/substrate.types';
import flagsmith from 'flagsmith';

export const v2Farms = ref<Farm[]>([]);
export const v3Farms = ref(<Farm[]>[]);
export const allStellarPayoutAddresses = ref<StellarPayoutResponse[]>([]);
export const v3SpecialFarms = ref<any>([]);
export const v3PortalFarms = ref<any>([]);
// export const showInformationDialog = useLocalStorage('landingFarmInformationDialog', true);

const checkV3FarmsForWallets = async (v3Wallets: Wallet[]) => {
    console.log(
        'All substrate addresses of wallets: ',
        v3Wallets.map((w: Wallet) => w.keyPair.getSubstrateKeyring().address)
    );

    console.log(
        'All stellar addresses of wallets: ',
        v3Wallets.map((w: Wallet) => w.keyPair.getStellarKeyPair().publicKey())
    );

    for (const v3Wallet of v3Wallets) {
        const substrateAddress = v3Wallet.keyPair.getSubstrateKeyring().address;
        const twinId = await getTwinId(substrateAddress);
        if (twinId === 0) {
            continue; // can't have farm without twin id
        }

        if (!allFarms.value) return;

        const allV3Farms = allFarms.value.filter((farm: { twin_id: Number }) => toNumber(farm.twin_id) === twinId);
        console.log('these are all v3 farms');
        console.log(allV3Farms);

        for (const farm of allV3Farms) {
            const allNodes = await getNodesByFarmId(farm.id);

            const f: Farm = {
                name: farm.name,
                wallet_id: v3Wallet.keyPair.getBasePublicKey(),
                v3: true,
                wallet: v3Wallet,
                farmId: farm.id,
                twinId: farm.twin_id,
                nodes: allNodes,
            };

            const index = v3Farms.value.findIndex((farm: any) => farm.farmId === f.farmId);

            index === -1 ? v3Farms.value.push(f) : v3Farms.value.splice(index, 1, f);
        }

        v3Farms.value.sort((a, b) => {
            // @TODO: solve this ts ignores - cause farm type farmId can be null
            //@ts-ignore
            if (a.farmId < b.farmId) return -1;
            //@ts-ignore
            if (a.farmId > b.farmId) return 1;
            return 0;
        });
    }
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

export const getNodesByFarmId = async (farmId: number) => {
    const query = `query MyQuery($farmId: Int ) {
  nodes(where: {farmID_eq: $farmId}) {
    nodeID
  }
}
`;
    const response = await axios.post(<string>flagsmith.getValue('tfchain_graphql_endpoint'), {
        query,
        variables: {
            farmId: farmId,
        },
    });

    return response?.data?.data?.nodes ?? [];
};

export const getAllStellarPayoutAddresses = async () => {
    const api = await getSubstrateApi();
    const myStellarAddresses = wallets.value.map(wallet => wallet.keyPair.getStellarKeyPair().publicKey());

    allStellarPayoutAddresses.value = (await api.query.tfgridModule.farmPayoutV2AddressByFarmID.entries()).map(
        ([storageKey, farm]) => {
            return {
                farmId: <number>storageKey.args?.[0].toJSON() || -1,
                stellarAddress: <string>farm.toHuman(),
            };
        }
    );

    const v3FarmIds = v3Farms.value.map(farm => farm.farmId);
    console.log('All V3 Farm ids: ', v3FarmIds);

    v3SpecialFarms.value = allStellarPayoutAddresses.value
        .filter((address: StellarPayoutResponse) => myStellarAddresses.includes(address.stellarAddress))
        .filter((address: StellarPayoutResponse) => !v3FarmIds.includes(toNumber(address.farmId)));

    const query = `query farmQuery($stellarAddresses: [String!]) {
  farms(where: {stellarAddress_in: $stellarAddresses}) {
    name
    twin_id: twinID
    public_ips: publicIPs {
      ip
    }
    pricing_policy_id: pricingPolicyID
    id: farmID
    certification: certification
  }
}
`;
    const response = await axios.post(<string>flagsmith.getValue('tfchain_graphql_endpoint'), {
        query,
        variables: {
            stellarAddresses: myStellarAddresses,
        },
    });

    const tempSpecialFarms = response?.data?.data?.farms ?? [];

    for (const v3PortalFarm of v3SpecialFarms.value) {
        const foundFarm = tempSpecialFarms.find((f: SubstrateFarmDto) => {
            return f.id === toNumber(v3PortalFarm.farmId.toString());
        });

        if (!foundFarm) {
            continue;
        }

        const v3Wallet = wallets.value.find(
            wallet => wallet.keyPair.getStellarKeyPair().publicKey() === v3PortalFarm.stellarAddress
        );

        if (!v3Wallet) {
            continue;
        }

        const allNodes = await getNodesByFarmId(v3PortalFarm.farmId);
        console.log(allNodes, v3PortalFarm.farmId);
        const f: Farm = {
            name: foundFarm.name,
            wallet_id: v3Wallet.keyPair.getBasePublicKey(),
            v3: true,
            wallet: v3Wallet,
            farmId: v3PortalFarm.farmId,
            twinId: foundFarm.twin_id,
            nodes: allNodes,
        };

        const index = v3PortalFarms.value.findIndex((farm: any) => farm.name === f.name);
        index === -1 ? v3PortalFarms.value.push(f) : v3PortalFarms.value.splice(index, 1, f);
    }
};

export const fetchFarms = async () => {
    for (const v3Wallet of wallets.value) {
        const substrateAddress = v3Wallet.keyPair.getSubstrateKeyring().address;
        const twinId = await getTwinId(substrateAddress);
        if (twinId === 0) {
            continue; // can't have farm without twin id
        }
        twinIds.value.add(twinId);
    }

    await fetchAllFarms();
    await checkV3FarmsForWallets(wallets.value);
    await getAllStellarPayoutAddresses();

    const enableV2Farms = flagsmith.hasFeature('can-see-v2-farms');

    if (enableV2Farms) {
        await checkV2FarmsForWallets(wallets.value);
    }

};
