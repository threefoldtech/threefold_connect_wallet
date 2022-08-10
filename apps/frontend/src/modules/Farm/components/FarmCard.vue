<template>
    <!--V2 Wallets -->
    <div class="relative col-span-1 divide-y divide-gray-200 rounded-lg bg-white p-3 shadow" v-if="!isV3">
        <div class="flex flex-row items-center justify-between">
            <div class="text-sm font-medium">
                {{ farm.name }}
            </div>
            <div>
                <button
                    @click="showCreateNewFarm = true"
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
                <FarmCardDetails :showSecrets="showSecrets" :farm="farm"></FarmCardDetails>
            </DisclosurePanel>
        </Disclosure>
    </div>

    <Dialog
        v-if="showCreateNewFarm"
        as="div"
        class="fixed inset-0 flex h-screen w-full items-center justify-center"
        :open="showCreateNewFarm"
        @close="showCreateNewFarm = false"
    >
        <DialogOverlay class="fixed inset-0 bg-gray-700/60" />
        <div class="flex w-[80%] max-w-[80%] items-center justify-center">
            <CreateFarmCard :migrationFarm="farm" @close="showCreateNewFarm = false" />
        </div>
    </Dialog>
</template>

<script lang="ts" setup>
    import CreateFarmCard from '@/modules/Farm/components/CreateFarmCard.vue';
    import { DisclosureButton, Disclosure, DisclosurePanel, DialogOverlay, Dialog } from '@headlessui/vue';
    import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/solid';
    import FarmCardDetails from '@/modules/Farm/components/FarmCardDetails.vue';
    import { ref } from 'vue';

    interface Props {
        farm: any;
        isV3: boolean;
        showSecrets?: boolean;
    }

    const { farm, isV3, showSecrets } = withDefaults(defineProps<Props>(), { isV3: false, showSecrets: true });
    const showCreateNewFarm = ref<boolean>(false);
</script>

<style scoped></style>
