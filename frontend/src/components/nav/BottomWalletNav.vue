<template>
    <div class="flex h-full divide-x-2 divide-gray-200 overflow-auto">
        <div
            v-for="item in nav"
            :key="item.name"
            class="min-w-[8ch] flex-1 cursor-pointer"
            @click="router.replace({ name: item.name, params: { wallet: route.params.wallet } })"
        >
            <div
                :class="{ 'border-primary-600 ': route.meta.activeNav === item.name }"
                class="box flex h-full flex-1 items-center justify-center border-t-4 border-transparent"
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

    import { CashIcon, SwitchHorizontalIcon, InformationCircleIcon, TrendingUpIcon } from '@heroicons/vue/outline';
    import { ref } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import flagsmith from 'flagsmith';

    const route = useRoute();
    const router = useRouter();
    const bottomNav: (() => NavItem[]) | NavItem[] = <(() => NavItem[]) | NavItem[]>route.meta?.bottomNav;
    const nav: NavItem[] = typeof bottomNav === 'function' ? bottomNav() : bottomNav ?? [];
</script>
