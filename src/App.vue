<template>
    <RouterView :key="$route.fullPath" />
    <CookieConsent />
</template>

<script lang="ts" setup>
    import CookieConsent from './components/CookieConsent.vue';
</script>

<style></style>
