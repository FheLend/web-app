
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { VaultTable } from '@/components/VaultTable';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <HeroSection />
        <VaultTable />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
