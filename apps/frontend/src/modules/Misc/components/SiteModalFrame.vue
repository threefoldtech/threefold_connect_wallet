<template>
    <Dialog :open="true" as="div" class="fixed inset-0 z-30">
        <MainLayout>
            <template #header>
                <PageHeader>
                    <h1>{{ title }}</h1>

                    <template #after>
                        <XIcon class="h-8 cursor-pointer text-gray-600" @click="$emit('close')" />
                    </template>
                </PageHeader>
            </template>
            <div class="h-full">
                <iframe width="100%" height="100%" :src="src" frameborder="0" allowfullscreen></iframe>
            </div>
        </MainLayout>
    </Dialog>
</template>

<script lang="ts" setup>
    import PageHeader from '@/modules/Misc/components/header/PageHeader.vue';
    import MainLayout from '@/modules/Misc/layouts/MainLayout.vue';
    import { Dialog } from '@headlessui/vue';
    import { XIcon } from '@heroicons/vue/solid';

    interface IProps {
        src: string;
        title?: string;
    }
    const { src, title } = withDefaults(defineProps<IProps>(), { title: 'site' });
    defineEmits(['close']);
</script>

<style scoped></style>
