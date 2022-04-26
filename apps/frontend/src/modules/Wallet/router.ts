import WalletList from '@/modules/Wallet/views/WalletList.vue';
import WalletImport from '@/modules/Wallet/views/WalletImport.vue';
import WalletShell from '@/modules/Wallet/views/wallet/WalletShell.vue';
import Overview from '@/modules/Wallet/views/wallet/Overview.vue';
import Transactions from '@/modules/Wallet/views/wallet/Transactions.vue';
import Info from '@/modules/Wallet/views/wallet/Info.vue';
import Vesting from '@/modules/Wallet/views/wallet/Vesting.vue';
import { RenderFunction } from 'vue';
import { CashIcon, InformationCircleIcon, SwitchHorizontalIcon, TrendingUpIcon } from '@heroicons/vue/outline';
import flagsmith from 'flagsmith';
import FirstWalletInit from '@/modules/Wallet/views/FirstWalletInit.vue';
import NoWalletsScreen from '@/modules/Wallet/views/NoWalletsScreen.vue';
import { Router } from 'vue-router';

export const walletRoutes = [
    {
        path: '/',
        name: 'walletList',
        component: WalletList,
    },
    {
        path: '/import',
        name: 'walletImport',
        component: WalletImport,
    },
    {
        path: '/wallet/:wallet',
        component: WalletShell,
        children: [
            {
                path: '',
                name: 'walletOverview',
                component: Overview,
                meta: {
                    activeNav: 'walletOverview',
                },
            },
            {
                path: 'transactions/:assetCode?',
                name: 'walletTransactions',
                component: Transactions,
                meta: {
                    activeNav: 'walletTransactions',
                },
            },
            {
                path: 'info',
                name: 'walletInfo',
                component: Info,
                meta: {
                    activeNav: 'walletInfo',
                },
            },
            {
                path: 'vesting',
                name: 'walletVesting',
                component: Vesting,
                meta: {
                    activeNav: 'walletVesting',
                },
            },
        ],
        meta: {
            bottomNav: () => [
                { name: 'walletOverview', icon: <RenderFunction>CashIcon },
                ...(flagsmith.hasFeature('transactionOverview')
                    ? [{ name: 'walletTransactions', icon: <RenderFunction>SwitchHorizontalIcon }]
                    : []),
                { name: 'walletInfo', icon: <RenderFunction>InformationCircleIcon },
                ...(flagsmith.hasFeature('vesting')
                    ? [{ name: 'walletVesting', icon: <RenderFunction>TrendingUpIcon }]
                    : []),
            ],
        },
    },
    {
        path: '/firstWalletInit',
        name: 'firstWalletInit',
        component: FirstWalletInit,
        props: true,
    },
    {
        path: '/noWalletsScreen',
        name: 'noWalletsScreen',
        component: NoWalletsScreen,
        props: true,
    },
];
export default async (router: Router) => {
    for (const route of walletRoutes) {
        router.addRoute(route);
    }
};
