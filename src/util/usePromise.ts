import { ref } from 'vue';

export const usePromise = <T>(promise: Promise<T>) => {
    const isLoading = ref(true);
    const data = ref<T | undefined>();
    promise.then(value => {
        data.value = value;
        isLoading.value = false;
    });

    return { data, isLoading };
};

export default usePromise;
