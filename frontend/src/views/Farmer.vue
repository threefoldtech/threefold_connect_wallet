<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <h1>Farmer</h1>
                <template #after>
                    <PlusCircleIcon class="h-8 text-gray-600 cursor-pointer" @click="createWallet()" />
                </template>
            </PageHeader>
        </template>
        <div class="p-4 bg-gray-200 min-h-full">
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
    import FarmerWalletCard from '@/views/FarmerWalletCard.vue';

    import { PlusCircleIcon } from '@heroicons/vue/outline';
    import { nanoid } from 'nanoid';
    import { PkidWalletTypes } from '@/service/initializationService';
    import { WalletKeyPair } from '@/lib/WalletKeyPair';

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
</script>

<style scoped></style>
