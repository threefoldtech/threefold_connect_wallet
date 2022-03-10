<template>
    <div>
        <h2>{{ name }}</h2>
        <div class="mt-2 flex flex-col rounded-2xl border p-4">
            <div v-if="!balance">
                <div class="flex animate-pulse justify-between text-transparent">
                    <span>
                        <small class="rounded-xl bg-slate-200 px-1">TFT</small>
                        <small class="ml-2 rounded-xl bg-slate-200">tfchain</small>
                    </span>
                    <span class="rounded-xl bg-slate-200 px-1">100.12</span>
                </div>
            </div>

            <div class="">
                <small v-if="balance && balance.assets && balance?.assets.filter(a => a.amount > 0).length === 0"
                    >No balance found for this wallet</small
                >
            </div>

            <div>
                <div
                    v-for="assetBalance in balance?.assets"
                    :class="{ hidden: assetBalance.amount <= 0 }"
                    class="flex justify-between"
                >
                    <span>
                        {{ assetBalance.name }}
                        <small class="text-gray-400">{{
                            assetBalance.type === 'substrate' ? 'tfchain' : assetBalance.type
                        }}</small>
                    </span>
                    {{
                        assetBalance.amount.toLocaleString(undefined, {
                            maximumFractionDigits: 6,
                            minimumSignificantDigits: 4,
                        })
                    }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { Balance } from '../service/walletService';
    import LoadingSpinner from '@/components/global/LoadingSpinner.vue';

    interface IProps {
        name: string;
        balance?: Balance;
    }

    const { name, balance } = defineProps<IProps>();
</script>

<style scoped></style>
