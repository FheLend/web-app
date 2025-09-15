import { useState } from "react";
import { Market } from "@/types/market";
import { Position } from "@/types/position";
import { cofhejs, FheTypes } from "cofhejs/web";
import { formatUnits } from "viem";
import { formatNumber } from "@/utils/converter";
import { toast } from "@/components/ui/use-toast";
import {
  useCofhejsIsActivePermitValid,
  useCofhejsModalStore,
} from "@/hooks/useCofhejs";

interface DecryptedPositionValues {
  [posIndex: number]: {
    collateral?: string;
    borrow?: string;
  };
}

interface DecryptingStatus {
  [posIndex: number]: {
    collateral: boolean;
    borrow: boolean;
  };
}

interface UsePositionDecryptionProps {
  positions: Position[]; // The user positions from useUserPositions
  market: Market;
}

interface UsePositionDecryptionReturn {
  decryptedValues: DecryptedPositionValues;
  decryptingPositions: DecryptingStatus;
  decryptPosition: (
    posIndex: number,
    skipPermitCheck?: boolean
  ) => Promise<void>;
  decryptCollateral: (
    posIndex: number,
    skipPermitCheck?: boolean
  ) => Promise<void>;
  decryptBorrow: (posIndex: number, skipPermitCheck?: boolean) => Promise<void>;
  isDecrypting: (posIndex: number) => boolean;
  isDecryptingCollateral: (posIndex: number) => boolean;
  isDecryptingBorrow: (posIndex: number) => boolean;
  isDecryptedCollateral: (posIndex: number) => boolean;
  isDecryptedBorrow: (posIndex: number) => boolean;
  getDisplayValue: (
    posIndex: number,
    valueType: "collateral" | "borrow"
  ) => string;
  calculatePositionLtv: (posIndex: number) => number;
  allPositionsDecrypted: boolean;
}

/**
 * A hook for managing decryption of FHE-encrypted position data
 */
export function usePositionDecryption({
  positions,
  market,
}: UsePositionDecryptionProps): UsePositionDecryptionReturn {
  // State to track decrypted values for each position
  const [decryptedValues, setDecryptedValues] =
    useState<DecryptedPositionValues>({});
  const [decryptingPositions, setDecryptingPositions] =
    useState<DecryptingStatus>({});

  // Permit validation
  const { valid: isPermitValid } = useCofhejsIsActivePermitValid();
  const { setGeneratePermitModalOpen } = useCofhejsModalStore();

  // Function to handle permit generation
  const handleGeneratePermit = (posIndex: number) => {
    setGeneratePermitModalOpen(true, () => {
      // After permit is generated, attempt to decrypt again
      toast({
        title: "Permit generated",
        description: "Decrypting your position data...",
      });

      // Retry decryption after permit is generated
      decryptPosition(posIndex, true);
    });
  };

  // Function to decrypt an individual value
  const decryptValue = async (
    posIndex: number,
    valueType: "collateral" | "borrow",
    encryptedValue: bigint
  ): Promise<bigint | null> => {
    try {
      const decryptedResult = await cofhejs.unseal(
        encryptedValue,
        FheTypes.Uint128
      );
      if (decryptedResult.success) {
        return decryptedResult.data;
      } else {
        throw new Error(decryptedResult.error?.code || "Decryption failed");
      }
    } catch (error) {
      console.error(`Error decrypting ${valueType}:`, error);
      return null;
    }
  };

  // Function to decrypt a specific value type (collateral or borrow)
  const decryptSingleValue = async (
    posIndex: number,
    valueType: "collateral" | "borrow",
    skipPermitCheck = false
  ) => {
    // Set loading state for this specific value type
    setDecryptingPositions((prev) => ({
      ...prev,
      [posIndex]: {
        ...prev[posIndex],
        [valueType]: true,
      },
    }));

    try {
      if (!skipPermitCheck && !isPermitValid) {
        // Reset loading state
        setDecryptingPositions((prev) => ({
          ...prev,
          [posIndex]: {
            ...prev[posIndex],
            [valueType]: false,
          },
        }));

        // Show permit modal if no valid permit exists
        handleGeneratePermit(posIndex);
        return;
      }

      // Get the encrypted value
      const encryptedValue = BigInt(
        valueType === "collateral"
          ? positions[posIndex].collateralAmount || "0"
          : positions[posIndex].borrowAmount || "0"
      );

      // Decrypt the value
      const decryptedValue = await decryptValue(
        posIndex,
        valueType,
        encryptedValue
      );

      // Format based on token decimals
      const formattedValue = formatNumber(
        formatUnits(
          decryptedValue,
          valueType === "collateral"
            ? market.collateralToken.decimals
            : market.loanToken.decimals
        )
      );

      // Store the decrypted value, preserving any other values that might be already decrypted
      setDecryptedValues((prev) => ({
        ...prev,
        [posIndex]: {
          ...prev[posIndex],
          [valueType]: formattedValue,
        },
      }));
    } catch (error) {
      console.error(`Error decrypting ${valueType}:`, error);
      toast({
        title: `Error decrypting ${valueType}`,
        description: error?.message || String(error),
        variant: "destructive",
      });
    } finally {
      setDecryptingPositions((prev) => ({
        ...prev,
        [posIndex]: {
          ...prev[posIndex],
          [valueType]: false,
        },
      }));
    }
  };

  // Function to decrypt collateral amount
  const decryptCollateral = (posIndex: number, skipPermitCheck = false) => {
    return decryptSingleValue(posIndex, "collateral", skipPermitCheck);
  };

  // Function to decrypt borrow amount
  const decryptBorrow = (posIndex: number, skipPermitCheck = false) => {
    return decryptSingleValue(posIndex, "borrow", skipPermitCheck);
  };

  // Function to decrypt both collateral and borrow amounts of a position
  const decryptPosition = async (posIndex: number, skipPermitCheck = false) => {
    // Set loading state for both values
    setDecryptingPositions((prev) => ({
      ...prev,
      [posIndex]: {
        collateral: true,
        borrow: true,
      },
    }));

    try {
      if (!skipPermitCheck && !isPermitValid) {
        // Reset loading state
        setDecryptingPositions((prev) => ({
          ...prev,
          [posIndex]: {
            collateral: false,
            borrow: false,
          },
        }));

        // Show permit modal if no valid permit exists
        handleGeneratePermit(posIndex);
        return;
      }

      // Decrypt both values in parallel
      await Promise.all([
        decryptCollateral(posIndex, true),
        decryptBorrow(posIndex, true),
      ]);
    } catch (error) {
      console.error(`Error decrypting position:`, error);
      toast({
        title: `Error decrypting position`,
        description: error?.message || String(error),
        variant: "destructive",
      });
    } finally {
      setDecryptingPositions((prev) => ({
        ...prev,
        [posIndex]: {
          collateral: false,
          borrow: false,
        },
      }));
    }
  };

  // Helper to check if a position is currently decrypting
  const isDecrypting = (posIndex: number): boolean => {
    return (
      decryptingPositions[posIndex]?.collateral ||
      decryptingPositions[posIndex]?.borrow ||
      false
    );
  };

  // Helper to check if collateral is currently decrypting
  const isDecryptingCollateral = (posIndex: number): boolean => {
    return decryptingPositions[posIndex]?.collateral || false;
  };

  // Helper to check if borrow is currently decrypting
  const isDecryptingBorrow = (posIndex: number): boolean => {
    return decryptingPositions[posIndex]?.borrow || false;
  };

  // Helper to check if collateral is decrypted
  const isDecryptedCollateral = (posIndex: number): boolean => {
    return !!decryptedValues[posIndex]?.collateral;
  };

  // Helper to check if borrow is decrypted
  const isDecryptedBorrow = (posIndex: number): boolean => {
    return !!decryptedValues[posIndex]?.borrow;
  };

  // Helper to get the display value (decrypted or masked)
  const getDisplayValue = (
    posIndex: number,
    valueType: "collateral" | "borrow"
  ): string => {
    return decryptedValues[posIndex]?.[valueType] || "******";
  };

  // Helper to calculate LTV for a specific position
  const calculatePositionLtv = (posIndex: number): number => {
    if (
      !decryptedValues[posIndex]?.collateral ||
      !decryptedValues[posIndex]?.borrow
    ) {
      return 0;
    }

    // Convert from formatted string back to numbers for LTV calc
    const collateralValue = parseFloat(
      decryptedValues[posIndex].collateral!.replace(/,/g, "")
    );
    const borrowValue = parseFloat(
      decryptedValues[posIndex].borrow!.replace(/,/g, "")
    );

    return collateralValue > 0 ? (borrowValue / collateralValue) * 100 : 0;
  };

  // Check if all positions are decrypted
  const allPositionsDecrypted =
    positions.length > 0 &&
    positions.every(
      (_, idx) =>
        !!decryptedValues[idx]?.collateral && !!decryptedValues[idx]?.borrow
    );

  return {
    decryptedValues,
    decryptingPositions,
    decryptPosition,
    decryptCollateral,
    decryptBorrow,
    isDecrypting,
    isDecryptingCollateral,
    isDecryptingBorrow,
    isDecryptedCollateral,
    isDecryptedBorrow,
    getDisplayValue,
    calculatePositionLtv,
    allPositionsDecrypted,
  };
}

// Helper function to calculate total portfolio values from decrypted positions
export function calculateTotalPositionValues(
  positions: Position[],
  decryptedValues: DecryptedPositionValues
) {
  // Initialize with encrypted placeholders
  const initialState = {
    totalCollateral: "*****",
    totalBorrowed: "*****",
    ltvPercentage: "*****",
  };

  // Check if we have decrypted values for all positions
  const allCollateralDecrypted = positions.every(
    (_, idx) => !!decryptedValues[idx]?.collateral
  );
  const allBorrowDecrypted = positions.every(
    (_, idx) => !!decryptedValues[idx]?.borrow
  );

  // If not all values are decrypted, return masked values
  if (!allCollateralDecrypted || !allBorrowDecrypted) {
    return initialState;
  }

  // Calculate totals
  let collateralTotal = 0;
  let borrowTotal = 0;

  positions.forEach((_, idx) => {
    // Get the decrypted values and convert to numbers
    const collateral = parseFloat(
      decryptedValues[idx]?.collateral?.replace(/,/g, "") || "0"
    );
    const borrow = parseFloat(
      decryptedValues[idx]?.borrow?.replace(/,/g, "") || "0"
    );

    collateralTotal += collateral;
    borrowTotal += borrow;
  });

  // Format totals for display
  const totalCollateral = collateralTotal.toFixed(2);
  const totalBorrowed = borrowTotal.toFixed(2);

  // Calculate LTV
  const ltv = collateralTotal > 0 ? (borrowTotal / collateralTotal) * 100 : 0;
  const ltvPercentage = ltv.toFixed(2);

  return { totalCollateral, totalBorrowed, ltvPercentage };
}
