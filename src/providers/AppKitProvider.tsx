import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { arbitrum, arbitrumSepolia, sepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import React from "react";
import { hardhatHaLink } from "@/configs/wagmi";
import { isProd } from "@/constant";

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
const networks = isProd
  ? [arbitrumSepolia, sepolia]
  : [arbitrumSepolia, sepolia, hardhatHaLink];

// Chain images configuration
export const chainImages = {
  1: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
  42161: "https://assets.coingecko.com/coins/images/16547/standard/arb.jpg",
  421614: "https://assets.coingecko.com/coins/images/16547/standard/arb.jpg",
  11155111:
    "https://assets.coingecko.com/coins/images/279/standard/ethereum.png", // Arbitrum Sepolia
  31337: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png", // Hardhat network
};

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
  defaultNetwork: arbitrumSepolia,
  enableNetworkSwitch: true,
  chainImages,
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
