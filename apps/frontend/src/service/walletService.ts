import { Ref, ref } from 'vue';
import { Horizon, ServerApi } from 'stellar-sdk';
import flagsmith from 'flagsmith';
import { getStellarClient } from '@/service/stellarService';
import { PkidWalletTypes } from '@/service/initializationService';
import { useLocalStorage } from '@vueuse/core';
import { WalletKeyPair } from '@/lib/WalletKeyPair';
import { bytesToHex } from '@/util/crypto';
import { getPkidClient, PkidWallet } from '@/service/pkidService';
import AccountRecord = ServerApi.AccountRecord;
import CollectionPage = ServerApi.CollectionPage;
import BalanceLineAsset = Horizon.BalanceLineAsset;
import OperationRecord = ServerApi.OperationRecord;
import BalanceLine = Horizon.BalanceLine;

export interface Wallet {
    name: string;
    keyPair: WalletKeyPair;

    meta: {
        position?: number;
        chain: 'stellar';
        type: PkidWalletTypes;
        index?: number;
    };
}

export interface AllowedAsset {
    name: string; //asset name
    type: 'stellar' | 'substrate';
    asset_code: string;
    issuer?: string;
}

export interface AssetBalance {
    name: string; //asset name
    amount: number;
    type: 'stellar' | 'substrate';
    issuer?: string;
}

export interface Balance {
    id: string; // walletId
    assets: AssetBalance[];
}

export interface Operation {
    id: string;
    operations: OperationRecord[];
    cursor?: string;
}

export const wallets: Ref<Wallet[]> = <Ref<Wallet[]>>ref<Wallet[]>([]);
export const balances: Ref<Balance[]> = useLocalStorage<Balance[]>('balance_cache', []); // @TODO: check when to clear cache
export const operations: Ref<Operation[]> = useLocalStorage<Operation[]>('operations_cache', []); // @TODO: check when to clear cache

export const getStellarBalance = async (wallet: Wallet): Promise<AccountRecord> => {
    const server = getStellarClient();
    return await server.accounts().accountId(wallet.keyPair.getStellarKeyPair().publicKey()).call();
};
export const getOperations = async (wallet: Wallet, cursor?: string): Promise<CollectionPage<OperationRecord>> => {
    const server = getStellarClient();
    const callBuilder = server
        .operations()
        .forAccount(wallet.keyPair.getStellarKeyPair().publicKey())
        .order('desc')
        .limit(200);
    if (cursor) callBuilder.cursor(cursor);

    return await callBuilder.call();
};

export const handleAccountRecord = (wallet: Wallet, res: AccountRecord) => {
    const allowedAssets: AllowedAsset[] = JSON.parse(<string>flagsmith.getValue('supported-currencies'));

    const balance: Balance = balances.value.find(value => value.id === wallet.keyPair.getBasePublicKey()) || {
        id: wallet.keyPair.getBasePublicKey(),
        assets: [],
    };
    const stellarAssets: AssetBalance[] = res.balances
        .map((balance: BalanceLine): AssetBalance => {
            const assetCode =
                balance.asset_type === 'native'
                    ? 'xlm'
                    : (<BalanceLineAsset<'credit_alphanum4'> | BalanceLineAsset<'credit_alphanum12'>>balance)
                          ?.asset_code;
            return {
                name: assetCode,
                amount: Number(balance.balance),
                type: 'stellar',
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
export const mergeAssets = (...assets: AssetBalance[]) => {
    return assets
        .filter(
            (value, index, self) =>
                self.findIndex(v => v.name === value.name && v.issuer === value.issuer && v.type === v.type) === index
        )
        .sort((a, b) => {
            if (a.name === b.name) return b.type.localeCompare(a.type);

            return b.name.localeCompare(a.name);
        });
};

export const handleOperationRecordPage = (page: CollectionPage<OperationRecord>, wallet: Wallet) => {
    const publicKey = wallet.keyPair.getStellarKeyPair().publicKey();
    const operation: Operation = operations.value.find(o => o.id === publicKey) || { operations: [], id: publicKey };
    const allowedAssets: string[] = JSON.parse(<string>flagsmith.getValue('currencies')).map((a: any) => a.asset_code);

    page.records.forEach((operationRecord: OperationRecord) => {
        const index = operation.operations.findIndex(t => t.id === operationRecord.id);

        operation.cursor = operationRecord.paging_token;

        // @ts-ignore
        if (allowedAssets.indexOf(operationRecord?.asset_code) === -1) return;

        index === -1
            ? operation.operations.push(operationRecord)
            : operation.operations.splice(index, 1, operationRecord);

        operation.operations.sort((a, b) => {
            if (a.created_at === b.created_at) return -b.id.localeCompare(a.id);

            return -b.created_at.localeCompare(a.created_at);
        });
    });

    const index = operations.value.findIndex(t => t.id === operation.id);

    index === -1 ? operations.value.push(operation) : operations.value.splice(index, 1, operation);
};
export const saveWallets = async () => {
    const pkidWallets: PkidWallet[] = wallets.value.map(
        (wallet: Wallet): PkidWallet => ({
            type: wallet.meta.type,
            name: wallet.name,
            index: wallet.meta.index,
            seed: bytesToHex(wallet.keyPair.getStellarKeyPair().rawSecretKey()),
            chain: 'stellar',
        })
    );

    const pkid = getPkidClient();
    await pkid.setDoc('purse', pkidWallets, true);
};
export const addOrUpdateWallet = (wallet: Wallet) => {
    const index = wallets.value.findIndex(w => w.keyPair.getBasePublicKey() === wallet.keyPair.getBasePublicKey());

    if (index === -1) {
        wallets.value.push(wallet);
        return;
    }
    wallets.value = [...wallets.value.slice(0, index), wallet, ...wallets.value.slice(index + 1)];
};
