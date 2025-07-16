"use client";

import { useCallback, useState } from "react";
import { zeroAddress } from "viem";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import {
  useCofhejsAccount,
  useCofhejsCreatePermit,
  useCofhejsModalStore,
} from "@/hooks/useCofhejs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type ExpirationOption = "1 day" | "1 week" | "1 month";
const shareablePermits = false;

export const CofhejsPermitModal = () => {
  const {
    generatePermitModalOpen,
    generatePermitModalCallback,
    setGeneratePermitModalOpen,
  } = useCofhejsModalStore();
  const createPermit = useCofhejsCreatePermit();
  const account = useCofhejsAccount();
  const [expiration, setExpiration] = useState<ExpirationOption>("1 week");
  const [recipient, setRecipient] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [showRecipientInput, setShowRecipientInput] = useState(false);

  const handleClose = useCallback(() => {
    setGeneratePermitModalOpen(false);
    // Reset state when closing
    setExpiration("1 week");
    setRecipient("");
    setName("");
    setShowRecipientInput(false);
  }, [setGeneratePermitModalOpen]);

  const handleGeneratePermit = useCallback(async () => {
    const type = recipient ? "sharing" : "self";

    const permitName = name.length > 0 ? name.slice(0, 24) : undefined;

    const expirationDate = new Date();
    expirationDate.setDate(
      expirationDate.getDate() +
        (expiration === "1 day" ? 1 : expiration === "1 week" ? 7 : 30)
    );

    const recipientAddress = recipient ? recipient : zeroAddress;

    const result = await createPermit({
      type,
      name: permitName,
      issuer: account,
      expiration: Math.round(expirationDate.getTime() / 1000),
      recipient: recipientAddress,
    });
    if (result?.success) {
      handleClose();
      // If there was a callback provided when opening the modal, execute it
      if (generatePermitModalCallback) {
        generatePermitModalCallback();
      }
    }
  }, [
    createPermit,
    generatePermitModalCallback,
    handleClose,
    account,
    recipient,
    expiration,
    name,
  ]);

  return (
    <Dialog
      open={generatePermitModalOpen}
      onOpenChange={setGeneratePermitModalOpen}
    >
      <DialogContent>
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center mb-4">
            <ShieldCheckIcon className="h-12 w-12 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold mb-4">
            Generate CoFHE Permit
          </DialogTitle>
          <p className="text-center mb-2 opacity-70">
            A permit is required to authenticate your identity and grant access
            to your encrypted data.
          </p>
          <p className="text-center mb-6 opacity-70">
            Generating a permit will open your wallet to sign a message (EIP712)
            which verifies your ownership of the connected wallet.
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-4 mb-6">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between gap-2">
              <Label className="text-sm font-semibold">
                Name{" "}
                <span className="font-normal">
                  (optional - used for display purposes)
                </span>
              </Label>
              <span className="text-xs text-gray-500">{name.length}/24</span>
            </div>
            <Input
              type="text"
              placeholder="Enter permit name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 24))}
              maxLength={24}
            />
          </div>

          {/* Expiration */}
          <div className="flex flex-row items-center justify-between gap-2 mt-5">
            <Label className="text-sm font-semibold">Expiration</Label>
            <div className="flex gap-2">
              {(["1 day", "1 week", "1 month"] as const).map((option) => (
                <Button
                  key={option}
                  variant={expiration === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExpiration(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          {/* Recipient */}
          {shareablePermits && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center justify-between gap-2">
                <Label className="text-sm font-semibold">Recipient</Label>
                <div className="flex gap-2">
                  <Button
                    variant={!showRecipientInput ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowRecipientInput(false)}
                  >
                    None
                  </Button>
                  <Button
                    variant={showRecipientInput ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowRecipientInput(true)}
                  >
                    Enter address
                  </Button>
                </div>
              </div>
              {showRecipientInput && (
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient address"
                />
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleGeneratePermit}>Generate Permit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
