import { config } from "@/configs/wagmi";
import { getRatioAtTick, getTickAtRatio } from "./tick";
import { readContract } from "@wagmi/core";
import MarketFHEAbi from "@/constant/abi/MarketFHE.json";

// For calculating the tick
const DEBT_INDEX_PRECISION = BigInt(1e15);
const Q40 = 2n ** 40n;

export const createPosition = async (
  marketAddress: `0x${string}`,
  borrowAmt: bigint,
  collateralAmt: bigint,
  tickSpacing: number
) => {
  try {
    const currentDebtIndex = (await readContract(config, {
      address: marketAddress,
      abi: MarketFHEAbi.abi,
      functionName: "pDebtIndex",
    })) as bigint;

    const scaledBorrowAmount =
      (borrowAmt * DEBT_INDEX_PRECISION) / currentDebtIndex;

    const ratioX80 = (scaledBorrowAmount * Q40) / collateralAmt;

    const tick = getTickAtRatio(ratioX80);
    const roundedTick =
      (tick < 0 ? -1 : 1) *
      Math.floor(Math.abs(tick) / tickSpacing) *
      tickSpacing;

    const newRatioX80 = getRatioAtTick(roundedTick);

    const usedCollateralAmount = (scaledBorrowAmount * Q40) / newRatioX80;
    return { tick: roundedTick, usedCollateralAmount };
  } catch (error) {
    throw new Error("Failed to calculate tick. Please try again.");
  }
};
