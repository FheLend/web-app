import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useWriteContract } from "wagmi";
import FHERC20Abi from "@/constant/abi/FHERC20.json";

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

export default function Transfer() {
  const [isLoading, setIsLoading] = useState(false);

  // Use wagmi's useWriteContract hook to interact with the contract
  const { writeContractAsync, isPending } = useWriteContract();

  const form = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      tokenAddress: "",
      amount: "",
      recipientAddress: "",
    },
  });

  const onSubmit = async (data: TransferForm) => {
    setIsLoading(true);
    try {
      const amountBigInt = BigInt(
        Math.floor(parseFloat(data.amount) * 10 ** 18)
      );
      console.log("Parsed amount as BigInt:", amountBigInt);

      const encryptedResult = await cofhejs.encrypt([
        Encryptable.uint128(amountBigInt),
      ]);

      console.log("Encrypted amount:", encryptedResult);
      if (!encryptedResult.success) {
        throw new Error(`Failed to encrypt data: ${encryptedResult.error}`);
      }

      // @ts-expect-error
      const txResult = await writeContractAsync({
        address: data.tokenAddress as `0x${string}`,
        abi: FHERC20Abi.abi,
        functionName: "encTransfer",
        args: [
          data.recipientAddress, // recipient address
          encryptedResult.data[0], // encrypted amount (euint128)
        ],
      });

      toast({
        title: "Transfer Initiated",
        description: `Transaction submitted: ${txResult.substring(0, 10)}...`,
      });

      console.log("Transaction hash:", txResult);
    } catch (error) {
      console.error("Transfer error:", error);
      toast({
        title: "Transfer Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while processing the transfer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
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
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
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

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || isPending}
                  >
                    {isLoading || isPending ? "Sending..." : "Send Tokens"}
                  </Button>
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
