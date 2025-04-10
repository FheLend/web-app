import { useParams } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { MarketDetailView } from "@/components/MarketDetailView";

const MarketDetail = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <MarketDetailView marketId={id || ""} />
      </main>
      <Footer />
    </div>
  );
};

export default MarketDetail;
