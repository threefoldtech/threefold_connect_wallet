<template>
    <RouterView />
    <Notifications />
    <div class="fixed top-2 right-2 text-gray-300 text-xs pointer-events-none font-light">{{ version }}</div>
</template>

<script lang="ts" setup>
    import Notifications from '@/components/Notifications.vue';

    //@ts-ignore
    const version = 'v3.0.0' || globalThis.version;
</script>

<style></style>
