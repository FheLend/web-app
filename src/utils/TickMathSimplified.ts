/**
 * Simplified version of TickMath for calculating ticks from ratios
 */

// Constants for 1.0001 base tick system
const BASE = 1.0001;

/**
 * Calculates the tick from a given ratio
 * @param ratio The ratio value (can be a decimal or bigint with fixed point representation)
 * @param isFixedPoint Whether the ratio is in fixed point representation (with Q80 precision)
 * @returns The tick value
 */
export function getTickFromRatio(
  ratio: bigint | number,
  isFixedPoint = true
): number {
  // If ratio is a bigint and represents a fixed point number with Q80 precision
  // we need to convert it to a decimal
  let decimalRatio: number;
  if (typeof ratio === "bigint" && isFixedPoint) {
    // Convert from fixed point Q48.80 to a decimal
    const Q80 = 2n ** 80n;
    decimalRatio = Number(ratio) / Number(Q80);
  } else {
    decimalRatio = Number(ratio);
  }

  // Calculate tick using logarithm base 1.0001
  // Formula: tick = log(ratio) / log(1.0001)
  return Math.floor(Math.log(decimalRatio) / Math.log(BASE));
}

/**
 * Rounds a tick to the nearest tick spacing
 * @param tick Raw tick value
 * @param tickSpacing Tick spacing value
 * @returns Tick rounded down to a valid tick according to spacing
 */
export function roundToValidTick(tick: number, tickSpacing: number): number {
  return Math.floor(tick / tickSpacing) * tickSpacing;
}
