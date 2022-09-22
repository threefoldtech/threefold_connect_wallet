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
    import { initFirstWallet } from '@/modules/Core/services/initialization.service';
    import { useRouter } from 'vue-router';
    import { useCounter } from '@vueuse/core';
    import { watch } from 'vue';
    import { addNotification } from '@/modules/Core/services/notification.service';
    import { initializedUser } from '@/modules/Core/services/crypto.service';
    import { NotificationType } from 'shared-types/src/enums/global/notification.enums';

    const { count, inc, reset } = useCounter();
    const router = useRouter();

    router.beforeEach(() => {
        reset();
    });

    watch(count, newValue => {
        if (newValue < 5) return;
        router.push({ name: 'devLogs' });
    });

    const init = async () => {
        try {
            await initFirstWallet();
        } catch (e) {
            addNotification(NotificationType.error, 'Failed to init first wallet', 'Please try again later');
            initializedUser.value = null;
            await router.push({ name: 'init' });
            return;
        }
        await router.push({ name: 'walletList' });
    };

    init();
</script>

<style scoped></style>
