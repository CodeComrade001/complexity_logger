import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/not-found";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { NotificationProvider } from "./context/notificationContext";
import ComplexityResultPage from "./pages/ComplexityResultPage";

function Router() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard/analysis/full-report" element={<ComplexityResultPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/:subpath" element={<DashboardPage />} />
        <Route element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <NotificationProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </NotificationProvider>
  );
}

export default App;