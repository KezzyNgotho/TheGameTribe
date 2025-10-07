import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { AppProps } from 'next/app';
import { WagmiConfig } from 'wagmi';

import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import Layout from '@/components/layout/Layout';

import { chains, wagmiConfig } from '@/utils/wallet-utils';

function MyApp({ Component, pageProps }: AppProps) {
  // Ensure Push Donut (42101) is added/switched on client
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    const ethereum = (window as any).ethereum;
    const target = {
      chainId: '0xA475', // 42101
      chainName: 'Push Chain Donut Testnet',
      nativeCurrency: { name: 'PC', symbol: 'PC', decimals: 18 },
      rpcUrls: ['https://evm.rpc-testnet-donut-node1.push.org/'],
      blockExplorerUrls: ['https://donut.push.network'],
    } as const;
    (async () => {
      try {
        await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: target.chainId }] });
      } catch (e: any) {
        if (e?.code === 4902) {
          try {
            await ethereum.request({ method: 'wallet_addEthereumChain', params: [target] });
          } catch {}
        }
      }
    })();
  }
  return (
    <>
      <Layout>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <Component {...pageProps} />
          </RainbowKitProvider>
        </WagmiConfig>
      </Layout>
    </>
  );
}

export default MyApp;
