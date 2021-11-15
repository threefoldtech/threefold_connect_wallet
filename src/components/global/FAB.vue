<template>
    <div
        class="
            rounded-full
            bg-primary-600
            h-10
            text-white text-2xl
            font-semibold
            flex
            items-center
            justify-center
            cursor-pointer
            active:bg-primary-400
        "
    >
        <slot>
            <PlusIcon class="h-6" />
        </slot>
    </div>
</template>
<script lang="ts" setup>
    import PlusIcon from '@heroicons/vue/solid/PlusIcon';
</script>
