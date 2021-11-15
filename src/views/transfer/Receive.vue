<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <ArrowLeftIcon @click="router.back()" />
                </template>
                <h1>Receive</h1>
            </PageHeader>
        </template>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import ArrowLeftIcon from '@heroicons/vue/solid/ArrowLeftIcon';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { useRouter } from 'vue-router';

    const router = useRouter();
</script>

<style scoped></style>
