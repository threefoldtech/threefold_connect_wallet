<template>
    <TransitionRoot appear :show="true" as="template">
        <Dialog as="div" @close="closeDialog">
            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="min-h-screen px-4 text-center">
                    <TransitionChild
                        as="template"
                        enter="duration-300 ease-out"
                        enter-from="opacity-0"
                        enter-to="opacity-100"
                        leave="duration-200 ease-in"
                        leave-from="opacity-100"
                        leave-to="opacity-0"
                    >
                        <DialogOverlay class="fixed inset-0 bg-slate-500/60" />
                    </TransitionChild>

                    <span class="inline-block h-screen align-middle" aria-hidden="true"> &#8203; </span>

                    <TransitionChild
                        as="template"
                        enter="duration-300 ease-out"
                        enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100"
                        leave="duration-200 ease-in"
                        leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95"
                    >
                        <div
                            class="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-md bg-white text-left align-middle shadow-xl transition-all"
                        >
                            <DialogTitle as="h3" class="px-4 pt-6 text-lg font-semibold leading-6">
                                <div class="mb-4 flex flex-row items-center justify-between">
                                    <slot name="title"></slot>
                                    <div>
                                        <div class="flex items-center justify-center rounded-full bg-gray-200 p-1">
                                            <XIcon class="h-4 cursor-pointer text-gray-600" @click="closeDialog" />
                                        </div>
                                    </div>
                                </div>
                            </DialogTitle>
                            <hr />
                            <div class="px-4 pb-6">
                                <div class="mt-3">
                                    <slot name="content"></slot>
                                </div>

                                <div class="mt-8 flex flex-row justify-end">
                                    <slot name="actions"></slot>
                                </div>
                            </div>
                        </div>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script lang="ts" setup>
    import { TransitionRoot, TransitionChild, DialogOverlay, Dialog, DialogTitle } from '@headlessui/vue';
    import { XIcon } from '@heroicons/vue/solid';

    const emit = defineEmits(['close', 'confirmed']);

    const closeDialog = () => {
        emit('close');
    };

    const acceptDialog = () => {
        emit('confirmed');
    };
</script>
