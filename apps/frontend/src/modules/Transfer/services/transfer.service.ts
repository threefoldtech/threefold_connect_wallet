import axios from 'axios';

export const obtainMemoFromTransactionUrl = async (url: string): Promise<string | null> => {
    try {
        return (await axios.get(url))?.data.memo;
    } catch (e) {
        return null;
    }
};
