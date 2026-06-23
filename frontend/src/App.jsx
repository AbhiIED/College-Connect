import React from "react";
import { Analytics } from "@vercel/analytics/next"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Loader from "./pages/Loader";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import ManageAccount from "./pages/ManageAccount";
import Directory from "./pages/Directory";
import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import ConnectionPage from "./pages/ConnectionPage";
import DonationPage from "./pages/DonationPage";
import AlumniProfile from "./components/alumni/AlumniProfile";
import RegisterPage from "./pages/RegisterPage";
import NewsDetails from "./pages/NewsDetails";
import Events from "./pages/Events";
import JobsPage from "./pages/JobsPage";
import Layout from "./components/layout/Layout";
import ForgotPassword from "./pages/Forgot-password";
import OtpVerification from "./pages/OtpVerification";
import DonationDetails from "./pages/DonationDetails";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UsersPage from "./pages/Admin/UsersPage";
import JobPage from "./pages/Admin/JobsPage";
import EventsPage from "./pages/Admin/EventsPage";
import PostsPage from "./pages/Admin/PostsPage";
import ProjectsPage from "./pages/Admin/ProjectsPage";
import NewsPage from "./pages/Admin/NewsPage";
import ConnectionsPage from "./pages/Admin/ConnectionsPage";
import SystemSettingsPage from "./pages/Admin/SystemSettingsPage";
import AnalyticsPage from "./pages/Admin/AnalyticsPage";
import NotificationsPage from "./pages/Admin/NotificationsPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public / User Routes */}
        <Route path="/" element={<Loader />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OtpVerification />} />

        {/* Layout wrapped routes (protected - requires login) */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/manage-account" element={<ManageAccount />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/connections" element={<ConnectionPage />} />
          <Route path="/donations" element={<DonationPage />} />
          <Route path="/donations/:id" element={<DonationDetails />} />
          <Route path="/alumni/:id" element={<AlumniProfile />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/all-news" element={<NewsDetails />} />
          <Route path="/events" element={<Events />} />
          <Route path="/jobs" element={<JobsPage />} />
        </Route>

        {/* ✅ Admin Dashboard with Nested Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole={3}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<UsersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="jobs" element={<JobPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="connections" element={<ConnectionsPage />} />
          <Route path="settings" element={<SystemSettingsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
