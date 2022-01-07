<template>
    <div class="rounded-2xl border p-4 flex flex-col">
        <div class="">
            <p class="font-semibold">{{ name }}</p>
        </div>
        <div class="">
            <p v-for="assetBalance in balance?.assets" :class="{ hidden: assetBalance.amount <= 0 }">
                {{ assetBalance.name }} {{ assetBalance.amount.toLocaleString() }}
            </p>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import ArrowUpIcon from '@heroicons/vue/outline/ArrowUpIcon';
    import ArrowDownIcon from '@heroicons/vue/outline/ArrowDownIcon';
    import { Balance } from '../service/walletService';

    interface IProps {
        name: string;
        balance?: Balance;
    }

    const { name, balance } = defineProps<IProps>();
</script>

<style scoped></style>
