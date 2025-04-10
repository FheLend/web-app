import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Lock, RefreshCw, Percent, ChevronDown } from 'lucide-react';
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
  const [timeframe, setTimeframe] = useState('3 months');
  
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
        
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              <div className="h-12 w-12 mr-3 relative">
                <Image 
                  src={market.collateralToken.logo} 
                  alt={market.collateralToken.symbol}
                  className="rounded-full absolute"
                />
              </div>
              <div className="h-12 w-12 relative -ml-6">
                <Image 
                  src={market.loanToken.logo} 
                  alt={market.loanToken.symbol}
                  className="rounded-full absolute"
                />
              </div>
              <h1 className="text-3xl font-bold ml-3">{market.collateralToken.symbol} / {market.loanToken.symbol}</h1>
            </div>
            <div className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
              theme === "dark" 
                ? "bg-cryptic-purple/10 text-cryptic-highlight" 
                : "bg-blue-50 text-cryptic-accent"
            )}>
              {market.ltv}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <Card className={cn(
              "rounded-lg border transition-all duration-300",
              theme === "dark" 
                ? "border-cryptic-purple/20 bg-glass" 
                : "border-slate-200 bg-white shadow-sm"
            )}>
              <CardContent className="pt-6">
                <div className="text-muted-foreground text-sm mb-1">Total Supply ({market.loanToken.symbol})</div>
                <div className="text-4xl font-bold">{parseFloat(market.liquidity).toFixed(2)}M</div>
                <div className="text-muted-foreground text-sm">${parseFloat(market.liquidity).toFixed(2)}M</div>
              </CardContent>
            </Card>
            <Card className={cn(
              "rounded-lg border transition-all duration-300",
              theme === "dark" 
                ? "border-cryptic-purple/20 bg-glass" 
                : "border-slate-200 bg-white shadow-sm"
            )}>
              <CardContent className="pt-6">
                <div className="text-muted-foreground text-sm mb-1">Liquidity ({market.loanToken.symbol})</div>
                <div className="text-4xl font-bold">{parseFloat(market.liquidity).toFixed(2)}M</div>
                <div className="text-muted-foreground text-sm">${parseFloat(market.liquidity).toFixed(2)}M</div>
              </CardContent>
            </Card>
            <Card className={cn(
              "rounded-lg border transition-all duration-300",
              theme === "dark" 
                ? "border-cryptic-purple/20 bg-glass" 
                : "border-slate-200 bg-white shadow-sm"
            )}>
              <CardContent className="pt-6">
                <div className="text-muted-foreground text-sm mb-1">Rate</div>
                <div className={cn(
                  "text-4xl font-bold",
                  market.rateChange === 'up' ? "text-emerald-400" : 
                  market.rateChange === 'down' ? "text-rose-400" : 
                  "text-amber-400"
                )}>
                  {market.rate}
                  <span className="ml-2">
                    {market.rateChange === 'up' && '↑'}
                    {market.rateChange === 'down' && '↓'}
                    {market.rateChange === 'stable' && '→'}
                  </span>
                </div>
                <div className="text-muted-foreground text-sm">Variable rate</div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-8">
            <Card className={cn(
              "rounded-lg border transition-all duration-300",
              theme === "dark" 
                ? "border-cryptic-purple/20 bg-glass" 
                : "border-slate-200 bg-white shadow-sm"
            )}>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Collateral Token</p>
                    <div className="flex items-center">
                      <Image 
                        src={market.collateralToken.logo} 
                        alt={market.collateralToken.symbol}
                        className="h-6 w-6 mr-2 rounded-full"
                      />
                      <p className="font-medium">{market.collateralToken.symbol}</p>
                    </div>
                    {market.collateralToken.apy && (
                      <p className="text-xs text-green-400 mt-1">APY: {market.collateralToken.apy}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Loan Token</p>
                    <div className="flex items-center">
                      <Image 
                        src={market.loanToken.logo} 
                        alt={market.loanToken.symbol}
                        className="h-6 w-6 mr-2 rounded-full"
                      />
                      <p className="font-medium">{market.loanToken.symbol}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Loan-to-Value (LTV)</p>
                    <p className="font-medium">{market.ltv}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Date of Creation</p>
                    <p className="font-medium">10/04/2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className={cn(
              "rounded-lg border transition-all duration-300",
              theme === "dark" 
                ? "border-cryptic-purple/20 bg-glass" 
                : "border-slate-200 bg-white shadow-sm"
            )}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Total Borrow ({market.loanToken.symbol})</CardTitle>
                  <CardDescription className="text-3xl font-bold mt-1">
                    {parseFloat(market.liquidityValue * 0.6).toFixed(2)}M
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="text-sm">
                    Borrow
                  </Button>
                  <Button variant="outline" size="sm" className="text-sm">
                    Supply
                  </Button>
                  <Button variant="outline" size="sm" className="text-sm">
                    Liquidity
                  </Button>
                  <Button variant="outline" size="sm" className="text-sm flex items-center">
                    {timeframe}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Chart visualization would go here</p>
              </CardContent>
            </Card>
            
            <Card className={cn(
              "rounded-lg border transition-all duration-300",
              theme === "dark" 
                ? "border-cryptic-purple/20 bg-glass" 
                : "border-slate-200 bg-white shadow-sm"
            )}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    Rate 
                    <span className={cn(
                      "ml-2",
                      market.rateChange === 'up' ? "text-emerald-400" : 
                      market.rateChange === 'down' ? "text-rose-400" : 
                      "text-amber-400"
                    )}>
                      {market.rateChange === 'up' && '↑'}
                      {market.rateChange === 'down' && '↓'}
                      {market.rateChange === 'stable' && '→'}
                    </span>
                  </CardTitle>
                  <CardDescription className={cn(
                    "text-3xl font-bold mt-1",
                    market.rateChange === 'up' ? "text-emerald-400" : 
                    market.rateChange === 'down' ? "text-rose-400" : 
                    "text-amber-400"
                  )}>
                    {market.rate}
                  </CardDescription>
                </div>
                <div>
                  <Button variant="outline" size="sm" className="text-sm flex items-center">
                    1 month
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">Rate chart visualization would go here</p>
              </CardContent>
              <div className="px-6 py-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">Native Rate</div>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="font-medium">{(market.rateValue - 0.15).toFixed(2)}%</div>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="md:col-span-2 relative">
            <div className="lg:sticky lg:top-24 space-y-6">
              <Card className={cn(
                "rounded-lg border transition-all duration-300",
                theme === "dark" 
                  ? "border-cryptic-purple/20 bg-glass" 
                  : "border-slate-200 bg-white shadow-sm"
              )}>
                <CardHeader>
                  <CardTitle>Supply Collateral {market.collateralToken.symbol}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!isConnected ? (
                    <div className="text-center py-6">
                      <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                        <span className="text-lg font-bold">X</span>
                      </div>
                      <p className="text-lg mb-2">0.00</p>
                      <p className="text-muted-foreground text-sm mb-6">$0</p>
                      <Button
                        className="bg-cryptic-accent hover:bg-cryptic-accent/90 text-white w-full"
                        onClick={() => open()}
                      >
                        Connect Wallet
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="relative">
                          <Input
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
                        <div className="flex justify-end mt-1 text-xs text-muted-foreground">
                          <span>$0</span>
                        </div>
                      </div>
                      
                      <Button
                        className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90 text-white text-lg py-6"
                      >
                        Supply
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className={cn(
                "rounded-lg border transition-all duration-300",
                theme === "dark" 
                  ? "border-cryptic-purple/20 bg-glass" 
                  : "border-slate-200 bg-white shadow-sm"
              )}>
                <CardHeader>
                  <CardTitle>Borrow {market.loanToken.symbol}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!isConnected ? (
                    <div className="text-center py-6">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4">
                        <span className="text-lg font-bold">B</span>
                      </div>
                      <p className="text-lg mb-2">0.00</p>
                      <p className="text-muted-foreground text-sm mb-6">$0</p>
                      <Button
                        className="bg-cryptic-accent hover:bg-cryptic-accent/90 text-white w-full"
                        onClick={() => open()}
                      >
                        Connect Wallet
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="relative">
                          <Input
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
                        <div className="flex justify-end mt-1 text-xs text-muted-foreground">
                          <span>$0</span>
                        </div>
                      </div>
                      
                      <Button
                        className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90 text-white text-lg py-6"
                      >
                        Borrow
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className={cn(
                "rounded-lg border transition-all duration-300",
                theme === "dark" 
                  ? "border-cryptic-purple/20 bg-glass" 
                  : "border-slate-200 bg-white shadow-sm"
              )}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Your collateral position ({market.collateralToken.symbol})</span>
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mr-1">
                          <span className="text-xs font-bold">X</span>
                        </div>
                        <span>0.00</span>
                      </div>
                    </div>
                    <div className="flex justify-end text-xs text-muted-foreground">
                      <span>$0</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Your loan position ({market.loanToken.symbol})</span>
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mr-1">
                          <span className="text-xs font-bold">B</span>
                        </div>
                        <span>0.00</span>
                      </div>
                    </div>
                    <div className="flex justify-end text-xs text-muted-foreground">
                      <span>$0</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">LTV / Liquidation LTV</span>
                      <span>0% / {market.ltv}</span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
