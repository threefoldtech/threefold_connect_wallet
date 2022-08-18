import { balances } from '@/modules/Wallet/services/walletService';
import { computed } from 'vue';
import { IAssetBalance } from 'shared-types';
import { IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';

export const useAssets = (wallet: IWallet) =>
    computed<IAssetBalance[]>(() => {
        const publicKey = wallet.keyPair.getBasePublicKey();
        const balance = balances.value?.find(t => t.id === publicKey);
        return balance?.assets || [];
    });
