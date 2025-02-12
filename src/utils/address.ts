import { Script, HashType } from '@ckb-ccc/core';
import { bech32 } from 'bech32';

export enum AddressType {
  MAINNET = 'ckb',
  TESTNET = 'ckt',
}

export enum CodeHashIndex {
  SECP256K1_BLAKE160 = '0x00',
  MULTISIG_SECP256K1_BLAKE160 = '0x01',
  ANYONE_CAN_PAY = '0x02',
}

export class Address {
  private static SHORT_PAYLOAD_VERSION = 0x01;
  private static FULL_PAYLOAD_VERSION = 0x02;

  static encode(
    script: Script,
    prefix: AddressType = AddressType.MAINNET,
    shortFormat: boolean = false
  ): string {
    try {
      // Create payload based on format
      const payload = shortFormat 
        ? this.createShortPayload(script)
        : this.createFullPayload(script);

      // Convert payload to 5-bit words for bech32 encoding
      const words = bech32.toWords(Buffer.from(payload, 'hex'));

      // Encode using bech32
      return bech32.encode(prefix, words, 250);
    } catch (error) {
      throw new Error(`Failed to encode address: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static decode(address: string): {
    script: Script;
    prefix: AddressType;
  } {
    try {
      // Decode bech32 address
      const { prefix, words } = bech32.decode(address, 250);
      
      // Convert words back to payload
      const payload = Buffer.from(bech32.fromWords(words)).toString('hex');
      
      // Validate prefix
      if (prefix !== AddressType.MAINNET && prefix !== AddressType.TESTNET) {
        throw new Error(`Invalid address prefix: ${prefix}`);
      }

      // Parse payload version
      const version = parseInt(payload.slice(0, 2), 16);
      
      let script: Script;
      switch (version) {
        case this.SHORT_PAYLOAD_VERSION:
          script = this.parseShortPayload(payload);
          break;
        case this.FULL_PAYLOAD_VERSION:
          script = this.parseFullPayload(payload);
          break;
        default:
          throw new Error(`Unsupported address version: ${version}`);
      }

      return {
        script,
        prefix: prefix as AddressType,
      };
    } catch (error) {
      throw new Error(`Failed to decode address: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private static createShortPayload(script: Script): string {
    // Get code hash index for supported short formats
    const codeHashIndex = this.getCodeHashIndex(script.codeHash);
    if (!codeHashIndex) {
      throw new Error('Script not supported in short format');
    }

    // Format: version(0x01) | code hash index | args
    return `01${codeHashIndex.slice(2)}${script.args.slice(2)}`;
  }

  private static createFullPayload(script: Script): string {
    // Format: version(0x02) | code hash | hash type | args
    const hashType = this.encodeHashType(script.hashType);
    return `02${script.codeHash.slice(2)}${hashType}${script.args.slice(2)}`;
  }

  private static parseShortPayload(payload: string): Script {
    const codeHashIndex = `0x${payload.slice(2, 4)}`;
    const args = `0x${payload.slice(4)}`;
    
    const codeHash = this.getCodeHashFromIndex(codeHashIndex);
    if (!codeHash) {
      throw new Error(`Unknown code hash index: ${codeHashIndex}`);
    }

    return new Script(
      codeHash as `0x${string}`,
      'type' as HashType,
      args as `0x${string}`
    );
  }

  private static parseFullPayload(payload: string): Script {
    const codeHash = `0x${payload.slice(2, 66)}`;
    const hashType = this.decodeHashType(payload.slice(66, 68));
    const args = `0x${payload.slice(68)}`;

    return new Script(
      codeHash as `0x${string}`,
      hashType,
      args as `0x${string}`
    );
  }

  private static getCodeHashIndex(codeHash: string): string | undefined {
    // Map code hashes to their indexes
    const codeHashMap: Record<string, string> = {
      '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8': CodeHashIndex.SECP256K1_BLAKE160,
      '0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8': CodeHashIndex.MULTISIG_SECP256K1_BLAKE160,
      '0xd369597ff47f29fbc0d47d2e3775370d1250b85140c670e4718af712983a2354': CodeHashIndex.ANYONE_CAN_PAY,
    };

    return codeHashMap[codeHash.toLowerCase()];
  }

  private static getCodeHashFromIndex(index: string): string | undefined {
    // Reverse mapping from indexes to code hashes
    const indexMap: Record<string, string> = {
      [CodeHashIndex.SECP256K1_BLAKE160]: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
      [CodeHashIndex.MULTISIG_SECP256K1_BLAKE160]: '0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8',
      [CodeHashIndex.ANYONE_CAN_PAY]: '0xd369597ff47f29fbc0d47d2e3775370d1250b85140c670e4718af712983a2354',
    };

    return indexMap[index.toLowerCase()];
  }

  private static encodeHashType(hashType: string): string {
    const hashTypeMap: Record<string, string> = {
      'type': '00',
      'data': '01',
      'data1': '02',
      'data2': '03',
    };
    
    const encoded = hashTypeMap[hashType];
    if (!encoded) {
      throw new Error(`Unsupported hash type: ${hashType}`);
    }
    
    return encoded;
  }

  private static decodeHashType(encoded: string): HashType {
    const hashTypeMap: Record<string, HashType> = {
      '00': 'type',
      '01': 'data',
      '02': 'data1',
      '03': 'data2',
    };
    
    const hashType = hashTypeMap[encoded];
    if (!hashType) {
      throw new Error(`Unknown hash type code: ${encoded}`);
    }
    
    return hashType;
  }
}
