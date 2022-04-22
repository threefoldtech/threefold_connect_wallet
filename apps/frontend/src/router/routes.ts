import {_RouteRecordBase, RouteComponent, RouteLocationNormalized, RouteRecordRaw, RouterView} from 'vue-router';
import WalletList from '@/views/WalletList.vue';
import Overview from '@/views/wallet/Overview.vue';
import Info from '@/views/wallet/Info.vue';
import Transactions from '@/views/wallet/Transactions.vue';
import Vesting from '@/views/wallet/Vesting.vue';
import PathNotFound from '@/views/PathNotFound.vue';
import Init from '@/views/Init.vue';
import FarmerInit from '@/views/FarmerInit.vue';
import Farmer from '@/views/Farmer.vue';
import TestView from '@/views/TestView.vue';
import WalletImport from '@/views/WalletImport.vue';
import WalletShell from '@/views/wallet/WalletShell.vue';
import Send from '@/views/transfer/Send.vue';
import DevShell from '@/views/dev/DevShell.vue';
import Logs from '@/views/dev/Logs.vue';
import Actions from '@/views/dev/Actions.vue';
import Receive from '@/views/transfer/Receive.vue';
import NoWalletsScreen from '@/views/NoWalletsScreen.vue';
import FirstWalletInit from '@/views/FirstWalletInit.vue';
import ConfirmSend from '@/views/transfer/ConfirmSend.vue';
import ConfirmBridge from '@/views/transfer/ConfirmBridge.vue';
import Bridge from '@/views/transfer/Bridge.vue';
import {
    BeakerIcon,
    CashIcon,
    InformationCircleIcon,
    SwitchHorizontalIcon,
    TableIcon,
    TrendingUpIcon,
} from '@heroicons/vue/outline';
import flagsmith from 'flagsmith';
import {NavItem} from '@/types';
import axios from 'axios';
import {RenderFunction} from 'vue';

interface Route extends _RouteRecordBase {
    component?: RouteComponent | (() => Promise<RouteComponent>);
    props?: boolean | Record<string, any> | ((to: RouteLocationNormalized) => Record<string, any>);
    meta?: {
        activeNav?: string;
        bottomNav?: NavItem[] | (() => NavItem[]);
        [key: string]: any;
    };
}

const viteEnableFarmers = false;

const farmerOnly: number = 0;

export const routes: Route[] = [
    {
        path: '/farmer',
        name: 'farmer',
        component: Farmer,
    },
    {
        path: '/',
        name: 'walletList',
        component: WalletList,
    },
    {
        path: '/dev',
        name: 'dev',
        component: DevShell,
        children: [
            {
                path: '',
                name: 'devLogs',
                component: Logs,
                meta: {
                    activeNav: 'devLogs',
                },
            },
            {
                path: '',
                name: 'devActions',
                component: Actions,
                meta: {
                    activeNav: 'devActions',
                },
            },
        ],
        meta: {
            bottomNav: [
                {name: 'devLogs', icon: <RenderFunction>TableIcon},
                {name: 'devActions', icon: <RenderFunction>BeakerIcon},
            ],
        },
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
                {name: 'walletOverview', icon: <RenderFunction>CashIcon},
                ...(flagsmith.hasFeature('transactionOverview')
                    ? [{name: 'walletTransactions', icon: <RenderFunction>SwitchHorizontalIcon}]
                    : []),
                {name: 'walletInfo', icon: <RenderFunction>InformationCircleIcon},
                ...(flagsmith.hasFeature('vesting')
                    ? [{name: 'walletVesting', icon: <RenderFunction>TrendingUpIcon}]
                    : []),
            ],
        },
    },
    {
        path: '/transfer',
        component: RouterView,
        children: [
            {
                path: 'send',
                name: 'send',
                component: Send,
                props: true,
            },
            {
                path: 'receive/',
                name: 'receive',
                component: Receive,
                props: true,
            },
            {
                path: 'confirm/send/:from/:to/:amount/:asset',
                name: 'confirmSend',
                component: ConfirmSend,
            },
            {
                path: 'confirm/bridge/:walletId/:amount',
                name: 'confirmBridge',
                component: ConfirmBridge,
            },
            {
                path: 'bridge/:basePublicKey',
                name: 'bridge',
                component: Bridge,
            },
        ],
    },
    {
        path: '/init',
        name: 'init',
        component: farmerOnly === 1 ? FarmerInit : Init,
        props: true,
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
        redirect: '/404',
    },
];
