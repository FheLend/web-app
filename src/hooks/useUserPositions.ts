import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatEther, formatUnits } from "viem";
import { readContract } from "@wagmi/core";
import { config } from "@/configs/wagmi";
import MarketFHEAbi from "@/constant/abi/MarketFHE.json";
import { Position } from "@/types/position";

interface UseUserPositionsOptions {
  marketAddress?: `0x${string}`;
  enabled?: boolean;
}

export function useUserPositions({
  marketAddress,
  enabled = true,
}: UseUserPositionsOptions) {
  const { address, isConnected } = useAccount();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Determine if we should make the contract call
  const shouldFetch = enabled && !!address && !!marketAddress && isConnected;

  // Get all positions for the user directly using getUserPositions
  const { data: positionsData, isLoading: positionsLoading } = useReadContract({
    address: marketAddress,
    abi: MarketFHEAbi.abi,
    functionName: "getUserPositions",
    args: [address],
    query: {
      enabled: shouldFetch,
    },
  });

  useEffect(() => {
    // Don't do anything if we're not supposed to fetch
    if (!shouldFetch) {
      setLoading(false);
      setPositions([]);
      return;
    }

    // Set loading state based on the contract read status
    setLoading(positionsLoading);

    // Process positions data when it's available
    if (!positionsLoading && positionsData !== undefined) {
      try {
        // Process the positions data returned from the contract
        const processPositions = () => {
          // If no positions data or empty result, return empty array
          if (
            !positionsData ||
            (Array.isArray(positionsData) && positionsData.length === 0)
          ) {
            setPositions([]);
            return;
          }

          // Map the raw contract data to our UserPosition format
          const userPositions: Position[] = Array.isArray(positionsData)
            ? positionsData.map((posInfo, index) => {
                return {
                  // Use index as the tick for now
                  tick: index,
                  // Extract the values we need from the position info
                  collateralAmount: posInfo.collateral?.toString() || "0",
                  borrowAmount: posInfo.scaledDebt?.toString() || "0",
                  liquidity: "0", // This might need to be calculated or fetched separately
                };
              })
            : [];

          setPositions(userPositions);
          setError(null);
        };

        processPositions();
      } catch (err) {
        console.error("Failed to process user positions:", err);
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        setPositions([]);
      } finally {
        setLoading(false);
      }
    }
  }, [
    address,
    isConnected,
    marketAddress,
    positionsData,
    positionsLoading,
    shouldFetch,
  ]);

  // Fixed loading state: only true when we're actively fetching something
  const isLoading = shouldFetch && (loading || positionsLoading);

  return {
    positions,
    loading: isLoading,
    error,
  };
}
