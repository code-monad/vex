export interface Script {
    codeHash: string;
    hashType: string;
    args: string;
}

export interface Cell {
    capacity: string;
    lock: Script;
    type?: Script;
}

export interface Transaction {
    hash: string;
    inputs: Cell[];
    outputs: Cell[];
    outputsData: string[];
    version: string;
}
