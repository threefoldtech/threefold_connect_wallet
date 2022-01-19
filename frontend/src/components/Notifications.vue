<!-- This example requires Tailwind CSS v2.0+ -->
<template>
    <!-- Global notification live region, render this permanently at the end of the document -->
    <Portal>
        <div
            aria-live="assertive"
            class="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
        >
            <div class="w-full flex flex-col items-center space-y-4 sm:items-end">
                <!-- Notification panel, dynamically insert this into the live region when it needs to be displayed -->
                <template v-for="notification in notifications">
                    <transition
                        enter-active-class="transform ease-out duration-300 transition"
                        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
                        leave-active-class="transition ease-in duration-100"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                    >
                        <div
                            class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
                        >
                            <div class="p-4">
                                <div class="flex items-start">
                                    <div class="shrink-0">
                                        <CheckCircleIcon aria-hidden="true" class="h-6 w-6 text-green-400" />
                                    </div>
                                    <div class="ml-3 w-0 flex-1 pt-0.5">
                                        <p class="text-sm font-medium text-gray-900">{{ notification.message }}</p>
                                    </div>
                                    <div class="ml-4 shrink-0 flex">
                                        <button
                                            class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            @click="notifications = notifications.filter(n => n.id !== notification.id)"
                                        >
                                            <span class="sr-only">Close</span>
                                            <XIcon aria-hidden="true" class="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition>
                </template>
            </div>
        </div>
    </Portal>
</template>

<script lang="ts" setup>
    import { CheckCircleIcon } from '@heroicons/vue/outline';
    import { XIcon } from '@heroicons/vue/solid';
    import { notifications } from '@/service/notificationService';
    import { Portal } from '@headlessui/vue';
</script>
