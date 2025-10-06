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
    mainContract: '0xA67264D67Ea9fa84c820004E32d45B93c9C0CE65',
    tokenContract: '0xA2B74d35e1352f77cafCaB676f39424fD8e3D690',
    nftContract: '0x5C6d74D06aE7695f63A75529D2E271f08d0a28E6',
    chainId: 42101,
    chainName: 'Push Donut Testnet',
  },
};

export const getChainConfig = (chainId: number): ChainConfig | undefined =>
  CHAIN_CONFIGS[chainId];