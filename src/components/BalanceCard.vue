<template>
    <div class="rounded-2xl border p-4">
        <div class="flex justify-between">
            <div>
                {{ balance.name }} <small class="text-gray-400">{{ balance.type }}</small>
            </div>
            <div>
                {{
                    balance.amount.toLocaleString(undefined, { maximumFractionDigits: 6, minimumSignificantDigits: 4 })
                }}
            </div>
        </div>
        <hr class="my-2" v-if="$slots['actions']" />
        <slot name="actions" />
    </div>
</template>

<script lang="ts" setup>
    import { AssetBalance } from '@/service/walletService';

    interface IProps {
        balance: AssetBalance;
    }

    const { balance } = defineProps<IProps>();
</script>

<style scoped></style>
