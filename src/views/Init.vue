<template>
    <div class="h-full w-full flex items-center justify-center text-center">
        <div>
            <svg
                class="animate-spin h-32 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
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

    const router = useRouter();

    init('testboy.3bot', '7IZiTghoAbJKdQbBqQoJrSCBD33SMTQAmIrrzfMaHLU=').then(() => {
        router.push({ name: 'walletList' }).catch(e => {
            router.push({ name: 'error' });
        });
    });
</script>

<style scoped></style>
