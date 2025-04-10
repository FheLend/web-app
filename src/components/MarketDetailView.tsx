
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Lock, RefreshCw, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/ThemeProvider';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

interface MarketDetailProps {
  marketId: string;
}

interface Market {
  id: string;
  collateralToken: {
    symbol: string;
    logo: string;
    apy?: string;
  };
  loanToken: {
    symbol: string;
    logo: string;
  };
  ltv: string;
  ltvValue: number;
  liquidity: string;
  liquidityValue: number;
  rate: string;
  rateValue: number;
  rateChange: 'up' | 'down' | 'stable';
  vaultRating: number;
  totalLoans: string;
}

const markets: Market[] = [
  {
    id: '1',
    collateralToken: {
      symbol: 'USDT',
      logo: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661',
    },
    loanToken: {
      symbol: 'USDC',
      logo: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694',
    },
    ltv: '96.50%',
    ltvValue: 96.5,
    liquidity: '66.24M USDC',
    liquidityValue: 66.24,
    rate: '5.33%',
    rateValue: 5.33,
    rateChange: 'up',
    vaultRating: 1,
    totalLoans: '$1,704,909,971'
  },
  {
    id: '2',
    collateralToken: {
      symbol: 'WBTC',
      logo: 'https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png?1696507857',
    },
    loanToken: {
      symbol: 'USDC',
      logo: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694',
    },
    ltv: '86.00%',
    ltvValue: 86.0,
    liquidity: '29.8M USDC',
    liquidityValue: 29.8,
    rate: '4.90%',
    rateValue: 4.9,
    rateChange: 'up',
    vaultRating: 15,
    totalLoans: '$1,253,490,256'
  },
  {
    id: '3',
    collateralToken: {
      symbol: 'wstETH',
      logo: 'https://assets.coingecko.com/coins/images/13442/standard/steth_logo.png?1696513206',
      apy: '3.53%'
    },
    loanToken: {
      symbol: 'USDC',
      logo: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694',
    },
    ltv: '88.00%',
    ltvValue: 88.0,
    liquidity: '26.81M USDC',
    liquidityValue: 26.81,
    rate: '5.24%',
    rateValue: 5.24,
    rateChange: 'up',
    vaultRating: 16,
    totalLoans: '$984,671,345'
  },
  {
    id: '4',
    collateralToken: {
      symbol: 'ETH',
      logo: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628',
    },
    loanToken: {
      symbol: 'USDC',
      logo: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694',
    },
    ltv: '86.00%',
    ltvValue: 86.0,
    liquidity: '24.48M USDC',
    liquidityValue: 24.48,
    rate: '5.04%',
    rateValue: 5.04,
    rateChange: 'up',
    vaultRating: 10,
    totalLoans: '$873,562,190'
  },
  {
    id: '5',
    collateralToken: {
      symbol: 'wstETH',
      logo: 'https://assets.coingecko.com/coins/images/13442/standard/steth_logo.png?1696513206',
      apy: '3.53%'
    },
    loanToken: {
      symbol: 'USDT',
      logo: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661',
    },
    ltv: '88.00%',
    ltvValue: 88.0,
    liquidity: '17.58M USDT',
    liquidityValue: 17.58,
    rate: '3.07%',
    rateValue: 3.07,
    rateChange: 'up',
    vaultRating: 7,
    totalLoans: '$642,897,345'
  },
];

export function MarketDetailView({ marketId }: MarketDetailProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  
  const market = markets.find((m) => m.id === marketId);
  
  if (!market) {
    return (
      <div className="py-16 text-center">
        <p className="text-xl text-muted-foreground">Market not found</p>
        <Button 
          className="mt-4"
          onClick={() => navigate('/borrow')}
        >
          Back to Markets
        </Button>
      </div>
    );
  }
  
  const handleCollateralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCollateralAmount(value);
    
    // Calculate borrow amount based on LTV
    if (value) {
      const collateral = parseFloat(value);
      const ltv = market.ltvValue / 100;
      setBorrowAmount((collateral * ltv).toFixed(2));
    } else {
      setBorrowAmount('');
    }
  };
  
  const handleBorrowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBorrowAmount(value);
    
    // Calculate required collateral based on LTV
    if (value) {
      const borrow = parseFloat(value);
      const ltv = market.ltvValue / 100;
      setCollateralAmount((borrow / ltv).toFixed(2));
    } else {
      setCollateralAmount('');
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/borrow')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Markets
        </Button>
        
        <div className="mb-8 text-center">
          <p className="text-cryptic-accent font-medium tracking-wide mb-3">
            Total Active Loans:{" "}
            <span
              className={cn(
                "text-cryptic-highlight",
                theme === "dark" ? "animate-glow" : ""
              )}
            >
              {market.totalLoans}
            </span>
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {/* Market Info */}
            <Card className={cn(
              "rounded-lg border transition-all duration-300",
              theme === "dark" 
                ? "border-cryptic-purple/20 bg-glass" 
                : "border-slate-200 bg-white shadow-sm"
            )}>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <div className="flex items-center">
                    <div className="h-10 w-10 mr-3">
                      <Image 
                        src={market.collateralToken.logo} 
                        alt={market.collateralToken.symbol}
                        className="rounded-full"
                      />
                    </div>
                    <span>{market.collateralToken.symbol}</span>
                  </div>
                  <div className="text-lg text-muted-foreground">→</div>
                  <div className="flex items-center">
                    <div className="h-10 w-10 mr-3">
                      <Image 
                        src={market.loanToken.logo} 
                        alt={market.loanToken.symbol}
                        className="rounded-full"
                      />
                    </div>
                    <span>{market.loanToken.symbol}</span>
                  </div>
                </CardTitle>
                <CardDescription className="text-lg">
                  Use {market.collateralToken.symbol} as collateral to borrow {market.loanToken.symbol}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-muted-foreground mb-1">Loan-to-Value (LTV)</p>
                    <p className="text-2xl font-medium text-foreground">{market.ltv}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Borrow Rate</p>
                    <p className={cn(
                      "text-2xl font-medium",
                      market.rateChange === 'up' ? "text-emerald-400" : 
                      market.rateChange === 'down' ? "text-rose-400" : 
                      "text-amber-400"
                    )}>
                      {market.rate}
                      <span className="ml-2 text-xl">
                        {market.rateChange === 'up' && '↑'}
                        {market.rateChange === 'down' && '↓'}
                        {market.rateChange === 'stable' && '→'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Available Liquidity</p>
                    <p className="text-2xl font-medium text-foreground">{market.liquidity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Vault Rating</p>
                    <div className="flex items-center">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-base font-medium",
                        theme === "dark" 
                          ? "bg-cryptic-purple/10 text-cryptic-highlight" 
                          : "bg-blue-50 text-cryptic-accent"
                      )}>
                        +{market.vaultRating}
                      </span>
                    </div>
                  </div>
                </div>
                
                {market.collateralToken.apy && (
                  <div className="mt-6 p-3 rounded-lg bg-green-400/10 text-green-400 flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    <p>
                      Your {market.collateralToken.symbol} collateral earns {market.collateralToken.apy} APY while deposited
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Skip chart section as per requirements */}
          </div>
          
          {/* Borrow Form - Sticky on the right column */}
          <div className="relative">
            <div className="lg:sticky lg:top-24">
              <Card className={cn(
                "rounded-lg border transition-all duration-300",
                theme === "dark" 
                  ? "border-cryptic-purple/20 bg-glass" 
                  : "border-slate-200 bg-white shadow-sm"
              )}>
                <CardHeader>
                  <CardTitle>Borrow {market.loanToken.symbol}</CardTitle>
                  <CardDescription>
                    Use {market.collateralToken.symbol} as collateral to borrow {market.loanToken.symbol} at {market.rate} variable rate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isConnected ? (
                    <div className="text-center py-6">
                      <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg mb-6 text-muted-foreground">Connect your wallet to start borrowing</p>
                      <Button
                        className="bg-cryptic-accent hover:bg-cryptic-accent/90 text-white w-full"
                        onClick={() => open()}
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Connect Wallet
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="collateral" className="block text-muted-foreground mb-2">
                          Collateral Amount
                        </label>
                        <div className="relative">
                          <Input
                            id="collateral"
                            type="number"
                            placeholder="0.00"
                            className="pl-4 pr-24 py-6 text-lg"
                            value={collateralAmount}
                            onChange={handleCollateralChange}
                          />
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                            <Image 
                              src={market.collateralToken.logo} 
                              alt={market.collateralToken.symbol}
                              className="h-5 w-5 mr-1 rounded-full"
                            />
                            <span className="text-muted-foreground">{market.collateralToken.symbol}</span>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                          <span>Balance: 0.00</span>
                          <button className="text-cryptic-accent hover:underline">MAX</button>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="borrow" className="block text-muted-foreground mb-2">
                          Borrow Amount
                        </label>
                        <div className="relative">
                          <Input
                            id="borrow"
                            type="number"
                            placeholder="0.00"
                            className="pl-4 pr-24 py-6 text-lg"
                            value={borrowAmount}
                            onChange={handleBorrowChange}
                          />
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                            <Image 
                              src={market.loanToken.logo} 
                              alt={market.loanToken.symbol}
                              className="h-5 w-5 mr-1 rounded-full"
                            />
                            <span className="text-muted-foreground">{market.loanToken.symbol}</span>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                          <span>Available: {market.liquidity}</span>
                          <button className="text-cryptic-accent hover:underline">MAX</button>
                        </div>
                      </div>
                      
                      <div className="space-y-3 py-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Loan-to-Value</span>
                          <span className="font-medium">{market.ltv}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Liquidation Threshold</span>
                          <span className="font-medium">{(parseFloat(market.ltv) + 3).toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Borrow Rate</span>
                          <span className="font-medium">{market.rate}</span>
                        </div>
                      </div>
                      
                      <Button
                        className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90 text-white text-lg py-6"
                      >
                        <Lock className="mr-2 h-5 w-5" />
                        Borrow {market.loanToken.symbol}
                      </Button>
                      
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
