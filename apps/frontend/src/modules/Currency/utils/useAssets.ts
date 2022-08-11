import { balances, Wallet } from '@/modules/Wallet/services/walletService';
import { computed } from 'vue';
import { IAssetBalance } from 'shared-types';

export const useAssets = (wallet: Wallet) =>
    computed<IAssetBalance[]>(() => {
        const publicKey = wallet.keyPair.getBasePublicKey();
        const balance = balances.value?.find(t => t.id === publicKey);
        return balance?.assets || [];
    });
