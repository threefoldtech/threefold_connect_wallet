<template>
    <div class="break-words">
        {{ wallet.name }} <br />
        {{ wallet.keyPair.getStellarKeyPair().publicKey() }} <br />
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
    import { Wallet } from '@/service/walletService';
    import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
    import { bytesToHex } from '@/util/crypto';
    import { inject } from 'vue';

    const wallet: Wallet = <Wallet>inject('wallet');
</script>

<style scoped></style>
