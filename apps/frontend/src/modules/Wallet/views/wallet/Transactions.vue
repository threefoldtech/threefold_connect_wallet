<template>
    <div class="relative bg-primary-600">
        <div class="mx-auto max-w-7xl py-3 px-3 sm:px-6 lg:px-8">
            <div class="pr-16 sm:px-16 sm:text-center">
                <p class="font-medium text-white">
                    <span class="md:inline">{{ $t('wallet.transactions.tfchainHistoryBanner') }}</span>
                </p>
            </div>
        </div>
    </div>
    <div class="space-y-2 p-4">
        <div>
            <p>{{ $t('wallet.transactions.filterTitle') }}</p>
            <Listbox v-model="selectedAsset">
                <div class="relative mt-1">
                    <ListboxButton
                        class="relative w-full cursor-default rounded-lg border-2 border-gray-200 bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
                    >
                        <span class="block truncate">{{ $t(`currency.short.${selectedAsset}`) }}</span>
                        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <SelectorIcon aria-hidden="true" class="h-5 w-5 text-gray-400" />
                        </span>
                    </ListboxButton>

                    <transition
                        leave-active-class="transition duration-100 ease-in"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                    >
                        <ListboxOptions
                            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md border-2 border-gray-50 bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm"
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
                                        active ? 'bg-amber-100 text-amber-900' : 'text-gray-900',
                                        'relative cursor-default select-none py-2 pl-10 pr-4',
                                    ]"
                                >
                                    <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">
                                        {{ $t(`currency.short.${asset}`) }}
                                    </span>
                                    <span
                                        v-if="selected"
                                        class="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600"
                                    >
                                        <CheckIcon aria-hidden="true" class="h-5 w-5" />
                                    </span>
                                </li>
                            </ListboxOption>
                        </ListboxOptions>
                    </transition>
                </div>
            </Listbox>
        </div>
        <div>
            <div>
                <template v-for="(operation, index) in computedOperations">
                    <div class="ml-4 h-4 w-0.5 bg-slate-200" v-if="index !== 0"></div>
                    <Operation :operation="operation" :wallet="wallet" />
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { useRoute } from 'vue-router';
    import {
        balances,
        getOperations,
        handleOperationRecordPage,
        operations,
    } from '@/modules/Wallet/services/walletService';
    import { computed, ComputedRef, inject, ref } from 'vue';
    import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue';
    import { CheckIcon, SelectorIcon } from '@heroicons/vue/outline';
    import flagsmith from 'flagsmith';
    import Operation from '@/modules/Transfer/components/Operation.vue';
    import { ServerApi } from 'stellar-sdk';
    import { NetworkError } from 'stellar-sdk/lib/errors';
    import { IBalance } from 'shared-types';
    import { IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';

    const route = useRoute();

    const wallet: IWallet = <IWallet>inject('wallet');
    const balance: ComputedRef<IBalance | undefined> = computed(() =>
        balances.value.find(b => b.id === wallet.keyPair.getBasePublicKey())
    );

    const allowedAssets: string[] = JSON.parse(<string>flagsmith.getValue('currencies')).map((a: any) => a.asset_code);

    const assets = computed(() => {
        const values = balance.value?.assets.map(a => a.name).filter(a => allowedAssets.indexOf(a) !== -1) || [];
        return ['all', ...values].filter((v, i, a) => a.indexOf(v) === i); // @todo: enable chains per asset
    });
    const selectedAsset = ref(assets.value.find(a => a === route.params?.assetCode) || assets.value[0]);

    const init = async () => {
        let page: ServerApi.CollectionPage<ServerApi.OperationRecord>;

        try {
            page = await getOperations(wallet);
        } catch (error) {
            if ((<NetworkError>error)?.response?.status === 404) {
                return;
            }
            throw error;
        }

        handleOperationRecordPage(page, wallet);
    };
    const computedOperations = computed(() => {
        return (
            operations.value
                .find(o => o.id === wallet.keyPair.getStellarKeyPair().publicKey())
                ?.operations.filter(o => {
                    return selectedAsset.value === 'all' || (<any>o)?.asset_code === selectedAsset.value;
                })
                .reverse() || []
        );
    });
    init();
</script>

<style scoped></style>
