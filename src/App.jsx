import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import RebirthBoss from './pages/RebirthBoss';
import CastleBoss from './pages/CastleBoss';
import GuildWar from './pages/GuildWar';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MemberProvider } from './context/MemberContext';
import { ActivityProvider } from './context/ActivityContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      {user && <Sidebar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />
        <Route path="/rebirth-boss" element={<ProtectedRoute><RebirthBoss /></ProtectedRoute>} />
        <Route path="/castle-boss" element={<ProtectedRoute><CastleBoss /></ProtectedRoute>} />
        <Route path="/war-plans" element={<ProtectedRoute><GuildWar /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <MemberProvider>
        <ActivityProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ActivityProvider>
      </MemberProvider>
    </AuthProvider>
  );
}

export default App;
