<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <ArrowLeftIcon @click="router.push({ name: 'walletList' })" />
                </template>
                <h1>Import wallet</h1>
            </PageHeader>
        </template>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
</script>
<style scoped></style>
