import { RouteRecordRaw, RouterView } from 'vue-router';
import WalletList from '@/views/WalletList.vue';
import Overview from '@/views/wallet/Overview.vue';
import Info from '@/views/wallet/Info.vue';
import Transactions from '@/views/wallet/Transactions.vue';
import Vesting from '@/views/wallet/Vesting.vue';
import PathNotFound from '@/views/PathNotFound.vue';
import Init from '@/views/Init.vue';
import TestView from '@/views/TestView.vue';
import WalletImport from '@/views/WalletImport.vue';
import Wallet from '@/views/Wallet.vue';
import Send from '@/views/transfer/Send.vue';
import Receive from '@/views/transfer/Receive.vue';
import FirstWalletInit from '@/views/FirstWalletInit.vue';

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'walletList',
        component: WalletList,
    },
    {
        path: '/listBalances',
        name: 'test',
        component: TestView,
    },
    {
        path: '/import',
        name: 'walletImport',
        component: WalletImport,
    },
    {
        path: '/wallet/:wallet',
        component: Wallet,
        children: [
            {
                path: '',
                name: 'walletOverview',
                component: Overview,
                meta: {
                    activeWalletNav: 'walletOverview',
                },
            },
            {
                path: 'transactions/:assetCode?',
                name: 'walletTransactions',
                component: Transactions,
                meta: {
                    activeWalletNav: 'walletTransactions',
                },
            },
            {
                path: 'info',
                name: 'walletInfo',
                component: Info,
                meta: {
                    activeWalletNav: 'walletInfo',
                },
            },
            {
                path: 'vesting',
                name: 'walletVesting',
                component: Vesting,
                meta: {
                    activeWalletNav: 'walletVesting',
                },
            },
        ],
    },
    {
        path: '/transfer',
        component: RouterView,
        children: [
            {
                path: 'send/:from?',
                name: 'send',
                component: Send,
            },
            {
                path: 'receive/:to?',
                name: 'receive',
                component: Receive,
            },
        ],
    },
    {
        path: '/init',
        name: 'init',
        component: Init,
        props: true,
    },
    {
        path: '/firstWalletInit/:address',
        name: 'firstWalletInit',
        component: FirstWalletInit,
        props: true,
    },
    {
        path: '/404',
        name: '404',
        component: PathNotFound,
        // Allows props to be passed to the 404 page through route
        // params, such as `resource` to define what wasn't found.
        props: true,
    },
    {
        path: '/error',
        name: 'error',
        component: PathNotFound,
        // Allows props to be passed to the 404 page through route
        // params, such as `resource` to define what wasn't found.
        props: true,
    },
    {
        path: '/:pathMatch(.*)',
        redirect: '404',
    },
];
