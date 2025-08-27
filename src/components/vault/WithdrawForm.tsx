import { useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { Encryptable, cofhejs } from "cofhejs/web";
import { Button } from "@/components/ui/button";
import { Info, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCofhejsActivePermit } from "@/hooks/useCofhejs";
import { cn } from "@/lib/utils";
import { BalanceInput } from "@/components/ui/BalanceInput";
import { CofhejsPermitModal } from "@/components/cofhe/CofhejsPermitModal";
import VaultAbi from "@/constant/abi/VaultFHE.json";
import { readContract, signTypedData } from "@wagmi/core";
import { config } from "@/configs/wagmi";
import { parseSignature } from "viem";

interface WithdrawFormProps {
  vaultId: string;
  vaultAsset: string;
  vaultSymbol: string;
  vaultDecimals: number;
  theme: string;
  isConnected: boolean;
  openWalletModal: () => void;
}

export function WithdrawForm({
  vaultId,
  vaultSymbol,
  vaultAsset,
  vaultDecimals,
  theme,
  isConnected,
  openWalletModal,
}: WithdrawFormProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { writeContractAsync, isPending: isWithdrawPending } =
    useWriteContract();
  const activePermitHash = useCofhejsActivePermit();
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();

  const handleWithdraw = async () => {
    if (!withdrawAmount || !vaultId || !activePermitHash) return;
    try {
      // Convert the amount to BigInt with proper decimals
      const amountBigInt = BigInt(
        Math.floor(parseFloat(withdrawAmount) * 10 ** (vaultDecimals || 18))
      );
      // Encrypt the amount using cofhejs
      setIsEncrypting(true);
      const encryptedAmount = await cofhejs.encrypt([
        Encryptable.uint128(amountBigInt),
      ]);
      setIsEncrypting(false);

      if (!encryptedAmount.success) {
        throw new Error(`Failed to encrypt data: ${encryptedAmount.error}`);
      }

      const { domain } = await publicClient.getEip712Domain({
        address: vaultId as `0x${string}`,
      });

      const nonce = await readContract(config, {
        address: vaultId as `0x${string}`,
        abi: VaultAbi.abi,
        functionName: "nonces",
        args: [address],
      });

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value_hash", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };
      const message = {
        owner: address,
        spender: vaultId,
        value_hash: encryptedAmount.data[0].ctHash,
        nonce,
        deadline: activePermitHash.expiration,
      };

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
      const { v, r, s } = parseSignature(signature);

      const permit = {
        owner: address,
        spender: vaultId,
        value_hash: encryptedAmount.data[0].ctHash,
        deadline: activePermitHash.expiration,
        v,
        r,
        s,
      };

      // Call encRedeem with the encrypted amount, receiver, owner, and permit
      const txResult = await writeContractAsync({
        address: vaultId as `0x${string}`,
        abi: VaultAbi.abi,
        functionName: "encRedeem",
        args: [encryptedAmount.data[0], address, address, permit],
        account: address,
        chain,
      });

      const txUrl = `${chain.blockExplorers.default.url}/tx/${txResult}`;

      toast({
        title: "Withdrawal Initiated",
        description: (
          <div>
            Transaction submitted for {withdrawAmount} {vaultSymbol}
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

      // Reset the withdraw amount
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdrawal error:", error);
      setIsEncrypting(false);
      toast({
        title: "Withdrawal Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while processing the withdrawal.",
        variant: "destructive",
        duration: 10000, // 10 seconds
      });
    }
  };

  // No need for a custom fetchUserShareBalance function
  // The BalanceInput component will handle fetching the balance automatically

  return (
    <div className="space-y-4">
      <BalanceInput
        label="Amount to Withdraw"
        value={withdrawAmount}
        onChange={(e) => setWithdrawAmount(e.target.value)}
        tokenAddress={vaultId}
        userAddress={address}
        decimals={vaultDecimals}
        suffixSymbol={vaultSymbol}
      />

      <div
        className={cn(
          "p-3 rounded-lg flex items-center",
          theme === "dark" ? "bg-cryptic-purple/10" : "bg-blue-50"
        )}
      >
        <Info className="h-4 w-4 text-cryptic-accent mr-2" />
        <span className="text-xs text-muted-foreground">
          Withdrawals are encrypted using FHE technology for maximum privacy
        </span>
      </div>

      {isConnected ? (
        <Button
          className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90"
          onClick={handleWithdraw}
          disabled={isWithdrawPending || !withdrawAmount || isEncrypting}
          needFHE
        >
          {isEncrypting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Encrypting...
            </>
          ) : isWithdrawPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Withdraw {vaultSymbol}</>
          )}
        </Button>
      ) : (
        <Button
          className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90"
          onClick={openWalletModal}
        >
          Connect Wallet to Withdraw
        </Button>
      )}
    </div>
  );
}
