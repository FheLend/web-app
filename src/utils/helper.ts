import { getRatioAtTick, getTickAtRatio } from "./tick";

// For calculating the tick
const DEBT_INDEX_PRECISION = BigInt(1e15);
const Q40 = 2n ** 40n;

export const createPosition = async (
  borrowAmt: bigint,
  collateralAmt: bigint,
  currentDebtIndex: bigint,
  tickSpacing: number
) => {
  try {
    const scaledBorrowAmount =
      (borrowAmt * DEBT_INDEX_PRECISION) / currentDebtIndex;

    const ratioX80 = (scaledBorrowAmount * Q40) / collateralAmt;

    const tick = getTickAtRatio(ratioX80);
    const roundedTick = Math.floor(tick / tickSpacing) * tickSpacing;

    const newRatioX80 = getRatioAtTick(roundedTick);

    const usedCollateralAmount = (scaledBorrowAmount * Q40) / newRatioX80;
    return { tick: roundedTick, usedCollateralAmount };
  } catch (error) {
    throw new Error("Failed to calculate tick. Please try again.");
  }
};
