import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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

  // Hide the existing Navbar only on the Landing Page
  const showNavbar = location.pathname !== "/";

  return (
    <>

      {showNavbar && (
        <Navbar
          search={search}
          setSearch={setSearch}
        />
      )}

      <Routes>
        {/* Opportunities */}
  <Route path="/opportunity" element={<Opportunities />} />

  {/* Post Opportunity */}
  <Route
    path="/CreatePost"
    element={
      <ProtectedRoute>
        <PostOpportunity />
      </ProtectedRoute>
    }
  />
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Existing Blog Feed */}
        <Route
          path="/home"
          element={<BlogList search={search} />}
        />

        {/* Keep /blog working */}
        <Route
          path="/blog"
          element={<BlogList search={search} />}
        />

        {/* Blog Details */}
        <Route path="/blog/:id" element={<PostView />} />

        {/* Forgot Password */}
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Reset Password */}
        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Bookmarks */}
        <Route
          path="/bookmark"
          element={<Bookmark />}
        />

        {/* Write Post */}
        <Route
          path="/write"
          element={
            <ProtectedRoute>
              <WritePost />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Edit Post */}
        <Route
          path="/posts/:id/edit"
          element={
            <ProtectedRoute>
              <EditPost />
            </ProtectedRoute>
          }
        />

        {/* Post Details */}
        <Route
          path="/posts/:id"
          element={<PostView />}
        />
      </Routes>
    </>
  );
}


function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
