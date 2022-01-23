<template>
    <div class="p-4">
        <div class="flex flex-col">
            <h2 class="text-lg font-bold uppercase">logs</h2>
            <button
                @click="copyToClipboard(logs)"
                class="flex items-center justify-between px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
                <ClipboardCopyIcon class="h-6 mr-2" />
                <span class="block text-sm">copy all logs</span>
            </button>
            <hr class="mt-3 border-primary-500" />
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
                            @click="copyToClipboard(log)"
                            class="absolute right-2 top-2 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <ClipboardCopyIcon class="h-6 mr-2" />
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

    const copyToClipboard = (val: any) => {
        const el = document.createElement('textarea');
        el.value = stringify(val);
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    };
</script>

<style scoped></style>
