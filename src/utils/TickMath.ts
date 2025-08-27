/**
 * TypeScript port of TickMath.sol library
 * For computing sqrt prices from ticks and vice versa
 * Computes sqrt price for ticks of size 1.0001, i.e. sqrt(1.0001^tick) as fixed point Q48.80 numbers.
 * Supports prices between 2**-48 and 2**48
 */

// Constants - directly from Solidity implementation
const MIN_TICK = -332727; // The minimum tick that may be passed to #getRatioAtTick computed from log base 1.0001 of 2**-48
const MAX_TICK = -MIN_TICK; // The maximum tick that may be passed to #getRatioAtTick computed from log base 1.0001 of 2**48

// The minimum and maximum values that can be returned from #getRatioAtTick
const MIN_RATIO = 4295088377n; // Equivalent to getRatioAtTick(MIN_TICK)
const MAX_RATIO = 340272774162632205326393168280372117504n; // Equivalent to getRatioAtTick(MAX_TICK)

/**
 * Calculates 1.0001^tick * 2**80
 * @param tick The input tick for the above formula
 * @returns A Fixed point Q48.80 number representing the ratio of the two assets (borrow/collateral) at the given tick
 * @throws If |tick| > max tick
 */
export function getRatioAtTick(tick: number): bigint {
  // Check if tick is within valid range
  const absTick = tick < 0 ? -tick : tick;
  if (absTick > MAX_TICK) {
    throw new Error("T"); // Match the Solidity error code "T" for tick out of range
  }

  let ratio =
    BigInt(absTick & 0x1) !== 0n
      ? 0xfff97272373d413259a46990580e213an
      : 0x100000000000000000000000000000000n;

  if ((absTick & 0x2) !== 0)
    ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n;
  if ((absTick & 0x4) !== 0)
    ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n;
  if ((absTick & 0x8) !== 0)
    ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n;
  if ((absTick & 0x10) !== 0)
    ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n;
  if ((absTick & 0x20) !== 0)
    ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n;
  if ((absTick & 0x40) !== 0)
    ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n;
  if ((absTick & 0x80) !== 0)
    ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n;
  if ((absTick & 0x100) !== 0)
    ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n;
  if ((absTick & 0x200) !== 0)
    ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n;
  if ((absTick & 0x400) !== 0)
    ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n;
  if ((absTick & 0x800) !== 0)
    ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n;
  if ((absTick & 0x1000) !== 0)
    ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n;
  if ((absTick & 0x2000) !== 0)
    ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n;
  if ((absTick & 0x4000) !== 0)
    ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n;
  if ((absTick & 0x8000) !== 0)
    ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n;
  if ((absTick & 0x10000) !== 0)
    ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n) >> 128n;
  if ((absTick & 0x20000) !== 0)
    ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n) >> 128n;
  if ((absTick & 0x40000) !== 0)
    ratio = (ratio * 0x48a170391f7dc42444e8fa2n) >> 128n;
  if ((absTick & 0x80000) !== 0) ratio = (ratio * 0x149b34ee7ac263n) >> 128n;

  if (tick > 0) {
    // For positive ticks, invert the ratio (same as dividing 2^256 by ratio)
    ratio = 2n ** 256n / ratio;
  }

  // This divides by 1<<48 rounding up to go from a Q128.128 to a Q48.80
  // We round up in the division so getTickAtRatio of the output price is always consistent
  const hasRemainder = ratio % (1n << 48n) !== 0n;
  return (ratio >> 48n) + (hasRemainder ? 1n : 0n);
}

/**
 * Calculates the tick for a given ratioX80
 * @param ratioX80 The input ratio as a Q48.80 fixed point number
 * @returns The tick corresponding to the input ratio
 * @throws If ratio is outside valid range
 */
export function getTickAtRatio(ratioX80: bigint): number {
  // Check if ratio is within valid range
  if (ratioX80 < MIN_RATIO || ratioX80 >= MAX_RATIO) {
    throw new Error("R"); // Match the Solidity error code "R" for ratio out of range
  }

  // Most significant bit search
  let msb = 0;

  // Converting ratio from Q48.80 to Q128.128 by shifting left by 48 bits
  // This aligns with the Solidity implementation that uses Q128.128 for internal calculations
  const ratio = ratioX80 << 48n;
  let r = ratio;

  if (r >= 1n << 128n) {
    msb += 128;
    r = r >> 128n;
  }
  if (r >= 1n << 64n) {
    msb += 64;
    r = r >> 64n;
  }
  if (r >= 1n << 32n) {
    msb += 32;
    r = r >> 32n;
  }
  if (r >= 1n << 16n) {
    msb += 16;
    r = r >> 16n;
  }
  if (r >= 1n << 8n) {
    msb += 8;
    r = r >> 8n;
  }
  if (r >= 1n << 4n) {
    msb += 4;
    r = r >> 4n;
  }
  if (r >= 1n << 2n) {
    msb += 2;
    r = r >> 2n;
  }
  if (r >= 1n << 1n) {
    msb += 1;
  }

  // Normalize to precision 127
  if (msb >= 128) {
    r = ratio >> BigInt(msb - 127);
  } else {
    r = ratio << BigInt(127 - msb);
  }

  // Calculate log_2 approximation with a 64-bit fractional part
  let log_2 = BigInt((msb - 128) << 64);

  // Fractional part binary logarithm calculation
  r = (r * r) >> 127n;
  if (r >= 1n << 128n) {
    log_2 |= 1n << 63n;
    r = r >> 1n;
  }
  r = (r * r) >> 127n;
  if (r >= 1n << 128n) {
    log_2 |= 1n << 62n;
    r = r >> 1n;
  }
  r = (r * r) >> 127n;
  if (r >= 1n << 128n) {
    log_2 |= 1n << 61n;
    r = r >> 1n;
  }
  r = (r * r) >> 127n;
  if (r >= 1n << 128n) {
    log_2 |= 1n << 60n;
    r = r >> 1n;
  }
  r = (r * r) >> 127n;
  if (r >= 1n << 128n) {
    log_2 |= 1n << 59n;
    r = r >> 1n;
  }
  r = (r * r) >> 127n;
  if (r >= 1n << 128n) {
    log_2 |= 1n << 58n;
    r = r >> 1n;
  }
  r = (r * r) >> 127n;
  if (r >= 1n << 128n) {
    log_2 |= 1n << 57n;
    r = r >> 1n;
  }
  r = (r * r) >> 127n;
  if (r >= 1n << 128n) {
    log_2 |= 1n << 56n;
    r = r >> 1n;
  }
  r = (r * r) >> 127n;
  if (r >= 1n << 128n) {
    log_2 |= 1n << 55n;
    r = r >> 1n;
  }
  r = (r * r) >> 127n;
  if (r >= 1n << 128n) {
    log_2 |= 1n << 54n;
    r = r >> 1n;
  }
  r = (r * r) >> 127n;
  if (r >= 1n << 128n) {
    log_2 |= 1n << 53n;
    r = r >> 1n;
  }
  r = (r * r) >> 127n;
  if (r >= 1n << 128n) {
    log_2 |= 1n << 52n;
    r = r >> 1n;
  }
  r = (r * r) >> 127n;
  if (r >= 1n << 128n) {
    log_2 |= 1n << 51n;
    r = r >> 1n;
  }
  r = (r * r) >> 127n;
  if (r >= 1n << 128n) {
    log_2 |= 1n << 50n;
    r = r >> 1n;
  }

  // Convert from log base 2 to the corresponding tick value
  // Using the constant from Solidity implementation for log2(1.0001)
  // This is the value to convert from log2(x) to log1.0001(x)
  const log_10001 = log_2 * 127869479499815993737216n;

  // Constants from Solidity implementation for computing the tick
  const tickLow = Number(
    (log_10001 - 3402992956809132418596140100660247210n) >> 128n
  );
  const tickHi = Number(
    (log_10001 + 291339464771989622907027621153398088495n) >> 128n
  );

  // Choose the closest tick
  if (tickLow === tickHi) {
    return tickLow;
  }

  return getRatioAtTick(tickHi) <= ratioX80 ? tickHi : tickLow;
}

/**
 * Utility function to round a tick to the nearest tick spacing
 * @param tick Raw tick value
 * @param tickSpacing Tick spacing value
 * @returns Tick rounded to the nearest valid tick according to spacing
 */
export function roundToNearestValidTick(
  tick: number,
  tickSpacing: number
): number {
  return Math.floor(tick / tickSpacing) * tickSpacing;
}

// Export constants for use in other files
export const TickMathConstants = {
  MIN_TICK,
  MAX_TICK,
  MIN_RATIO,
  MAX_RATIO,
};
