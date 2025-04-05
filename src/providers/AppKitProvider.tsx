
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { mainnet, arbitrum, polygon } from 'viem/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import React from 'react'

// Create Query Client
const queryClient = new QueryClient()

// Get a temporary project ID - in production replace with your actual ID from Reown Cloud
const projectId = 'example_project_id' // Replace with your project ID from https://cloud.reown.com

// Create metadata for the wallet app
const metadata = {
  name: 'Felend',
  description: 'Felend DeFi Platform',
  url: 'https://felend.app', 
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Set networks - using proper typing for AppKitNetwork
const networks = [mainnet, arbitrum, polygon]

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false
})

// Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true
  }
})

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
