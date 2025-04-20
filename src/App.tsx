
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Lending from "./pages/Lending";
import Borrow from "./pages/Borrow";
import MarketDetail from "./pages/MarketDetail";
import NotFound from "./pages/NotFound";
import VaultDetail from "./pages/VaultDetail";
import Settings from "./pages/Settings";
import UILibrary from "./pages/UILibrary";
import { AppKitProvider } from "./providers/AppKitProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AdminAuthProvider } from "./providers/AdminAuthProvider";
import { Navbar } from "./components/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <AppKitProvider>
      <QueryClientProvider client={queryClient}>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Navbar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/lending" element={<Lending />} />
                <Route path="/borrow" element={<Borrow />} />
                <Route path="/market/:id" element={<MarketDetail />} />
                <Route path="/vault/:id" element={<VaultDetail />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/ui-library" element={<UILibrary />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AdminAuthProvider>
      </QueryClientProvider>
    </AppKitProvider>
  </ThemeProvider>
);

export default App;
