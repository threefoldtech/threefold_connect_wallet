<template>
    <div class="flex h-full">
        <div class="grid h-16 w-16 shrink-0 place-items-center p-4">
            <slot name="before"></slot>
        </div>
        <div
            class="flex grow flex-col items-center justify-center overflow-auto px-0 text-lg font-semibold leading-tight"
            @click="inc()"
        >
            <slot></slot>
        </div>
        <div class="grid h-16 w-16 shrink-0 place-items-center p-4">
            <slot name="after"></slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { useCounter } from '@vueuse/core';
    import { watch } from 'vue';
    import { useRouter } from 'vue-router';

    const { count, inc } = useCounter();
    const router = useRouter();

    watch(count, newValue => {
        if (newValue < 5) return;
        router.push({ name: 'devLogs' });
    });
</script>

<style scoped></style>
