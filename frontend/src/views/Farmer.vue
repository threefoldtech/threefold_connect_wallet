<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <h1>Farmer</h1>
                <template #after v-if="canCreateWallet">
                    <PlusCircleIcon class="h-8 cursor-pointer text-gray-600" @click="createWallet()" />
                </template>
            </PageHeader>
        </template>
        <div v-if="!farmsIsLoading && !addressesIsLoading" class="min-h-full bg-gray-200 p-4">
            <div v-if="grid2Wallets.length > 0">
                <h2 class="py-2 font-medium">Wallets found with farms in Gridv2</h2>
                <ul role="list" class="grid grid-cols-1 gap-6">
                    <FarmerWalletCard :wallet="wallet" v-for="wallet in grid2Wallets" />
                </ul>
                <hr class="my-4 border-primary-400" />
                <h2 class="py-2 font-medium">Rest Wallets</h2>
                <ul role="list" class="grid grid-cols-1 gap-6">
                    <FarmerWalletCard :wallet="wallet" v-for="wallet in restWallets" />
                </ul>
            </div>
            <div v-else>
                <h2 class="py-2 font-medium">No wallets found with farms in Gridv2</h2>
                <ul role="list" class="grid grid-cols-1 gap-6">
                    <FarmerWalletCard :wallet="wallet" v-for="wallet in wallets" />
                </ul>
            </div>
        </div>
        <div v-else class="min-h-full bg-gray-200 p-4">
            <div>
                <h2 class="py-2 font-medium">Loading...</h2>
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
