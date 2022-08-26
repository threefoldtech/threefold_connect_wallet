import { Ref, ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { WalletKeyPairBuilder } from '@/modules/Core/models/keypair.model';
import { IAssetBalance, IBalance } from 'shared-types';
import { IFlutterWallet, IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';
import { IPkidWallet } from 'shared-types/src/interfaces/global/pkid.interfaces';
import { IOperations } from 'shared-types/src/interfaces/global/operation.interfaces';

export const wallets: Ref<IWallet[]> = <Ref<IWallet[]>>ref<IWallet[]>([]);
export const balances: Ref<IBalance[]> = useLocalStorage<IBalance[]>('balance_cache', [], {
    serializer: {
        read(raw: string): IBalance[] {
            const balancesInCache: IBalance[] = JSON.parse(raw);

            return balancesInCache.filter((value, index, array) => {
                return array.findIndex(v => v.id === value.id) === index;
            });
        },
        write(value: IBalance[]): string {
            return JSON.stringify(value);
        },
    },
});

export const operations: Ref<IOperations[]> = useLocalStorage<IOperations[]>('operations_cache', []);

export const mergeAssets = (...assets: IAssetBalance[]) => {
    return assets
        .filter(
            (asset, index, self) =>
                self.findIndex(a => a.name === asset.name && a.issuer === asset.issuer && a.type === a.type) === index
        )
        .sort((a, b) => {
            if (a.name === b.name) return b.type.localeCompare(a.type);
            return b.name.localeCompare(a.name);
        });
};

export const addOrUpdateWallet = (wallet: IWallet) => {
    const index = wallets.value.findIndex(w => w.keyPair.getBasePublicKey() === wallet.keyPair.getBasePublicKey());

    if (index === -1) {
        wallets.value.push(wallet);
        return;
    }
    wallets.value = [...wallets.value.slice(0, index), wallet, ...wallets.value.slice(index + 1)];
};

export const sendWalletDataToFlutter = () => {
    if (!wallets.value) return;

    //@TODO: implement this for substrate / stellar (Only hardcoded stellar atm)
    return new Promise(resolve => {
        const walletsToSend: IFlutterWallet[] = wallets.value.map(wallet => {
            return {
                name: wallet.name,
                chain: 'stellar',
                address: wallet.keyPair.getStellarKeyPair().publicKey(),
            };
        });

        globalThis?.flutter_inappwebview?.callHandler('SAVE_WALLETS', walletsToSend);
        resolve(true);
    });
};

export const mapToWallet = (wallets: IPkidWallet[]): IWallet[] => {
    return wallets.map((wallet: IPkidWallet) => {
        const walletKeyPairBuilder = new WalletKeyPairBuilder();

        if (wallet.seed.split(' ').length === 12) {
            walletKeyPairBuilder.add12WordsSeed(wallet.seed);
        }

        if (wallet.seed.length === 64) {
            walletKeyPairBuilder.addSeed(wallet.seed);
        }

        const walletKeyPair = walletKeyPairBuilder.build();

        if (!walletKeyPair) {
            throw new Error('Error in building the wallet keypair');
        }
        return {
            keyPair: walletKeyPair,
            name: wallet.name,
            meta: {
                index: wallet.index,
                type: wallet.type,
                isPublic: wallet.isPublic,
                position: wallet.position,
            },
        };
    });
};
