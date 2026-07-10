import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { PlayersPage } from "./pages/PlayersPage";
import { MatchesPage } from "./pages/MatchesPage";
import { AttendancePage } from "./pages/AttendancePage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { PerformancePage } from "./pages/PerformancePage";
import { ContributionsPage } from "./pages/ContributionsPage";
import { ContributionDetailPage } from "./pages/ContributionDetailPage";
import { useEffect } from "react";
import { login } from "./services/authService";

// Create a single supabase client for interacting with your database
function App() {
  useEffect(() => {
    login("admin", "123456");
  }, []);

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
            <Route path="/contributions" element={<ContributionsPage />} />
            <Route path="/contributions/:id" element={<ContributionDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;