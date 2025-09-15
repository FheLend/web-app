import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { BalanceInput } from "@/components/common/BalanceInput";
import { useAccount, usePublicClient, useWriteContract, useChain } from "wagmi";
import { Encryptable, cofhejs } from "cofhejs/web";
import { readContract, signTypedData } from "@wagmi/core";
import { formatUnits, parseSignature, parseUnits } from "viem";
import { Info, Loader2, AlertCircle, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useCofhejsActivePermit } from "@/hooks/useCofhejs";
import { CofhejsPermitModal } from "@/components/cofhe/CofhejsPermitModal";
import MarketFHEAbi from "@/constant/abi/MarketFHE.json";
import { config } from "@/configs/wagmi";
import FHERC20Abi from "@/constant/abi/FHERC20.json";
import { Market } from "@/types/market";
import { useUserPositions } from "@/hooks/useUserPositions";
import { usePositionDecryption } from "@/hooks/usePositionDecryption";
import { PositionDisplay } from "./PositionDisplay";

interface RepayFormProps {
  isConnected: boolean;
  market: Market;
  open: () => void;
  theme?: string;
}

export function RepayForm({
  isConnected,
  market,
  open,
  theme,
}: RepayFormProps) {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const activePermitHash = useCofhejsActivePermit();
  const { writeContractAsync, isPending: isRepayPending } = useWriteContract();

  // Get user positions
  const { positions, loading, positionsError } = useUserPositions({
    marketAddress: market.id as `0x${string}`,
    enabled: !!isConnected && !!address,
  });

  // State for expanded position and repay amount
  const [expandedPositionIndex, setExpandedPositionIndex] = useState<
    number | null
  >(null);
  const [repayAmounts, setRepayAmounts] = useState<{
    [posIndex: number]: string;
  }>({});
  const [minCollateralAmounts, setMinCollateralAmounts] = useState<{
    [posIndex: number]: string;
  }>({});

  // Encryption and submission states
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use our custom hook for position decryption
  const {
    decryptedValues,
    decryptCollateral,
    decryptBorrow,
    isDecryptingCollateral,
    isDecryptingBorrow,
    isDecryptedCollateral,
    isDecryptedBorrow,
  } = usePositionDecryption({
    positions,
    market,
  });

  // Get current debt index for calculation
  const getCurrentDebtIndex = useCallback(async () => {
    const currentDebtIndex = (await readContract(config, {
      address: market.id as `0x${string}`,
      abi: MarketFHEAbi.abi,
      functionName: "pDebtIndex",
    })) as bigint;
    return currentDebtIndex;
  }, [market.id]);

  // Toggle position expansion
  const togglePositionExpand = (index: number) => {
    if (expandedPositionIndex === index) {
      setExpandedPositionIndex(null);
    } else {
      setExpandedPositionIndex(index);
      // Initialize repay amount for this position if not already set
      if (!repayAmounts[index]) {
        setRepayAmounts({
          ...repayAmounts,
          [index]: "",
        });

        // Set default minimum collateral amount based on proportional repay ratio
        if (
          decryptedValues[index]?.collateral &&
          decryptedValues[index]?.borrow
        ) {
          const collateralValue = parseFloat(decryptedValues[index].collateral);
          // Default to 50% of borrow amount for repay
          const borrowValue = parseFloat(decryptedValues[index].borrow);
          const defaultRepayValue = borrowValue / 2;
          // Calculate proportional collateral based on repay ratio
          const repayRatio = defaultRepayValue / borrowValue;
          const minCollateral = (collateralValue * repayRatio).toString();

          setMinCollateralAmounts({
            ...minCollateralAmounts,
            [index]: minCollateral,
          });

          // Also set the default repay amount to 50% of borrow
          setRepayAmounts({
            ...repayAmounts,
            [index]: defaultRepayValue.toString(),
          });
        }
      }
    }
  };

  // Reset error when inputs change
  useEffect(() => {
    setError(null);
  }, [repayAmounts, minCollateralAmounts]);

  // Handle repay amount changes
  const handleRepayAmountChange = (index: number, value: string) => {
    setRepayAmounts({
      ...repayAmounts,
      [index]: value,
    });

    // If we have decrypted collateral and borrow, calculate min collateral based on repay ratio
    if (decryptedValues[index]?.collateral && decryptedValues[index]?.borrow) {
      const collateralValue = parseFloat(decryptedValues[index].collateral);
      const borrowValue = parseFloat(decryptedValues[index].borrow);
      const repayValue = parseFloat(value) || 0;

      if (borrowValue > 0 && repayValue > 0) {
        // Calculate the proportion of the loan being repaid (capped at 100%)
        const repayRatio = Math.min(repayValue / borrowValue, 1);
        // Calculate proportional collateral to be returned based on repay ratio
        const minCollateralValue = collateralValue * repayRatio;

        console.log("Calculating minCollateral:", {
          repayValue,
          borrowValue,
          repayRatio,
          collateralValue,
          minCollateralValue,
        });

        setMinCollateralAmounts({
          ...minCollateralAmounts,
          [index]: minCollateralValue.toString(),
        });
      }
    }
  };

  // Handle repay action
  const handleRepay = async (positionIndex: number) => {
    if (
      !repayAmounts[positionIndex] ||
      !activePermitHash ||
      !market.id ||
      !positions[positionIndex]
    ) {
      toast({
        title: "Missing information",
        description:
          "Please ensure all fields are filled and you have an active permit",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsEncrypting(true);

      // Get the position's tick and ensure it's properly spaced
      const positionTick = positions[positionIndex].tick;
      // Ensure the tick is aligned with the market's tickSpacing
      const tick =
        Math.floor(positionTick / market.tickSpacing) * market.tickSpacing;

      // Convert amounts to BigInt with proper decimals
      const repayAmountBigInt = parseUnits(
        repayAmounts[positionIndex],
        market.loanToken.decimals
      );

      const minCollateralAmountBigInt = parseUnits(
        minCollateralAmounts[positionIndex] || "0",
        market.collateralToken.decimals
      );

      // Encrypt the repay amount
      const encryptedRepayAmount = await cofhejs.encrypt([
        Encryptable.uint128(repayAmountBigInt),
      ]);

      // Encrypt the minimum collateral amount
      const encryptedMinCollateralAmount = await cofhejs.encrypt([
        Encryptable.uint128(minCollateralAmountBigInt),
      ]);

      setIsEncrypting(false);

      if (
        !encryptedRepayAmount.success ||
        !encryptedMinCollateralAmount.success
      ) {
        throw new Error(
          `Failed to encrypt data: ${
            encryptedRepayAmount.error || encryptedMinCollateralAmount.error
          }`
        );
      }

      setIsConfirming(true);

      // Get domain for EIP-712 signature
      const { domain } = await publicClient.getEip712Domain({
        address: market.loanToken.address as `0x${string}`,
      });

      const nonce = await readContract(config, {
        address: market.loanToken.address as `0x${string}`,
        abi: FHERC20Abi.abi,
        functionName: "nonces",
        args: [address],
      });

      // Define types for EIP-712 signature
      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value_hash", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      // Create message for signature
      const message = {
        owner: address,
        spender: market.id,
        value_hash: encryptedRepayAmount.data[0].ctHash,
        nonce,
        deadline: activePermitHash.expiration,
      };

      // Sign the typed data
      const signature = await signTypedData(config, {
        account: address,
        domain: {
          name: domain.name,
          version: domain.version,
          chainId: domain.chainId,
          verifyingContract: domain.verifyingContract,
        },
        types,
        primaryType: "Permit",
        message,
      });

      // Parse the signature
      const { v, r, s } = parseSignature(signature);

      // Create permit object
      const permit = {
        owner: address,
        spender: market.id,
        value_hash: encryptedRepayAmount.data[0].ctHash,
        deadline: activePermitHash.expiration,
        v,
        r,
        s,
      };

      console.log("Repay parameters:", {
        encryptedRepayAmount: encryptedRepayAmount,
        tick: tick,
        positionTick: positions[positionIndex].tick,
        tickSpacing: market.tickSpacing,
        encryptedMinCollateralAmount: encryptedMinCollateralAmount,
        permit,
      });

      const txResult = await writeContractAsync({
        address: market.id as `0x${string}`,
        abi: MarketFHEAbi.abi,
        functionName: "repay",
        args: [
          encryptedRepayAmount.data[0],
          tick,
          encryptedMinCollateralAmount.data[0],
          permit,
        ],
        account: address,
        chain,
      });

      setIsConfirming(false);

      // Show transaction success toast
      const txUrl = `${chain.blockExplorers.default.url}/tx/${txResult}`;
      toast({
        title: "Repay Transaction Initiated",
        description: (
          <div>
            Transaction submitted for {repayAmounts[positionIndex]}{" "}
            {market.loanToken.symbol}
            <br />
            <a
              href={txUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-500 hover:text-blue-700"
            >
              View on {chain.name}
            </a>
          </div>
        ),
        duration: 10000, // 10 seconds
      });

      // Clear the expanded position
      setExpandedPositionIndex(null);
    } catch (error) {
      console.error("Repay failed:", error);
      setIsEncrypting(false);
      setIsConfirming(false);
      toast({
        title: "Repay Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while processing the repay transaction.",
        variant: "destructive",
        duration: 10000, // 10 seconds
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-6">
        <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
          <span className="text-lg font-bold">X</span>
        </div>
        <p className="text-lg mb-2">0.00</p>
        <p className="text-muted-foreground text-sm mb-6">$0</p>
        <Button
          className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90"
          onClick={() => open()}
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : positionsError ? (
        <div className="flex items-center gap-2 text-sm text-red-500 py-4">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to load positions. Please try again.</span>
        </div>
      ) : positions.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            You don't have any active positions to repay.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-medium mb-2">Your Positions</h3>
          {positions.map((position, idx) => {
            const decryptedBorrow = decryptedValues[idx]?.borrow;
            const decryptedCollateral = decryptedValues[idx]?.collateral;

            return (
              <div
                key={`position-${idx}`}
                className="rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="p-4">
                  <PositionDisplay
                    position={position}
                    positionIndex={idx}
                    market={market}
                    decryptedCollateral={decryptedCollateral}
                    decryptedBorrow={decryptedBorrow}
                    isDecryptingCollateral={isDecryptingCollateral(idx)}
                    isDecryptingBorrow={isDecryptingBorrow(idx)}
                    isDecryptedCollateral={isDecryptedCollateral(idx)}
                    isDecryptedBorrow={isDecryptedBorrow(idx)}
                    onDecryptCollateral={() => decryptCollateral(idx)}
                    onDecryptBorrow={() => decryptBorrow(idx)}
                    displayCompact={false}
                  >
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => togglePositionExpand(idx)}
                      disabled={
                        !isDecryptedBorrow(idx) || !isDecryptedCollateral(idx)
                      }
                    >
                      {expandedPositionIndex === idx ? "Cancel" : "Repay"}
                      {expandedPositionIndex === idx ? (
                        <ChevronUp className="h-3 w-3 ml-1" />
                      ) : null}
                    </Button>
                  </PositionDisplay>
                </div>

                {/* Expandable repay section */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    expandedPositionIndex === idx
                      ? "max-h-[500px] opacity-100"
                      : "max-h-0 opacity-0"
                  )}
                >
                  {expandedPositionIndex === idx && (
                    <div className="p-4 border-t">
                      <div className="space-y-4">
                        <BalanceInput
                          label="Repay Amount"
                          value={repayAmounts[idx] || ""}
                          onChange={(e) =>
                            handleRepayAmountChange(idx, e.target.value)
                          }
                          tokenAddress={market.loanToken.address}
                          userAddress={address}
                          decimals={market.loanToken.decimals || 18}
                          suffixSymbol={market.loanToken.symbol}
                        />

                        <div className="flex justify-between text-sm p-3 rounded-md bg-gray-100 dark:bg-gray-800">
                          <span className="text-muted-foreground">
                            Current loan
                          </span>
                          <span className="font-medium">
                            {decryptedValues[idx]?.borrow || "******"}{" "}
                            {market.loanToken.symbol}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm p-3 rounded-md bg-gray-100 dark:bg-gray-800">
                          <span className="text-muted-foreground">
                            Expected collateral return
                          </span>
                          <span className="font-medium">
                            ~
                            {parseFloat(
                              minCollateralAmounts[idx] || "0"
                            ).toFixed(4)}{" "}
                            {market.collateralToken.symbol}
                          </span>
                        </div>

                        {error && (
                          <div
                            className={cn(
                              "p-3 rounded-lg flex items-center",
                              theme === "dark" ? "bg-red-500/10" : "bg-red-50"
                            )}
                          >
                            <Info className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-xs text-red-500">
                              {error}
                            </span>
                          </div>
                        )}

                        <div
                          className={cn(
                            "p-3 rounded-lg flex items-center",
                            theme === "dark"
                              ? "bg-cryptic-purple/10"
                              : "bg-blue-50"
                          )}
                        >
                          <Info className="h-4 w-4 text-cryptic-accent mr-2" />
                          <span className="text-xs text-muted-foreground">
                            Repay transactions are encrypted using FHE
                            technology to ensure your financial privacy
                          </span>
                        </div>

                        <Button
                          className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90"
                          onClick={() => handleRepay(idx)}
                          disabled={
                            isRepayPending ||
                            !repayAmounts[idx] ||
                            isEncrypting ||
                            isConfirming ||
                            !decryptedBorrow
                          }
                          needFHE
                        >
                          {isEncrypting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Encrypting...
                            </>
                          ) : isConfirming ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Confirming...
                            </>
                          ) : isRepayPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>Repay {market.loanToken.symbol}</>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Include the permit modal component */}
      <CofhejsPermitModal />
    </div>
  );
}
