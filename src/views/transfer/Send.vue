<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <ArrowLeftIcon @click="router.back()" />
                </template>
                <h1>Send</h1>
            </PageHeader>
        </template>
        <div class="p-4">
            <Listbox v-model="selected" as="div">
                <ListboxLabel class="block text-sm font-medium text-gray-700">From</ListboxLabel>
                <div class="mt-1 relative">
                    <ListboxButton
                        class="
                            relative
                            w-full
                            bg-white
                            border border-gray-300
                            rounded-md
                            shadow-sm
                            pl-3
                            pr-10
                            py-2
                            text-left
                            cursor-default
                            focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
                            sm:text-sm
                        "
                    >
                        <span class="w-full inline-flex truncate">
                            <span class="truncate">{{ selected.name }}</span>
                            <span class="ml-2 truncate text-gray-500">{{ selected.username }}</span>
                        </span>
                        <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <SelectorIcon aria-hidden="true" class="h-5 w-5 text-gray-400" />
                        </span>
                    </ListboxButton>

                    <transition
                        leave-active-class="transition ease-in duration-100"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                    >
                        <ListboxOptions
                            class="
                                absolute
                                z-10
                                mt-1
                                w-full
                                bg-white
                                shadow-lg
                                max-h-60
                                rounded-md
                                py-1
                                text-base
                                ring-1 ring-black ring-opacity-5
                                overflow-auto
                                focus:outline-none
                                sm:text-sm
                            "
                        >
                            <ListboxOption
                                v-for="person in people"
                                :key="person.username"
                                v-slot="{ active, selected }"
                                :value="person"
                                as="template"
                            >
                                <li
                                    :class="[
                                        active ? 'text-white bg-indigo-600' : 'text-gray-900',
                                        'cursor-default select-none relative py-2 pl-3 pr-9',
                                    ]"
                                >
                                    <div class="flex">
                                        <span :class="[selected ? 'font-semibold' : 'font-normal', 'truncate']">
                                            {{ person.name }}
                                        </span>
                                        <span :class="[active ? 'text-indigo-200' : 'text-gray-500', 'ml-2 truncate']">
                                            {{ person.username }}
                                        </span>
                                    </div>

                                    <span
                                        v-if="selected"
                                        :class="[
                                            active ? 'text-white' : 'text-indigo-600',
                                            'absolute inset-y-0 right-0 flex items-center pr-4',
                                        ]"
                                    >
                                        <CheckIcon aria-hidden="true" class="h-5 w-5" />
                                    </span>
                                </li>
                            </ListboxOption>
                        </ListboxOptions>
                    </transition>
                </div>
            </Listbox>
            <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700" for="email">Search candidates</label>
                <div class="mt-1 flex rounded-md shadow-sm">
                    <div class="relative flex items-stretch flex-grow focus-within:z-10">
                        <input
                            id="email"
                            class="
                                focus:ring-indigo-500 focus:border-indigo-500
                                block
                                w-full
                                rounded-none rounded-l-md
                                pl-3
                                sm:text-sm
                                border-gray-300
                            "
                            name="email"
                            placeholder="John Doe"
                            type="email"
                        />
                    </div>
                    <button
                        class="
                            -ml-px
                            relative
                            inline-flex
                            items-center
                            space-x-2
                            px-2
                            py-2
                            border border-gray-300
                            text-sm
                            font-medium
                            rounded-r-md
                            text-gray-700
                            bg-gray-50
                            hover:bg-gray-100
                            focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
                        "
                        type="button"
                    >
                        <UserIcon class="w-6 text-primary-600t"></UserIcon>
                    </button>
                </div>
            </div>
            <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700" for="price">Price</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                    <input
                        id="price"
                        class="
                            focus:ring-indigo-500 focus:border-indigo-500
                            block
                            w-full
                            pl-4
                            pr-12
                            sm:text-sm
                            border-gray-300
                            rounded-md
                        "
                        name="price"
                        placeholder="0.00"
                        type="text"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center">
                        <label class="sr-only" for="currency">Currency</label>
                        <select
                            id="currency"
                            v-model="selectedAsset"
                            class="
                                focus:ring-indigo-500 focus:border-indigo-500
                                h-full
                                py-0
                                pl-2
                                pr-7
                                border-transparent
                                bg-transparent
                                text-gray-500
                                sm:text-sm
                                rounded-md
                            "
                            name="currency"
                        >
                            <option v-for="asset in allowedAssets">{{ asset }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import ArrowLeftIcon from '@heroicons/vue/solid/ArrowLeftIcon';
    import UserIcon from '@heroicons/vue/solid/UserIcon';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { useRouter } from 'vue-router';
    import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue';
    import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid';
    import { ref } from 'vue';
    import flagsmith from 'flagsmith';

    const router = useRouter();
    const allowedAssets: string[] = JSON.parse(<string>flagsmith.getValue('currencies')).map((a: any) => a.asset_code);

    const people = [
        { name: 'Wade Cooper', username: '@wadecooper' },
        { name: 'Arlene Mccoy', username: '@arlenemccoy' },
        { name: 'Devon Webb', username: '@devonwebb' },
        { name: 'Tom Cook', username: '@tomcook' },
        { name: 'Tanya Fox', username: '@tanyafox' },
        { name: 'Hellen Schmidt', username: '@hellenschmidt' },
        { name: 'Caroline Schultz', username: '@carolineschultz' },
        { name: 'Mason Heaney', username: '@masonheaney' },
        { name: 'Claudie Smitham', username: '@claudiesmitham' },
        { name: 'Emil Schaefer', username: '@emilschaefer' },
    ];
    const selected = ref(people[3]);
    const selectedAsset = ref('BTC');
</script>

<style scoped></style>
