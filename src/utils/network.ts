export type NetworkType = 'mainnet' | 'testnet';

export function resolveNetworkType(network: string): NetworkType {
    const normalized = network.toLowerCase().trim();
    
    const mainnetAliases = ['main', 'mainnet', 'mirana'];
    const testnetAliases = ['test', 'testnet', 'pudge', 'meepo'];
    
    if (mainnetAliases.includes(normalized)) {
        return 'mainnet';
    }
    if (testnetAliases.includes(normalized)) {
        return 'testnet';
    }
    
    throw new Error(`Invalid network type: ${network}. Must be one of: ${[...mainnetAliases, ...testnetAliases].join(', ')}`);
}
