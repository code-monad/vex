export enum SporeOperation {
    MINT = 'mint',
    TRANSFER = 'transfer',
    MELT = 'melt'
}

export enum ClusterOperation {
    CREATE = 'create',
    TRANSFER = 'transfer'
}

export interface SporeEvent {
    txHash: string;
    operation: SporeOperation;
    sporeId: string;
    fromAddress?: string;  // undefined for MINT
    toAddress?: string;    // undefined for MELT
    contentType: string;
    content: string;
    clusterId?: string;
    timestamp: Date;
}

export interface ClusterEvent {
    txHash: string;
    operation: ClusterOperation;
    clusterId: string;
    fromAddress?: string;  // undefined for CREATE
    toAddress: string;
    name: string;
    description: string;
    timestamp: Date;
}
