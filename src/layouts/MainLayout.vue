<template>
    <div class="h-screen bg-white flex flex-col">
        <header v-if="$slots['header']" class="h-16 border-b flex-shrink-0">
            <slot name="header" />
        </header>
        <main class="flex-grow overflow-auto">
            <slot />
            <div class="absolute right-4 bottom-4 h-10 w-10">
                <slot v-if="$slots['fab']" name="fab" />
            </div>
        </main>
        <nav v-if="$slots['navigation']" class="h-12 flex-shrink-0">
            <slot name="navigation" />
        </nav>
    </div>
</template>

<script lang="ts" setup></script>

<style scoped></style>
