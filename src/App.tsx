import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PlayersPage } from './pages/PlayersPage';
import { MatchesPage } from './pages/MatchesPage';
import { AttendancePage } from './pages/AttendancePage';
import { StatisticsPage } from './pages/StatisticsPage';
import { PerformancePage } from './pages/PerformancePage';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/performance" element={<PerformancePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
