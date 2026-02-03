import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { SystemUser, defaultPageByRole, PagePermission } from "@/lib/database";
import { ReservationNotifications } from "@/components/ReservationNotifications";
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
import Login from "./pages/Login";
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
import Welcome from "./pages/Welcome";
import About from "./pages/About";

const queryClient = new QueryClient();

// Initialize theme on app load
const initTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
initTheme();

// Route permission mapping
const routePermissions: Record<string, PagePermission> = {
  '/': 'dashboard',
  '/pos': 'pos',
  '/products': 'products',
  '/inventory': 'inventory',
  '/materials': 'materials',
  '/materials-report': 'materials-report',
  '/tables': 'tables',
  '/tables-view': 'tables-view',
  '/reservations': 'reservations',
  '/kitchen': 'kitchen',
  '/kitchen-stats': 'kitchen-stats',
  '/delivery': 'delivery',
  '/customers': 'customers',
  '/loyalty': 'loyalty',
  '/offers': 'offers',
  '/offers-report': 'offers-report',
  '/sales': 'sales',
  '/expenses': 'expenses',
  '/reports': 'reports',
  '/employee-performance': 'employee-performance',
  '/sales-goals': 'sales-goals',
  '/branches': 'branches',
  '/suppliers': 'suppliers',
  '/settings': 'settings',
  '/users': 'users',
  '/activity-log': 'activity-log',
  '/shifts': 'shifts',
  '/about': 'about',
};

// Protected Route Component
function ProtectedRoute({ 
  element, 
  requiredPermission, 
  userPermissions,
  defaultPath 
}: { 
  element: React.ReactElement;
  requiredPermission: PagePermission;
  userPermissions: PagePermission[];
  defaultPath: string;
}) {
  if (userPermissions.includes(requiredPermission)) {
    return element;
  }
  return <Navigate to={defaultPath} replace />;
}

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if first visit
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
    
    // Check if user is already logged in
    const savedUserData = localStorage.getItem('currentUserData');
    if (savedUserData) {
      try {
        const user = JSON.parse(savedUserData) as SystemUser;
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('currentUserData');
      }
    }
    setIsLoading(false);
  }, []);

  const handleWelcomeComplete = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
  };

  const handleLogin = (user: SystemUser) => {
    localStorage.setItem('currentUserData', JSON.stringify(user));
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUserData');
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show welcome page for first-time visitors
  if (showWelcome) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Welcome onComplete={handleWelcomeComplete} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Login onLogin={handleLogin} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Login onLogin={handleLogin} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  const userPermissions = currentUser.permissions || [];
  const defaultPath = defaultPageByRole[currentUser.role] || '/';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Customer Display - Public route without layout */}
            <Route path="/customer-display" element={<CustomerDisplay />} />
            
            {/* Main App Routes with Layout */}
            <Route path="/*" element={
              <MainLayout 
                userName={currentUser.name} 
                userRole={currentUser.role}
                userPermissions={userPermissions}
                onLogout={handleLogout}
              >
                <Routes>
              {/* Default redirect based on role */}
              <Route path="/" element={
                userPermissions.includes('dashboard') 
                  ? <Dashboard /> 
                  : <Navigate to={defaultPath} replace />
              } />
              
              <Route path="/pos" element={
                <ProtectedRoute 
                  element={<POS />} 
                  requiredPermission="pos" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/products" element={
                <ProtectedRoute 
                  element={<Products />} 
                  requiredPermission="products" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/inventory" element={
                <ProtectedRoute 
                  element={<Inventory />} 
                  requiredPermission="inventory" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/materials" element={
                <ProtectedRoute 
                  element={<Materials />} 
                  requiredPermission="materials" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/materials-report" element={
                <ProtectedRoute 
                  element={<MaterialsReport />} 
                  requiredPermission="materials-report" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/tables" element={
                <ProtectedRoute 
                  element={<Tables />} 
                  requiredPermission="tables" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/tables-view" element={
                <ProtectedRoute 
                  element={<TablesView />} 
                  requiredPermission="tables-view" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/sales" element={
                <ProtectedRoute 
                  element={<Sales />} 
                  requiredPermission="sales" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/reports" element={
                <ProtectedRoute 
                  element={<Reports />} 
                  requiredPermission="reports" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute 
                  element={<Settings />} 
                  requiredPermission="settings" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/kitchen" element={
                <ProtectedRoute 
                  element={<Kitchen />} 
                  requiredPermission="kitchen" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/customers" element={
                <ProtectedRoute 
                  element={<Customers />} 
                  requiredPermission="customers" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/delivery" element={
                <ProtectedRoute 
                  element={<Delivery />} 
                  requiredPermission="delivery" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/users" element={
                <ProtectedRoute 
                  element={<Users />} 
                  requiredPermission="users" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/activity-log" element={
                <ProtectedRoute 
                  element={<ActivityLog />} 
                  requiredPermission="activity-log" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/shifts" element={
                <ProtectedRoute 
                  element={<Shifts />} 
                  requiredPermission="shifts" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/loyalty" element={
                <ProtectedRoute 
                  element={<Loyalty />} 
                  requiredPermission="loyalty" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/reservations" element={
                <ProtectedRoute 
                  element={<Reservations />} 
                  requiredPermission="reservations" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/expenses" element={
                <ProtectedRoute 
                  element={<Expenses />} 
                  requiredPermission="expenses" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/offers" element={
                <ProtectedRoute 
                  element={<Offers />} 
                  requiredPermission="offers" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/employee-performance" element={
                <ProtectedRoute 
                  element={<EmployeePerformance />} 
                  requiredPermission="employee-performance" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/offers-report" element={
                <ProtectedRoute 
                  element={<OffersReport />} 
                  requiredPermission="offers-report" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/sales-goals" element={
                <ProtectedRoute 
                  element={<SalesGoals />} 
                  requiredPermission="sales-goals" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/kitchen-stats" element={
                <ProtectedRoute 
                  element={<KitchenStats />} 
                  requiredPermission="kitchen-stats" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/branches" element={
                <ProtectedRoute 
                  element={<Branches />} 
                  requiredPermission="branches" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/suppliers" element={
                <ProtectedRoute 
                  element={<Suppliers />} 
                  requiredPermission="suppliers" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />
              
              <Route path="/about" element={
                <ProtectedRoute 
                  element={<About />} 
                  requiredPermission="about" 
                  userPermissions={userPermissions}
                  defaultPath={defaultPath}
                />
              } />

                  {/* Catch all - redirect to default path */}
                  <Route path="*" element={<Navigate to={defaultPath} replace />} />
                </Routes>
                <ReservationNotifications />
              </MainLayout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
