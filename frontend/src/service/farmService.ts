import { Wallet, wallets } from '@/service/walletService';
import { allFarms, fetchAllFarms, getSubstrateApi, getTwinId } from '@/service/substrateService';
import { toNumber } from 'lodash';
import { BCFarm, Farm, StellarPayoutResponse } from '@/types/farms.types';
import { useDynamicBalance } from '@/util/useDynamicBalance';
import axios from 'axios';
import { ref } from 'vue';
import { crypto_sign_keypair } from 'libsodium-wrappers';

export const v2Farms = ref<Farm[]>([]);
export const v3Farms = ref(<Farm[]>[]);
export const allStellarPayoutAddresses = ref<any>([]);
export const v3SpecialFarms = ref<any>([]);
export const v3PortalFarms = ref<any>([]);

const checkV3FarmsForWallets = async (v3Wallets: Wallet[]) => {
    for (const v3Wallet of v3Wallets) {
        const api = await getSubstrateApi();

        const substrateAddress = v3Wallet.keyPair.getSubstrateKeyring().address;
        const twinId = await getTwinId(substrateAddress);
        if (twinId === 0) {
            continue; // can't have farm without twin id
        }
        // console  .debug('twinId', twinId);
        // console.table([...allFarms.value.map((f: any) => ({ ...f }))], ['name', 'twin_id']);
        const allV3Farms = allFarms.value.filter((farm: { twin_id: Number }) => toNumber(farm.twin_id) === twinId);

        const farmIds = JSON.parse(JSON.stringify(allV3Farms.map((farm: BCFarm) => toNumber(farm.id))));
        const bcNodes = await api.query.tfgridModule.nodes.entries();

        // farmIds.push(35);

        const allNodes = bcNodes
            //@ts-ignore
            .filter(([, node]) => farmIds.includes(node.toJSON().farm_id));

        for (const farm of allV3Farms) {
            const f: Farm = {
                name: farm?.toHuman()?.name,
                wallet_id: v3Wallet.keyPair.getBasePublicKey(),
                v3: true,
                wallet: v3Wallet,
                farmId: farm?.toJSON()?.id,
                twinId: farm?.toJSON()?.twin_id,
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

export const getAllStellarPayoutAddresses = async () => {
    const api = await getSubstrateApi();

    const myStellarAddresses = wallets.value.map(wallet => wallet.keyPair.getStellarKeyPair().publicKey());

    allStellarPayoutAddresses.value = (await api.query.tfgridModule.farmPayoutV2AddressByFarmID.entries()).map(
        (farm: any) => {
            return {
                farmId: toNumber(farm[0].toHuman()[0].toString()),
                stellarAddress: farm[1].toHuman(),
            };
        }
    );

    const v3FarmIds = v3Farms.value.map(farm => farm.farmId);

    v3SpecialFarms.value = allStellarPayoutAddresses.value
        .filter((address: StellarPayoutResponse) => myStellarAddresses.includes(address.stellarAddress))
        .filter((address: StellarPayoutResponse) => !v3FarmIds.includes(address.farmId));

    for (const v3PortalFarm of v3SpecialFarms.value) {
        const foundFarm = allFarms.value.find(
            (f: any) => toNumber(f.toHuman().id.toString()) === toNumber(v3PortalFarm.farmId.toString())
        );

        if (!foundFarm) {
            continue;
        }

        const v3Wallet = wallets.value.find(
            wallet => wallet.keyPair.getStellarKeyPair().publicKey() === v3PortalFarm.stellarAddress
        );

        if (!v3Wallet) {
            continue;
        }

        const f: Farm = {
            name: foundFarm.toHuman().name,
            wallet_id: v3Wallet.keyPair.getBasePublicKey(),
            v3: true,
            wallet: v3Wallet,
            farmId: v3PortalFarm.farmId.toString(),
            twinId: foundFarm.twin_id.toString(),
        };

        const index = v3PortalFarms.value.findIndex((farm: any) => farm.name === f.name);
        index === -1 ? v3PortalFarms.value.push(f) : v3PortalFarms.value.splice(index, 1, f);
    }
};

export const fetchFarms = async () => {
    await fetchAllFarms();
    await checkV3FarmsForWallets(wallets.value);
    await getAllStellarPayoutAddresses();
    await checkV2FarmsForWallets(wallets.value);
};
