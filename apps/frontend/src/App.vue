<template>
    <div
        v-if="isDev"
        class="user-select-none pointer-events-none fixed right-0 mt-9 mr-9 w-72 origin-top bg-yellow-500 text-center opacity-80"
        style="transform: translateX(50%) rotate(45deg)"
    >
        <div>DEV</div>
    </div>
    <div
        v-if="isBeta && !isDev"
        class="user-select-none pointer-events-none fixed right-0 mt-9 mr-9 w-72 origin-top bg-yellow-500 text-center opacity-80"
        style="transform: translateX(50%) rotate(45deg)"
    >
        <div>BETA</div>
    </div>
    <RouterView />
    <Notifications />
    <div
        class="fixed top-2 right-2 z-50 select-none text-xs font-light text-gray-300"
        v-on:touchend.prevent.stop="inc()"
        @click.prevent.stop="inc()"
    >
        {{ version }}
    </div>
</template>

<script lang="ts" setup>
    import Notifications from '@/modules/Core/components/Notifications.vue';
    import { useCounter } from '@vueuse/core';
    import { useRouter } from 'vue-router';
    import { watch } from 'vue';
    import version from '../public/config/version';

    const { count, inc, reset } = useCounter();
    const router = useRouter();

    router.beforeEach(() => {
        reset();
    });

    watch(count, newValue => {
        if (newValue < 5) return;
        router.push({ name: 'devLogs' });
    });

    console.log('Running on version: ', version);
    const isBeta = globalThis.location.hostname.includes('-beta');
</script>

<style></style>
