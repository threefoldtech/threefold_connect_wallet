import { Ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';

export const selectedTransaction: Ref<string> = useLocalStorage('selectedTransaction', '');
