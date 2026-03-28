import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Layouts
import CitizenLayout from '@/components/layout/CitizenLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Citizen Pages
import Home from '@/pages/Home';
import ReportIssue from '@/pages/ReportIssue';
import TrackIssues from '@/pages/TrackIssues';
import Community from '@/pages/Community';
import Events from '@/pages/Events';
import CityMap from '@/pages/CityMap';
import Profile from '@/pages/Profile';
import PortalSelect from '@/pages/PortalSelect';
import { CitizenGuard, AdminGuard } from '@/components/guards/PortalGuard';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import ManageIssues from '@/pages/admin/ManageIssues';
import Analytics from '@/pages/admin/Analytics';
import ManageEvents from '@/pages/admin/ManageEvents';
import ManagePolls from '@/pages/admin/ManagePolls';
import ManageFeedback from '@/pages/admin/ManageFeedback';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Portal Selection */}
      <Route path="/portal" element={<PortalSelect />} />

      {/* Citizen Routes — protected by CitizenGuard */}
      <Route element={<CitizenGuard />}>
        <Route element={<CitizenLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/track" element={<TrackIssues />} />
          <Route path="/map" element={<CityMap />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/community" element={<Community />} />
          <Route path="/events" element={<Events />} />
        </Route>
      </Route>

      {/* Admin Routes — protected by AdminGuard */}
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/issues" element={<ManageIssues />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/events" element={<ManageEvents />} />
          <Route path="/admin/polls" element={<ManagePolls />} />
          <Route path="/admin/feedback" element={<ManageFeedback />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
