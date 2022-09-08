<template>
    <span
        class="mr-2 rounded px-2.5 py-0.5 text-sm font-medium"
        :class="{
            'bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900': props.type === BadgeType.POSITIVE,
            'bg-red-100 text-red-800 dark:bg-red-200 dark:text-red-900': props.type === BadgeType.NEGATIVE,
            'bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900': props.type === BadgeType.NEUTRAL,
        }"
    >
        {{ props.text }}</span
    >
</template>

<script lang="ts" setup>
    import { BadgeType } from 'shared-types/src/enums/global/badge.enums';

    interface IProps {
        type: BadgeType;
        text: string;
    }

    const props = defineProps<IProps>();
</script>

<style scoped></style>
