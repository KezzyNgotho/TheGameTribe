// // src/config/contracts.ts

export interface ChainConfig {
  mainContract: string;
  tokenContract: string;
  nftContract: string;
  chainId: number;
  chainName: string;
}

export const CHAIN_CONFIGS: { [key: number]: ChainConfig } = {
  42101: {
    mainContract: '0x39f933D41A7249d03df58b5FEc9470fB7e1Fbaf3',
    tokenContract: '0xb47Ea6Ec7fc6C56E74253797aC069f14632d7B4e',
    nftContract: '0x84E18baEd80a10d90e948cbe5aA3B5611108745A',
    chainId: 42101,
    chainName: 'Push Donut Testnet',
  },
};

export const getChainConfig = (chainId: number): ChainConfig | undefined =>
  CHAIN_CONFIGS[chainId];