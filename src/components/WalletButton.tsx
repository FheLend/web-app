import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, ExternalLink, LogOut, ChevronDown } from "lucide-react";
import {
  useAccount,
  useBalance,
  useConfig,
  useSwitchChain,
  useDisconnect,
} from "wagmi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAppKit } from "@reown/appkit/react";
import { formatEther } from "viem";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "@/lib/themeUtils";
import { CofhejsPortal } from "./cofhe/CofhejsPortal";
import { chainImages } from "@/providers/AppKitProvider";

export function WalletButton() {
  const { address, isConnected, chain } = useAccount();
  const { chains } = useConfig();
  const { switchChain } = useSwitchChain();
  const appKit = useAppKit();
  const { data: balanceData } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const { walletButtonStyles, dropdownMenuContent, dropdownMenuItem } =
    useThemeStyles();

  if (!isConnected || !address) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={walletButtonStyles}
        onClick={() => appKit.open()}
      >
        <Lock className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  // Format address for display
  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  // Format balance for display
  const formattedBalance = balanceData
    ? parseFloat(formatEther(balanceData.value)).toFixed(2)
    : "0.00";

  // Get native token symbol
  const tokenSymbol = balanceData?.symbol || "ETH";

  // Get chain image URL
  const getChainImage = (chainId?: number) => {
    if (!chainId) return null;
    return chainImages[chainId] || null;
  };

  // Fallback to symbol if image not available
  const getChainLogo = (chainId?: number) => {
    if (!chainId) return null;

    // Display chain symbol based on chainId
    if (chainId === 1) return "Ξ";
    if (chainId === 137) return "M";
    if (chainId === 42161) return "A";
    if (chainId === 10) return "O";
    if (chainId === 8453) return "B";

    return null;
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Native Token Balance */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(walletButtonStyles, "flex items-center")}
          >
            <div className="w-5 h-5 rounded-full mr-2 flex justify-center items-center overflow-hidden">
              {getChainImage(chain?.id) ? (
                <img
                  src={getChainImage(chain?.id)}
                  alt={chain?.name || "Chain"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-foreground/10 flex justify-center items-center">
                  {getChainLogo(chain?.id)}
                </div>
              )}
            </div>
            {formattedBalance} {tokenSymbol}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={dropdownMenuContent}>
          <div className="px-2 py-1.5 text-sm font-semibold">
            Switch Network
          </div>
          <DropdownMenuSeparator className="bg-cryptic-accent/20" />
          {chains.map((availableChain) => (
            <DropdownMenuItem
              key={availableChain.id}
              className={cn(
                dropdownMenuItem,
                chain?.id === availableChain.id ? "text-cryptic-accent" : ""
              )}
              onClick={() => switchChain({ chainId: availableChain.id })}
            >
              <div className="w-5 h-5 rounded-full overflow-hidden mr-2 flex justify-center items-center">
                {getChainImage(availableChain.id) ? (
                  <img
                    src={getChainImage(availableChain.id)}
                    alt={availableChain.name || "Chain"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-foreground/10 flex justify-center items-center">
                    {getChainLogo(availableChain.id)}
                  </div>
                )}
              </div>
              {availableChain.name}
              {chain?.id === availableChain.id && (
                <span className="ml-auto">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Wallet Address Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={walletButtonStyles}>
            {displayAddress}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={dropdownMenuContent}>
          <DropdownMenuItem
            className={dropdownMenuItem}
            onClick={() => {
              window.open(`https://etherscan.io/address/${address}`, "_blank");
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

      <CofhejsPortal />
    </div>
  );
}
