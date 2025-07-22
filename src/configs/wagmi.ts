import { defineChain } from "viem";
import { http, createConfig } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";

export const hardhatHaLink = defineChain({
  id: 31_337,
  name: "hardhat",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://node.halink.fun"] },
  },
});

export const config = createConfig({
  chains: import.meta.env.DEV
    ? [arbitrumSepolia, hardhatHaLink]
    : [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(),
    [hardhatHaLink.id]: http(),
  },
});
