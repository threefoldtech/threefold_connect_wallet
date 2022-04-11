<template>
    <div class="rounded-2xl border p-4">
        <div class="flex flex-row justify-between pb-3">
            <div class="flex items-center gap-2">
                <AssetIcon :name="'TFT'" />

                <div class="shrink-0">
                    {{ $t('currency.short.tft') }}
                    <small class="capitalize text-gray-400"> {{ $t(`chain.stellar`) }} </small>
                </div>
            </div>

            <div>
                {{ formatCurrency(totalLockedTokens) }}
            </div>
        </div>

        <div v-for="t in lockedTokens">
            <span class="text-xs">
                {{
                    $t('wallet.overview.lockedTokensDetails', {
                        amount: formatCurrency(t.amount),
                        asset_code: t.balance.asset_code,
                        date: timeStampToReadableDate(t.unlockFrom),
                    })
                }}
            </span>
        </div>
        <hr class="my-2" v-if="$slots['actions']" />
        <slot name="actions" />
    </div>
</template>

<script lang="ts" setup>
    import { TokenItem } from '@/service/lockService';
    import { computed } from 'vue';
    import { formatCurrency } from '@/util/formatCurrency';
    import { timeStampToReadableDate } from '@/util/time';
    import AssetIcon from '@/components/AssetIcon.vue';

    interface IProps {
        lockedBalances: (TokenItem | null)[];
    }

    const { lockedBalances } = defineProps<IProps>();

    const lockedTokens = computed(() => {
        return lockedBalances.filter(token => token?.canBeUnlocked === false);
    });

    const totalLockedTokens = computed(() => {
        return lockedBalances.reduce((acc, cur) => {
            if (cur) {
                return acc + cur.amount;
            }
            return acc;
        }, 0);
    });
</script>
