<template>
    <div class="h-full flex divide-x-2 divide-gray-200 overflow-auto">
        <div
            v-for="item in nav"
            :key="item.name"
            class="cursor-pointer flex-1 min-w-[8ch]"
            @click="router.replace({ name: item.name, params: { wallet: route.params.wallet } })"
        >
            <div
                :class="{ 'border-primary-600 ': route.meta.activeWalletNav === item.name }"
                class="border-t-4 border-transparent flex-1 h-full flex items-center justify-center box"
            >
                <Component
                    :is="item.icon"
                    :class="{ 'text-primary-600': route.meta.activeWalletNav === item.name }"
                    class="h-4"
                />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import { NavItem } from '@/types';

    import CashIcon from '@heroicons/vue/solid/CashIcon';
    import SwitchHorizontalIcon from '@heroicons/vue/solid/SwitchHorizontalIcon';
    import InformationCircleIcon from '@heroicons/vue/solid/InformationCircleIcon';
    import TrendingUpIcon from '@heroicons/vue/solid/TrendingUpIcon';
    import { ref } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import flagsmith from 'flagsmith';

    const nav = ref<NavItem[]>([
        { name: 'walletOverview', icon: CashIcon },
        ...(flagsmith.hasFeature('transactionOverview')
            ? [{ name: 'walletTransactions', icon: SwitchHorizontalIcon }]
            : []),
        { name: 'walletInfo', icon: InformationCircleIcon },
        ...(flagsmith.hasFeature('vesting') ? [{ name: 'walletVesting', icon: TrendingUpIcon }] : []),
    ]);
    const route = useRoute();
    const router = useRouter();
</script>
