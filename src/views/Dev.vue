<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <ArrowLeftIcon @click="router.back()" />
                </template>
                <h1>Dev</h1>

                <template #after>
                    <HomeIcon @click="router.replace({ name: 'walletList' })" />
                </template>
            </PageHeader>
        </template>
        <Logs />
        <template #navigation>
            <bottomDevNav />
        </template>
    </MainLayout>
</template>

<script lang="ts" setup>
    import { ArrowLeftIcon, HomeIcon } from '@heroicons/vue/outline';

    import Logs from '@/components/Logs.vue';
    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import BottomDevNav from '@/components/nav/BottomDevNav.vue';
    import { useRouter } from 'vue-router';

    const router = useRouter();
</script>

<style scoped></style>
