import { _RouteRecordBase, RouteComponent, RouteLocationNormalized } from 'vue-router';
import { NavItem } from '@/types';
import axios from 'axios';
import { farmRoutes } from '@/modules/Farm/router';
import { devRoutes } from '@/modules/Dev/router';
import { walletRoutes } from '@/modules/Wallet/router';
import { transferRoutes } from '@/modules/Transfer/router';
import { bridgeRoutes } from '@/modules/Bridge/router';

export interface Route extends _RouteRecordBase {
    component?: RouteComponent | (() => Promise<RouteComponent>);
    props?: boolean | Record<string, any> | ((to: RouteLocationNormalized) => Record<string, any>);
    meta?: {
        activeNav?: string;
        bottomNav?: NavItem[] | (() => NavItem[]);
        [key: string]: any;
    };
}

let farmerOnly = 1;

export const getRoutes = async () => {
    return [...farmRoutes, ...devRoutes, ...walletRoutes, ...transferRoutes, ...bridgeRoutes];
};
