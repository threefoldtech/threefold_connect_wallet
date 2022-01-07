<template>
    <RouterView :key="$route.fullPath" />
    <Notifications />
    <div class="fixed bottom-2 left-2 text-gray-400 text-xs pointer-events-none font-light">{{ version }}</div>
</template>

<script lang="ts" setup>
    import Notifications from '@/components/Notifications.vue';

    //@ts-ignore
    const version = globalThis.version;
</script>

<style></style>
