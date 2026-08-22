import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import WritePost from './pages/WritePost';
import PostView from './pages/PostView';
import BlogList from './pages/BlogList';
import EditPost from './pages/EditPost';
import AdminDashboard from './pages/AdminDashboard';
import Bookmark from "./pages/Bookmark";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from "./pages/LandingPage";

function App() {
  const [search, setSearch] = useState('');

return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>

          <Navbar
            search={search}
            setSearch={setSearch}
          />

          <Routes>
               <Route path="/" element={<LandingPage />} />
            <Route path="/" element={<BlogList search={search} />} />
            <Route path="/blog" element={<BlogList search={search} />} />
            <Route path="/blog/:id" element={<PostView />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/bookmark" element={<Bookmark />} />

            <Route
              path="/write"
              element={
                <ProtectedRoute>
                  <WritePost />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/posts/:id/edit"
              element={
                <ProtectedRoute>
                  <EditPost />
                </ProtectedRoute>
              }
            />

            <Route path="/posts/:id" element={<PostView />} />
          </Routes>

        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
