<template>
    <div>
        <h2>{{ name }}</h2>
        <div class="mt-2 flex flex-col rounded-2xl border p-4">
            <div v-if="!balance">
                <div class="flex animate-pulse justify-between text-transparent">
                    <span>
                        <small class="rounded-xl bg-slate-200 px-1">TFT</small>
                        <small class="ml-2 rounded-xl bg-slate-200">{{ $t(`chain.substrate`) }}</small>
                    </span>
                    <span class="rounded-xl bg-slate-200 px-1">100.12</span>
                </div>
            </div>

            <div class="">
                <small v-if="balance && balance.assets && balance?.assets.filter(a => a.amount > 0).length === 0">{{
                    $t('walletCard.noBalance')
                }}</small>
            </div>

            <div>
                <div
                    v-for="assetBalance in balance?.assets"
                    :class="{ hidden: assetBalance.amount <= 0 }"
                    class="flex justify-between p-1"
                >
                    <div class="flex flex-row items-center">
                        <AssetIcon
                            :key="assetBalance.name"
                            :height="6"
                            :width="6"
                            :name="assetBalance.name"
                        ></AssetIcon>
                        <span class="pl-2"> {{ assetBalance.name }}</span>
                        <span class="pl-2 text-sm capitalize text-gray-400">{{
                            $t(`chain.${assetBalance.type}`)
                        }}</span>
                    </div>
                    {{ formatCurrency(assetBalance.amount) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { Balance } from '../service/walletService';
    import LoadingSpinner from '@/components/global/LoadingSpinner.vue';
    import AssetIcon from '@/components/AssetIcon.vue';
    import { formatCurrency } from '@/util/formatCurrency';

    interface IProps {
        name: string;
        balance?: Balance;
    }

    const { name, balance } = defineProps<IProps>();
</script>

<style scoped></style>
