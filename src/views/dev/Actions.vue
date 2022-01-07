<template>
    <div class="p-4">
        <CTA @click="addWallet()"> add Wallet</CTA>
        <CTA @click="addNotification()"> add Wallet</CTA>
    </div>
</template>

<script lang="ts" setup>
    import { Wallet, wallets } from '@/service/walletService';
    import { PkidWalletTypes } from '@/service/initializationService';
    import { WalletKeyPair } from '@/lib/WalletKeyPair';
    import { bytesToHex } from '@/util/crypto';
    import { Keypair } from 'stellar-sdk';
    import { getPkidClient, PkidWallet } from '@/service/pkidService';

    const addWallet = async () => {
        const keyPair = Keypair.random();
        const wallet: Wallet = {
            keyPair: new WalletKeyPair(bytesToHex(keyPair.rawSecretKey())),
            meta: { chain: 'stellar', type: PkidWalletTypes.Native },
            name: 'etstset',
        };
        wallets.value.push(wallet);

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
    };
</script>

<style scoped></style>
