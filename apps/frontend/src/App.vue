<template>
    <RouterView />
</template>

<script lang="ts" setup>
    import version from '../public/config/version';
    import { isDev } from '@/modules/Core/utils/environment';

    console.info('Developer mode: ', isDev);

    if (!isDev) {
        console.info('Running on version: ', version);
    }
</script>
