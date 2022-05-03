<template>
    <span class="mr-2 rounded px-2.5 py-0.5 text-sm font-medium" :class="defineCorrectType(type)"> {{ text }}</span>
</template>

<script lang="ts" setup>
    import { BadgeType } from '@/modules/Misc/enums/badge.enum';

    interface IProps {
        type: BadgeType;
        text: string;
    }

    const { type, text } = defineProps<IProps>();

    const defineCorrectType = (type: BadgeType) => {
        switch (type) {
            case BadgeType.POSITIVE:
                return 'bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900';
            case BadgeType.NEGATIVE:
                return 'bg-red-100 text-red-800 dark:bg-red-200 dark:text-red-900';
            case BadgeType.NEUTRAL:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900';
        }
    };
</script>

<style scoped></style>
