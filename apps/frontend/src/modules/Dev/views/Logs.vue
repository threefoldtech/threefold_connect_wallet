<template>
    <div class="p-4">
        <div class="flex flex-col">
            <h2 class="text-lg font-bold uppercase">logs</h2>
            <button
                @click="copyToClipboard(logs)"
                class="flex items-center justify-between rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
                <ClipboardCopyIcon class="mr-2 h-6" />
                <span class="block text-sm">copy all logs</span>
            </button>
            <hr class="mt-3 border-primary-500" />
            <div>
                <dl
                    class="mt-3 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-lg bg-white md:divide-y-0 md:divide-x"
                >
                    <div
                        v-for="(log, index) in logs"
                        :class="{
                            'bg-blue-100 log-info': log.level === 'info' && index % 2 === 1,
                            'bg-blue-300 log-info': log.level === 'info' && index % 2 === 0,
                            'bg-red-100 log-error': log.level === 'error' && index % 2 === 1,
                            'bg-red-300 log-error': log.level === 'error' && index % 2 === 0,
                            'bg-yellow-100 log-warn': log.level === 'warn' && index % 2 === 1,
                            'bg-yellow-300 log-warn': log.level === 'warn' && index % 2 === 0,
                            'bg-gray-100 log-debug': log.level === 'debug' && index % 2 === 1,
                            'bg-gray-300 log-debug': log.level === 'debug' && index % 2 === 0,
                            'bg-gray-100 log-trace': log.level === 'trace' && index % 2 === 1,
                            'bg-gray-300 log-trace': log.level === 'trace' && index % 2 === 0,
                            'bg-gray-100 log-table': log.level === 'table' && index % 2 === 1,
                            'bg-gray-300 log-table': log.level === 'table' && index % 2 === 0,
                            'bg-gray-100 log-log': log.level === 'log' && index % 2 === 1,
                            'bg-gray-300 log-log': log.level === 'log' && index % 2 === 0,
                        }"
                        class="relative px-4 py-5 sm:p-6"
                    >
                        <dt class="text-base font-normal">
                            {{ log.level }}
                        </dt>
                        <span class="text-sm font-medium text-gray-500"> from {{ log.timestamp }} </span>

                        <dd class="logs-baseline mt-1 flex justify-between md:block lg:flex">
                            <div class="logs-baseline flex overflow-auto text-sm font-semibold">
                                <pre class="whitespace-pre-wrap">{{ log.args }}</pre>
                            </div>
                        </dd>
                        <button
                            @click="copyToClipboard(log)"
                            class="absolute right-2 top-2 inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                            <ClipboardCopyIcon class="mr-2 h-6" />
                            <span class="block text-sm">copy</span>
                        </button>
                    </div>
                </dl>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { Log, logs } from '@/modules/Dev/utils/log';
    import { watch } from 'vue';
    import { ClipboardCopyIcon } from '@heroicons/vue/solid';

    const stringify = (val: any) => JSON.stringify(val, null, 2);

    watch(logs, (val: Log[]) => {
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
