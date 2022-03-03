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
                            class="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                        >
                            <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                                <div class="mb-4 flex flex-row justify-between">
                                    <div class="uppercase">Change wallet name</div>
                                    <div>
                                        <XIcon class="h-6 cursor-pointer text-gray-600" @click="closeDialog" />
                                    </div>
                                </div>
                            </DialogTitle>
                            <div class="mt-2">
                                <input
                                    v-model="newWalletName"
                                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    name="name"
                                    type="text"
                                />
                                <div class="pt-1 text-xs text-red-500">
                                    {{ walletNameError }}
                                </div>
                            </div>

                            <div class="mt-6 flex flex-row justify-between">
                                <button
                                    type="button"
                                    class="rounded-md bg-red-500 py-2 px-4 text-sm font-medium text-white hover:bg-gray-50 focus:outline-none focus:ring-offset-2"
                                    @click="closeDialog"
                                >
                                    Cancel
                                </button>
                                <button
                                    :disabled="walletNameError"
                                    type="button"
                                    class="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white hover:bg-blue-200"
                                    :class="walletNameError ? 'bg-gray-200' : 'bg-blue-500'"
                                    @click="acceptDialog"
                                >
                                    Change
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
    import { TransitionRoot, TransitionChild, DialogOverlay, Dialog, DialogTitle } from '@headlessui/vue';
    import { ref, watch } from 'vue';
    import { XIcon } from '@heroicons/vue/solid';
    import { validateWalletName } from '@/util/validate';

    const emit = defineEmits(['close', 'confirmed', 'update:newWalletName']);

    interface IProps {
        walletName: string;
    }

    const { walletName } = defineProps<IProps>();

    const walletNameError = ref<string | null>(null);
    const newWalletName = ref<string>(walletName);

    watch(newWalletName, newValue => {
        walletNameError.value = validateWalletName(newValue, walletName);
    });

    const closeDialog = () => {
        emit('close');
    };

    const acceptDialog = () => {
        emit('confirmed', newWalletName.value);
    };
</script>
