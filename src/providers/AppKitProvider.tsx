
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider, createConfig } from "wagmi";
import { mainnet, arbitrum, polygon, optimism, base } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import React from "react";

// Create Query Client
const queryClient = new QueryClient();

// Get a temporary project ID - in production replace with your actual ID from Reown Cloud
const projectId = "f2830e5577ce58788341bf77dc115ec0"; // Replace with your project ID from https://cloud.reown.com

// Create metadata for the wallet app
const metadata = {
  name: "Felend",
  description: "Felend DeFi Platform",
  url: "https://felend.app",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Set networks - using proper typing for AppKitNetwork
const networks = [mainnet, arbitrum, polygon, optimism, base];

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
});

// Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  metadata,
  // @ts-expect-error: 'networks' is already defined in the adapter and does not need to be passed explicitly
  networks,
  defaultNetwork: mainnet,
  enableNetworkSwitch: true,
  // Updated chain images with the new URLs
  chainImages: {
    1: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
    42161: "https://assets.coingecko.com/coins/images/16547/standard/arb.jpg?1721358242",
    137: "https://assets.geckoterminal.com/dau5esiwuf9jj9r0jchj9qgdhy8g",
    10: "https://assets.geckoterminal.com/o2v9hloio02gxzmtsz3lzjoi4bqs",
    8453: "https://assets.geckoterminal.com/l8yo12s6ujq0884jp13udw6zp1an"
  },
  features: {
    analytics: true,
  },
});

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
