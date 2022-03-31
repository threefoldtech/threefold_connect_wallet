<template>
    <div class="flex flex-col gap-2 p-4">
        <CTA @click="addWallet()"> add Wallet</CTA>
        <CTA @click="clearPkidPurse()"> clear PkidPurse</CTA>
        <CTA @click="activate()"> activate</CTA>
        <CTA @click="addNote()"> add Notification</CTA>
        <hr />
        <CTA @click="deleteUnwantedFarms()">delete <span class="text-bold">unwanted</span> Farms</CTA>
        <hr />

        <CTA @click="clearCache()"> Clear cache</CTA>

        <CTA @click="clearContacts()"> Delete contacts</CTA>

        <Disclosure as="div" class="mt-2" v-slot="{ open }">
            <DisclosureButton
                class="flex w-full justify-between rounded-lg bg-red-600 px-4 py-2 text-left text-sm font-medium text-white focus:outline-none focus-visible:ring focus-visible:ring-red-500 focus-visible:ring-opacity-75"
            >
                <span>Delete all farms(every farm connected to my wallets)?</span>
                <ChevronUpIcon :class="open ? 'rotate-180 transform' : ''" class="h-5 w-5 text-white" />
            </DisclosureButton>
            <DisclosurePanel class="mt-2 rounded-md bg-red-300 px-4 pt-4 pb-2 text-sm text-gray-500">
                <CTA @click="deleteAllFarms()">I am sure and i will not complain to the devs</CTA>
            </DisclosurePanel>
        </Disclosure>
    </div>
</template>

<script lang="ts" setup>
    import { balances, saveWallets, Wallet, wallets } from '@/service/walletService';
    import { PkidWalletTypes } from '@/service/initializationService';
    import { IWalletKeyPair, WalletKeyPairBuilder } from '@/lib/WalletKeyPair';
    import { bytesToHex, hexToBytes } from '@/util/crypto';
    import { Keypair } from 'stellar-sdk';
    import { getPkidClient } from '@/service/pkidService';
    import { nanoid } from 'nanoid';
    import { addNotification, NotificationType } from '@/service/notificationService';
    import { Keyring } from '@polkadot/api';
    import {
        activationServiceForSubstrate,
        getSubstrateApi,
        getTwinId,
        submitExtrensic,
    } from '@/service/substrateService';
    import { KeyringPair } from '@polkadot/keyring/types';
    import { toNumber } from 'lodash';
    import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
    import CTA from '@/components/global/CTA.vue';
    import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/solid';

    const addWallet = async () => {
        const keyPair = Keypair.random();

        const walletKeyPairBuilder = new WalletKeyPairBuilder();
        walletKeyPairBuilder.addRandomSeed();

        const wallet: Wallet = {
            keyPair: <IWalletKeyPair>walletKeyPairBuilder.build(),
            meta: { type: PkidWalletTypes.Native },
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

    const clearContacts = async () => {
        const pkid = getPkidClient();
        await pkid.setDoc('contacts', [], true);
        addNotification(NotificationType.info, 'Cleared contacts');
    };

    const addNote = () => {
        addNotification(
            NotificationType.info,
            'Farm creation on v3 successful',
            'Your farm has been created on Grid v3. Please note that it will take several days for your v2 nodes to be migrated to your v3 farm. Once they have been migrated, you will see them listed under your new v3 Farm.'
        );
        addNotification(NotificationType.success, 'test', 'test subtitle', 3000);
    };

    const deleteUnwantedFarms = async () => {
        addNotification(NotificationType.info, 'Deleting unwanted farms');
        const seeds = wallets.value.map(w => w.keyPair.getSeed());
        const api = await getSubstrateApi();

        const allFarms = (await api.query.tfgridModule.farms.entries()).map(([, farm]) => farm.toJSON());

        console.log('got all farms');
        for (const seed of seeds) {
            const keyring: Keyring = new Keyring({ type: 'ed25519' });
            const bytes = hexToBytes(seed);

            const keyringPair = keyring.addFromSeed(bytes);

            const twinId = toNumber(await getTwinId(keyringPair.address));
            console.log('got twin id', twinId);
            if (twinId === 0) {
                continue;
            }

            //@ts-ignore
            const farm_ids = allFarms.filter(f => toNumber(f.twin_id) === twinId).map(f => f.id);
            console.log({ farm_ids });

            for (const id of farm_ids) {
                addNotification(NotificationType.info, 'Deleting farm', `Farm ${id}`);

                const submittableExtrinsic = api.tx.tfgridModule.deleteFarm(id);

                await submitExtrensic(submittableExtrinsic, keyringPair);

                // wait 1 second
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        addNotification(NotificationType.success, 'Done', 'Deleted unwanted farms');
    };

    const deleteAllFarms = async () => {
        addNotification(NotificationType.info, 'Deleting farms');
        const seeds = wallets.value.map(w => w.keyPair.getSeed());
        const api = await getSubstrateApi();

        const allFarms = (await api.query.tfgridModule.farms.entries()).map(([, farm]) => farm.toJSON());

        console.log('got all farms');
        for (const seed of seeds) {
            const keyring: Keyring = new Keyring({ type: 'sr25519' });
            const bytes = hexToBytes(seed);

            const keyringPair = keyring.addFromSeed(bytes);

            const twinId = toNumber(await getTwinId(keyringPair.address));
            console.log('got twin id', twinId);
            if (twinId === 0) {
                continue;
            }

            //@ts-ignore
            const farm_ids = allFarms.filter(f => toNumber(f.twin_id) === twinId).map(f => f.id);
            console.log({ farm_ids });

            for (const id of farm_ids) {
                addNotification(NotificationType.info, 'Deleting farm', `Farm ${id}`);
                const submittableExtrinsic = api.tx.tfgridModule.deleteFarm(id);

                await submitExtrensic(submittableExtrinsic, keyringPair);

                // wait 1 second
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        addNotification(NotificationType.success, 'Done', 'Deleted farms');
    };

    const clearCache = () => {
        const notToClear = ['override', 'devSeed'];

        const keys = Object.keys(localStorage);

        notToClear.forEach(item => {
            let itemIndex = keys.indexOf(item);
            keys.splice(itemIndex, 1);
        });

        keys.forEach(item => {
            localStorage.removeItem(item);
        });

        addNotification(NotificationType.success, 'Done', 'Cleared cache');
    };
    const activate = async () => {
        await activationServiceForSubstrate('5F4Yb9T5B3rkeTCfCCEAg92V9CFPviC3XikeiBcqMWFrNz5B');
        addNotification(NotificationType.success, 'Done', 'Activated');
    };
</script>

<style scoped></style>
