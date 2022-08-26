<template>vesting</template>

<script lang="ts" setup>
    import { inject } from 'vue';
    import { IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';

    const wallet: IWallet = <IWallet>inject('wallet');
</script>

<style scoped></style>
