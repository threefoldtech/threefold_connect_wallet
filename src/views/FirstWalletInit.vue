<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div class="max-w-3xl mx-auto flex justify-center items-center h-full">
            <div class="text-center space-y-4 flex flex-col justify-center items-center">
                <div class="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-secondary-600"></div>
                <div>initializing your first wallet</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { initFirstWallet } from '@/service/initializationService';
    import { useRouter } from 'vue-router';

    const router = useRouter();

    initFirstWallet().then(() => {
        router.push({ name: 'walletList' });
    });
</script>

<style scoped></style>
