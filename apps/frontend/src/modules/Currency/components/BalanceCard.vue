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
                {{ currencyUtil(balance.amount) }}
            </div>
        </div>
        <hr class="my-2 last:hidden" />
        <slot name="actions" />
    </div>
</template>

<script lang="ts" setup>
    import AssetIcon from '@/modules/Currency/components/AssetIcon.vue';
    import { currencyUtil } from '@/modules/Currency/utils/currency.util';
    import { IAssetBalance } from 'shared-types';
    interface IProps {
        balance: IAssetBalance;
    }

    const { balance } = defineProps<IProps>();
</script>

<style scoped></style>
