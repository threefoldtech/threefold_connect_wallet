<template>
    <div class="flex flex-col gap-2 p-4">
        <CTA @click="addWallet()"> add Wallet</CTA>
        <CTA @click="clearPkidPurse()"> clear PkidPurse</CTA>
        <CTA @click="addNote()"> add Notification</CTA>
    </div>
</template>

<script lang="ts" setup>
    import { saveWallets, Wallet, wallets } from '@/service/walletService';
    import { PkidWalletTypes } from '@/service/initializationService';
    import { WalletKeyPair } from '@/lib/WalletKeyPair';
    import { bytesToHex } from '@/util/crypto';
    import { Keypair } from 'stellar-sdk';
    import { getPkidClient } from '@/service/pkidService';
    import { nanoid } from 'nanoid';
    import { addNotification, NotificationType } from '@/service/notificationService';

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

    const addNote = () => {
        addNotification(NotificationType.success, 'test', 'test subtitle', 3000);
    };
</script>

<style scoped></style>
