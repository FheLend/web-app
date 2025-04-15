
import { Footer } from "@/components/Footer";
import { BorrowMarketsList } from "@/components/BorrowMarketsList";
import { BorrowHero } from "@/components/BorrowHero";

const Borrow = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <BorrowHero />
        <BorrowMarketsList />
      </main>
      <Footer />
    </div>
  );
};

export default Borrow;
