import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import DashboardOverview from "@/pages/dashboard/overview";
import Projects from "@/pages/dashboard/projects";
import Settings from "@/pages/dashboard/settings";
import NotFound from "@/pages/not-found";
import "./index.css"
import { NotificationProvider } from "./context/useNotification";
import { ThemeProvider } from "./components/theme-provider";
import ComplexityResultPage from "./pages/dashboard/fullComplexityResultPage";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" component={DashboardOverview} />
      <Route path="/dashboard/projects" component={Projects} />
      <Route path="/dashboard/complexity-full-result" component={ComplexityResultPage} />
      {/* Fallback reports route to projects for now to prevent 404 on click */}
      <Route path="/dashboard/reports" component={Projects} />
      <Route path="/dashboard/settings" component={Settings} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
