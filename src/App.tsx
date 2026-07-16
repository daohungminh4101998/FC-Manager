import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PlayersPage } from "./pages/PlayersPage";
import { MatchesPage } from "./pages/MatchesPage";
import { AttendancePage } from "./pages/AttendancePage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { PerformancePage } from "./pages/PerformancePage";
import { ContributionsPage } from "./pages/ContributionsPage";
import { ContributionDetailPage } from "./pages/ContributionDetailPage";
import { ChatPage } from "./pages/ChatPage";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route
                path="/performance"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <PerformancePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/contributions" element={<ContributionsPage />} />
              <Route path="/contributions/:id" element={<ContributionDetailPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
