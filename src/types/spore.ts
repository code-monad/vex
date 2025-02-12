import { ccc, mol } from "@ckb-ccc/core";

// Type definitions
export interface SporeData {
  contentType: string;
  content: ccc.BytesLike;
  clusterId?: ccc.HexLike;
}

export interface ClusterData {
  name: string;
  description: string;
}

// Molecule codecs
export const SporeStruct = mol.table({
  contentType: mol.String,
  content: mol.Bytes,
  clusterId: mol.BytesOpt,
});

export const ClusterStruct = mol.table({
  name: mol.String,
  description: mol.String,
});

// Codec functions
export function packSporeData(data: SporeData): Uint8Array {
  return ccc.bytesFrom(SporeStruct.encode(data));
}

export function unpackSporeData(data: ccc.BytesLike): SporeData {
  return SporeStruct.decode(data);
}

export function packClusterData(data: ClusterData): Uint8Array {
  return ccc.bytesFrom(ClusterStruct.encode(data));
}

export function unpackClusterData(data: ccc.BytesLike): ClusterData {
  return ClusterStruct.decode(data);
}
