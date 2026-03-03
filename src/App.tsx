import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ReservationNotifications } from "@/components/ReservationNotifications";
import { DemoDataNotification } from "@/components/DemoDataNotification";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useFeatureToggles, routeToFeature } from "@/hooks/useFeatureToggles";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import POS from "./pages/POS";
import Tables from "./pages/Tables";
import TablesView from "./pages/TablesView";
import Inventory from "./pages/Inventory";
import Materials from "./pages/Materials";
import MaterialsReport from "./pages/MaterialsReport";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Kitchen from "./pages/Kitchen";
import KitchenStats from "./pages/KitchenStats";
import Customers from "./pages/Customers";
import Delivery from "./pages/Delivery";
import Users from "./pages/Users";
import ActivityLog from "./pages/ActivityLog";
import Shifts from "./pages/Shifts";
import Loyalty from "./pages/Loyalty";
import Reservations from "./pages/Reservations";
import Expenses from "./pages/Expenses";
import Offers from "./pages/Offers";
import OffersReport from "./pages/OffersReport";
import SalesGoals from "./pages/SalesGoals";
import EmployeePerformance from "./pages/EmployeePerformance";
import Branches from "./pages/Branches";
import Suppliers from "./pages/Suppliers";
import CustomerDisplay from "./pages/CustomerDisplay";
import About from "./pages/About";
import PublicMenu from "./pages/PublicMenu";
import MenuCategory from "./pages/MenuCategory";
import ProductDetails from "./pages/ProductDetails";
import FeatureSettings from "./pages/FeatureSettings";
import TaxSettings from "./pages/TaxSettings";
import PublicStore from "./pages/PublicStore";

const queryClient = new QueryClient();

// Initialize theme
const initTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
initTheme();

function FeatureRoute({ featureKey, element }: { featureKey: string; element: React.ReactElement }) {
  // Feature routes are checked in the parent - this is a wrapper for clarity
  return element;
}

function AppContent() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { restaurant, restaurantId, isLoading: restaurantLoading } = useRestaurant();
  const { isFeatureEnabled, isLoading: togglesLoading } = useFeatureToggles(restaurantId);
  const [showDemoNotification, setShowDemoNotification] = useState(false);

  useEffect(() => {
    if (isAuthenticated && restaurantId) {
      const hasSeenDemo = localStorage.getItem('hasSeenDemoNotification');
      if (!hasSeenDemo) {
        setShowDemoNotification(true);
      }
    }
  }, [isAuthenticated, restaurantId]);

  const handleDismissDemo = () => {
    localStorage.setItem('hasSeenDemoNotification', 'true');
    setShowDemoNotification(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/menu" element={<PublicMenu />} />
          <Route path="/menu/:categoryName" element={<MenuCategory />} />
          <Route path="/product/:productId" element={<ProductDetails />} />
          <Route path="/customer-display" element={<CustomerDisplay />} />
          <Route path="/store/:restaurantId" element={<PublicStore />} />
          <Route path="*" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (restaurantLoading || togglesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">جاري تحميل بيانات المطعم...</p>
        </div>
      </div>
    );
  }

  // Helper to check if route is enabled
  const isRouteEnabled = (path: string) => {
    const featureKey = routeToFeature[path];
    if (!featureKey) return true; // Unknown routes are allowed
    return isFeatureEnabled(featureKey);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/menu" element={<PublicMenu />} />
        <Route path="/menu/:categoryName" element={<MenuCategory />} />
        <Route path="/product/:productId" element={<ProductDetails />} />
        <Route path="/customer-display" element={<CustomerDisplay />} />
        <Route path="/store/:restaurantId" element={<PublicStore />} />
        
        {/* Main App */}
        <Route path="/*" element={
          <MainLayout restaurantName={restaurant?.name || 'مطعمي'}>
            {showDemoNotification && <DemoDataNotification onDismiss={handleDismissDemo} />}
            <Routes>
              <Route path="/" element={isRouteEnabled('/') ? <Dashboard /> : <Navigate to="/pos" replace />} />
              {isRouteEnabled('/pos') && <Route path="/pos" element={<POS />} />}
              {isRouteEnabled('/products') && <Route path="/products" element={<Products />} />}
              {isRouteEnabled('/inventory') && <Route path="/inventory" element={<Inventory />} />}
              {isRouteEnabled('/materials') && <Route path="/materials" element={<Materials />} />}
              {isRouteEnabled('/materials-report') && <Route path="/materials-report" element={<MaterialsReport />} />}
              {isRouteEnabled('/tables') && <Route path="/tables" element={<Tables />} />}
              {isRouteEnabled('/tables-view') && <Route path="/tables-view" element={<TablesView />} />}
              {isRouteEnabled('/sales') && <Route path="/sales" element={<Sales />} />}
              {isRouteEnabled('/reports') && <Route path="/reports" element={<Reports />} />}
              {isRouteEnabled('/settings') && <Route path="/settings" element={<Settings />} />}
              {isRouteEnabled('/kitchen') && <Route path="/kitchen" element={<Kitchen />} />}
              {isRouteEnabled('/kitchen-stats') && <Route path="/kitchen-stats" element={<KitchenStats />} />}
              {isRouteEnabled('/customers') && <Route path="/customers" element={<Customers />} />}
              {isRouteEnabled('/delivery') && <Route path="/delivery" element={<Delivery />} />}
              {isRouteEnabled('/users') && <Route path="/users" element={<Users />} />}
              {isRouteEnabled('/activity-log') && <Route path="/activity-log" element={<ActivityLog />} />}
              {isRouteEnabled('/shifts') && <Route path="/shifts" element={<Shifts />} />}
              {isRouteEnabled('/loyalty') && <Route path="/loyalty" element={<Loyalty />} />}
              {isRouteEnabled('/reservations') && <Route path="/reservations" element={<Reservations />} />}
              {isRouteEnabled('/expenses') && <Route path="/expenses" element={<Expenses />} />}
              {isRouteEnabled('/offers') && <Route path="/offers" element={<Offers />} />}
              {isRouteEnabled('/offers-report') && <Route path="/offers-report" element={<OffersReport />} />}
              {isRouteEnabled('/employee-performance') && <Route path="/employee-performance" element={<EmployeePerformance />} />}
              {isRouteEnabled('/sales-goals') && <Route path="/sales-goals" element={<SalesGoals />} />}
              {isRouteEnabled('/branches') && <Route path="/branches" element={<Branches />} />}
              {isRouteEnabled('/suppliers') && <Route path="/suppliers" element={<Suppliers />} />}
              {isRouteEnabled('/about') && <Route path="/about" element={<About />} />}
              
              {/* Always available */}
              <Route path="/feature-settings" element={<FeatureSettings />} />
              <Route path="/taxes" element={<TaxSettings />} />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ReservationNotifications />
          </MainLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
