<template>
    <div class="h-full flex">
        <div class="h-16 w-16 p-4 grid place-items-center flex-shrink-0">
            <slot name="before"></slot>
        </div>
        <div
            class="
                flex-grow flex flex-col
                justify-center
                items-center
                font-semibold
                leading-tight
                text-lg
                overflow-auto
                px-0
            "
        >
            <slot></slot>
        </div>
        <div class="h-16 w-16 p-4 grid place-items-center flex-shrink-0">
            <slot name="after"></slot>
        </div>
    </div>
</template>

<script lang="ts" setup></script>

<style scoped></style>
