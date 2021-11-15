<template>
    <div class="py-2 text-sm tracking-tight group">
        <div class="hidden group-hover:block">{{ operation.type }}</div>
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
    import { ServerApi } from 'stellar-sdk';
    import OperationRecord = ServerApi.OperationRecord;

    interface IProps {
        operation: OperationRecord;
        wallet: Wallet;
    }

    const { operation, wallet } = defineProps<IProps>();
</script>

<style scoped></style>
