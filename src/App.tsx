import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import ShapeForge from './pages/ShapeForge';
import CanvasStudio from './pages/CanvasStudio';
import Login from './pages/Login';
import Lobby from './pages/Lobby';
import { useAppStore } from './store/useAppStore';
import { useSyncFirebase } from './hooks/useSyncFirebase';

const MainApp = () => {
  const roomId = useAppStore(state => state.roomId);
  useSyncFirebase(roomId);

  if (!roomId) {
    return <Lobby />;
  }

  return (
    <Router>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-900">
        <Navigation />
        <main className="flex-1 relative overflow-hidden">
          <Routes>
            <Route path="/forge" element={<ShapeForge />} />
            <Route path="/studio" element={<CanvasStudio />} />
            <Route path="*" element={<Navigate to="/forge" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('abstracta_auth') === 'true'
  );

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return <MainApp />;
}

export default App;
