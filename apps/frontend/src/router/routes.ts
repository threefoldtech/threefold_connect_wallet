import { _RouteRecordBase, RouteComponent, RouteLocationNormalized } from 'vue-router';
import { NavItem } from '@/types';

export interface Route extends _RouteRecordBase {
    component?: RouteComponent | (() => Promise<RouteComponent>);
    props?: boolean | Record<string, any> | ((to: RouteLocationNormalized) => Record<string, any>);
    meta?: {
        activeNav?: string;
        bottomNav?: NavItem[] | (() => NavItem[]);
        [key: string]: any;
    };
}
