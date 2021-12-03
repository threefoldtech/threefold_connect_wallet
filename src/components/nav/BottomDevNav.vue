<template>
    <div class="h-full flex divide-x-2 divide-gray-200 overflow-auto">
        <div
            v-for="item in nav"
            :key="item.name"
            class="cursor-pointer flex-1 min-w-[8ch]"
            @click="router.replace({ name: item.name, params: { wallet: route.params.wallet } })"
        >
            <div
                :class="{ 'border-primary-600 ': route.meta.activeNav === item.name }"
                class="border-t-4 border-transparent flex-1 h-full flex items-center justify-center box"
            >
                <Component
                    :is="item.icon"
                    :class="{ 'text-primary-600': route.meta.activeNav === item.name }"
                    class="h-4"
                />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { NavItem } from '@/types';
    import { TableIcon } from '@heroicons/vue/outline';
    import { ref } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import flagsmith from 'flagsmith';

    const nav = ref<NavItem[]>([{ name: 'devlogs', icon: TableIcon }]);
    const route = useRoute();
    const router = useRouter();
</script>
