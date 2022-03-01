<template>
    <div class="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto flex h-full max-w-3xl items-center justify-center">
            <div class="flex flex-col items-center justify-center space-y-4 text-center">
                <div class="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-secondary-600"></div>
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
