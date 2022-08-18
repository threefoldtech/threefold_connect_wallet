export enum ExtrinsicStatus {
    FUTURE = 'Future',
    READY = 'Ready',
    BROADCAST = 'Broadcast',
    IN_BLOCK = 'InBlock',
    RETRACTED = 'Retracted',
    FINALLY_TIMEOUT = 'FinalityTimeout',
    FINALIZED = 'Finalized',
    USURPED = 'Usurped',
    DROPPED = 'Dropped',
    INVALID = 'Invalid',
}

export enum ExtrinsicCallbackMethod {
    FARM_DELETED = 'FarmDeleted',
    FARM_CREATED = 'FarmCreated',
}