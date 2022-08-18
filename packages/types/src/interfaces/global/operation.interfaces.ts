import { ServerApi } from 'stellar-sdk';

import OperationRecord = ServerApi.OperationRecord;

export interface IOperations {
    id: string;
    operations: OperationRecord[];
}
