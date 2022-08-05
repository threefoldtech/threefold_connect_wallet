<template>
    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" @close="isOpen = false">
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
                        <DialogOverlay class="fixed inset-0 bg-slate-500/40" />
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
                            class="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                        >
                            <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                                <div class="flex flex-row justify-between">
                                    <div>Welcome to Farm Migration</div>
                                    <div>
                                        <XIcon class="h-6 cursor-pointer text-gray-600" @click="isOpen = false" />
                                    </div>
                                </div>
                            </DialogTitle>
                            <div class="mt-2">
                                <p class="text-sm text-gray-500">
                                    This tool is designed to help you migrate your existing farms from TF Grid v2 to TF
                                    Grid v3. If any of your existing farms are created with or have a payout to an
                                    active wallet address in your TF Connect app, you will see these in this section.
                                </p>
                            </div>

                            <div class="mt-4">
                                <button
                                    type="button"
                                    class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    @click="acceptDialog()"
                                >
                                    Got it, thanks!
                                </button>
                            </div>
                        </div>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script lang="ts" setup>
    import { useLocalStorage } from '@vueuse/core';
    import { ref } from 'vue';
    import { TransitionRoot, TransitionChild, Dialog, DialogOverlay, DialogTitle } from '@headlessui/vue';
    import { XIcon } from '@heroicons/vue/solid';
    // import { showInformationDialog } from '@/modules/Farm/services/farmService';

    const isOpen = ref<boolean>(true);

    const acceptDialog = () => {
        isOpen.value = false;
        // showInformationDialog.value = false;
    };
</script>
