<template>
    <div class="rounded-2xl border p-4 flex justify-between">
        <div>{{ asset }}</div>
        <div>{{ balance.toLocaleString(undefined, { maximumFractionDigits: 6, minimumSignificantDigits: 4 }) }}</div>
    </div>
</template>

<script lang="ts" setup>
    import ArrowUpIcon from '@heroicons/vue/outline/ArrowUpIcon';
    import ArrowDownIcon from '@heroicons/vue/outline/ArrowDownIcon';

    interface IProps {
        name: string;
        asset: string;
        balance: number;
        change: number;
    }

    const { name, asset, balance, change } = defineProps<IProps>();
</script>

<style scoped></style>
