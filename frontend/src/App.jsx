import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Opportunities from "./pages/opportunity";
import PostOpportunity from "./pages/CreatePost";

import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import BlogList from "./pages/BlogList";
import Dashboard from "./pages/Dashboard";
import WritePost from "./pages/WritePost";
import PostView from "./pages/PostView";
import EditPost from "./pages/EditPost";
import AdminDashboard from "./pages/AdminDashboard";
import Bookmark from "./pages/Bookmark";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


function AppContent() {
  const [search, setSearch] = useState("");
  const location = useLocation();

  // Hide the main Navbar only on the landing page
  const hideNavbar = location.pathname === "/";

  return (
    <>
      {/* Main Navbar - hidden on landing page */}
      {!hideNavbar && (
        <Navbar
          search={search}
          setSearch={setSearch}
        />
      )}

      <Routes>

        {/* =========================
            LANDING PAGE
            No main Navbar
        ========================= */}
        <Route
          path="/"
          element={<LandingPage />}
        />


        {/* =========================
            HOME / BLOG FEED
        ========================= */}
        <Route
          path="/home"
          element={
            <BlogList search={search} />
          }
        />

        {/* Keep /blog working */}
        <Route
          path="/blog"
          element={
            <BlogList search={search} />
          }
        />


        {/* =========================
            BLOG DETAILS
        ========================= */}
        <Route
          path="/blog/:id"
          element={<PostView />}
        />

        <Route
          path="/posts/:id"
          element={<PostView />}
        />


        {/* =========================
            OPPORTUNITIES
        ========================= */}
        <Route
          path="/opportunity"
          element={<Opportunities />}
        />


        {/* =========================
            CREATE OPPORTUNITY
        ========================= */}
        <Route
          path="/CreatePost"
          element={
            <ProtectedRoute>
              <PostOpportunity />
            </ProtectedRoute>
          }
        />


        {/* =========================
            FORGOT PASSWORD
        ========================= */}
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        {/* =========================
            RESET PASSWORD
        ========================= */}
        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />


        {/* =========================
            DASHBOARD
        ========================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================
            BOOKMARK
        ========================= */}
        <Route
          path="/bookmark"
          element={<Bookmark />}
        />


        {/* =========================
            WRITE POST
        ========================= */}
        <Route
          path="/write"
          element={
            <ProtectedRoute>
              <WritePost />
            </ProtectedRoute>
          }
        />


        {/* =========================
            ADMIN DASHBOARD
        ========================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================
            EDIT POST
        ========================= */}
        <Route
          path="/posts/:id/edit"
          element={
            <ProtectedRoute>
              <EditPost />
            </ProtectedRoute>
          }
        />

      </Routes>
    </>
  );
}


function App() {
  return (
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    >
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
