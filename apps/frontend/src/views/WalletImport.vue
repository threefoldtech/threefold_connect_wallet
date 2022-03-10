<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <ArrowLeftIcon @click="router.push({ name: 'walletList' })" />
                </template>
                <h1>{{ $t('walletImport.title') }}</h1>
            </PageHeader>
        </template>
        <div class="p-4">
            <div>
                <label class="block text-sm font-medium text-gray-700" for="Wallet Name">{{
                    $t('walletImport.walletName')
                }}</label>
                <div class="mt-1">
                    <input
                        id="Wallet Name"
                        v-model="name"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        name="Wallet Name"
                        type="text"
                    />
                </div>
            </div>
            <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700" for="secret">{{
                    $t('walletImport.secret')
                }}</label>
                <div class="mt-1">
                    <textarea
                        id="secret"
                        v-model="secret"
                        class="block w-full resize-none rounded-md border-gray-300 text-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        name="secret"
                        rows="4"
                    />
                </div>
            </div>
            <Disclosure v-slot="{ open }">
                <DisclosureButton
                    class="mt-4 flex w-full justify-between px-0 py-2 text-left text-sm font-medium text-primary-500 focus:outline-none"
                >
                    <span>{{ $t('walletImport.advanced') }}</span>
                    <ChevronUpIcon :class="open ? '' : 'rotate-180 transform'" class="h-5 w-5" />
                </DisclosureButton>
                <DisclosurePanel class="pt-4 pb-2">
                    <div>
                        <label class="block text-sm font-medium text-gray-700" for="walletindex">{{
                            $t('walletImport.addressIndex')
                        }}</label>
                        <div class="mt-1">
                            <input
                                id="walletindex"
                                v-model="walletIndex"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                name="walletindex"
                                type="number"
                            />
                        </div>
                    </div>
                </DisclosurePanel>
            </Disclosure>
            <div class="mt-4 flex">
                <button class="flex-1 rounded-md bg-blue-600 px-4 py-2 uppercase text-white" @click="importWallet">
                    {{ $t('walletImport.CTA') }}
                </button>
            </div>
        </div>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { ArrowLeftIcon, ChevronUpIcon } from '@heroicons/vue/outline';
    import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { Keypair } from 'stellar-sdk';
    import { Wallet, wallets } from '@/service/walletService';
    import { getPkidClient, PkidWallet } from '@/service/pkidService';
    import { PkidWalletTypes } from '@/service/initializationService';
    import { bytesToHex } from '@/util/crypto';
    import { WalletKeyPair } from '@/lib/WalletKeyPair';

    const walletIndex = ref(0);

    const router = useRouter();

    const name = ref();
    const secret = ref();

    const importWallet = async () => {
        const importedKeypair = Keypair.fromSecret(secret.value);
        wallets.value.push({
            keyPair: new WalletKeyPair(bytesToHex(importedKeypair.rawSecretKey())),
            name: name.value,
            meta: {
                index: -1,
                type: PkidWalletTypes.Imported,
                chain: 'stellar',
            },
        });

        const pkidWallets: PkidWallet[] = wallets.value.map(
            (wallet: Wallet): PkidWallet => ({
                type: wallet.meta.type,
                name: wallet.name,
                index: wallet.meta.index,
                seed: bytesToHex(wallet.keyPair.getStellarKeyPair().rawSecretKey()),
                chain: 'stellar',
            })
        );

        const pkid = getPkidClient();
        await pkid.setDoc('purse', pkidWallets, true);

        await router.replace({ name: 'walletList' });
    };
</script>
<style scoped></style>
