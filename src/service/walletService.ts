import { Ref, ref } from 'vue';
import { Horizon, Keypair, ServerApi } from 'stellar-sdk';
import flagsmith from 'flagsmith';
import { getStellarClient } from '@/service/stellarService';
import { PkidWalletTypes } from '@/service/initializationService';
import { useLocalStorage } from '@vueuse/core';
import AccountRecord = ServerApi.AccountRecord;
import CollectionPage = ServerApi.CollectionPage;
import BalanceLineAsset = Horizon.BalanceLineAsset;
import OperationRecord = ServerApi.OperationRecord;
import BalanceLine = Horizon.BalanceLine;

export interface Wallet {
    name: string;
    keyPair: Keypair;

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

export const wallets: Ref<Wallet[]> = ref<Wallet[]>([]);
export const balances: Ref<Balance[]> = useLocalStorage<Balance[]>('balance_cache', []);
export const operations: Ref<Operation[]> = useLocalStorage<Operation[]>('operations_cache', []);

export const getBalance = async (wallet: Wallet): Promise<AccountRecord> => {
    const server = getStellarClient();
    return await server.accounts().accountId(wallet.keyPair.publicKey()).call();
};
export const getOperations = async (wallet: Wallet, cursor?: string): Promise<CollectionPage<OperationRecord>> => {
    const server = getStellarClient();
    const callBuilder = server.operations().forAccount(wallet.keyPair.publicKey());
    if (cursor) callBuilder.cursor(cursor);

    return await callBuilder.call();
};

export const handleAccountRecord = (wallet: Wallet, res: AccountRecord) => {
    const allowedAssets: AllowedAsset[] = JSON.parse(<string>flagsmith.getValue('currencies'));

    const assets: AssetBalance[] = res.balances
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

    const balance: Balance = {
        id: wallet.keyPair.publicKey(),
        assets,
    };
    const index = balances.value.findIndex(lb => lb.id === balance.id);

    index === -1 ? balances.value.push(balance) : balances.value.splice(index, 1, balance);
};

export const handleOperationRecordPage = (page: CollectionPage<OperationRecord>, wallet: Wallet) => {
    const publicKey = wallet.keyPair.publicKey();
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
    });

    const index = operations.value.findIndex(t => t.id === operation.id);

    index === -1 ? operations.value.push(operation) : operations.value.splice(index, 1, operation);
};
