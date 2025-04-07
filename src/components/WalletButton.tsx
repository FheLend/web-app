
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, ExternalLink, LogOut, ChevronDown } from 'lucide-react'
import { useAccount, useDisconnect, useBalance, useNetwork, useSwitchNetwork } from 'wagmi'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useAppKit } from "@reown/appkit/react";
import { formatEther } from 'viem'

export function WalletButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit();
  const { data: balanceData } = useBalance({ address })
  const { chain } = useNetwork()
  const { switchNetwork, chains } = useSwitchNetwork()
  
  if (!isConnected || !address) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="border-cryptic-accent/50 bg-transparent hover:bg-cryptic-accent/10 text-cryptic-accent text-base"
        onClick={() => open()}
      >
        <Lock className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }
  
  // Format address for display
  const displayAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''
  
  // Format balance for display
  const formattedBalance = balanceData ? 
    parseFloat(formatEther(balanceData.value)).toFixed(2) : 
    '0.00'
  
  // Get native token symbol
  const tokenSymbol = balanceData?.symbol || 'ETH'
  
  return (
    <div className="flex items-center space-x-2">
      {/* Native Token Balance */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-cryptic-accent/50 bg-transparent hover:bg-cryptic-accent/10 text-cryptic-accent text-base flex items-center"
          >
            <div className="w-4 h-4 rounded-full bg-foreground/10 mr-2 flex justify-center items-center">
              {chain?.id === 1 ? 'Ξ' : ''}
            </div>
            {formattedBalance} {tokenSymbol}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-cryptic-darker border-cryptic-accent/20">
          <div className="px-2 py-1.5 text-sm font-semibold">Switch Network</div>
          <DropdownMenuSeparator className="bg-cryptic-accent/20" />
          {chains.map((availableChain) => (
            <DropdownMenuItem 
              key={availableChain.id}
              className={`cursor-pointer flex items-center hover:bg-cryptic-accent/10 ${chain?.id === availableChain.id ? 'text-cryptic-accent' : ''}`}
              onClick={() => switchNetwork?.(availableChain.id)}
            >
              {availableChain.name}
              {chain?.id === availableChain.id && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Wallet Address Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-cryptic-accent/50 bg-transparent hover:bg-cryptic-accent/10 text-cryptic-accent text-base"
          >
            {displayAddress}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-cryptic-darker border-cryptic-accent/20">
          <DropdownMenuItem 
            className="cursor-pointer flex items-center hover:bg-cryptic-accent/10"
            onClick={() => {
              window.open(`https://etherscan.io/address/${address}`, '_blank')
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer flex items-center text-destructive hover:bg-destructive/10"
            onClick={() => disconnect()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
