<template>
    <OperationInfoDialog @close="showOperationDetails = false" v-if="showOperationDetails" :operation="operation">
    </OperationInfoDialog>
    <div class="group py-2 text-sm tracking-tight" @click="showOperationDetails = true">
        <div v-if="operation.type === 'payment'" class="flex items-center justify-between gap-4">
            <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                :class="{
                    'bg-green-600':
                        operation?.to === wallet.keyPair.getStellarKeyPair().publicKey() &&
                        operation?.from !== wallet.keyPair.getStellarKeyPair().publicKey(),
                    'bg-red-600':
                        operation?.from === wallet.keyPair.getStellarKeyPair().publicKey() &&
                        operation?.to !== wallet.keyPair.getStellarKeyPair().publicKey(),
                    'bg-gray-600':
                        operation?.to === wallet.keyPair.getStellarKeyPair().publicKey() &&
                        operation?.from === wallet.keyPair.getStellarKeyPair().publicKey(),
                }"
            >
                <ArrowUpIcon
                    v-if="
                        operation?.to === wallet.keyPair.getStellarKeyPair().publicKey() &&
                        operation?.from !== wallet.keyPair.getStellarKeyPair().publicKey()
                    "
                    class="h-5 w-5 text-white"
                />
                <ArrowDownIcon
                    v-else-if="
                        operation?.from === wallet.keyPair.getStellarKeyPair().publicKey() &&
                        operation?.to !== wallet.keyPair.getStellarKeyPair().publicKey()
                    "
                    class="h-5 w-5 text-white"
                />
                <SwitchVerticalIcon v-else class="h-5 w-5 text-white" />
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
                    {{ operation?.asset_code }} {{ formatCurrency(operation?.amount ?? 0) }}
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
                {{ $t('component.operationInfo.operation.ASSET_ADDED', { asset: operation.asset_code }) }}
            </div>
            <div>
                {{ formatTime(operation.created_at) }}
            </div>
        </div>
        <div class="shrink-0" v-else-if="operation.type === 'create_account'">
            {{ $t('component.operationInfo.operation.ACCOUNT_CREATED') }}
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { Wallet } from '@/modules/Wallet/services/walletService';
    import { XIcon, ArrowUpIcon, ArrowDownIcon, LinkIcon, SwitchVerticalIcon } from '@heroicons/vue/solid';
    import { ServerApi } from 'stellar-sdk';
    import { ref } from 'vue';
    import { formatTime } from '@/modules/Core/utils/time';
    import { formatCurrency } from '@/modules/Currency/utils/formatCurrency';
    import OperationInfoDialog from '@/modules/Wallet/components/dialogs/OperationInfoDialog.vue';

    interface IProps {
        operation: ServerApi.OperationRecord;
        wallet: Wallet;
    }

    const { operation, wallet } = defineProps<IProps>();

    const showOperationDetails = ref<boolean>(false);
</script>

<style scoped></style>
