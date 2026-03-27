import { Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import MonitorPage from './pages/MonitorPage';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<DashboardPage />} />
      <Route path="/monitor" element={<MonitorPage />} />
    </Routes>
  );
}

export default App;
