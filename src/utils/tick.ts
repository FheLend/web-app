// TickMath.ts
// SPDX-License-Identifier: GPL-2.0-or-later

export const MIN_TICK: number = -166363;
export const MAX_TICK: number = -MIN_TICK;

export const MIN_RATIO: bigint = 65541n;
export const MAX_RATIO: bigint = 18445561804641519763n;

export function getRatioAtTick(tick: number): bigint {
  const absTick = tick < 0 ? BigInt(-tick) : BigInt(tick);
  if (absTick > BigInt(MAX_TICK)) throw new Error("T");

  let ratio: bigint =
    absTick & 0x1n
      ? 0xfff97272373d413259a46990580e213an
      : 0x100000000000000000000000000000000n;

  if (absTick & 0x2n)
    ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n;
  if (absTick & 0x4n)
    ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n;
  if (absTick & 0x8n)
    ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n;
  if (absTick & 0x10n)
    ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n;
  if (absTick & 0x20n)
    ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n;
  if (absTick & 0x40n)
    ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n;
  if (absTick & 0x80n)
    ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n;
  if (absTick & 0x100n)
    ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n;
  if (absTick & 0x200n)
    ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n;
  if (absTick & 0x400n)
    ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n;
  if (absTick & 0x800n)
    ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n;
  if (absTick & 0x1000n)
    ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n;
  if (absTick & 0x2000n)
    ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n;
  if (absTick & 0x4000n)
    ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n;
  if (absTick & 0x8000n)
    ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n;
  if (absTick & 0x10000n)
    ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n) >> 128n;
  if (absTick & 0x20000n)
    ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n) >> 128n;
  if (absTick & 0x40000n) ratio = (ratio * 0x48a170391f7dc42444e8fa2n) >> 128n;
  if (absTick & 0x80000n) ratio = (ratio * 0x149b34ee7ac263n) >> 128n;

  if (tick > 0) ratio = ((1n << 256n) - 1n) / ratio; // uint256.max / ratio

  const shifted = ratio >> 88n;
  const needsRoundUp = ratio % (1n << 88n) !== 0n;
  return shifted + (needsRoundUp ? 1n : 0n);
}

export function getTickAtRatio(ratioX80: bigint): number {
  if (ratioX80 < MIN_RATIO || ratioX80 >= MAX_RATIO) throw new Error("R");

  const ratio = ratioX80 << 88n; // back to Q128.128

  // find most significant bit (msb)
  let r = ratio;
  let msb = 0n;

  const check = (shift: bigint, mask: bigint) => {
    if (r > mask) {
      r >>= shift;
      msb |= shift;
    }
  };

  check(128n, (1n << 128n) - 1n);
  check(64n, (1n << 64n) - 1n);
  check(32n, (1n << 32n) - 1n);
  check(16n, (1n << 16n) - 1n);
  check(8n, (1n << 8n) - 1n);
  check(4n, (1n << 4n) - 1n);
  check(2n, (1n << 2n) - 1n);
  check(1n, 1n);

  // normalize r
  if (msb >= 128n) r = ratio >> (msb - 127n);
  else r = ratio << (127n - msb);

  let log_2 = (msb - 128n) << 64n;

  // iterative approximation (8 rounds)
  for (let i = 0; i < 14; i++) {
    r = (r * r) >> 127n;
    const f = r >> 128n;
    log_2 |= f << (63n - BigInt(i));
    r >>= f;
  }

  // log_10001 = log2(ratioX128) / log2(1.0001)
  const log_10001 = log_2 * 127869479499815993737216n; // 128.128 number

  const tickLow = Number(
    (log_10001 - 3402992956809132418596140100660247210n) >> 128n
  );
  const tickHi = Number(
    (log_10001 + 291339464771989622907027621153398088495n) >> 128n
  );

  return getRatioAtTick(tickHi) <= ratioX80 ? tickHi : tickLow;
}
