import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BalanceInput } from "@/components/common/BalanceInput";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { Encryptable, cofhejs } from "cofhejs/web";
import { readContract, signTypedData } from "@wagmi/core";
import { parseSignature, parseUnits } from "viem";
import { Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Market } from "@/types/market";
import { Position } from "@/types/position";
import { formatNumber } from "@/utils/converter";
import { createPosition } from "@/utils/helper";
import MarketFHEAbi from "@/constant/abi/MarketFHE.json";
import FHERC20Abi from "@/constant/abi/FHERC20.json";
import { config } from "@/configs/wagmi";
import { useCofhejsActivePermit } from "@/hooks/useCofhejs";

interface RepayPositionFormProps {
  positionIndex: number;
  market: Market;
  position: Position;
  decryptedCollateral?: string;
  decryptedBorrow?: string;
  onClose: () => void;
  theme?: string;
}

export function RepayPositionForm({
  positionIndex,
  market,
  position,
  decryptedCollateral,
  decryptedBorrow,
  onClose,
  theme,
}: RepayPositionFormProps) {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const activePermitHash = useCofhejsActivePermit();
  const { writeContractAsync, isPending: isRepayPending } = useWriteContract();

  // Form state
  const [repayAmount, setRepayAmount] = useState("");
  const [minCollateralAmount, setMinCollateralAmount] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle repay amount changes
  const handleRepayAmountChange = async (value: string) => {
    setRepayAmount(value);
    setError(null);

    // If we have decrypted collateral and borrow, calculate min collateral based on repay ratio
    if (decryptedCollateral && decryptedBorrow) {
      const collateralValue = parseFloat(decryptedCollateral);
      const borrowValue = parseFloat(decryptedBorrow);
      const repayValue = parseFloat(value) || 0;

      if (borrowValue > 0 && repayValue > 0) {
        // Calculate the proportion of the loan being repaid (capped at 100%)
        const ratio = borrowValue / collateralValue;
        // Calculate proportional collateral to be returned based on repay ratio
        const minCollateralValue = repayValue / ratio;

        setMinCollateralAmount(minCollateralValue.toString());
      }
    }
  };

  // Handle repay action
  const handleRepay = async () => {
    if (!repayAmount || !activePermitHash || !market.id || !position) {
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
      const repayAmountBigInt = parseUnits(
        repayAmount,
        market.loanToken.decimals
      );
      const minCollateralAmountBigInt = parseUnits(
        minCollateralAmount || "0",
        market.collateralToken.decimals
      );

      const { tick } = await createPosition(
        market.id as `0x${string}`,
        repayAmountBigInt,
        minCollateralAmountBigInt,
        market.tickSpacing
      );

      // Encrypt the repay amount
      const [encryptedRepayAmount, encryptedMinCollateralAmount] =
        await Promise.all([
          cofhejs.encrypt([Encryptable.uint128(repayAmountBigInt)]),
          cofhejs.encrypt([Encryptable.uint128(minCollateralAmountBigInt)]),
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

      console.log("Repay tx params:", {
        args: [
          encryptedRepayAmount.data[0],
          tick,
          encryptedMinCollateralAmount.data[0],
          permit,
        ],
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
            Transaction submitted for {repayAmount} {market.loanToken.symbol}
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

      // Close the form
      onClose();
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

  return (
    <div className="space-y-4 p-4 border-t">
      <BalanceInput
        label="Repay Amount"
        value={repayAmount}
        onChange={(e) => handleRepayAmountChange(e.target.value)}
        tokenAddress={market.loanToken.address}
        userAddress={address}
        decimals={market.loanToken.decimals || 18}
        suffixSymbol={market.loanToken.symbol}
      />

      <div className="flex justify-between text-sm p-3 rounded-md bg-gray-100 dark:bg-gray-800">
        <span className="text-muted-foreground">Current loan</span>
        <span className="font-medium">
          {decryptedBorrow ? formatNumber(decryptedBorrow) : "******"}{" "}
          {market.loanToken.symbol}
        </span>
      </div>

      <div className="flex justify-between text-sm p-3 rounded-md bg-gray-100 dark:bg-gray-800">
        <span className="text-muted-foreground">Min collateral return</span>
        <span className="font-medium">
          ~{formatNumber(minCollateralAmount || "0")}{" "}
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
          Repay transactions are encrypted using FHE technology to ensure your
          financial privacy
        </span>
      </div>

      <Button
        className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90"
        onClick={handleRepay}
        disabled={
          isRepayPending ||
          !repayAmount ||
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
  );
}
