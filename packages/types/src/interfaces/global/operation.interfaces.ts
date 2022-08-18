import { ServerApi } from 'stellar-sdk';

import OperationRecord = ServerApi.OperationRecord;

export interface IOperation {
    id: string;
    operations: OperationRecord[];
    cursor?: string;
}
