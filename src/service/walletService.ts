import { Ref, ref } from 'vue';
import { Keypair } from 'stellar-base';
import flagsmith from 'flagsmith';
import { Horizon, Server, ServerApi } from 'stellar-sdk';
import AccountRecord = ServerApi.AccountRecord;
import CollectionPage = ServerApi.CollectionPage;
import TransactionRecord = ServerApi.TransactionRecord;
import BalanceLineAsset = Horizon.BalanceLineAsset;
import OperationRecord = ServerApi.OperationRecord;
import { getStellarClient } from '@/service/stellarService';

export interface Wallet {
    name: string;
    keyPair: Keypair;
}

export interface AssetBalance {
    name: string;
    amount: number;
}

export interface Balance {
    id: string;
    assets: AssetBalance[];
}

export interface Operation {
    id: string;
    operations: OperationRecord[];
    cursor?: string;
}

export const wallets: Ref<Wallet[]> = ref<Wallet[]>([]);
export const balances: Ref<Balance[]> = ref<Balance[]>([]);
export const transactions: Ref<TransactionRecord[]> = ref<TransactionRecord[]>([]);
export const operations: Ref<Operation[]> = ref<Operation[]>([]);

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
    // res?.transactions().then((page: CollectionPage<TransactionRecord>) => {
    //     page.records.forEach((transactionRecord: TransactionRecord) => {
    //         const index = transactions.value.findIndex(t => t.id === transactionRecord.id);
    //
    //         index === -1
    //             ? transactions.value.push(transactionRecord)
    //             : transactions.value.splice(index, 1, transactionRecord);
    //     });
    // });
    const allowedAssets: string[] = JSON.parse(<string>flagsmith.getValue('currencies')).map((a: any) => a.asset_code);

    const assets: { name: string; amount: number }[] = res.balances
        .map(balance => {
            const assetCode =
                balance.asset_type === 'native'
                    ? 'xlm'
                    : (<BalanceLineAsset<'credit_alphanum4'> | BalanceLineAsset<'credit_alphanum12'>>balance)
                          ?.asset_code;
            return {
                name: assetCode,
                amount: Number(balance.balance),
            };
        })
        .filter(a => allowedAssets.indexOf(a.name) !== -1);

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
