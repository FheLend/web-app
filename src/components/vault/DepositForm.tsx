import { useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { Encryptable, cofhejs } from "cofhejs/web";
import { Button } from "@/components/ui/button";
import { Info, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCofhejsActivePermit } from "@/hooks/useCofhejs";
import { cn } from "@/lib/utils";
import { BalanceInput } from "@/components/common/BalanceInput";
import VaultAbi from "@/constant/abi/VaultFHE.json";
import { readContract, signTypedData, verifyTypedData } from "@wagmi/core";
import { config } from "@/configs/wagmi";
import { parseSignature } from "viem";
import MarketAbi from "@/constant/abi/MarketFHE.json";
import FHERC20Abi from "@/constant/abi/FHERC20.json";
import { Input } from "../ui/input";

interface DepositFormProps {
  vaultId: string;
  vaultAsset: string;
  vaultSymbol: string;
  vaultDecimals: number;
  theme: string;
  isConnected: boolean;
  openWalletModal: () => void;
}

export function DepositForm({
  vaultId,
  vaultSymbol,
  vaultAsset,
  vaultDecimals,
  theme,
  isConnected,
  openWalletModal,
}: DepositFormProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { writeContractAsync, isPending: isDepositPending } =
    useWriteContract();
  const activePermitHash = useCofhejsActivePermit();
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const [marketAddress, setMarketAddress] = useState("");

  const handleDeposit = async () => {
    if (!depositAmount || !vaultId || !activePermitHash) return;
    try {
      setIsEncrypting(true);
      // Convert the amount to BigInt with proper decimals
      const amountBigInt = BigInt(
        Math.floor(parseFloat(depositAmount) * 10 ** (vaultDecimals || 18))
      );
      // Encrypt the amount using cofhejs
      const encryptedAmount = await cofhejs.encrypt([
        Encryptable.uint128(amountBigInt),
      ]);
      setIsEncrypting(false);

      if (!encryptedAmount.success) {
        throw new Error(`Failed to encrypt data: ${encryptedAmount.error}`);
      }
      setIsConfirming(true);
      const { domain } = await publicClient.getEip712Domain({
        address: vaultAsset as `0x${string}`,
      });

      const nonce = await readContract(config, {
        address: vaultAsset as `0x${string}`,
        abi: FHERC20Abi.abi as any,
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
        spender: marketAddress ? marketAddress : vaultId,
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
        spender: marketAddress ? marketAddress : vaultId,
        value_hash: encryptedAmount.data[0].ctHash,
        deadline: activePermitHash.expiration,
        v,
        r,
        s,
      };

      console.log("signature:", signature);
      console.log("permit:", permit);

      const txResult = await writeContractAsync({
        address: (marketAddress ? marketAddress : vaultId) as `0x${string}`,
        abi: (marketAddress ? MarketAbi : VaultAbi).abi,
        functionName: "encDeposit",
        args: [encryptedAmount.data[0], address, permit],
        account: address,
        chain,
      });
      setIsConfirming(false);

      const txUrl = `${chain.blockExplorers.default.url}/tx/${txResult}`;

      toast({
        title: "Deposit Initiated",
        description: (
          <div>
            Transaction submitted for {depositAmount} {vaultSymbol}
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
      setDepositAmount("");
    } catch (error) {
      setIsEncrypting(false);
      setIsConfirming(false);
      toast({
        title: "Deposit Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while processing the deposit.",
        variant: "destructive",
        duration: 10000, // 10 seconds
      });
    }
  };

  return (
    <div className="space-y-4">
      <BalanceInput
        label="Amount to Deposit"
        value={depositAmount}
        onChange={(e) => setDepositAmount(e.target.value)}
        tokenAddress={vaultAsset}
        userAddress={address}
        decimals={vaultDecimals}
        suffixSymbol={vaultSymbol}
      />

      <div>
        <div className="text-sm text-muted-foreground mb-2">Market Address</div>
        <Input
          value={marketAddress}
          onChange={(e) => setMarketAddress(e.target.value)}
          placeholder="0x..."
        />
      </div>

      <div
        className={cn(
          "p-3 rounded-lg flex items-center",
          theme === "dark" ? "bg-cryptic-purple/10" : "bg-blue-50"
        )}
      >
        <Info className="h-4 w-4 text-cryptic-accent mr-2" />
        <span className="text-xs text-muted-foreground">
          Deposits are encrypted using FHE technology for maximum privacy
        </span>
      </div>

      {isConnected ? (
        <Button
          className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90"
          onClick={handleDeposit}
          disabled={
            isDepositPending || !depositAmount || isEncrypting || isConfirming
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
          ) : isDepositPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Deposit {vaultSymbol}</>
          )}
        </Button>
      ) : (
        <Button
          className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90"
          onClick={openWalletModal}
        >
          Connect Wallet to Deposit
        </Button>
      )}
    </div>
  );
}
