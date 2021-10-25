<template>
    <div class="fixed fixed bottom-0 px-8 py-4 w-full">
        <div
            :class="{
                hidden: cookieConsent,
            }"
            class="rounded-md bg-blue-50 p-4 w-full"
        >
            <div class="flex">
                <div class="flex-shrink-0">
                    <InformationCircleIcon aria-hidden="true" class="h-5 w-5 text-blue-400" />
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-blue-800">Cookie Notice</h3>
                    <div class="mt-2 text-sm text--700">
                        <p>
                            By clicking “Allow”, you agree to the storing of cookies on your device to enhance site
                            navigation, analyze site usage, and assist in our marketing efforts.
                        </p>
                    </div>
                    <div class="mt-4">
                        <div class="-mx-2 -my-1.5 flex">
                            <button
                                class="
                                    ml-3
                                    bg-blue-50
                                    px-2
                                    py-1.5
                                    rounded-md
                                    text-sm
                                    font-medium
                                    text-blue-800
                                    hover:bg-blue-100
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-offset-2
                                    focus:ring-offset-blue-50
                                    focus:ring-blue-600
                                "
                                type="button"
                                @click="cookieConsent = true"
                            >
                                Allow
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { InformationCircleIcon } from '@heroicons/vue/solid';
    import { useLocalStorage } from '@vueuse/core';

    const cookieConsent = useLocalStorage('cookieConsent', false);
</script>
