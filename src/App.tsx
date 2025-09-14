import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Vault from "./pages/Vault";
import Borrow from "./pages/Borrow";
import MarketDetail from "./pages/MarketDetail";
import NotFound from "./pages/NotFound";
import VaultDetail from "./pages/VaultDetail";
import Settings from "./pages/Settings";
import UILibrary from "./pages/UILibrary";
import Transfer from "./pages/Transfer";
import { AppKitProvider } from "./providers/AppKitProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AdminAuthProvider } from "./providers/AdminAuthProvider";
import { Navbar } from "./components/Navbar";
import { useInitialize } from "./hooks/useInitialize";
import { CofhejsPermitModal } from "./components/cofhe/CofhejsPermitModal";

const queryClient = new QueryClient();

const Provider = () => (
  <ThemeProvider>
    <AppKitProvider>
      <QueryClientProvider client={queryClient}>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </TooltipProvider>
        </AdminAuthProvider>
      </QueryClientProvider>
    </AppKitProvider>
  </ThemeProvider>
);

const App = () => {
  useInitialize();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/earn" element={<Vault />} />
        <Route path="/borrow" element={<Borrow />} />
        <Route path="/market/:id" element={<MarketDetail />} />
        <Route path="/vault/:id" element={<VaultDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/ui-library" element={<UILibrary />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CofhejsPermitModal />
    </>
  );
};

export default Provider;
