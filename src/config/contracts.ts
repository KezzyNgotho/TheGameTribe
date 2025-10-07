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
    mainContract: '0x66aDA2b13F8813FDd38c0A2e23F9a8e4BfCE5510',
    tokenContract: '0xF86923B8d9Ebd71493648Cc65CBccb3312138017',
    nftContract: '0x1652FC1a8dAA76B5cb70D05bC96BD9bdDc6D50b0',
    chainId: 42101,
    chainName: 'Push Donut Testnet',
  },
};

export const getChainConfig = (chainId: number): ChainConfig | undefined =>
  CHAIN_CONFIGS[chainId];