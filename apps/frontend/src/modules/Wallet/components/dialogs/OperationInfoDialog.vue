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
                        <pre class="whitespace-pre-wrap break-all text-sm">{{ operation }}</pre>
                    </div>

                    <div>From</div>
                    <div>{{ operation.from }}</div>
                    <div>To</div>
                    <div>{{ operation.to }}</div>
                    <div>Amount</div>
                    <div>{{ operation.amount }}</div>
                    <div>Created at</div>
                    <div>{{ operation.created_at }}</div>
                    <div>Tx hash</div>
                    <div>{{ operation.transaction_hash }}</div>
                    <div>Asset</div>
                    <div>{{ operation.asset_code }}</div>
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

    interface IProps {
        operation: ServerApi.OperationRecord;
    }

    const { operation } = defineProps<IProps>();
</script>
