
import { useState } from 'react';
import { Search, Shield, Star, Vault, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Filter = 'All' | 'ETH' | 'BTC' | 'USDC' | 'DAI';

interface Vault {
  id: string;
  name: string;
  icon: string;
  deposits: string;
  value: string;
  curator: string;
  curatorIcon: string;
  collateral: string[];
  apy: string;
  apyTrend: 'up' | 'down' | 'stable';
}

const vaults: Vault[] = [
  {
    id: '1',
    name: 'Private DAI Vault',
    icon: '🔒',
    deposits: '350.06M DAI',
    value: '$349.87M',
    curator: 'FeLend DAO',
    curatorIcon: '🛡️',
    collateral: ['ETH', 'BTC', 'LINK', 'AAVE'],
    apy: '7.41%',
    apyTrend: 'up'
  },
  {
    id: '2',
    name: 'Encrypted USDC Yield',
    icon: '🔐',
    deposits: '214.36M USDC',
    value: '$213.99M',
    curator: 'Private Capital',
    curatorIcon: '⚜️',
    collateral: ['ETH', 'SOL', 'AVAX', 'BNB', 'MATIC'],
    apy: '5.86%',
    apyTrend: 'up'
  },
  {
    id: '3',
    name: 'FHE USDC Pool',
    icon: '🛡️',
    deposits: '142.11M USDC',
    value: '$141.92M',
    curator: 'FHE Finance',
    curatorIcon: '🔷',
    collateral: ['ETH', 'BTC', 'LTC', 'DOT', 'BNB'],
    apy: '5.59%',
    apyTrend: 'down'
  },
  {
    id: '4',
    name: 'Private USDT Vault',
    icon: '🔒',
    deposits: '124.78M USDT',
    value: '$124.63M',
    curator: 'FHE Finance',
    curatorIcon: '🔷',
    collateral: ['ETH', 'BTC', 'SOL'],
    apy: '4.94%',
    apyTrend: 'down'
  },
  {
    id: '5',
    name: 'Confidential BUSD',
    icon: '🔐',
    deposits: '91.89M BUSD',
    value: '$91.85M',
    curator: 'FHE Finance',
    curatorIcon: '🔷',
    collateral: ['ETH', 'BNB'],
    apy: '5.05%',
    apyTrend: 'stable'
  },
  {
    id: '6',
    name: 'Encrypted USDC Core',
    icon: '🛡️',
    deposits: '84.54M USDC',
    value: '$84.37M',
    curator: 'FeLend DAO',
    curatorIcon: '🔱',
    collateral: ['ETH', 'BTC', 'SOL', 'DOT', 'LINK'],
    apy: '5.49%',
    apyTrend: 'up'
  },
];

export function VaultTable() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const filteredVaults = vaults.filter(vault => {
    const matchesSearch = searchTerm === '' || 
      vault.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      vault.curator.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = activeFilter === 'All' || 
      vault.deposits.includes(activeFilter);
    
    return matchesSearch && matchesFilter;
  });

  const handleRowClick = (vaultId: string) => {
    navigate(`/vault/${vaultId}`);
  };

  // Render a mobile card view for each vault
  const renderMobileVaults = () => {
    return filteredVaults.map((vault) => (
      <div 
        key={vault.id}
        className="mb-4 p-4 bg-cryptic-dark/50 rounded-lg border border-cryptic-muted/20 hover:bg-cryptic-purple/10 transition duration-150 cursor-pointer"
        onClick={() => handleRowClick(vault.id)}
      >
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-cryptic-purple/10 rounded-full">
            <span className="text-xl">{vault.icon}</span>
          </div>
          <div className="ml-4">
            <div className="font-medium text-foreground text-lg">{vault.name}</div>
            <div className="text-muted-foreground">{vault.value}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div>
            <div className="text-muted-foreground">Deposits</div>
            <div className="text-foreground font-medium">{vault.deposits}</div>
          </div>
          
          <div>
            <div className="text-muted-foreground">APY</div>
            <div className={cn(
              "font-medium",
              vault.apyTrend === 'up' ? "text-emerald-400" : 
              vault.apyTrend === 'down' ? "text-rose-400" : 
              "text-amber-400"
            )}>
              {vault.apy} 
              <span className="ml-1">
                {vault.apyTrend === 'up' && '↑'}
                {vault.apyTrend === 'down' && '↓'}
                {vault.apyTrend === 'stable' && '→'}
              </span>
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Curator</div>
            <div className="flex items-center text-foreground">
              <span className="mr-1">{vault.curatorIcon}</span> {vault.curator}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground">Collateral</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {vault.collateral.slice(0, 2).map((token, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cryptic-purple/10 text-cryptic-highlight"
                >
                  {token}
                </span>
              ))}
              {vault.collateral.length > 2 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cryptic-purple/10 text-cryptic-highlight">
                  +{vault.collateral.length - 2}
                </span>
              )}
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
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Encrypted Lending Vaults</h2>
          <p className="text-muted-foreground text-base sm:text-lg">Discover our FHE-powered lending pools with private transactions and balances</p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto mb-4 sm:mb-0 overflow-x-auto pb-2 sm:pb-0">
            <div className="flex space-x-2 min-w-max">
              {(['All', 'ETH', 'BTC', 'USDC', 'DAI'] as Filter[]).map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "border-cryptic-muted text-base",
                    activeFilter === filter && "bg-cryptic-accent hover:bg-cryptic-accent/90"
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
              placeholder="Search vaults"
              className="pl-10 w-full sm:w-64 bg-cryptic-darker border-cryptic-muted text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isMobile ? (
          <div className="space-y-4">
            {renderMobileVaults()}
          </div>
        ) : (
          <div className="overflow-x-auto cryptic-shadow rounded-lg border border-cryptic-accent/20">
            <Table className="w-full text-base">
              <TableHeader className="bg-cryptic-darker">
                <TableRow>
                  <TableHead className="text-left font-medium text-muted-foreground">Vault</TableHead>
                  <TableHead className="text-left font-medium text-muted-foreground">Deposits</TableHead>
                  <TableHead className="text-left font-medium text-muted-foreground">Curator</TableHead>
                  <TableHead className="text-left font-medium text-muted-foreground">Collateral</TableHead>
                  <TableHead className="text-left font-medium text-muted-foreground">APY</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-cryptic-muted/20">
                {filteredVaults.map((vault) => (
                  <TableRow 
                    key={vault.id} 
                    className="bg-cryptic-dark/50 hover:bg-cryptic-purple/10 transition duration-150 cursor-pointer"
                    onClick={() => handleRowClick(vault.id)}
                  >
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-cryptic-purple/10 rounded-full">
                          <span className="text-xl">{vault.icon}</span>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-foreground text-lg">{vault.name}</div>
                          <div className="text-muted-foreground">{vault.value}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-foreground">
                      {vault.deposits}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-cryptic-purple/10 rounded-full">
                          <span className="text-base">{vault.curatorIcon}</span>
                        </div>
                        <div className="ml-3 text-foreground">{vault.curator}</div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {vault.collateral.map((token, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cryptic-purple/10 text-cryptic-highlight"
                          >
                            {token}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <span 
                          className={cn(
                            "font-medium text-lg",
                            vault.apyTrend === 'up' ? "text-emerald-400" : 
                            vault.apyTrend === 'down' ? "text-rose-400" : 
                            "text-amber-400"
                          )}
                        >
                          {vault.apy}
                        </span>
                        <div 
                          className={cn(
                            "ml-2 text-xl",
                            vault.apyTrend === 'up' ? "text-emerald-400" : 
                            vault.apyTrend === 'down' ? "text-rose-400" : 
                            "text-amber-400"
                          )}
                        >
                          {vault.apyTrend === 'up' && '↑'}
                          {vault.apyTrend === 'down' && '↓'}
                          {vault.apyTrend === 'stable' && '→'}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="mt-6 flex justify-center">
          <div className="inline-flex rounded-md">
            <Button variant="outline" size="sm" className="rounded-r-none border-r-0 text-muted-foreground text-base">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="rounded-l-none text-muted-foreground text-base">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
