import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { Toaster } from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './styles/calendar.css';

try {
  const root = document.getElementById("app");
  if (!root) {
    throw new Error("Root element not found");
  }

  createRoot(root).render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<AuthLayout><Home /></AuthLayout>} />
          <Route path="/tasks" element={<AuthLayout><Tasks /></AuthLayout>} />
          <Route path="/stories" element={<AuthLayout><Stories /></AuthLayout>} />
          <Route path="/content" element={<AuthLayout><Content /></AuthLayout>} />
          <Route path="/notes" element={<AuthLayout><Notes /></AuthLayout>} />
          <Route path="/help" element={<AuthLayout><Help /></AuthLayout>} />
          <Route path="/settings" element={<AuthLayout><Settings /></AuthLayout>} />
          <Route path="/notifications" element={<AuthLayout><Notifications /></AuthLayout>} />
          <Route path="/profile" element={<AuthLayout><Profile /></AuthLayout>} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </StrictMode>
  );
} catch (error) {
  console.error('Error rendering application:', error);
  document.body.innerHTML = '<div style="padding: 20px;">Error loading application. Please check the console for details.</div>';
}