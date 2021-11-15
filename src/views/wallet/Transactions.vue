<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <ArrowLeftIcon @click="router.push({ name: 'walletList' })" />
                </template>
                <h1>{{ wallet.name }}</h1>
                <h2 class="text-xs font-normal text-gray-500">{{ wallet.name }}@{{ userInitialized }}</h2>
            </PageHeader>
        </template>
        <template #navigation>
            <BottomWalletNav />
        </template>
        <div class="p-4 space-y-2">
            <div>
                <p>Filter by currency</p>
                <Listbox v-model="selectedAsset">
                    <div class="relative mt-1">
                        <ListboxButton
                            class="
                                relative
                                w-full
                                py-2
                                pl-3
                                pr-10
                                text-left
                                bg-white
                                rounded-lg
                                border-2 border-gray-200
                                cursor-default
                                focus:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-opacity-75
                                focus-visible:ring-white
                                focus-visible:ring-offset-orange-300
                                focus-visible:ring-offset-2
                                focus-visible:border-indigo-500
                                sm:text-sm
                            "
                        >
                            <span class="block truncate">{{ selectedAsset }}</span>
                            <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <SelectorIcon aria-hidden="true" class="w-5 h-5 text-gray-400" />
                            </span>
                        </ListboxButton>

                        <transition
                            leave-active-class="transition duration-100 ease-in"
                            leave-from-class="opacity-100"
                            leave-to-class="opacity-0"
                        >
                            <ListboxOptions
                                class="
                                    absolute
                                    w-full
                                    py-1
                                    mt-1
                                    overflow-auto
                                    text-base
                                    bg-white
                                    rounded-md
                                    max-h-60
                                    border-2 border-gray-50
                                    shadow-lg
                                    focus:outline-none
                                    sm:text-sm
                                "
                            >
                                <ListboxOption
                                    v-for="asset in assets"
                                    :key="asset"
                                    v-slot="{ active, selected }"
                                    :value="asset"
                                    as="template"
                                >
                                    <li
                                        :class="[
                                            active ? 'text-amber-900 bg-amber-100' : 'text-gray-900',
                                            'cursor-default select-none relative py-2 pl-10 pr-4',
                                        ]"
                                    >
                                        <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                                            asset
                                        }}</span>
                                        <span
                                            v-if="selected"
                                            class="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600"
                                        >
                                            <CheckIcon aria-hidden="true" class="w-5 h-5" />
                                        </span>
                                    </li>
                                </ListboxOption>
                            </ListboxOptions>
                        </transition>
                    </div>
                </Listbox>
            </div>
            <div>
                <div class="divide-y-2">
                    <Operation v-for="operation in computedOperations" :operation="operation" :wallet="wallet" />
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import BottomWalletNav from '@/components/nav/BottomWalletNav.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import ArrowLeftIcon from '@heroicons/vue/solid/ArrowLeftIcon';
    import { useRoute, useRouter } from 'vue-router';
    import {
        Balance,
        balances,
        getOperations,
        handleOperationRecordPage,
        operations,
        transactions,
        Wallet,
        wallets,
    } from '@/service/walletService';
    import { computed, ComputedRef, ref } from 'vue';
    import { Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue';
    import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid';
    import { Horizon, Server, ServerApi } from 'stellar-sdk';
    import flagsmith from 'flagsmith';
    import Operation from '@/components/Operation.vue';
    import { userInitialized } from '@/service/cryptoService';

    const router = useRouter();
    const route = useRoute();

    const wallet: Wallet = <Wallet>wallets.value.find(w => w.keyPair.publicKey() === route.params.wallet);
    const balance: ComputedRef<Balance | undefined> = computed(() =>
        balances.value.find(b => b.id === wallet.keyPair.publicKey())
    );

    const allowedAssets: string[] = JSON.parse(<string>flagsmith.getValue('currencies')).map((a: any) => a.asset_code);

    const assets = computed(() => {
        const values = balance.value?.assets.map(a => a.name).filter(a => allowedAssets.indexOf(a) !== -1) || [];
        return ['All', ...values];
    });
    const selectedAsset = ref(assets.value.find(a => a === route.params?.assetCode) || assets.value[0]);

    const init = async () => {
        const page = await getOperations(wallet);
        handleOperationRecordPage(page, wallet);
    };
    const computedOperations = computed(() => {
        return (
            operations.value
                .find(o => o.id === wallet.keyPair.publicKey())
                ?.operations.filter(o => {
                    return selectedAsset.value === 'All' || (<any>o)?.asset_code === selectedAsset.value;
                }) || []
        );
    });
    init();
</script>

<style scoped></style>
