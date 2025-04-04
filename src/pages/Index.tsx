
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { VaultTable } from '@/components/VaultTable';
import { Features } from '@/components/Features';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <VaultTable />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
