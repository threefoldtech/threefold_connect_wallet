<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <!--                <template #before v-if="canCreateWallet">-->
                <!--                    <div>-->
                <!--                        <PlusCircleIcon class="h-8 cursor-pointer text-gray-600" @click="createWallet()" />-->
                <!--                        Sync with your wallet-->
                <!--                    </div>-->
                <!--                </template>-->
                <h1>Farms</h1>
                <!--                <template #after v-if="canCreateWallet">-->
                <!--                    <PlusCircleIcon class="h-8 cursor-pointer text-gray-600" @click="createWallet()" />-->
                <!--                </template>-->
            </PageHeader>
        </template>
        <div v-if="!farmsIsLoading && !addressesIsLoading" class="min-h-full bg-gray-200 p-4">
            <div class="font-medium">Farms on v2</div>
            <div v-if="grid2Wallets.length > 0">
                <h2 cl ass="py-2 font-medium">Wallets connected to existing farms in TF Grid v2</h2>
                <ul role="list" class="grid grid-cols-1 gap-6">
                    <FarmerWalletCard :wallet="wallet" v-for="wallet in grid2Wallets" />
                </ul>
                <hr class="my-4 border-primary-400" />
                <h2 class="py-2 font-medium">Wallets with no existing farms on Grid v2</h2>
                <ul role="list" class="grid grid-cols-1 gap-6">
                    <FarmerWalletCard :wallet="wallet" v-for="wallet in restWallets" />
                </ul>
            </div>
            <div v-else>
                <h2 class="py-2 text-sm">No wallets found with farms in TF Grid v2</h2>

                <div class="flex flex-row items-center justify-between py-2">
                    <div class="py-2 font-medium">Farms on v3</div>
                    <PlusCircleIcon class="h-8 cursor-pointer text-gray-600" @click="createWallet()" />
                </div>
                <ul role="list" class="grid grid-cols-1 gap-6">
                    <FarmerWalletCard :wallet="wallet" v-for="wallet in wallets" />
                </ul>
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
                <h2 class="mt-4">loading</h2>
            </div>
        </div>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { saveWallets, wallets } from '@/service/walletService';
    import FarmerWalletCard from '@/components/FarmerWalletCard.vue';

    import { PlusCircleIcon } from '@heroicons/vue/outline';
    import { nanoid } from 'nanoid';
    import { init, PkidWalletTypes } from '@/service/initializationService';
    import { WalletKeyPair } from '@/lib/WalletKeyPair';
    import flagsmith from 'flagsmith';
    import { computed, onBeforeUnmount, ref } from 'vue';
    import { fetchAllFarms } from '@/service/substrateService';
    import { usePromise } from '@/util/usePromise';
    import axios from 'axios';

    //@ts-ignore
    const canCreateWallet = import.meta.env.DEV || flagsmith.hasFeature('can_create_wallet_for_farmer');

    const createWallet = async () => {
        const walletKeyPair = WalletKeyPair.random();
        console.log(walletKeyPair);
        wallets.value.push({
            keyPair: walletKeyPair,
            meta: { chain: 'stellar', type: PkidWalletTypes.Imported },
            name: nanoid(),
        });
        await saveWallets();
    };

    const addressesIsLoading = ref(true);
    const adressess = ref<string[]>([]);
    const initAddresses = async () => {
        addressesIsLoading.value = true;
        const result = await axios.get('/api/v1/farms/addresses');
        if (result?.data) {
            adressess.value = result.data;
        }
        addressesIsLoading.value = false;
    };
    initAddresses();

    const grid2Wallets = computed(() => {
        return wallets.value.filter(wallet => {
            const stellarKeyPair = wallet.keyPair.getStellarKeyPair().publicKey();
            return adressess.value?.find(farm => farm === stellarKeyPair);
        });
    });

    const restWallets = computed(() => {
        return wallets.value.filter(wallet => {
            const id = wallet.keyPair.getBasePublicKey();
            return !grid2Wallets.value.find(grid2Wallet => grid2Wallet.keyPair.getBasePublicKey() === id);
        });
    });

    const { isLoading: farmsIsLoading } = usePromise(fetchAllFarms());

    const intervalPointer = setInterval(async () => {
        await fetchAllFarms();
    }, 3000);
    onBeforeUnmount(() => clearInterval(intervalPointer));
</script>

<style scoped></style>
