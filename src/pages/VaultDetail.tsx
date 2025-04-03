
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { VaultHeader } from '@/components/VaultHeader';
import { VaultOverview } from '@/components/VaultOverview';
import { VaultPerformance } from '@/components/VaultPerformance';
import { VaultRisk } from '@/components/VaultRisk';
import { VaultDepositors } from '@/components/VaultDepositors';
import { VaultTransactionHistory } from '@/components/VaultTransactionHistory';
import { DepositWithdrawForm } from '@/components/DepositWithdrawForm';
import { useParams } from 'react-router-dom';
import { useMemo } from 'react';

// Mock data for vault details
const getVaultData = (id: string) => {
  return {
    id,
    name: "Spark DAI Vault",
    symbol: "SparkDAI",
    verified: true,
    description: "This Spark DAI vault is created by SparkDAO's innovators to invest secure amounts for liquidity. Spark follow its mission to capture features.",
    tvl: "350.06M",
    apy: "7.28%",
    borrowed: "82.07M",
    deposited: "350.02M",
    ltv: "7.28%",
    protocolCoverage: "7.28%",
    feeRecipient: {
      amount: "0.00%",
      value: "0.000"
    },
    performanceFee: "0.00%",
    risk: {
      riskFactor: "LOW",
      score: 6,
      timeToLoss: "Never (until jump)",
      collateral: "$022.65M",
      totalOutstanding: "$0.00",
      debtCeiling: "$1,000,000,000"
    },
    marketData: [
      { asset: "ETH-USD (Bband 15%)", allocation: "49.78%", value: "$174.34M", collateral: "Collateral", ltv: "6.17%" },
      { asset: "ETH-USD (Nautilus 8%)", allocation: "24.38%", value: "$85.36M", collateral: "Collateral", ltv: "6.64%" },
      { asset: "USDC-USDT", allocation: "8.57%", value: "$29.97M", collateral: "Collateral", ltv: "6.0%" },
      { asset: "DAI", allocation: "4.90%", value: "$17.15M", collateral: "-", ltv: "0.00%" },
      { asset: "WBTC-USD", allocation: "3.93%", value: "$13.75M", collateral: "Collateral", ltv: "7.32%" },
      { asset: "ETH-USD (CLMM 10%)", allocation: "3.78%", value: "$13.22M", collateral: "Collateral", ltv: "9.08%" },
      { asset: "ETH-USD (Nautilus 5%)", allocation: "3.44%", value: "$12.04M", collateral: "Collateral", ltv: "5.20%" },
      { asset: "WBTC-USDT", allocation: "0.87%", value: "$3.05M", collateral: "Collateral", ltv: "9.05%" },
      { asset: "USDT-FRXETH", allocation: "0.29%", value: "$1.01M", collateral: "Collateral", ltv: "4.30%" },
      { asset: "USDC", allocation: "0.07%", value: "$0.24M", collateral: "Collateral", ltv: "17.07%" }
    ]
  };
};

const VaultDetail = () => {
  const { vaultId } = useParams<{ vaultId: string }>();
  
  const vaultData = useMemo(() => {
    return getVaultData(vaultId || 'default');
  }, [vaultId]);

  return (
    <div className="min-h-screen flex flex-col bg-cryptic-darker">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <VaultHeader vault={vaultData} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <VaultOverview vault={vaultData} />
          </div>
          <div className="lg:col-span-1">
            <DepositWithdrawForm vaultSymbol={vaultData.symbol} apy={vaultData.apy} />
          </div>
        </div>
        
        <VaultPerformance vault={vaultData} />
        <VaultRisk vault={vaultData} />
        <VaultTransactionHistory vault={vaultData} />
        <VaultDepositors vault={vaultData} />
      </main>
      <Footer />
    </div>
  );
};

export default VaultDetail;
