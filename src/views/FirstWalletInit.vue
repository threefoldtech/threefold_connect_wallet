<template>
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-secondary-600">test</div>
    </div>
</template>

<script lang="ts" setup>
    import { useRoute } from 'vue-router';
    import { firstWalletInitCallback } from '@/service/initializationService';
    import { onBeforeUnmount } from 'vue';
    import { getStellarClient } from '@/service/stellarService';

    const server = getStellarClient();

    const route = useRoute();

    const stream = server
        .accounts()
        .accountId(<string>route.params.address)
        .cursor('now')
        .stream({
            onmessage: () => {
                firstWalletInitCallback.value();
            },
        });

    console.log('etset');
    onBeforeUnmount(() => {
        stream();
    });
</script>

<style scoped></style>
