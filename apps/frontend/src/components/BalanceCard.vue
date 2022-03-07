<template>
    <div class="rounded-2xl border p-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <AssetIcon :name="balance.name" />

                <div class="shrink-0">
                    {{ balance.name }}
                    <small class="text-gray-400">{{ balance.type.replace('substrate', 'TFChain') }}</small>
                </div>
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
    import AssetIcon from '@/components/AssetIcon.vue';

    interface IProps {
        balance: AssetBalance;
    }

    const { balance } = defineProps<IProps>();
</script>

<style scoped></style>
