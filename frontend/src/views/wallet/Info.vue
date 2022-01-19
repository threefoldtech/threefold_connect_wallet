`
<template>
    <div class="break-words">
        {{ wallet.name }} <br />
        <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
            <div class="mt-1">
                <input
                    type="text"
                    name="name"
                    id="name"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    :value="wallet.name"
                    @change="updateWalletName"
                />
            </div>
        </div>
        {{ wallet.keyPair.getStellarKeyPair().publicKey() }} <br />
        {{ wallet.keyPair.getSubstrateKeyring().address }} <br />
        <Disclosure v-slot="{ open }">
            <DisclosureButton
                class="px-4 py-2 flex justify-between py-2 text-sm font-medium text-left text-primary-500 focus:outline-none mt-4 bg-primary-100"
            >
                <span>Show Stellar Secret</span>
            </DisclosureButton>
            <DisclosurePanel class="pt-4 pb-2">
                {{ wallet.keyPair.getStellarKeyPair().secret() }} <br
            /></DisclosurePanel>
        </Disclosure>
        <Disclosure v-slot="{ open }">
            <DisclosureButton
                class="px-4 py-2 flex justify-between py-2 text-sm font-medium text-left text-primary-500 focus:outline-none mt-4 bg-primary-100"
            >
                <span>Show entropy in hex</span>
            </DisclosureButton>
            <DisclosurePanel class="pt-4 pb-2">
                {{ bytesToHex(wallet.keyPair.getStellarKeyPair().rawSecretKey()) }} <br />
                {{ wallet.keyPair.getSeed() }} <br />
            </DisclosurePanel>
        </Disclosure>
    </div>
</template>

<script lang="ts" setup>
    import { saveWallets, addOrUpdateWallet, Wallet } from '@/service/walletService';
    import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
    import { bytesToHex } from '@/util/crypto';
    import { computed, inject, ref } from 'vue';
    import { getSubstrateApi } from '@/service/substrateService';

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

        wallet.name = newName;
        addOrUpdateWallet(wallet);

        saveWallets();
    };
</script>

<style scoped></style>
`
