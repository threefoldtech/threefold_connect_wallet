`
<template>
    <div class="break-words p-2">
        <div>
            <label class="block text-sm font-medium text-gray-700" for="name">Name</label>
            <div class="mt-1">
                <input
                    id="name"
                    :value="wallet.name"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    name="name"
                    type="text"
                    @change="updateWalletName"
                />
            </div>
        </div>
        <div class="mt-2">
            <code class="block border-2 border-slate-500 p-2">{{
                wallet.keyPair.getStellarKeyPair().publicKey()
            }}</code>
            <code class="mt-2 block border-2 border-slate-500 p-2">{{
                wallet.keyPair.getSubstrateKeyring().address
            }}</code>
        </div>
        <Disclosure v-slot="{ open }" as="div" class="flex flex-col">
            <DisclosureButton
                class="mt-2 flex grow rounded-md bg-primary-100 px-4 py-2 py-2 text-left text-sm font-medium text-primary-500 focus:outline-none"
            >
                <ChevronUpIcon v-if="open" class="-ml-1 mr-2 h-5 w-5" />
                <ChevronDownIcon v-if="!open" class="-ml-1 mr-2 h-5 w-5" />
                <span>Show Stellar Secret</span>
            </DisclosureButton>
            <DisclosurePanel class="mt-2 block border-2 border-slate-500 p-2" as="code">
                {{ wallet.keyPair.getStellarKeyPair().secret() }} <br
            /></DisclosurePanel>
        </Disclosure>
        <Disclosure v-slot="{ open }" as="div" class="flex flex-col">
            <DisclosureButton
                class="mt-2 flex grow rounded-md bg-primary-100 px-4 py-2 py-2 text-left text-sm font-medium text-primary-500 focus:outline-none"
            >
                <ChevronUpIcon v-if="open" class="-ml-1 mr-2 h-5 w-5" />
                <ChevronDownIcon v-if="!open" class="-ml-1 mr-2 h-5 w-5" />
                <span>Show entropy in hex</span>
            </DisclosureButton>
            <DisclosurePanel class="mt-2 block border-2 border-slate-500 p-2" as="code">
                {{ wallet.keyPair.getSeed() }} <br
            /></DisclosurePanel>
        </Disclosure>

        <div class="mt-2 flex">
            <button
                v-if="!showDeleteWalletConfirmation"
                :disabled="wallet.meta.type === PkidWalletTypes.Native"
                class="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-500 focus:disabled:ring-0"
                type="button"
                @click="showDeleteWalletConfirmation = true"
            >
                <TrashIcon aria-hidden="true" class="-ml-1 mr-2 h-5 w-5" />
                Delete
            </button>
            <button
                v-if="showDeleteWalletConfirmation"
                class="inline-flex items-center rounded-md border border-transparent bg-red-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
                type="button"
                @click="deleteWallet"
            >
                I agree to delete my wallet
            </button>
            <button
                v-if="showDeleteWalletConfirmation"
                class="inline-flex flex-1 items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2"
                type="button"
                @click="showDeleteWalletConfirmation = false"
            >
                Cancel
            </button>
        </div>

        <div class="mt-2">
            <button class="rounded-md bg-blue-200 px-4 py-2" @click="testSend">test</button>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { addOrUpdateWallet, saveWallets, Wallet } from '@/service/walletService';
    import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
    import { computed, inject, ref } from 'vue';
    import { getSubstrateApi } from '@/service/substrateService';
    import { TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/solid';
    import { PkidWalletTypes } from '@/service/initializationService';
    import { addNotification, NotificationType } from '../../service/notificationService';
    import { sendTokens } from '../../service/substrateService';

    const showDeleteWalletConfirmation = ref(false);
    const wallet: Wallet = <Wallet>inject('wallet');

    const test = computed(async () => {
        const api = await getSubstrateApi();
        return await api.query.system.account(wallet.keyPair.getSubstrateKeyring().publicKey);
    });

    const data = ref();

    const init = async () => {
        const api = await getSubstrateApi();
        data.value = await api.query.system.account(wallet.keyPair.getSubstrateKeyring().publicKey);
    };
    init();

    const updateWalletName = (e: Event) => {
        const target: HTMLInputElement | undefined = <HTMLInputElement>e?.target;
        if (!target) return;
        const newRawName = target?.value;
        if (!newRawName) return;

        //@todo: validate name
        //@todo: add notification
        //@todo: maby add confirm dialog

        const newName = newRawName.trim();

        wallet.name = `${newName}`;
        addOrUpdateWallet(wallet);

        saveWallets();
    };

    const deleteWallet = () => {
        addNotification(NotificationType.error, 'not implemented yet', undefined, 2000);
    };

    const testSend = () => {
        console.log(wallet);
        sendTokens(wallet.keyPair.getSubstrateKeyring(), '5DiwPcPzCmj3i4TFFUtXfb4wUk8h5YapMuz6qnqzDL914EbL');
    };
</script>

<style scoped></style>
`
