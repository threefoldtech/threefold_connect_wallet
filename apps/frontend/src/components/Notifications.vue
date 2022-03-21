<template>
    <Portal>
        <div
            aria-live="assertive"
            class="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
        >
            <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
                <!-- Notification panel, dynamically insert this into the live region when it needs to be displayed -->
                <template v-for="notification in filteredNotifications">
                    <transition
                        enter-active-class="transform ease-out duration-300 transition"
                        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
                        leave-active-class="transition ease-in duration-100"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                    >
                        <div
                            class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                        >
                            <div class="p-4">
                                <div class="flex items-start">
                                    <div class="shrink-0">
                                        <CheckCircleIcon
                                            v-if="notification.type === NotificationType.success"
                                            aria-hidden="true"
                                            class="h-6 w-6 text-green-400"
                                        />

                                        <XCircleIcon
                                            v-else-if="notification.type === NotificationType.error"
                                            aria-hidden="true"
                                            class="h-6 w-6 text-red-400"
                                        />

                                        <InformationCircleIcon
                                            v-else-if="notification.type === NotificationType.warning"
                                            aria-hidden="true"
                                            class="h-6 w-6 text-amber-400"
                                        />

                                        <InformationCircleIcon
                                            v-else
                                            aria-hidden="true"
                                            class="h-6 w-6 text-blue-400"
                                        />
                                    </div>
                                    <div class="ml-3 w-0 flex-1 pt-0.5">
                                        <p class="text-sm font-medium text-gray-900">{{ notification.message }}</p>
                                        <p class="break-words pt-1 text-sm text-gray-500" v-if="notification.subtitle">
                                            {{ notification.subtitle }}
                                        </p>
                                    </div>
                                    <div class="ml-4 flex shrink-0">
                                        <button
                                            class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
    import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/vue/outline';
    import { XIcon } from '@heroicons/vue/solid';
    import { notifications } from '@/service/notificationService';
    import { Portal } from '@headlessui/vue';
    import { NotificationType } from '@/service/notificationService';
    import { computed } from 'vue';

    const filteredNotifications = computed(() => {
        return notifications.value.slice(0, 5).reverse();
    });
</script>
