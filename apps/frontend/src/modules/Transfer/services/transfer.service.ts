import axios from 'axios';
import { Ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';

export const selectedTransaction: Ref<string> = useLocalStorage('selectedTransaction', '');

export const obtainMemoFromTransactionUrl = async (url: string): Promise<string | null> => {
    try {
        return (await axios.get(url))?.data.memo;
    } catch (e) {
        return null;
    }
};
