<template>
    <div @click="clickOnField">
        <div class="mb-2 flex flex-row items-center">
            <label class="block text-sm font-medium text-gray-700"> {{ labelText }} </label>
        </div>
        <div class="flex w-full">
            <div class="relative flex w-full">
                <input
                    type="text"
                    name="fieldText"
                    class="block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Search..."
                    autocomplete="off"
                    :disabled="disabled"
                    v-model="fieldText"
                />

                <span @click="clickOnIcon" class="absolute inset-y-0 right-0 flex items-center pr-4">
                    <slot name="icon" />
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    interface IProps {
        fieldText: string;
        disabled: boolean;
        labelText: string;
    }

    const { fieldText, disabled, labelText } = defineProps<IProps>();

    const emit = defineEmits(['clickOnIcon', 'clickOnField']);

    const clickOnIcon = () => {
        emit('clickOnIcon');
    };

    const clickOnField = () => {
        emit('clickOnField');
    };
</script>

<style scoped></style>
