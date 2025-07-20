import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle as AlertCircleIcon } from "lucide-react";
import { cofhejs, FheTypes } from "cofhejs/web";
import { readContract } from "@wagmi/core";
import { config } from "@/configs/wagmi";
import FHERC20Abi from "@/constant/abi/FHERC20.json";
import {
  useCofhejsInitStatus,
  useCofhejsIsActivePermitValid,
  useCofhejsModalStore,
} from "@/hooks/useCofhejs";

interface BalanceInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  tokenAddress?: string;
  userAddress?: string;
  decimals?: number;
  balanceFunction?: string;
  suffixSymbol?: string;
  disabled?: boolean;
}

export function BalanceInput({
  label = "Amount",
  value,
  onChange,
  placeholder = "0.00",
  className,
  tokenAddress,
  userAddress,
  decimals = 18,
  balanceFunction = "encBalanceOf",
  suffixSymbol,
  disabled = false,
}: BalanceInputProps) {
  const [balance, setBalance] = useState<string | null>(null);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [encryptedBalance, setEncryptedBalance] = useState<any>(null);
  const isPermitValid = useCofhejsIsActivePermitValid();
  const { setGeneratePermitModalOpen } = useCofhejsModalStore();
  const cofhejsStatus = useCofhejsInitStatus();

  // Check if the token address is valid
  const isValidTokenAddress =
    tokenAddress && /^0x[a-fA-F0-9]{40}$/.test(tokenAddress);

  // Fetch balance when token address changes and is valid
  useEffect(() => {
    const fetchBalance = async () => {
      if (!isValidTokenAddress || !userAddress) {
        setBalance(null);
        setEncryptedBalance(null);
        return;
      }

      setIsFetchingBalance(true);
      try {
        // Call encBalanceOf to get encrypted balance
        const encBalance = await readContract(config, {
          address: tokenAddress as `0x${string}`,
          abi: FHERC20Abi.abi,
          functionName: balanceFunction,
          args: [userAddress],
        });

        // Store the encrypted balance for later decryption
        setEncryptedBalance(encBalance);

        // If we have a valid permit, try to decrypt
        if (isPermitValid && encBalance) {
          await decryptBalance(encBalance);
        } else {
          // We have the encrypted balance but no valid permit
          setBalance(null);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(null);
      } finally {
        setIsFetchingBalance(false);
      }
    };

    fetchBalance();
  }, [tokenAddress, userAddress, isPermitValid, balanceFunction]);

  // Function to decrypt the balance (can be called after permit generation)
  const decryptBalance = async (encryptedBalanceData: any) => {
    if (!encryptedBalanceData) return;

    try {
      setIsFetchingBalance(true);

      // Decrypt the balance
      const decryptedResult = await cofhejs.decrypt(
        encryptedBalanceData,
        FheTypes.Uint128
      );

      if (decryptedResult.success) {
        // Format the balance (convert from wei to token units)
        const balanceInWei = decryptedResult.data;
        const formattedBalance = (
          Number(balanceInWei) /
          10 ** decimals
        ).toFixed(4);
        setBalance(formattedBalance);
      } else {
        console.error("Failed to decrypt balance:", decryptedResult.error);
        setBalance(null);
      }
    } catch (error) {
      console.error("Error decrypting balance:", error);
      setBalance(null);
    } finally {
      setIsFetchingBalance(false);
    }
  };

  // Handler for permit generation
  const handleGeneratePermit = () => {
    setGeneratePermitModalOpen(true, () => {
      // This callback will run after a permit is successfully generated
      if (encryptedBalance) {
        decryptBalance(encryptedBalance);
      }
    });
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm text-muted-foreground">{label}</label>
        {isFetchingBalance || cofhejsStatus.isPending ? (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Loading...
          </div>
        ) : (
          isValidTokenAddress && (
            <div className="text-sm text-muted-foreground">
              {balance !== null ? `Balance: ${balance}` : ""}
            </div>
          )
        )}
      </div>
      <div className="relative">
        <Input
          type="number"
          step="any"
          min="0"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={suffixSymbol ? "pr-16" : className}
          disabled={disabled}
        />
        {suffixSymbol && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-sm font-medium text-muted-foreground">
              {suffixSymbol}
            </span>
          </div>
        )}
      </div>

      {isValidTokenAddress &&
        !isPermitValid &&
        !isFetchingBalance &&
        !cofhejsStatus.isPending && (
          <div className="mt-2">
            <Alert variant="warning" className="py-2">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle className="text-xs font-medium">
                Permit Required
              </AlertTitle>
              <AlertDescription className="text-xs">
                You need to generate a permit to view your balance.{" "}
                <span
                  className="underline cursor-pointer text-blue-500"
                  onClick={handleGeneratePermit}
                >
                  Click here to generate
                </span>
              </AlertDescription>
            </Alert>
          </div>
        )}
    </div>
  );
}
