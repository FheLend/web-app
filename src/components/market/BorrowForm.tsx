import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { BalanceInput } from "@/components/ui/BalanceInput";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { Encryptable, cofhejs } from "cofhejs/web";
import { readContract, signTypedData } from "@wagmi/core";
import { parseSignature } from "viem";
import { Info, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCofhejsActivePermit } from "@/hooks/useCofhejs";
import { cn } from "@/lib/utils";
import { CofhejsPermitModal } from "@/components/cofhe/CofhejsPermitModal";
import MarketFHEAbi from "@/constant/abi/MarketFHE.json";
import { config } from "@/configs/wagmi";
import FHERC20Abi from "@/constant/abi/FHERC20.json";
import MockOracleAbi from "@/constant/abi/MockOracle.json";
import { Market } from "@/types/market";
import { Input } from "../ui/input";
import { getTickAtRatio, roundToNearestValidTick } from "@/utils/TickMath";

// For calculating the tick
const DEBT_INDEX_PRECISION = BigInt(1e18);
const Q80 = 2n ** 80n;

interface BorrowFormProps {
  isConnected: boolean;
  market: Market;
  open: () => void;
  theme?: string;
}

export function BorrowForm({
  isConnected,
  market,
  open,
  theme,
}: BorrowFormProps) {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const activePermitHash = useCofhejsActivePermit();
  const { writeContractAsync, isPending: isBorrowPending } = useWriteContract();

  // Manage borrowAmount and collateralAmount state internally
  const [borrowAmount, setBorrowAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");

  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isCalculatingTick, setIsCalculatingTick] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [calculatedTick, setCalculatedTick] = useState<number | null>(null);
  const [calculatingTickError, setCalculatingTickError] = useState<
    string | null
  >(null);

  // Calculate loan-to-value ratio
  const ltvRatio = useMemo(() => {
    if (
      !borrowAmount ||
      !collateralAmount ||
      parseFloat(collateralAmount) === 0
    ) {
      return 0;
    }
    // This is a simplistic calculation and might need adjustment based on token prices
    return (parseFloat(borrowAmount) / parseFloat(collateralAmount)) * 100;
  }, [borrowAmount, collateralAmount]);

  // Calculate tick based on borrow amount and collateral using TickMath
  // This exactly matches the calculateTickFHE function in the test
  const calculateTick = async (borrowAmt: bigint, collateralAmt: bigint) => {
    setIsCalculatingTick(true);
    setCalculatingTickError(null);

    try {
      // Get current debt index (plaintext)
      const currentDebtIndex = (await readContract(config, {
        address: market.id as `0x${string}`,
        abi: MarketFHEAbi.abi,
        functionName: "pDebtIndex",
      })) as bigint;

      // Calculate scaled borrow amount
      const scaledBorrowAmount =
        (borrowAmt * DEBT_INDEX_PRECISION) / currentDebtIndex;

      // Calculate ratio as scaledDebt/collateral
      const ratioX80 = (scaledBorrowAmount * Q80) / collateralAmt;

      // Get the tick using the TickMath library directly with ratioX80
      // The library expects a Q128 ratio but our ratio is already in Q80 format
      // so we need to scale it up by 2^48
      const ratioX128 = ratioX80 * 2n ** 48n;
      const rawTick = getTickAtRatio(ratioX128);

      // Round to nearest valid tick according to tick spacing
      // This matches exactly what the test does
      const tickSpacing = market.tickSpacing || 60;
      const roundedTick = Math.floor(rawTick / tickSpacing) * tickSpacing;

      console.log(market);
      console.log({
        currentDebtIndex: currentDebtIndex.toString(),
        borrowAmt: borrowAmt.toString(),
        scaledBorrowAmount: scaledBorrowAmount.toString(),
        collateralAmt: collateralAmt.toString(),
        ratioX80: ratioX80.toString(),
        ratioX128: ratioX128.toString(),
        rawTick,
        roundedTick,
        tickSpacing,
      });

      setCalculatedTick(roundedTick);
      setIsCalculatingTick(false);
      return roundedTick;
    } catch (error) {
      console.error("Error calculating tick:", error);
      setCalculatingTickError("Failed to calculate tick. Please try again.");
      setIsCalculatingTick(false);
      throw error;
    }
  };

  // Reset calculation error when inputs change
  useEffect(() => {
    setCalculatingTickError(null);
  }, [borrowAmount, collateralAmount]);

  // Handle borrow amount changes internally
  const handleBorrowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBorrowAmount(value);

    // Calculate required collateral based on LTV if market LTV value is available
    if (value && market.ltvValue) {
      const borrow = parseFloat(value);
      const ltv = market.ltvValue / 100;

      // Optionally, we can update the collateral amount based on LTV
      // setCollateralAmount((borrow / ltv).toFixed(2));
    }
  };

  // Handle collateral amount changes internally
  const handleCollateralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCollateralAmount(value);
  };

  const handleBorrow = async () => {
    if (!borrowAmount || !collateralAmount || !market.id || !activePermitHash) {
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
      // Convert amounts to BigInt with proper decimals
      const borrowAmountBigInt = BigInt(
        Math.floor(
          parseFloat(borrowAmount) * 10 ** (market.loanToken.decimals || 18)
        )
      );
      const collateralAmountBigInt = BigInt(
        Math.floor(
          parseFloat(collateralAmount) *
            10 ** (market.collateralToken.decimals || 18)
        )
      );

      // Calculate the appropriate tick
      const tick = await calculateTick(
        borrowAmountBigInt,
        collateralAmountBigInt
      );

      // Encrypt the amounts using cofhejs
      // Note: For borrowAmount, we encrypt the exact amount requested
      const encryptedBorrowAmount = await cofhejs.encrypt([
        Encryptable.uint128(borrowAmountBigInt),
      ]);

      // For collateralAmount, we double it as the maximum amount (exactly like the test does)
      // This gives the contract flexibility to use what it needs up to this maximum
      const encryptedCollateralAmount = await cofhejs.encrypt([
        Encryptable.uint128(collateralAmountBigInt * 2n), // Doubling for max collateral amount as per test
      ]);

      setIsEncrypting(false);

      if (
        !encryptedBorrowAmount.success ||
        !encryptedCollateralAmount.success
      ) {
        throw new Error(
          `Failed to encrypt data: ${
            encryptedBorrowAmount.error || encryptedCollateralAmount.error
          }`
        );
      }

      setIsConfirming(true);

      // Get domain for EIP-712 signature
      const { domain } = await publicClient.getEip712Domain({
        address: market.collateralToken.address as `0x${string}`,
      });

      const nonce = await readContract(config, {
        address: market.collateralToken.address as `0x${string}`,
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
        value_hash: encryptedCollateralAmount.data[0].ctHash,
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
        value_hash: encryptedCollateralAmount.data[0].ctHash,
        deadline: activePermitHash.expiration,
        v,
        r,
        s,
      };

      console.log("Borrow parameters:", {
        inBorrowAmount: encryptedBorrowAmount,
        tick: tick,
        inMaxCollateralAmount: encryptedCollateralAmount.data[0],
        permit,
        borrowAmountValue: borrowAmountBigInt.toString(),
        maxCollateralValue: (collateralAmountBigInt * 2n).toString(),
      });

      // Execute the borrow transaction
      // Match exactly how the test calls the borrow function:
      // await market.connect(user).borrow([encBorrow], [tick], [encCollateral], [permit]);
      const txResult = await writeContractAsync({
        address: market.id as `0x${string}`,
        abi: MarketFHEAbi.abi,
        functionName: "borrow",
        args: [
          encryptedBorrowAmount.data[0], // Array of encrypted borrow amounts
          tick, // Array of ticks
          encryptedCollateralAmount.data[0], // Array of encrypted collateral amounts
          permit, // Array of permits
        ],
        account: address,
        chain,
      });

      setIsConfirming(false);

      // Show transaction success toast
      const txUrl = `${chain.blockExplorers.default.url}/tx/${txResult}`;
      toast({
        title: "Borrow Transaction Initiated",
        description: (
          <div>
            Transaction submitted for {borrowAmount} {market.loanToken.symbol}
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
    } catch (error) {
      console.error("Borrow failed:", error);
      setIsEncrypting(false);
      setIsConfirming(false);
      toast({
        title: "Borrow Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while processing the borrow transaction.",
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
      <BalanceInput
        label="Collateral Amount"
        value={collateralAmount}
        onChange={handleCollateralChange}
        tokenAddress={market.collateralToken.address}
        userAddress={address}
        decimals={market.collateralToken.decimals || 18}
        suffixSymbol={market.collateralToken.symbol}
      />

      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm text-muted-foreground">Borrow Amount</label>
        </div>
        <div className="relative">
          <Input
            type="number"
            value={borrowAmount}
            onChange={handleBorrowChange}
            placeholder="0.00"
            className="pr-16"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-sm font-medium text-muted-foreground">
              {market.loanToken.symbol}
            </span>
          </div>
        </div>
      </div>
      <div className="pt-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">LTV / Liquidation LTV</span>
          <span>
            {ltvRatio.toFixed(2)}% /{" "}
            {market.liquidationThresholdBasisPoint / 100}%
          </span>
        </div>
        <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{
              width: `${
                (ltvRatio * 100) / (market.liquidationThresholdBasisPoint / 100)
              }%`,
            }}
          ></div>
        </div>
      </div>

      {calculatingTickError && (
        <div
          className={cn(
            "p-3 rounded-lg flex items-center",
            theme === "dark" ? "bg-red-500/10" : "bg-red-50"
          )}
        >
          <Info className="h-4 w-4 text-red-500 mr-2" />
          <span className="text-xs text-red-500">{calculatingTickError}</span>
        </div>
      )}

      <div
        className={cn(
          "p-3 rounded-lg flex items-center",
          theme === "dark" ? "bg-cryptic-purple/10" : "bg-blue-50"
        )}
      >
        <Info className="h-4 w-4 text-cryptic-accent mr-2" />
        <span className="text-xs text-muted-foreground">
          Borrow transactions are encrypted using FHE technology to ensure your
          financial privacy
        </span>
      </div>

      <Button
        className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90 mt-4"
        onClick={handleBorrow}
        disabled={
          isBorrowPending ||
          !borrowAmount ||
          !collateralAmount ||
          isEncrypting ||
          isCalculatingTick ||
          isConfirming
        }
        needFHE
      >
        {isEncrypting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Encrypting...
          </>
        ) : isCalculatingTick ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Calculating...
          </>
        ) : isConfirming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirming...
          </>
        ) : isBorrowPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>Borrow {market.loanToken.symbol}</>
        )}
      </Button>

      {/* Include the permit modal component */}
      <CofhejsPermitModal />
    </div>
  );
}
