<template>
    <div class="mb-2 flex flex-row items-center">
        <label class="block text-sm font-medium text-gray-700"> {{ labelText }} </label>
        <div v-if="isSensitiveData" class="pl-3">
            <eye-icon
                v-if="!showSensitive"
                @click="showSensitive = !showSensitive"
                class="h-4 text-primary-600"
            ></eye-icon>
            <eye-off-icon
                v-if="showSensitive"
                @click="showSensitive = !showSensitive"
                class="h-4 text-primary-600"
            ></eye-off-icon>
        </div>
    </div>
    <div class="flex w-full">
        <div class="relative flex w-full">
            <input
                :type="showSensitive === true ? 'text' : 'password'"
                type="text"
                name="fieldText"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                :class="[showSensitive ? 'pr-12' : '', disabled ? 'border-none pl-0  shadow-none' : '']"
                placeholder="Search..."
                autocomplete="off"
                :disabled="disabled"
                v-model="fieldText"
            />

            <span
                v-if="showSensitive"
                @click="copyToClipboard"
                class="absolute inset-y-0 right-0 flex items-center pr-4"
            >
                <slot name="icon" />
            </span>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { EyeIcon, EyeOffIcon } from '@heroicons/vue/solid';
    import { addNotification, NotificationType } from '@/service/notificationService';
    import { ref } from 'vue';

    interface IProps {
        fieldText: string;
        disabled: boolean;
        labelText: string;
        isSensitiveData?: boolean;
    }

    const { fieldText, disabled, labelText, isSensitiveData } = withDefaults(defineProps<IProps>(), {
        isSensitiveData: false,
    });

    const showSensitive = ref<boolean>(!isSensitiveData);

    const copyToClipboard = () => {
        const isDev = import.meta.env.DEV;

        // @TODO: find a better solution for this
        // Developer mode doesn't use Flutter Webview so a copy won't work. This is a temporary fix
        if (isDev) {
            navigator.clipboard.writeText(fieldText);
            console.log('Copied');
            return addNotification(NotificationType.info, 'Text has been copied to clipboard', fieldText, 2000);
        }

        //@ts-ignore
        globalThis?.flutter_inappwebview.callHandler('COPY', fieldText).then(function () {
            console.log('Copied');
        });
        addNotification(NotificationType.info, 'Text has been copied to clipboard', fieldText, 2000);
    };
</script>

<style scoped></style>
