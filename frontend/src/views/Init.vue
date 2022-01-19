<template>
    <div :class="{ 'debug-screens': isDev }" class="h-full w-full flex items-center justify-center text-center">
        <div>
            <svg
                class="animate-spin h-32 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                @click="inc()"
            >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                    class="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    fill="currentColor"
                ></path>
            </svg>
            <h2 class="mt-4">{{ loadingText.title }}</h2>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { useRouter } from 'vue-router';
    import { init, loadingText } from '@/service/initializationService';
    import { useCounter, useLocalStorage } from '@vueuse/core';
    import { watch } from 'vue';

    const { count, inc, reset } = useCounter();
    const router = useRouter();

    router.beforeEach(() => {
        reset();
    });

    watch(count, newValue => {
        if (newValue < 5) return;
        router.push({ name: 'devLogs' });
    });
    //@ts-ignore
    const isDev = import.meta.env.DEV;

    const seed = useLocalStorage('devSeed', '7IZiTghoAbJKdQbBqQoJrSCBD33SMTQAmIrrzfMaHLU=');
    const overrideIsDev = useLocalStorage('override', false);
    // if (isDev || overrideIsDev.value) {
    //     init('testseed.3bot', seed.value)
    //         .then(() => {
    //             router.push({ name: 'walletList' }).catch(e => {
    //                 console.error(e);
    //                 router.push({ name: 'error' });
    //             });
    //         })
    //         .catch((e: any) => {
    //             console.error(e);
    //             router.push({ name: 'error' });
    //         });
    // }
    //
    // if (!isDev && !overrideIsDev.value) {
    //     //@ts-ignore
    //     globalThis.init = (name: string, seedString: string) => {
    //         init(name, seedString)
    //             .then(() => {
    //                 router.push({ name: 'walletList' }).catch(e => {
    //                     console.error(e);
    //                     router.push({ name: 'error' });
    //                 });
    //             })
    //             .catch((e: any) => {
    //                 console.error(e);
    //                 router.push({ name: 'error' });
    //             });
    //     };
    //     //@ts-ignore
    //     globalThis?.flutter_inappwebview?.callHandler('VUE_INITIALIZED');
    // }
</script>

<style scoped></style>
