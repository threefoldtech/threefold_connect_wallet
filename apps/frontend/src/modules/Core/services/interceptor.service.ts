import axios from 'axios';
import { isDev } from '@/modules/Core/utils/environment';

export const useAxiosInterceptor = () => {
    axios.interceptors.response.use(undefined, error => {
        if (isDev) return;

        console.error(
            error?.config ? `${error.message}: ${error?.config?.method.toUpperCase()} ${error?.config?.url}` : error
        );
    });
};
