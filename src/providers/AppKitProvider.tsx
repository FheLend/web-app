
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
