<template>vesting</template>

<script lang="ts" setup>
    import { Wallet } from '@/service/walletService';
    import { inject } from 'vue';

    const wallet: Wallet = <Wallet>inject('wallet');
</script>

<style scoped></style>
