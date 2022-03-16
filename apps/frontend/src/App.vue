<template>
    <RouterView />
    <Notifications />
    <div class="fixed top-2 right-2 z-50 select-none text-xs font-light text-gray-300" @click="inc()">
        {{ version }}
    </div>
</template>

<script lang="ts" setup>
    import Notifications from '@/components/Notifications.vue';
    import { useCounter } from '@vueuse/core';
    import { useRouter } from 'vue-router';
    import { watch } from 'vue';

    const version = <string>(<any>globalThis)?.version;

    const { count, inc, reset } = useCounter();
    const router = useRouter();

    router.beforeEach(() => {
        reset();
    });

    watch(count, newValue => {
        if (newValue < 5) return;
        router.push({ name: 'devLogs' });
    });
</script>

<style></style>
