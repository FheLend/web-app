
import { Button } from '@/components/ui/button'
import { Lock, ExternalLink, LogOut } from 'lucide-react'
import { useAccount, useDisconnect } from 'wagmi'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useAppKit } from "@reown/appkit/react";

export function WalletButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit();
  
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
    
  return (
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
  )
}
