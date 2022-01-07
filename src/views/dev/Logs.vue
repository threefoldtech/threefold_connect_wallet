<template>
    <div class="p-4">
        <div class="flex flex-col">
            <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 hidden">
                <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th
                                        class="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        scope="col"
                                    >
                                        #
                                    </th>
                                    <th
                                        class="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        scope="col"
                                    >
                                        Level
                                    </th>
                                    <th
                                        class="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        scope="col"
                                    >
                                        timestamp
                                    </th>
                                    <th
                                        class="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        scope="col"
                                    >
                                        log
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(log, index) in logs"
                                    :class="{
                                        'bg-blue-100': log.level === 'info' && index % 2 === 1,
                                        'bg-blue-300': log.level === 'info' && index % 2 === 0,
                                        'bg-red-100': log.level === 'error' && index % 2 === 1,
                                        'bg-red-300': log.level === 'error' && index % 2 === 0,
                                        'bg-green-100': log.level === 'success' && index % 2 === 1,
                                        'bg-green-300': log.level === 'success' && index % 2 === 0,
                                        'bg-yellow-100': log.level === 'warning' && index % 2 === 1,
                                        'bg-yellow-300': log.level === 'warning' && index % 2 === 0,
                                        'bg-gray-100': log.level === 'debug' && index % 2 === 1,
                                        'bg-gray-300': log.level === 'debug' && index % 2 === 0,
                                        'bg-gray-100': log.level === 'notice' && index % 2 === 1,
                                        'bg-gray-300': log.level === 'notice' && index % 2 === 0,
                                        'bg-gray-100': log.level === 'table' && index % 2 === 1,
                                        'bg-gray-300': log.level === 'table' && index % 2 === 0,
                                        'bg-gray-100': log.level === 'log' && index % 2 === 1,
                                        'bg-gray-300': log.level === 'log' && index % 2 === 0,
                                    }"
                                >
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {{ index + 1 }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        {{ log.level }}
                                    </td>

                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        {{ log.timestamp }}
                                    </td>
                                    <td v-if="log.args.length === 1" class="px-6 py-4 whitespace-nowrap text-sm">
                                        <pre>{{ stringify(log.args[0]) }}</pre>
                                    </td>
                                    <td v-else class="px-6 py-4 whitespace-nowrap text-sm">
                                        <pre>{{ stringify(log.args) }}</pre>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div>
                <dl
                    class="mt-3 grid grid-cols-1 rounded-lg bg-white overflow-hidden divide-y divide-gray-200 md:divide-y-0 md:divide-x"
                >
                    <div
                        v-for="(log, index) in logs"
                        :class="{
                            'bg-blue-100': log.level === 'info' && index % 2 === 1,
                            'bg-blue-300': log.level === 'info' && index % 2 === 0,
                            'bg-red-100': log.level === 'error' && index % 2 === 1,
                            'bg-red-300': log.level === 'error' && index % 2 === 0,
                            'bg-green-100': log.level === 'success' && index % 2 === 1,
                            'bg-green-300': log.level === 'success' && index % 2 === 0,
                            'bg-yellow-100': log.level === 'warning' && index % 2 === 1,
                            'bg-yellow-300': log.level === 'warning' && index % 2 === 0,
                            'bg-gray-100': log.level === 'debug' && index % 2 === 1,
                            'bg-gray-300': log.level === 'debug' && index % 2 === 0,
                            'bg-gray-100': log.level === 'notice' && index % 2 === 1,
                            'bg-gray-300': log.level === 'notice' && index % 2 === 0,
                            'bg-gray-100': log.level === 'table' && index % 2 === 1,
                            'bg-gray-300': log.level === 'table' && index % 2 === 0,
                            'bg-gray-100': log.level === 'log' && index % 2 === 1,
                            'bg-gray-300': log.level === 'log' && index % 2 === 0,
                        }"
                        class="px-4 py-5 sm:p-6 relative"
                    >
                        <dt class="text-base font-normal">
                            {{ log.level }}
                        </dt>
                        <span class="text-sm font-medium text-gray-500"> from {{ log.timestamp }} </span>

                        <dd class="mt-1 flex justify-between logs-baseline md:block lg:flex">
                            <div class="flex logs-baseline text-sm font-semibold overflow-auto">
                                <pre class="whitespace-pre-wrap">{{ log.args }}</pre>
                            </div>
                        </dd>
                        <button
                            class="absolute right-2 top-2 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <ClipboardCopyIcon class="h-6" />
                            <span class="block text-sm">copy</span>
                        </button>
                    </div>
                </dl>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { logs } from '@/util/log';
    import { watch } from 'vue';
    import { ClipboardCopyIcon } from '@heroicons/vue/solid';

    const stringify = (val: any) => JSON.stringify(val, null, 2);

    watch(logs, val => {
        //@ts-ignore
        window.logs = logs.value;
    });
</script>

<style scoped></style>
