<template>
    <div class="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto flex h-full max-w-3xl items-center justify-center">
            <div class="flex flex-col items-center justify-center space-y-4 text-center">
                <div class="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-secondary-600"></div>
                <div v-on:touchend.prevent.stop="inc()" @click.prevent.stop="inc()">initializing your first wallet</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { initFirstWallet } from '@/modules/Core/services/initializationService';
    import { useRouter } from 'vue-router';
    import { useCounter } from '@vueuse/core';
    import { watch } from 'vue';
    import { addNotification, NotificationType } from '@/modules/Core/services/notificationService';
    import { userInitialized } from '@/modules/Core/services/cryptoService';

    const { count, inc, reset } = useCounter();
    const router = useRouter();

    router.beforeEach(() => {
        reset();
    });

    watch(count, newValue => {
        if (newValue < 5) return;
        router.push({ name: 'devLogs' });
    });

    const init = async (retries = 0) => {
        try {
            await initFirstWallet();
        } catch (e) {
            if (retries < 3) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await init(retries + 1);
                return;
            }
            addNotification(NotificationType.error, 'Failed to init first wallet', 'Please try again later');
            userInitialized.value = null;
            await router.push({ name: 'init' });
            return;
        }
        await router.push({ name: 'walletList' });
    };

    init();
</script>

<style scoped></style>
