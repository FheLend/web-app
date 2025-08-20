export function getTokenLogo(symbol: string) {
  const str = symbol.toLowerCase();
  if (str.includes("eth")) {
    return "https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628";
  }
  if (str.includes("usdc")) {
    return "https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694";
  }
  if (str.includes("usdt")) {
    return "https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661";
  }
  return null;
}
