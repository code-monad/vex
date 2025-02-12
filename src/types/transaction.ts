export interface Script {
  codeHash: string;
  hashType: 'type' | 'data';
  args: string;
}

export interface Cell {
  capacity: string;
  lock: Script;
  type?: Script | null;
}

export interface CellDep {
  depType: 'code' | 'dep_group';
  outPoint: {
    txHash: string;
    index: string;
  };
}

export interface Input extends Cell {
  previousOutput: {
    txHash: string;
    index: string;
  };
  since: string;
}

export interface Transaction {
  hash: string;
  inputs: Input[];
  outputs: Cell[];
  outputsData: string[];
  cellDeps: CellDep[];
  headerDeps: string[];
  version: string;
  witnesses: string[];
}
