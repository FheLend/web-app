export interface Market {
  id: string;
  name: string;
  collateralToken: {
    symbol: string;
    logo: string;
    apy?: string;
    address: string;
    decimals?: number;
  };
  loanToken: {
    symbol: string;
    logo: string;
    address: string;
    decimals?: number;
  };
  ltv: string;
  ltvValue: number;
  liquidity: string;
  liquidityValue: number;
  rate: string;
  rateValue: number;
  rateChange: "up" | "down" | "stable";
  vaultRating: number;
  maxLtvBasisPoint: number;
  liquidationThresholdBasisPoint: number;
  tickSpacing: number;
}
