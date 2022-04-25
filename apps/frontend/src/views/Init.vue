<template>
    <div :class="{ 'debug-screens': isDev }" class="flex h-full w-full items-center justify-center text-center">
        <div>
            <svg
                class="h-32 animate-spin text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                v-on:touchend.prevent.stop="inc()"
                @click.prevent.stop="inc()"
            >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                    class="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    fill="currentColor"
                ></path>
            </svg>
            <h2 class="mt-4">{{ $t(`init.${loadingText.title}`) }}</h2>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { useRouter } from 'vue-router';
    import { init as walletInitialisation, loadingText } from '@/service/initializationService';
    import { useCounter, useLocalStorage } from '@vueuse/core';
    import { watch } from 'vue';
    import { balances, operations, wallets } from '@/service/walletService';
    import { isDev } from '@/util/enviroment';

    const { count, inc, reset } = useCounter();
    const router = useRouter();

    router.beforeEach(() => {
        reset();
    });

    watch(count, newValue => {
        if (newValue < 5) return;
        router.push({ name: 'devLogs' });
    });

    const seed = useLocalStorage('devSeed', '7IZiTghoAbJKdQbBqQoJrSCBD33SMTQAmIrrzfMaHLU=');
    const overrideIsDev = useLocalStorage('override', false);
    const initClearCache = useLocalStorage('initClearCache', true);

    const initApp = async (name: string, seedString: string) => {
        if (initClearCache.value) {
            balances.value = [];
            operations.value = [];
        }
        await walletInitialisation(name, seedString);

        try {
            if (wallets.value.length === 1) {
                await router.push({
                    name: 'walletOverview',
                    params: { wallet: wallets.value[0].keyPair.getStellarKeyPair().publicKey() },
                });
                return;
            }
            await router.push({ name: 'walletList' });
        } catch (error) {
            console.error(error);
            await router.push({ name: 'error' });
        }
    };

    //@ts-ignore
    globalThis.init = initApp;

    if (overrideIsDev.value) {
        initApp('testseed.3bot', seed.value);
    }

    //@ts-ignore
    globalThis?.flutter_inappwebview?.callHandler('VUE_INITIALIZED');
</script>

<style scoped></style>
