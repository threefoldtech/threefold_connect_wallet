<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <ArrowLeftIcon @click="$router.push({ name: 'walletList' })" />
                </template>
                <h1>Import wallet</h1>
            </PageHeader>
        </template>
        <div class="p-4">
            <div>
                <label class="block text-sm font-medium text-gray-700" for="Wallet Name">Wallet Name</label>
                <div class="mt-1">
                    <input
                        id="Wallet Name"
                        v-model="name"
                        class="
                            shadow-sm
                            focus:ring-primary-500 focus:border-primary-500
                            block
                            w-full
                            sm:text-sm
                            border-gray-300
                            rounded-md
                        "
                        name="Wallet Name"
                        type="text"
                    />
                </div>
            </div>
            <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700" for="secret">Secret</label>
                <div class="mt-1">
                    <textarea
                        id="secret"
                        v-model="secret"
                        class="
                            shadow-sm
                            focus:ring-primary-500 focus:border-primary-500
                            block
                            w-full
                            border-gray-300
                            rounded-md
                            resize-none
                            text-lg
                        "
                        name="secret"
                        rows="4"
                    />
                </div>
            </div>
            <Disclosure v-slot="{ open }">
                <DisclosureButton
                    class="
                        px-0
                        flex
                        justify-between
                        w-full
                        py-2
                        text-sm
                        font-medium
                        text-left text-primary-500
                        focus:outline-none
                        mt-4
                    "
                >
                    <span>Advanced</span>
                    <ChevronUpIcon :class="open ? '' : 'transform rotate-180'" class="w-5 h-5" />
                </DisclosureButton>
                <DisclosurePanel class="pt-4 pb-2">
                    <div>
                        <label class="block text-sm font-medium text-gray-700" for="walletindex">Address index</label>
                        <div class="mt-1">
                            <input
                                id="walletindex"
                                v-model="walletIndex"
                                class="
                                    shadow-sm
                                    focus:ring-primary-500 focus:border-primary-500
                                    block
                                    w-full
                                    sm:text-sm
                                    border-gray-300
                                    rounded-md
                                "
                                name="walletindex"
                                type="number"
                            />
                        </div>
                    </div>
                </DisclosurePanel>
            </Disclosure>
            <div class="mt-4 flex">
                <button class="px-4 py-2 text-white bg-blue-600 rounded-md flex-1" @click="importWallet">
                    Import Wallet
                </button>
            </div>
        </div>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { ArrowLeftIcon, ChevronUpIcon } from '@heroicons/vue/solid';
    import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { Keypair } from 'stellar-sdk';
    import { Wallet, wallets } from '@/service/walletService';
    import { getPkidClient, PkidWallet } from '@/service/pkidService';
    import { PkidWalletTypes } from '@/service/initializationService';
    import { bytesToHex } from '@/util/crypto';

    const walletIndex = ref(0);

    const router = useRouter();

    const name = ref();
    const secret = ref();

    const importWallet = async () => {
        const importedKeypair = Keypair.fromSecret(secret.value);
        wallets.value.push({
            keyPair: importedKeypair,
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
                seed: bytesToHex(wallet.keyPair.rawSecretKey()),
                chain: 'stellar',
            })
        );

        const pkid = getPkidClient();
        await pkid.setDoc('purse', pkidWallets, true);

        await router.replace({ name: 'walletList' });
    };
</script>
<style scoped></style>
