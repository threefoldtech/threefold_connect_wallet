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
                <div class="pt-2 text-red-500 text-xs" v-if="walletNameError">
                    {{ $t(`walletImport.error.${walletNameError}`) }}
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
                        <label class="block text-sm font-medium text-gray-700" for="walletindex"
                            >{{ $t('walletImport.addressIndex') }}
                            <small class="text-primary-500" @click="walletIndex = 0">{{
                                $t('walletImport.addressIndexInfo')
                            }}</small></label
                        >
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
    import { saveWallets, Wallet, wallets } from '@/service/walletService';
    import { getPkidClient, PkidWallet } from '@/service/pkidService';
    import { PkidWalletTypes } from '@/service/initializationService';
    import { bytesToHex } from '@/util/crypto';
    import { IWalletKeyPair, WalletKeyPairBuilder } from '@/lib/WalletKeyPair';
    import { getEntropyFromPhrase } from 'mnemonicconversion2924';
    import { entropyToMnemonic, mnemonicToEntropy } from '@jimber/simple-bip39';
    import { addNotification, NotificationType } from '@/service/notificationService';
    import { calculateWalletEntropyFromAccount } from '@jimber/stellar-crypto';
    import { validateWalletName } from '@/util/validate';

    const walletIndex = ref(0);

    const router = useRouter();

    const name = ref<string>('');
    const secret = ref();

    const walletNameError = ref<string>();

    const importWallet = async () => {
        const walletKeyPairBuilder = new WalletKeyPairBuilder();
        const errorNameMessage = validateWalletName(name.value, null);

        if (errorNameMessage) {
            walletNameError.value = errorNameMessage;
            return;
        }

        if (!secret.value) {
            addNotification(NotificationType.error, 'Invalid secret', 'Please enter a valid secret', 5000);
            return;
        }

        // Native seed
        if (secret.value.length === 64) {
            try {
                walletKeyPairBuilder.addSeed(secret.value);
            } catch (e) {
                addNotification(NotificationType.error, 'Invalid secret', 'Please enter a valid secret', 5000);
                return;
            }
        }

        // Stellar secret
        if (secret.value.length === 56) {
            try {
                const importedKeypair = Keypair.fromSecret(secret.value);
                const entropyBytes = importedKeypair.rawSecretKey();
                walletKeyPairBuilder.addSeed(bytesToHex(entropyBytes));
            } catch (e) {
                addNotification(NotificationType.error, 'Invalid stellar secret', 'Please enter a valid secret', 5000);
                return;
            }
        }

        // Revine secret
        if (secret.value.split(' ').length === 29) {
            try {
                const entropyBytes = getEntropyFromPhrase(secret.value.split(' '));
                const mnemonic = entropyToMnemonic(entropyBytes);
                const entropy = calculateWalletEntropyFromAccount(mnemonic, walletIndex.value);

                walletKeyPairBuilder.addSeed(bytesToHex(entropy));
            } catch (e) {
                addNotification(NotificationType.error, 'Invalid revine secret', 'Please enter a valid secret', 5000);
                return;
            }
        }

        // Stellar 24 words
        if (secret.value.split(' ').length === 24) {
            try {
                const entropy = calculateWalletEntropyFromAccount(secret.value, walletIndex.value);
                walletKeyPairBuilder.addSeed(bytesToHex(entropy));
            } catch (e) {
                addNotification(NotificationType.error, 'Invalid seedphrase', 'Please enter a valid seedphrase', 5000);
                return;
            }
        }

        // Substrate 12 words
        if (secret.value.split(' ').length === 12) {
            try {
                walletKeyPairBuilder.add12WordsSeed(secret.value);
            } catch (e) {
                addNotification(
                    NotificationType.error,
                    'Invalid substrate seedphrase',
                    'Please enter a valid seedphrase',
                    5000
                );
                return;
            }
        }

        let walletKeyPair: IWalletKeyPair;
        try {
            walletKeyPair = <IWalletKeyPair>walletKeyPairBuilder.build();
        } catch (e) {
            addNotification(NotificationType.error, 'Invalid secret', 'Please enter a valid secret', 5000);
            return;
        }

        if (!walletKeyPair) {
            addNotification(NotificationType.error, 'Invalid secret', 'Please enter a valid secret', 5000);
            return;
        }

        //check if seed is already in use
        const foundWallet = wallets.value.find(w => w.keyPair.getSeed() === walletKeyPair.getSeed());
        if (foundWallet) {
            addNotification(NotificationType.error, 'Wallet already exists', 'Please enter a different secret', 5000);
            return;
        }

        wallets.value.push({
            keyPair: walletKeyPair,
            name: name.value,
            meta: {
                index: -1,
                type: PkidWalletTypes.Imported,
            },
        });

        await saveWallets();

        await router.replace({ name: 'walletList' });
    };
</script>
<style scoped></style>
