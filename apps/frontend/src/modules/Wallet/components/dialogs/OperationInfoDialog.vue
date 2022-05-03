<template>
    <Dialog as="div" open>
        <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="h-screen w-full bg-blue-200">
                <MainLayout>
                    <template #header>
                        <PageHeader>
                            <h1>Operation details</h1>

                            <template #after>
                                <XIcon class="h-8 cursor-pointer text-gray-600" @click="$emit('close')" />
                            </template>
                        </PageHeader>
                    </template>

                    <div class="p-4">
                        <p class="mt-4 text-sm font-semibold">From</p>
                        <p class="mb-2 truncate text-gray-500">
                            {{ operation.from }}
                        </p>
                        <hr />
                        <p class="mt-4 text-sm font-semibold">To</p>
                        <p class="mb-2 truncate text-gray-500">
                            {{ operation.to }}
                        </p>
                        <hr />
                        <p class="mt-4 text-sm font-semibold">Type</p>
                        <div
                            class="mb-2 truncate text-gray-500"
                            v-if="wallet.keyPair.getStellarKeyPair().publicKey() === operation.from"
                        >
                            Payment
                        </div>
                        <div v-else-if="wallet.keyPair.getStellarKeyPair().publicKey() === operation.to">Receive</div>
                        <div v-else>Unknown</div>
                        <hr />
                        <p class="mt-4 text-sm font-semibold">Amount</p>
                        <p class="mb-2 truncate text-gray-500">
                            {{ operation.amount }}
                        </p>
                        <p class="mt-4 text-sm font-semibold">Asset</p>
                        <p class="mb-2 truncate text-gray-500">
                            {{ operation.asset_code }}
                        </p>
                        <hr />
                        <hr />
                        <p class="mt-4 text-sm font-semibold">Created at</p>
                        <p class="mb-2 truncate text-gray-500">
                            {{ operation.created_at }}
                        </p>
                        <hr />
                        <p class="mt-4 text-sm font-semibold">Transaction hash</p>
                        <p class="mb-2 truncate text-gray-500">
                            {{ operation.transaction_hash }}
                        </p>
                    </div>
                </MainLayout>
            </div>
        </div>
    </Dialog>
</template>

<script lang="ts" setup>
    import { Dialog } from '@headlessui/vue';
    import { XIcon } from '@heroicons/vue/solid';
    import MainLayout from '@/modules/Misc/layouts/MainLayout.vue';
    import PageHeader from '@/modules/Misc/components/header/PageHeader.vue';
    import { ServerApi } from 'stellar-sdk';
    import { Wallet } from '@/modules/Wallet/services/walletService';
    import { inject } from 'vue';

    const wallet: Wallet = <Wallet>inject('wallet');

    interface IProps {
        operation: ServerApi.OperationRecord;
    }

    const { operation } = defineProps<IProps>();
</script>
