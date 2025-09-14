import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BalanceInput } from "@/components/common/BalanceInput";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Footer } from "@/components/Footer";
import { Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Encryptable, cofhejs } from "cofhejs/web";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import FHERC20Abi from "@/constant/abi/FHERC20.json";
import { erc20Abi } from "viem";

const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

const transferSchema = z.object({
  tokenAddress: z
    .string()
    .min(1, "Token address is required")
    .refine(
      (address) => ethereumAddressRegex.test(address),
      "Invalid Ethereum address format. Must start with 0x followed by 40 hexadecimal characters"
    ),
  amount: z
    .string()
    .min(0, "Amount is required")
    .refine((val) => !isNaN(Number(val)), "Amount must be a number"),
  recipientAddress: z
    .string()
    .min(1, "Recipient address is required")
    .refine(
      (address) => ethereumAddressRegex.test(address),
      "Invalid Ethereum address format. Must start with 0x followed by 40 hexadecimal characters"
    ),
});

type TransferForm = z.infer<typeof transferSchema>;

function SendTokenBtn({
  tokenAddress,
  amount,
  recipientAddress,
  decimals,
}: TransferForm & { decimals: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const { writeContractAsync, isPending } = useWriteContract();
  const { address, chain } = useAccount();

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      const amountBigInt = BigInt(
        Math.floor(parseFloat(amount) * 10 ** decimals)
      );
      console.log("Parsed amount as BigInt:", amountBigInt);

      const encryptedResult = await cofhejs.encrypt([
        Encryptable.uint128(amountBigInt),
      ]);

      console.log("Encrypted amount:", encryptedResult);
      if (!encryptedResult.success) {
        throw new Error(`Failed to encrypt data: ${encryptedResult.error}`);
      }

      const txResult = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: FHERC20Abi.abi,
        functionName: "encTransfer",
        args: [
          recipientAddress, // recipient address
          encryptedResult.data[0], // encrypted amount (euint128)
        ],
        account: address,
        chain,
      });

      toast({
        title: "Transfer Initiated",
        description: `Transaction submitted: ${txResult.substring(0, 10)}...`,
      });
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description:
          error instanceof Error
            ? error.message
            : `An error occurred while processing the transfer.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button
      onClick={onSubmit}
      className="w-full"
      disabled={isLoading || isPending}
    >
      {isLoading || isPending ? "Sending..." : "Send Tokens"}
    </Button>
  );
}

function MintTokenBtn({
  tokenAddress,
  amount,
  recipientAddress,
  decimals,
}: TransferForm & { decimals: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const { writeContractAsync, isPending } = useWriteContract();
  const { address, chain } = useAccount();

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      const amountBigInt = BigInt(
        Math.floor(parseFloat(amount) * 10 ** decimals)
      );

      const txResult = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: FHERC20Abi.abi,
        functionName: "mint", // Use mint function name
        args: [
          recipientAddress, // minting to self
          amountBigInt, // encrypted amount (euint128)
        ],
        account: address,
        chain,
      });

      toast({
        title: "Minting Initiated",
        description: `Transaction submitted: ${txResult.substring(0, 10)}...`,
      });
    } catch (error) {
      toast({
        title: "Mint Failed",
        description:
          error instanceof Error
            ? error.message
            : `An error occurred while processing the mint.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button
      onClick={onSubmit}
      className="w-full"
      disabled={isLoading || isPending}
    >
      {isLoading || isPending ? "Minting..." : "Mint Tokens"}
    </Button>
  );
}

export default function Transfer() {
  const { address } = useAccount();

  const form = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      tokenAddress: "",
      amount: "",
      recipientAddress: "",
    },
  });

  // Watch for changes to tokenAddress to fetch balance
  const tokenAddress = useWatch({
    control: form.control,
    name: "tokenAddress",
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      enabled: ethereumAddressRegex.test(tokenAddress || ""),
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-28">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Transfer Tokens
              </CardTitle>
              <CardDescription>
                Send tokens to any address on the network
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form
                  className="space-y-6"
                  onSubmit={form.handleSubmit(() => {})}
                >
                  <FormField
                    control={form.control}
                    name="tokenAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Address</FormLabel>
                        <FormControl>
                          <Input placeholder="0x..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <BalanceInput
                          label="Amount"
                          value={field.value}
                          onChange={field.onChange}
                          tokenAddress={tokenAddress}
                          userAddress={address}
                          decimals={decimals}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recipientAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient Address</FormLabel>
                        <FormControl>
                          <Input placeholder="0x..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-5 gap-4">
                    <div className="col-span-2">
                      <SendTokenBtn
                        {...(form.control._formValues as TransferForm)}
                        decimals={decimals || 18}
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      Or
                    </div>
                    <div className="col-span-2">
                      <MintTokenBtn
                        {...(form.control._formValues as TransferForm)}
                        decimals={decimals || 18}
                      />
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
