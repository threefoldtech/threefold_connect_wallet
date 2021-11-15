<template>
    <MainLayout>
        <template #header></template>
        <h1 class="">home</h1>
        <template #navigation>
            <BottomWalletNav />
        </template>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import BottomWalletNav from '@/components/nav/BottomWalletNav.vue';
</script>

<style scoped></style>
