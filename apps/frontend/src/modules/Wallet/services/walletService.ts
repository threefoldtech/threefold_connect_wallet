import { Ref, ref } from 'vue';
import { Horizon, ServerApi } from 'stellar-sdk';
import flagsmith from 'flagsmith';
import { useLocalStorage } from '@vueuse/core';
import { WalletKeyPairBuilder } from '@/modules/Core/models/keypair.model';
import { getPkidClient } from '@/modules/Pkid/services/pkid.service';
import { getStellarClient } from '@/modules/Stellar/services/stellarService';
import { appKeyPair } from '@/modules/Core/services/crypto.service';
import { ChainTypes, IAllowedAsset, IAssetBalance, IBalance } from 'shared-types';
import AccountRecord = ServerApi.AccountRecord;
import CollectionPage = ServerApi.CollectionPage;
import BalanceLineAsset = Horizon.BalanceLineAsset;
import BalanceLine = Horizon.BalanceLine;
import { PkidNamedKeys } from 'shared-types/src/enums/global/pkid.enums';
import { IFlutterWallet, IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';
import { IPkidWallet } from 'shared-types/src/interfaces/global/pkid.interfaces';
import { IOperations } from 'shared-types/src/interfaces/global/operation.interfaces';
import OperationRecord = ServerApi.OperationRecord;

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

export const getStellarBalance = async (wallet: IWallet): Promise<AccountRecord> => {
    const server = getStellarClient();
    return await server.accounts().accountId(wallet.keyPair.getStellarKeyPair().publicKey()).call();
};

export const handleAccountRecord = (wallet: IWallet, res: AccountRecord) => {
    const allowedAssets: IAllowedAsset[] = JSON.parse(<string>flagsmith.getValue('supported-currencies'));

    const balance: IBalance = balances.value.find(value => value.id === wallet.keyPair.getBasePublicKey()) || {
        id: wallet.keyPair.getBasePublicKey(),
        assets: [],
    };
    const stellarAssets: IAssetBalance[] = res.balances
        .map((balance: BalanceLine): IAssetBalance => {
            const assetCode =
                balance.asset_type === 'native'
                    ? 'XLM'
                    : (<BalanceLineAsset<'credit_alphanum4'> | BalanceLineAsset<'credit_alphanum12'>>balance)
                          ?.asset_code;
            return {
                name: assetCode,
                amount: Number(balance.balance),
                type: ChainTypes.STELLAR,
                issuer: (<BalanceLineAsset<'credit_alphanum4'> | BalanceLineAsset<'credit_alphanum12'>>balance)
                    ?.asset_issuer,
            };
        })
        .filter(a =>
            allowedAssets.find(allowedAsset => allowedAsset.asset_code === a.name && allowedAsset.issuer === a.issuer)
        );

    balance.assets = mergeAssets(...stellarAssets, ...balance.assets);
    const index = balances.value.findIndex(lb => lb.id === balance.id);

    index === -1 ? balances.value.push(balance) : balances.value.splice(index, 1, balance);
};

//@todo: make this better
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

        //@ts-ignore
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
                position: wallet.position,
            },
        };
    });
};
