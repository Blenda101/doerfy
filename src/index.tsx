import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tasks } from "./screens/Tasks";
import { Home } from "./screens/Home/Home";
import { Profile } from "./screens/Profile/Profile";
import { Auth } from "./screens/Auth/Auth";
import { Content } from "./screens/Content";
import { Notes } from "./screens/Notes";
import { Help } from "./screens/Help";
import { Settings } from "./screens/Settings";
import { Stories } from "./screens/Stories/Stories";
import { Notifications } from "./screens/Notifications";
import { AuthLayout } from "./components/AuthLayout";
import { Toaster } from "react-hot-toast";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./styles/calendar.css";
import "./styles/editor.css";
import Test from "./screens/Test";

const queryClient = new QueryClient();

try {
  const root = document.getElementById("app");
  if (!root) {
    throw new Error("Root element not found");
  }

  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/test" element={<Test />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <AuthLayout>
                  <Home />
                </AuthLayout>
              }
            />
            <Route
              path="/tasks"
              element={
                <AuthLayout>
                  <Tasks />
                </AuthLayout>
              }
            />
            <Route
              path="/stories"
              element={
                <AuthLayout>
                  <Stories />
                </AuthLayout>
              }
            />
            <Route
              path="/content"
              element={
                <AuthLayout>
                  <Content />
                </AuthLayout>
              }
            />
            <Route
              path="/notes"
              element={
                <AuthLayout>
                  <Notes />
                </AuthLayout>
              }
            />
            <Route
              path="/help"
              element={
                <AuthLayout>
                  <Help />
                </AuthLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthLayout>
                  <Settings />
                </AuthLayout>
              }
            />
            <Route
              path="/notifications"
              element={
                <AuthLayout>
                  <Notifications />
                </AuthLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthLayout>
                  <Profile />
                </AuthLayout>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
} catch (error) {
  console.error("Error rendering application:", error);
  document.body.innerHTML =
    '<div style="padding: 20px;">Error loading application. Please check the console for details.</div>';
}
