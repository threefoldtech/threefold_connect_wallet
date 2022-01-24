<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <h1>Farmer</h1>
                <template #after v-if="canCreateWallet">
                    <PlusCircleIcon class="h-8 text-gray-600 cursor-pointer" @click="createWallet()" />
                </template>
            </PageHeader>
        </template>
        <div class="p-4 bg-gray-200 min-h-full" v-if="grid2Wallets.length > 0">
            <h2 class="font-medium py-2">Wallets found with farms in Gridv2</h2>
            <ul role="list" class="grid grid-cols-1 gap-6">
                <FarmerWalletCard :wallet="wallet" v-for="wallet in grid2Wallets" />
            </ul>
            <hr class="my-4 border-primary-400" />
            <h2 class="font-medium py-2">Rest Wallets</h2>
            <ul role="list" class="grid grid-cols-1 gap-6">
                <FarmerWalletCard :wallet="wallet" v-for="wallet in restWallets" />
            </ul>
        </div>
        <div class="p-4 bg-gray-200 min-h-full" v-else>
            <h2 class="font-medium py-2">No wallets found with farms in Gridv2</h2>
            <ul role="list" class="grid grid-cols-1 gap-6">
                <FarmerWalletCard :wallet="wallet" v-for="wallet in wallets" />
            </ul>
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
    import { PkidWalletTypes } from '@/service/initializationService';
    import { WalletKeyPair } from '@/lib/WalletKeyPair';
    import flagsmith from 'flagsmith';
    import { computed } from 'vue';
    import farms from '@/data/farms.json';

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

    const grid2Wallets = computed(() => {
        return wallets.value.filter(wallet => {
            const stellarKeyPair = wallet.keyPair.getStellarKeyPair().publicKey();
            return farms.find(farm => farm.stellar_wallet_addres === stellarKeyPair);
        });
    });

    const restWallets = computed(() => {
        return wallets.value.filter(wallet => {
            const id = wallet.keyPair.getBasePublicKey();
            return !grid2Wallets.value.find(grid2Wallet => grid2Wallet.keyPair.getBasePublicKey() === id);
        });
    });
</script>

<style scoped></style>
