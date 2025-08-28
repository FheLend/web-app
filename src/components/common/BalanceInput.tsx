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
import { toast } from "../ui/use-toast";

interface BalanceInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  tokenAddress?: string;
  userAddress?: string;
  decimals?: number;
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
  suffixSymbol,
  disabled = false,
}: BalanceInputProps) {
  const [balance, setBalance] = useState<string | null>(null);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [encryptedBalance, setEncryptedBalance] = useState<bigint>(null);
  const { valid: isPermitValid, error: permitError } =
    useCofhejsIsActivePermitValid();
  const { setGeneratePermitModalOpen } = useCofhejsModalStore();
  const cofhejsStatus = useCofhejsInitStatus();

  // Fetch balance when token address changes and is valid
  useEffect(() => {
    const fetchBalance = async () => {
      if (!userAddress) {
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
          functionName: "encBalanceOf",
          args: [userAddress],
        });

        // Store the encrypted balance for later decryption
        setEncryptedBalance(encBalance as bigint);

        // If we have a valid permit, try to decrypt
        if (isPermitValid && encBalance) {
          await decryptBalance(encBalance as bigint);
        } else {
          // We have the encrypted balance but no valid permit
          setBalance("0");
        }
      } catch (error) {
        setBalance(null);
      } finally {
        setIsFetchingBalance(false);
      }
    };

    fetchBalance();
  }, [tokenAddress, userAddress, isPermitValid]);

  // Function to decrypt the balance (can be called after permit generation)
  const decryptBalance = async (encryptedBalanceData: bigint) => {
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
        ).toLocaleString();
        setBalance(formattedBalance);
      } else {
        setBalance(null);
        throw new Error(decryptedResult.error.code);
      }
    } catch (error) {
      toast({
        title: "Error decrypting balance",
        description: error?.message || error,
        variant: "destructive",
      });
      setIsFetchingBalance(false);
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
          <div className="text-sm text-muted-foreground">
            {balance !== null ? `Balance: ${balance}` : ""}
          </div>
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

      {!isPermitValid && !isFetchingBalance && !cofhejsStatus.isPending && (
        <div className="mt-2">
          <Alert variant="warning" className="py-2">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle className="text-xs font-medium">
              Permit Required
            </AlertTitle>
            <AlertDescription className="text-xs">
              {permitError === "no-permit"
                ? "A permit is required to view your balance"
                : permitError === "expired"
                ? "Your permit has expired. Please generate a new one or use another one."
                : "Unable to verify permit status"}
              <span
                className="underline cursor-pointer text-blue-500 ml-1"
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
