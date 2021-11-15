<template>
    <div class="rounded-2xl border p-4 flex justify-between">
        <div>{{ asset }}</div>
        <div>{{ balance.toLocaleString() }}</div>
    </div>
</template>

<script lang="ts" setup>
    import ArrowUpIcon from '@heroicons/vue/solid/ArrowUpIcon';
    import ArrowDownIcon from '@heroicons/vue/solid/ArrowDownIcon';

    interface IProps {
        name: string;
        asset: string;
        balance: number;
        change: number;
    }

    const { name, asset, balance, change } = defineProps<IProps>();
</script>

<style scoped></style>
