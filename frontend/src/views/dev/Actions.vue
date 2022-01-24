<template>
    <div class="flex flex-col gap-2 p-4">
        <CTA @click="addWallet()"> add Wallet</CTA>
        <CTA @click="clearPkidPurse()"> clear PkidPurse</CTA>
    </div>
</template>

<script lang="ts" setup>
    import { saveWallets, Wallet, wallets } from '@/service/walletService';
    import { PkidWalletTypes } from '@/service/initializationService';
    import { WalletKeyPair } from '@/lib/WalletKeyPair';
    import { bytesToHex } from '@/util/crypto';
    import { Keypair } from 'stellar-sdk';
    import { getPkidClient } from '@/service/pkidService';
    import router from '@/router';
    import { nanoid } from 'nanoid';

    const addWallet = async () => {
        const keyPair = Keypair.random();
        const wallet: Wallet = {
            keyPair: new WalletKeyPair(bytesToHex(keyPair.rawSecretKey())),
            meta: { chain: 'stellar', type: PkidWalletTypes.Native },
            name: `testWallet-${nanoid()}`,
        };
        wallets.value.push(wallet);
        await saveWallets();
    };
    const clearPkidPurse = async () => {
        const pkid = getPkidClient();
        await pkid.setDoc('purse', false, true);
        window.location.assign('/');
    };
</script>

<style scoped></style>
