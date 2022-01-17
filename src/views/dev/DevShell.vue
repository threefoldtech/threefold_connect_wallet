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
        <RouterView :key="$route.fullPath" />
        <template #navigation>
            <BottomNav />
        </template>
    </MainLayout>
</template>

<script lang="ts" setup>
    import { ArrowLeftIcon, HomeIcon } from '@heroicons/vue/outline';

    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { useRouter } from 'vue-router';
    import BottomNav from '@/components/nav/BottomNav.vue';

    const router = useRouter();
</script>

<style scoped></style>
