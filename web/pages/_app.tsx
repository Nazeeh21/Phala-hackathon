import { Layout } from "@/MyComponents/Layout";
import "@/styles/globals.css";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import {
  WagmiConfig,
  configureChains,
  createConfig,
} from "wagmi";
import { hardhat } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";


const { chains, publicClient } = configureChains(
  [hardhat],
  [
    // alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider(),
  ]
);
const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains,
});
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
