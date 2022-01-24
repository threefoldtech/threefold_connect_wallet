<template>
    <div
        class="flex h-10 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-2xl font-semibold text-white active:bg-primary-400"
    >
        <slot>
            <PlusIcon class="h-6" />
        </slot>
    </div>
</template>
<script lang="ts" setup>
    import PlusIcon from '@heroicons/vue/outline/PlusIcon';
</script>
