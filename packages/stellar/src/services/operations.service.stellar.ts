import { getStellarClient } from './core.service.stellar';
import { ServerApi } from 'stellar-sdk';
import { IOperations } from 'shared-types/src/interfaces/global/operation.interfaces';
import CollectionPage = ServerApi.CollectionPage;
import OperationRecord = ServerApi.OperationRecord;
import { operations } from 'wallet-frontend/src/modules/Wallet/services/wallet.service';

export const getOperationsInLocalStorage = async (
    basePublicKey: string,
    address: string,
    supportedAssets: string[],
    cursor: number = 0
): Promise<void> => {
    const retrievedOperations = (await getOperationsFromStellar(address, cursor)).records;

    const filteredOperation = retrievedOperations.filter(
        (o: OperationRecord) => supportedAssets.findIndex(() => (<any>o)?.asset_type) != -1
    );

    const walletOperationsObject: IOperations = operations.value.find(o => o.id === basePublicKey) || {
        operations: [],
        id: basePublicKey,
    };

    filteredOperation.forEach((operation: OperationRecord) => {
        const operationIdx = walletOperationsObject.operations.findIndex((o: OperationRecord) => o.id === operation.id);

        operationIdx === -1
            ? walletOperationsObject.operations.push(operation)
            : walletOperationsObject.operations.splice(operationIdx, 1, operation);

        walletOperationsObject.operations
            .sort((a, b) => {
                if (a.created_at === b.created_at) return -b.id.localeCompare(a.id);

                return -b.created_at.localeCompare(a.created_at);
            })
            .reverse();
    });

    const index = operations.value.findIndex(t => t.id === walletOperationsObject.id);

    index === -1
        ? operations.value.push(walletOperationsObject)
        : operations.value.splice(index, 1, walletOperationsObject);
};

const getOperationsFromStellar = async (
    address: string,
    cursor: number = 0
): Promise<CollectionPage<OperationRecord>> => {
    const client = getStellarClient();

    const callBuilder = client.operations().forAccount(address).order('desc').limit(200);
    if (cursor) callBuilder.cursor(cursor);

    return await callBuilder.call();
};
