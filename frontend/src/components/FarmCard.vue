<template>
    <!--V2 Wallets -->
    <div class="relative col-span-1 divide-y divide-gray-200 rounded-lg bg-white p-3 shadow" v-if="!isV3">
        <div class="flex flex-row items-center justify-between">
            <div class="text-sm font-medium">
                {{ farm.name }}
            </div>
            <div>
                <button
                    class="rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-500"
                >
                    Migrate to v3
                </button>
            </div>
        </div>
    </div>

    <!--V3 Wallets -->
    <div v-else class="relative col-span-1 divide-y rounded-lg bg-white">
        <Disclosure v-slot="{ open }" as="div" class="relative col-span-1 rounded-lg bg-white">
            <DisclosureButton as="div" class="flex flex-row items-center justify-between">
                <div class="text-md max-w-90 truncate p-4 font-medium">
                    {{ farm.name }}
                </div>
                <div>
                    <ChevronUpIcon v-if="open" class="-ml-1 mr-2 h-5 w-5" />
                    <ChevronDownIcon v-if="!open" class="-ml-1 mr-2 h-5 w-5" />
                </div>
            </DisclosureButton>
            <DisclosurePanel as="div">
                <FarmCardDetails :farm="farm"></FarmCardDetails>
            </DisclosurePanel>
        </Disclosure>
    </div>
</template>

<script lang="ts" setup>
    import { Farm } from '@/types/farms.types';

    import { DisclosureButton, Disclosure, DisclosurePanel } from '@headlessui/vue';
    import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/solid';
    import FarmCardDetails from '@/components/FarmCardDetails.vue';

    // Defining props
    interface Props {
        farm: Farm;
        isV3: boolean;
    }

    const { farm, isV3 } = withDefaults(defineProps<Props>(), { isV3: false });
</script>

<style scoped></style>
