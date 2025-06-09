
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"; // Added useNavigate
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Input } from "@/components/ui/input"; // For search
import { Button } from "@/components/ui/button"; // For search
import { Search as SearchIcon } from "lucide-react"; // For search
import React, { useState } from "react"; // For search input state
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults"; // Import SearchResults
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

const queryClient = new QueryClient();

import { useTranslation } from 'react-i18next'; // Import useTranslation

// Simple Search Input Component
const SearchInput = () => {
  const { t } = useTranslation(); // For placeholder
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search/${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(''); // Optionally clear search term after submit
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
      <Input
        type="search"
        placeholder={t('searchPlaceholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-8 text-sm w-40 md:w-64" // Adjusted width
      />
      <Button type="submit" variant="ghost" size="icon" className="h-8 w-8">
        <SearchIcon className="h-4 w-4" />
      </Button>
    </form>
  );
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <header className="bg-card border-b border-border p-2 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center"> {/* Changed to justify-between */}
              {/* Placeholder for App Name/Logo - can be added later */}
              <div>
                {/* Example: <h1 className="text-lg font-bold">Mizzima</h1> */}
              </div>
              <div className="flex items-center gap-4"> {/* Group search and lang switcher */}
                <SearchInput />
                <LanguageSwitcher />
              </div>
            </div>
          </header>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/search/:query" element={<SearchResults />} />
            <Route path="/search" element={<SearchResults />} /> {/* Handle empty search path */}
            <Route path="/subscription" element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
