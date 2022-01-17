<template>
    <div class="p-4">
        <CTA @click="addWallet()"> add Wallet</CTA>
        <CTA @click="addNotification()"> add Wallet</CTA>
    </div>
</template>

<script lang="ts" setup>
    import { saveWallets, Wallet, wallets } from '@/service/walletService';
    import { PkidWalletTypes } from '@/service/initializationService';
    import { WalletKeyPair } from '@/lib/WalletKeyPair';
    import { bytesToHex } from '@/util/crypto';
    import { Keypair } from 'stellar-sdk';

    const addWallet = async () => {
        const keyPair = Keypair.random();
        const wallet: Wallet = {
            keyPair: new WalletKeyPair(bytesToHex(keyPair.rawSecretKey())),
            meta: { chain: 'stellar', type: PkidWalletTypes.Native },
            name: 'etstset',
        };
        wallets.value.push(wallet);
        await saveWallets();
    };
    const addNotification = () => {};
</script>

<style scoped></style>
