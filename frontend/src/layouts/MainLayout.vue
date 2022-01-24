<template>
    <div class="flex h-screen flex-col bg-white">
        <header v-if="$slots['header']" class="h-16 shrink-0 border-b">
            <slot name="header" />
        </header>
        <main class="grow overflow-auto">
            <slot />
            <div class="absolute right-4 bottom-4 h-10 w-10">
                <slot v-if="$slots['fab']" name="fab" />
            </div>
        </main>
        <nav v-if="$slots['navigation']" class="h-12 shrink-0">
            <slot name="navigation" />
        </nav>
    </div>
</template>

<script lang="ts" setup></script>

<style scoped></style>
