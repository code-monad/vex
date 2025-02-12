export interface Script {
    code_hash: string;
    hash_type: string;
    args: string;
}

export interface Cell {
    capacity: string;
    lock: Script;
    type?: Script | null;
}

export interface CellDep {
    dep_type: 'code' | 'dep_group';
    out_point: {
        tx_hash: string;
        index: string;
    };
}

export interface Input extends Cell {
    previous_output: {
        tx_hash: string;
        index: string;
    };
    since: string;
}

export interface Transaction {
    hash: string;
    cell_deps: {
        dep_type: string;
        out_point: {
            index: string;
            tx_hash: string;
        };
    }[];
    header_deps: string[];
    inputs: {
        previous_output: {
            index: string;
            tx_hash: string;
        };
        since: string;
        capacity?: string;
        lock?: Script;
        type?: Script;
    }[];
    outputs: {
        capacity: string;
        lock: Script;
        type: Script | null;
    }[];
    outputs_data: string[];
    version: string;
    witnesses: string[];
}
