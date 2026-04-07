import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import NewSession from './pages/NewSession';
import LiveSessions from './pages/LiveSessions';
import History from './pages/History';
import Expenses from './pages/Expenses';
import Accounts from './pages/Accounts';
import Revenue from './pages/Revenue';
import Points from './pages/Points';
import Settings from './pages/Settings';
import Owner from './pages/Owner';
import { ProtectedRoute } from './components/PinProtection';
import LoginScreen from './components/LoginScreen';

import { AppProvider, useAppContext } from './context/AppContext';

function AppContent() {
  const { activeProfile } = useAppContext();

  return (
    <BrowserRouter>
      {!activeProfile && <LoginScreen />}
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new-session" element={<NewSession />} />
          <Route path="/live" element={<LiveSessions />} />
          <Route path="/history" element={<History />} />

          <Route path="/expenses" element={<ProtectedRoute area="expenses"><Expenses /></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute area="accounts"><Accounts /></ProtectedRoute>} />
          <Route path="/revenue" element={<ProtectedRoute area="revenue"><Revenue /></ProtectedRoute>} />
          <Route path="/owner" element={<ProtectedRoute area="owner"><Owner /></ProtectedRoute>} />

          <Route path="/points" element={<Points />} />
          <Route path="/settings" element={<ProtectedRoute area="settings"><Settings /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
