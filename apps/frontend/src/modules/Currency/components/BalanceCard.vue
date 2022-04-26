<template>
    <div class="rounded-2xl border p-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <AssetIcon :name="balance.name" />

                <div class="shrink-0">
                    {{ balance.name }}
                    <small class="capitalize text-gray-400"> {{ $t(`chain.${balance.type}`) }} </small>
                </div>
            </div>
            <div>
                {{ formatCurrency(balance.amount) }}
            </div>
        </div>
        <hr class="my-2" v-if="$slots['actions']" />
        <slot name="actions" />
    </div>
</template>

<script lang="ts" setup>
    import { AssetBalance } from '@/modules/Wallet/services/walletService';
    import AssetIcon from '@/modules/Currency/components/AssetIcon.vue';
    import { formatCurrency } from '@/modules/Currency/utils/formatCurrency';
    interface IProps {
        balance: AssetBalance;
    }

    const { balance } = defineProps<IProps>();
</script>

<style scoped></style>
