<template>
    <Dialog v-if="isOpen" as="div" open @close="isOpen = false">
        <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="h-screen w-full bg-blue-200">
                <MainLayout>
                    <template #header>
                        <PageHeader>
                            <h1>Operation info</h1>

                            <template #after>
                                <XIcon class="h-8 text-gray-600 cursor-pointer" @click="isOpen = false" />
                            </template>
                        </PageHeader>
                    </template>
                    <div>
                        <pre class="text-sm break-all whitespace-pre-wrap">{{ operation }}</pre>
                    </div>
                </MainLayout>
            </div>
        </div>
    </Dialog>
    <div class="py-2 text-sm tracking-tight group" @click="isOpen = true">
        <div class="text-red-600">{{ operation.type }}</div>
        <div v-if="operation.type === 'payment'">
            <div class="break-all">
                {{ operation?.from === wallet.keyPair.publicKey() ? operation?.to : operation?.from }}
            </div>
            <div
                :class="{
                    'text-green-600': operation?.from !== wallet.keyPair.publicKey(),
                    'text-red-600': operation?.from === wallet.keyPair.publicKey(),
                }"
            >
                {{ operation?.asset_code }} {{ Number(operation?.amount).toLocaleString() }}
            </div>
            <div>{{ operation?.created_at }}</div>
        </div>
        <div v-else-if="operation.type === 'change_trust'">{{ operation.asset_code }} asset added</div>
        <div v-else-if="operation.type === 'create_account'">account created</div>
    </div>
</template>

<script lang="ts" setup>
    import { Wallet } from '@/service/walletService';
    import { Dialog } from '@headlessui/vue';
    import { XIcon } from '@heroicons/vue/outline';

    import { ServerApi } from 'stellar-sdk';
    import OperationRecord = ServerApi.OperationRecord;
    import { ref } from 'vue';
    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';

    interface IProps {
        operation: OperationRecord;
        wallet: Wallet;
    }

    const { operation, wallet } = defineProps<IProps>();

    const isOpen = ref<boolean>(false);
</script>

<style scoped></style>
