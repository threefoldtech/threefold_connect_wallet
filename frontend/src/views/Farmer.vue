<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <h1>Farms</h1>
                <template v-if="canCreateWallet" #after>
                    <PlusCircleIcon class="h-8 cursor-pointer text-gray-600" @click="createNewFarm()" />
                </template>
            </PageHeader>
        </template>
        <div v-if="!farmsIsLoading && !addressesIsLoading" class="min-h-full bg-gray-200 p-4">
            <div class="font-medium">Farms on v2</div>
            <div v-if="v2Farms.length > 0">
                <h2 class="pb-2 text-xs">Farms connected to existing wallets in TF Grid v2</h2>
                <ul role="list" class="grid grid-cols-1 gap-4">
                    <FarmCard :isV3="false" :farm="farm" v-for="farm in v2Farms" />
                </ul>
            </div>
            <div v-else>
                <h2 class="pb-2 text-xs">No farms connected to existing wallets in TF Grid v2</h2>
            </div>

            <div class="pt-3 font-medium">Farms on v3</div>
            <div v-if="v3Farms.length > 0">
                <h2 class="pb-2 text-xs">Farms connected to existing wallets in TF Grid v3</h2>
                <ul role="list" class="grid grid-cols-1 gap-6">
                    <FarmCard :isV3="true" :farm="farm" v-for="farm in v3Farms" />
                </ul>
            </div>
            <div v-else>
                <h2 class="pb-2 text-xs">No farms connected to existing wallets in TF Grid v3</h2>
            </div>

            <div v-if="newCreatedFarms.length > 0">
                <div v-for="newFarm in newCreatedFarms">
                    <CreateFarmCard :v2Farms="v2Farms" :farm="newFarm" :wallets="wallets"></CreateFarmCard>
                </div>
            </div>
        </div>
        <div v-else class="flex min-h-full items-center justify-center bg-gray-200 p-4">
            <div class="items-center justify-center text-center">
                <svg
                    class="h-32 animate-spin text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path
                        class="opacity-75"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        fill="currentColor"
                    ></path>
                </svg>
                <h2 class="mt-4">Loading</h2>
            </div>
        </div>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { saveWallets, Wallet, wallets } from '@/service/walletService';
    import FarmerWalletCard from '@/components/FarmerWalletCard.vue';

    import { PlusCircleIcon } from '@heroicons/vue/outline';
    import { nanoid } from 'nanoid';
    import { init, PkidWalletTypes } from '@/service/initializationService';
    import { WalletKeyPair } from '@/lib/WalletKeyPair';
    import flagsmith from 'flagsmith';
    import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
    import {
        allFarms,
        fetchAllFarms,
        getSubstrateApi,
        getSubstrateAssetBalances,
        getTwinId,
        getUsersTermsAndConditions,
    } from '@/service/substrateService';
    import { usePromise } from '@/util/usePromise';
    import axios from 'axios';
    import FarmCard from '@/components/FarmCard.vue';
    import { BCFarm, Farm } from '@/types/farms.types';
    import { onBeforeMount } from '@vue/runtime-core';
    import { useDynamicBalance } from '@/util/useDynamicBalance';
    import { toNumber } from 'lodash';
    import CreateFarmCard from '@/components/CreateFarmCard.vue';

    //@ts-ignore
    const canCreateWallet = import.meta.env.DEV || flagsmith.hasFeature('can_create_wallet_for_farmer');

    const createWallet = async () => {
        const walletKeyPair = WalletKeyPair.random();
        console.log(walletKeyPair.getStellarKeyPair().publicKey());
        wallets.value.push({
            keyPair: walletKeyPair,
            meta: { chain: 'stellar', type: PkidWalletTypes.Imported },
            name: nanoid(),
        });
        await saveWallets();
    };

    const createNewFarm = async () => {
        const f: Farm = {
            v3: true,
            name: nanoid(),
        };

        newCreatedFarms.value.push(f);
    };

    const addressesIsLoading = ref(true);
    const addresses = ref<string[]>([]);

    const v2Farms = ref<Farm[]>([]);
    const v3Farms = ref(<Farm[]>[]);
    const newCreatedFarms = ref(<Farm[]>[]);

    const initAddresses = async () => {
        addressesIsLoading.value = true;
        const result = await axios.get('/api/v1/farms/addresses');
        if (result?.data) {
            addresses.value = result.data;
        }
        addressesIsLoading.value = false;
    };

    initAddresses();

    const grid2Wallets = computed(() => {
        return wallets.value.filter(wallet => {
            const stellarKeyPair = wallet.keyPair.getStellarKeyPair().publicKey();
            return addresses.value?.find(farm => farm === stellarKeyPair);
        });
    });

    const checkV3FarmsForWallets = async (v3Wallets: Wallet[]) => {
        for (const v3Wallet of v3Wallets) {
            const api = await getSubstrateApi();

            const substrateAddress = v3Wallet.keyPair.getSubstrateKeyring().address;
            const twinId = await getTwinId(substrateAddress);

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

                v3Farms.value.push(f);
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

                    v2Farms.value.push(f);
                }
            }
        }
    };

    const restWallets = computed(() => {
        return wallets.value.filter(wallet => {
            const id = wallet.keyPair.getBasePublicKey();
            return !grid2Wallets.value.find(grid2Wallet => grid2Wallet.keyPair.getBasePublicKey() === id);
        });
    });

    const { isLoading: farmsIsLoading } = usePromise(fetchAllFarms());

    const intervalPointer = setInterval(async () => {
        console.log('Refreshing farms ..');
        await fetchAllFarms();
    }, 3000);

    onBeforeMount(async () => {
        await checkV2FarmsForWallets(wallets.value);
        await checkV3FarmsForWallets(restWallets.value);

        console.log('Loaded farms');
        console.log(v2Farms.value);
        console.log(v3Farms.value);
    });

    onBeforeUnmount(() => clearInterval(intervalPointer));
</script>

<style scoped></style>
