<template></template>

<script lang="ts" setup>
    //define farm as prop

    interface Props {
        farm: Farm;
    }
    const { farm } = defineProps<Props>();
</script>

<style scoped></style>
