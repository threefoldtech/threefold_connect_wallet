import { AssetBalance, balances, Wallet } from '@/service/walletService';
import { computed } from 'vue';

export const useAssets = (wallet: Wallet) =>
    computed<AssetBalance[]>(() => {
        const publicKey = wallet.keyPair.getBasePublicKey();
        const balance = balances.value?.find(t => t.id === publicKey);
        return balance?.assets || [];
    });
