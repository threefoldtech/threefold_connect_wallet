<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <h1>Farms</h1>
                <template v-if="canCreateFarms && showCreateNewFarm === false" #after>
                    <PlusCircleIcon class="h-8 cursor-pointer text-gray-600" @click="showCreateNewFarm = true" />
                </template>
            </PageHeader>
        </template>
        <div v-if="!farmsIsLoading && !addressesIsLoading" class="min-h-full bg-gray-200 p-4">
            <div v-if="v2Farms.length > 0 || v3Farms.length > 0">
                <div class="font-medium">Farms to be migrated to V3 from V2</div>
                <div v-if="v2Farms.length > 0">
                    <h2 class="pb-2 text-xs">Farms connected to existing wallets in TF Grid v2</h2>
                    <ul role="list" class="grid grid-cols-1 gap-3">
                        <FarmCard :isV3="false" :farm="farm" v-for="farm in v2Farms" />
                    </ul>
                </div>
                <div v-else>
                    <h2 class="pb-2 text-xs">No farms connected to existing wallets in TF Grid v2</h2>
                </div>

                <div class="pt-3 font-medium">Farms on v3</div>
                <div v-if="v3Farms.length > 0">
                    <h2 class="pb-2 text-xs">Farms connected to existing wallets should be migrated</h2>
                    <ul role="list" class="grid grid-cols-1 gap-3">
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
            <main
                v-else
                class="mx-auto flex w-full max-w-7xl flex-grow flex-col justify-center rounded-md bg-white px-4 sm:px-6 lg:px-8"
            >
                <div class="py-16">
                    <div class="text-center">
                        <p class="text-sm font-semibold uppercase tracking-wide text-primary-600">
                            no farms connected to your existing wallets
                        </p>
                        <h1 class="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                            Create farm on grid v3
                        </h1>
                        <div class="mt-6">
                            <a
                                href="#"
                                class="text-base font-medium text-primary-600 hover:text-primary-500"
                                @click="showCreateNewFarm = true"
                            >
                                Click to create<span aria-hidden="true"> &rarr;</span></a
                            >
                        </div>
                    </div>
                </div>
            </main>
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

    <Dialog
        as="div"
        class="fixed inset-0 flex h-screen w-full items-center justify-center"
        :open="showCreateNewFarm"
        @close="showCreateNewFarm = false"
    >
        <DialogOverlay class="pointer-events-none fixed inset-0 bg-gray-700/60" />
        <div class="flex w-[80%] max-w-[80%] items-center justify-center">
            <CreateFarmCard @close="showCreateNewFarm = false" />
        </div>
    </Dialog>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { saveWallets, wallets } from '@/service/walletService';

    import { Dialog, DialogOverlay } from '@headlessui/vue';

    import { PlusCircleIcon } from '@heroicons/vue/outline';
    import { nanoid } from 'nanoid';
    import { PkidWalletTypes } from '@/service/initializationService';
    import { WalletKeyPair } from '@/lib/WalletKeyPair';
    import flagsmith from 'flagsmith';
    import { computed, onBeforeUnmount, ref } from 'vue';
    import { fetchAllFarms } from '@/service/substrateService';
    import { usePromise } from '@/util/usePromise';
    import axios from 'axios';
    import FarmCard from '@/components/FarmCard.vue';
    import { Farm } from '@/types/farms.types';
    import CreateFarmCard from '@/components/CreateFarmCard.vue';
    import { fetchFarms, v2Farms, v3Farms } from '@/service/farmService';
    import { useRouter } from 'vue-router';
    //@ts-ignore
    const canCreateFarms = import.meta.env.DEV || flagsmith.hasFeature('can_create_farms_for_farmer');
    const showCreateNewFarm = ref<boolean>(false);

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

    const router = useRouter();
    const addressesIsLoading = ref(true);
    const addresses = ref<string[]>([]);

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

    const restWallets = computed(() => {
        return wallets.value.filter(wallet => {
            const id = wallet.keyPair.getBasePublicKey();
            return !grid2Wallets.value.find(grid2Wallet => grid2Wallet.keyPair.getBasePublicKey() === id);
        });
    });

    // const { isLoading: farmsIsLoading } = usePromise(fetchAllFarms());

    const farmsIsLoading = ref<boolean>(false);
    let intervalPointer: any;

    onBeforeUnmount(() => clearInterval(intervalPointer));

    const init = async () => {
        if (wallets.value.length <= 0) {
            return await router.push({ name: 'noWalletsScreen' });
        }

        farmsIsLoading.value = true;
        await fetchFarms();
        console.log('Farms have been fetched');
        farmsIsLoading.value = false;

        intervalPointer = setInterval(async () => {
            console.log('Refreshing farms ..');
            await fetchFarms();
            console.log('Farms refreshed');
        }, 5000);
    };

    init();
</script>

<style scoped></style>
