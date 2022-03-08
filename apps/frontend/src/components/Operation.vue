<template>
    <Dialog v-if="isOpen && false" as="div" open @close="isOpen = false">
        <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="h-screen w-full bg-blue-200">
                <MainLayout>
                    <template #header>
                        <PageHeader>
                            <h1>Operation info</h1>

                            <template #after>
                                <XIcon class="h-8 cursor-pointer text-gray-600" @click="isOpen = false" />
                            </template>
                        </PageHeader>
                    </template>
                    <div class="p-4">
                        <pre class="whitespace-pre-wrap break-all text-sm">{{ operation }}</pre>
                    </div>
                </MainLayout>
            </div>
        </div>
    </Dialog>
    <div class="group py-2 text-sm tracking-tight" @click="isOpen = true">
        <div v-if="operation.type === 'payment'" class="flex items-center justify-between gap-4">
            <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                :class="{
                    'bg-green-600': operation?.from !== wallet.keyPair.getStellarKeyPair().publicKey(),
                    'bg-red-600': operation?.from === wallet.keyPair.getStellarKeyPair().publicKey(),
                }"
            >
                <ArrowUpIcon
                    v-if="operation?.from !== wallet.keyPair.getStellarKeyPair().publicKey()"
                    class="h-5 w-5 text-white"
                />
                <ArrowDownIcon v-else class="h-5 w-5 text-white" />
            </div>
            <div class="flex flex-1 flex-col overflow-hidden">
                <div class="overflow-hidden overflow-ellipsis text-ellipsis">
                    {{
                        operation?.from === wallet.keyPair.getStellarKeyPair().publicKey()
                            ? operation?.to
                            : operation?.from
                    }}
                </div>
                <div
                    :class="{
                        'text-green-600': operation?.from !== wallet.keyPair.getStellarKeyPair().publicKey(),
                        'text-red-600': operation?.from === wallet.keyPair.getStellarKeyPair().publicKey(),
                    }"
                >
                    {{ operation?.asset_code }} {{ Number(operation?.amount).toLocaleString() }}
                </div>
            </div>
            <div class="shrink-0">
                {{ formatTime(operation.created_at) }}
            </div>
        </div>
        <div v-else-if="operation.type === 'change_trust'" class="flex items-center justify-between gap-4">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
                <LinkIcon class="h- w-5 text-white" />
            </div>
            <div class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {{ operation.asset_code }} asset added
            </div>
            <div>
                {{ formatTime(operation.created_at) }}
            </div>
        </div>
        <div class="shrink-0" v-else-if="operation.type === 'create_account'">account created</div>
    </div>
</template>

<script lang="ts" setup>
    import { Wallet } from '@/service/walletService';
    import { Dialog } from '@headlessui/vue';
    import { XIcon, ArrowUpIcon, ArrowDownIcon, LinkIcon } from '@heroicons/vue/solid';

    import { ServerApi } from 'stellar-sdk';
    import OperationRecord = ServerApi.OperationRecord;
    import { ref } from 'vue';
    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { formatTime } from '../util/time';

    interface IProps {
        operation: OperationRecord;
        wallet: Wallet;
    }

    const { operation, wallet } = defineProps<IProps>();

    const isOpen = ref<boolean>(false);
</script>

<style scoped></style>
