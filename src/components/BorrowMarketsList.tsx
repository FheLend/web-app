
import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/providers/ThemeProvider';
import { Image } from '@/components/ui/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Filter = 'All' | 'ETH' | 'USDC' | 'USDT' | 'WBTC';
type SortField = 'ltv' | 'liquidity' | 'rate' | null;
type SortDirection = 'asc' | 'desc';

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
    vaultRating: 1
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
    vaultRating: 15
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
    vaultRating: 16
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
    vaultRating: 10
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
    vaultRating: 7
  },
];

export function BorrowMarketsList() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const sortMarkets = (marketsToSort: Market[]) => {
    if (!sortField) return marketsToSort;
    
    return [...marketsToSort].sort((a, b) => {
      let valueA: number, valueB: number;
      
      switch (sortField) {
        case 'ltv':
          valueA = a.ltvValue;
          valueB = b.ltvValue;
          break;
        case 'liquidity':
          valueA = a.liquidityValue;
          valueB = b.liquidityValue;
          break;
        case 'rate':
          valueA = a.rateValue;
          valueB = b.rateValue;
          break;
        default:
          return 0;
      }
      
      return sortDirection === 'asc' 
        ? valueA - valueB 
        : valueB - valueA;
    });
  };
  
  const filteredMarkets = markets.filter(market => {
    const matchesSearch = searchTerm === '' || 
      market.collateralToken.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
      market.loanToken.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = activeFilter === 'All' || 
      market.collateralToken.symbol === activeFilter || 
      market.loanToken.symbol === activeFilter;
    
    return matchesSearch && matchesFilter;
  });
  
  const sortedMarkets = sortMarkets(filteredMarkets);

  const handleRowClick = (marketId: string) => {
    navigate(`/market/${marketId}`);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronDown className="h-4 w-4 ml-1 opacity-30" />;
    }
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-1" /> 
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const renderMobileMarkets = () => {
    return sortedMarkets.map((market) => (
      <div 
        key={market.id}
        className={cn(
          "mb-4 p-4 rounded-lg border hover:bg-cryptic-purple/10 transition duration-150 cursor-pointer",
          theme === "dark" 
            ? "bg-cryptic-dark/50 border-cryptic-muted/20" 
            : "bg-white border-slate-200 hover:bg-slate-50"
        )}
        onClick={() => handleRowClick(market.id)}
      >
        <div className="flex items-center mb-3 justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 mr-3">
              <Image 
                src={market.collateralToken.logo} 
                alt={market.collateralToken.symbol}
                className="rounded-full"
              />
            </div>
            <div>
              <div className="font-medium text-foreground">{market.collateralToken.symbol}</div>
              {market.collateralToken.apy && (
                <div className="text-xs text-green-400">APY: {market.collateralToken.apy}</div>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="h-10 w-10 mr-3">
              <Image 
                src={market.loanToken.logo} 
                alt={market.loanToken.symbol}
                className="rounded-full"
              />
            </div>
            <div className="font-medium text-foreground">{market.loanToken.symbol}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div>
            <div className="text-muted-foreground">LTV</div>
            <div className="text-foreground font-medium">{market.ltv}</div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Rate</div>
            <div className={cn(
              "font-medium",
              market.rateChange === 'up' ? "text-emerald-400" : 
              market.rateChange === 'down' ? "text-rose-400" : 
              "text-amber-400"
            )}>
              {market.rate} 
              <span className="ml-1">
                {market.rateChange === 'up' && '↑'}
                {market.rateChange === 'down' && '↓'}
                {market.rateChange === 'stable' && '→'}
              </span>
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Liquidity</div>
            <div className="text-foreground font-medium">{market.liquidity}</div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Vault Rating</div>
            <div className="flex items-center">
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                theme === "dark" 
                  ? "bg-cryptic-purple/10 text-cryptic-highlight" 
                  : "bg-blue-50 text-cryptic-accent"
              )}>
                +{market.vaultRating}
              </span>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="py-8 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Borrow Markets</h2>
          <p className="text-muted-foreground text-base sm:text-lg">Choose which assets to use as collateral and which to borrow</p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto mb-4 sm:mb-0 overflow-x-auto pb-2 sm:pb-0">
            <div className="flex space-x-2 min-w-max">
              {(['All', 'ETH', 'WBTC', 'USDC', 'USDT'] as Filter[]).map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "border-cryptic-muted text-base",
                    activeFilter === filter && "bg-cryptic-accent hover:bg-cryptic-accent"
                  )}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search markets"
              className={cn(
                "pl-10 w-full sm:w-64 text-base",
                theme === "dark" 
                  ? "bg-cryptic-darker border-cryptic-muted" 
                  : "bg-white border-slate-200"
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isMobile ? (
          <div className="space-y-4">
            {renderMobileMarkets()}
          </div>
        ) : (
          <div className={cn(
            "overflow-x-auto cryptic-shadow rounded-lg border",
            theme === "dark" ? "border-cryptic-accent/20" : "border-slate-200"
          )}>
            <Table className="w-full text-base">
              <TableHeader className={theme === "dark" ? "bg-cryptic-darker" : "bg-slate-50"}>
                <TableRow>
                  <TableHead className="text-left font-medium text-muted-foreground">Collateral</TableHead>
                  <TableHead className="text-left font-medium text-muted-foreground">Loan</TableHead>
                  <TableHead 
                    className="text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground flex items-center"
                    onClick={() => handleSort('ltv')}
                  >
                    <span>LTV</span>
                    {renderSortIndicator('ltv')}
                  </TableHead>
                  <TableHead 
                    className="text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground flex items-center"
                    onClick={() => handleSort('liquidity')}
                  >
                    <span>Liquidity</span>
                    {renderSortIndicator('liquidity')}
                  </TableHead>
                  <TableHead 
                    className="text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground flex items-center"
                    onClick={() => handleSort('rate')}
                  >
                    <span>Rate</span>
                    {renderSortIndicator('rate')}
                  </TableHead>
                  <TableHead className="text-left font-medium text-muted-foreground">Vault Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={cn(
                "divide-y",
                theme === "dark" ? "divide-cryptic-muted/20" : "divide-slate-100"
              )}>
                {sortedMarkets.map((market) => (
                  <TableRow 
                    key={market.id} 
                    className={cn(
                      "transition duration-150 cursor-pointer",
                      theme === "dark" 
                        ? "bg-cryptic-dark/50 hover:bg-cryptic-purple/10" 
                        : "bg-white hover:bg-slate-50"
                    )}
                    onClick={() => handleRowClick(market.id)}
                  >
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <Image 
                            src={market.collateralToken.logo} 
                            alt={market.collateralToken.symbol}
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{market.collateralToken.symbol}</div>
                          {market.collateralToken.apy && (
                            <div className="text-xs text-green-400">APY: {market.collateralToken.apy}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <Image 
                            src={market.loanToken.logo} 
                            alt={market.loanToken.symbol}
                            className="rounded-full"
                          />
                        </div>
                        <div className="font-medium text-foreground">{market.loanToken.symbol}</div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-foreground font-medium">
                      {market.ltv}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-foreground font-medium">
                      {market.liquidity}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <span 
                          className={cn(
                            "font-medium",
                            market.rateChange === 'up' ? "text-emerald-400" : 
                            market.rateChange === 'down' ? "text-rose-400" : 
                            "text-amber-400"
                          )}
                        >
                          {market.rate}
                        </span>
                        <div 
                          className={cn(
                            "ml-2 text-xl",
                            market.rateChange === 'up' ? "text-emerald-400" : 
                            market.rateChange === 'down' ? "text-rose-400" : 
                            "text-amber-400"
                          )}
                        >
                          {market.rateChange === 'up' && '↑'}
                          {market.rateChange === 'down' && '↓'}
                          {market.rateChange === 'stable' && '→'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-sm font-medium",
                          theme === "dark" 
                            ? "bg-cryptic-purple/10 text-cryptic-highlight" 
                            : "bg-blue-50 text-cryptic-accent"
                        )}>
                          +{market.vaultRating}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
