<template>
    <RouterView />
</template>

<script lang="ts" setup>
    import version from '../public/config/version';

    console.log('Running on version: ', version);
</script>
