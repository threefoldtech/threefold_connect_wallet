<template>
    <transition name="fade">
        <div class="fixed inset-0 z-20 overflow-y-auto">
            <div class="grid h-screen w-screen place-items-center px-4 text-center sm:block sm:p-0">
                <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="close()">
                    <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true"></span>
                <div
                    class="inline-block max-w-2xl transform rounded-lg bg-white text-left align-middle shadow-xl transition-all md:w-3/4"
                    role="dialog"
                    aria-modal="true"
                >
                    <div class="flex w-full flex-col px-4 py-4">
                        <h1 class="text-primary text-md font-bold">
                            <slot name="header" />
                        </h1>
                    </div>
                    <div class="mb-4 rounded-b-lg bg-white">
                        <slot name="content" />
                    </div>
                    <div v-show="action" class="flex flex-row-reverse rounded-b-lg bg-gray-50 py-3 px-6">
                        <slot name="actions" />
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
    import { defineComponent, onBeforeUnmount } from 'vue';
    import { onBeforeMount } from '@vue/runtime-core';

    export default defineComponent({
        name: 'Modal',
        props: {
            action: {
                type: Boolean,
                default: false,
            },
            line: {
                type: Boolean,
                default: true,
            },
            sticky: {
                type: Boolean,
                default: false,
            },
        },
        emits: ['close'],
        setup(props, ctx) {
            let escListener = null;
            const close = () => {
                if (props.sticky) {
                    return;
                }
                ctx.emit('close');
            };

            onBeforeMount(() => {
                escListener = e => {
                    if (e.key !== 'Escape') {
                        return;
                    }
                    ctx.emit('close');
                };
                document.addEventListener('keyup', escListener);
            });

            onBeforeUnmount(() => {
                document.removeEventListener('keyup', escListener);
            });

            return {
                close,
            };
        },
    });
</script>

<style scoped></style>
