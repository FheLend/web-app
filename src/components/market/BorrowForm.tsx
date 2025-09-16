import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { Button } from "@/components/ui/button";
import { BalanceInput } from "@/components/common/BalanceInput";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { Encryptable, cofhejs } from "cofhejs/web";
import { readContract, signTypedData } from "@wagmi/core";
import { formatUnits, parseSignature, parseUnits } from "viem";
import { Info, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCofhejsActivePermit } from "@/hooks/useCofhejs";
import { cn } from "@/lib/utils";
import { CofhejsPermitModal } from "@/components/cofhe/CofhejsPermitModal";
import MarketFHEAbi from "@/constant/abi/MarketFHE.json";
import { config } from "@/configs/wagmi";
import FHERC20Abi from "@/constant/abi/FHERC20.json";
import { Market } from "@/types/market";
import { Input } from "../ui/input";
import { createPosition } from "@/utils/helper";

interface BorrowFormProps {
  isConnected: boolean;
  market: Market;
  open: () => void;
  theme?: string;
}

let timeoutId: NodeJS.Timeout;

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
  const [tick, setTick] = useState<number | null>(null);

  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isCalculatingTick, setIsCalculatingTick] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Reset calculation error when inputs change
  useEffect(() => {
    setError(null);
  }, [borrowAmount, collateralAmount]);

  // Clean up timeout on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Reference to store the base collateral amount
  const baseCollateralRef = useRef<string | null>(null);

  // Recalculate collateral based on borrow amount with debouncing
  const recalculateCollateral = async (borrowAmt, collateralAmt) => {
    // Clear any existing timeout to implement debouncing
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout that will execute after 500ms of inactivity
    timeoutId = setTimeout(async () => {
      if (!borrowAmt || parseFloat(borrowAmt) <= 0) return;
      if (!collateralAmt || parseFloat(collateralAmt) <= 0) return;
      try {
        const borrowAmtBigInt = parseUnits(
          borrowAmt,
          market.loanToken.decimals
        );

        // If we don't have a base collateral amount or the user manually changed it, use current value
        if (!baseCollateralRef.current || collateralAmt !== collateralAmount) {
          baseCollateralRef.current = collateralAmt;
        }

        // Always use the base collateral for calculations
        const baseCollateralAmtBigInt = parseUnits(
          baseCollateralRef.current,
          market.collateralToken.decimals
        );

        // Calculate tick based on borrow amount and base collateral
        setIsCalculatingTick(true);
        setError(null);
        const { tick: calculatedTick, usedCollateralAmount } =
          await createPosition(
            market.id as `0x${string}`,
            borrowAmtBigInt,
            baseCollateralAmtBigInt,
            market.tickSpacing
          );
        setIsCalculatingTick(false);
        setTick(calculatedTick);

        const formatted = formatUnits(
          usedCollateralAmount,
          market.collateralToken.decimals
        );
        setCollateralAmount(formatted);
      } catch (error) {
        setIsCalculatingTick(false);
        console.error("Error recalculating values:", error);
      }
    }, 500); // 500ms debounce delay
  };

  // Handle borrow amount changes internally
  const handleBorrowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBorrowAmount(value);
    recalculateCollateral(value, collateralAmount);
  };

  // Handle collateral amount changes internally
  const handleCollateralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCollateralAmount(value);
    // When user manually changes collateral, update the base reference
    if (parseFloat(value) > 0) {
      baseCollateralRef.current = value;
    }
    recalculateCollateral(borrowAmount, value);
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
      const borrowAmountBigInt = parseUnits(
        borrowAmount,
        market.loanToken.decimals
      );
      const collateralAmountBigInt = parseUnits(
        collateralAmount,
        market.collateralToken.decimals
      );

      const encryptedBorrowAmount = await cofhejs.encrypt([
        Encryptable.uint128(borrowAmountBigInt),
      ]);

      const encryptedCollateralAmount = await cofhejs.encrypt([
        Encryptable.uint128(collateralAmountBigInt),
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
        encryptedBorrowAmount: encryptedBorrowAmount,
        tick: tick,
        encryptedCollateralAmount: encryptedCollateralAmount,
        permit,
      });

      const txResult = await writeContractAsync({
        address: market.id as `0x${string}`,
        abi: MarketFHEAbi.abi,
        functionName: "borrow",
        args: [
          [encryptedBorrowAmount.data[0]],
          [tick],
          [encryptedCollateralAmount.data[0]],
          [permit],
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
        // onBlur={recalculateCollateral}
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
            // onBlur={recalculateCollateral}
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

      {error && (
        <div
          className={cn(
            "p-3 rounded-lg flex items-center",
            theme === "dark" ? "bg-red-500/10" : "bg-red-50"
          )}
        >
          <Info className="h-4 w-4 text-red-500 mr-2" />
          <span className="text-xs text-red-500">{error}</span>
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
