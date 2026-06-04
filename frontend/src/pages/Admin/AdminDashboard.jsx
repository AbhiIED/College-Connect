import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import AdminSidebar from "@/components/layout/AdminSidebar";
import NotificationBell from "@/components/admin/NotificationBell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from "recharts";
import {
  Users,
  Calendar,
  Briefcase,
  TrendingUp,
  Plus,
  Clock,
  ArrowRight,
  ShieldCheck,
  Heart,
  Newspaper,
  Network,
  MessageSquare,
  LogOut
} from "lucide-react";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboardHome = location.pathname === "/admin-dashboard";

  const [stats, setStats] = useState({
    totalAlumni: 0,
    activeStudents: 0,
    upcomingEvents: 0,
    jobPostings: 0,
    totalDonationAmount: 0,
    totalDonationCount: 0,
    donationTrend: [],
    userGrowth: [],
    recentActivity: [],
  });

  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/signin");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        navigate("/signin");
        return;
      }

      const data = await res.json();
      setStats({
        totalAlumni: data.totalAlumni || 0,
        activeStudents: data.activeStudents || 0,
        upcomingEvents: data.upcomingEvents || 0,
        jobPostings: data.jobPostings || 0,
        totalDonationAmount: data.totalDonationAmount || 0,
        totalDonationCount: data.totalDonationCount || 0,
        donationTrend: data.donationTrend || [],
        userGrowth: data.userGrowth || [],
        recentActivity: data.recentActivity || [],
      });
    } catch (error) {
      console.error("Error loading dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [location.pathname]);

  const getActivityIcon = (type) => {
    switch (type) {
      case "donation":
        return <Heart className="h-4 w-4 text-rose-500 animate-pulse" />;
      case "post":
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      case "job":
        return <Briefcase className="h-4 w-4 text-emerald-500" />;
      case "event":
        return <Calendar className="h-4 w-4 text-amber-500" />;
      default:
        return <ShieldCheck className="h-4 w-4 text-brand-600" />;
    }
  };

  const getActivityBadge = (type) => {
    switch (type) {
      case "donation":
        return "success";
      case "post":
        return "default";
      case "job":
        return "success";
      case "event":
        return "warning";
      default:
        return "gray";
    }
  };

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="flex bg-gray-50/50 min-h-screen">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8 transition-all duration-300">
        {/* Global Admin Header Top Bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md font-sans">
              Admin Portal
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/signin");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50/30 transition-all duration-200 cursor-pointer shadow-3xs font-sans"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {isDashboardHome ? (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* ── Top Header Section ── */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200/60">
              <div>
                <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900">
                  Dashboard Overview
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage college networking, fundraising metrics, and moderation statistics.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/admin-dashboard/events">
                  <Button className="bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-sm cursor-pointer gap-2">
                    <Plus className="h-4 w-4" /> Add Event
                  </Button>
                </Link>
                <Link to="/admin-dashboard/projects">
                  <Button variant="outline" className="border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-semibold cursor-pointer gap-2">
                    Create Campaign
                  </Button>
                </Link>
              </div>
            </header>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse bg-white border border-gray-100">
                    <CardHeader className="h-20 bg-gray-50/50 border-b border-gray-50"></CardHeader>
                    <CardContent className="h-24"></CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* ── KPI Cards Grid ── */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* KPI 1: Alumni */}
                  <Card className="bg-white border border-gray-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                            Total Alumni
                          </p>
                          <h3 className="text-3xl font-bold text-gray-900 mt-2 font-display">
                            {stats.totalAlumni.toLocaleString()}
                          </h3>
                        </div>
                        <div className="p-2.5 rounded-lg bg-indigo-50 text-brand-600">
                          <Users className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-2xs font-semibold text-emerald-600 mt-4">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Platform mentors verified</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* KPI 2: Students */}
                  <Card className="bg-white border border-gray-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                            Active Students
                          </p>
                          <h3 className="text-3xl font-bold text-gray-900 mt-2 font-display">
                            {stats.activeStudents.toLocaleString()}
                          </h3>
                        </div>
                        <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600">
                          <Users className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-2xs font-semibold text-teal-600 mt-4">
                        <span>Enrolled and searching referrals</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* KPI 3: Fundraising campaigns */}
                  <Card className="bg-white border border-gray-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                            Total Donations
                          </p>
                          <h3 className="text-3xl font-bold text-gray-900 mt-2 font-display">
                            ₹{Number(stats.totalDonationAmount).toLocaleString()}
                          </h3>
                        </div>
                        <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
                          <Heart className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-2xs font-medium text-gray-500 mt-4">
                        <Badge variant="success" className="px-1.5 py-0.5 text-3xs font-bold uppercase tracking-wide">
                          {stats.totalDonationCount} gifts
                        </Badge>
                        <span className="text-3xs">contributed to campaigns</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* KPI 4: Jobs and Events */}
                  <Card className="bg-white border border-gray-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                            Active Events
                          </p>
                          <h3 className="text-3xl font-bold text-gray-900 mt-2 font-display">
                            {stats.upcomingEvents}
                          </h3>
                        </div>
                        <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                          <Calendar className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-2xs font-medium text-gray-500 mt-4">
                        <Badge variant="gray" className="px-1.5 py-0.5 text-3xs font-bold uppercase tracking-wide">
                          {stats.jobPostings} Jobs
                        </Badge>
                        <span className="text-3xs">referrals listed</span>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* ── Charts & Visualizations ── */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Donations Trend Chart (Left side) */}
                  <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-2xs">
                    <CardHeader className="border-b border-gray-100/50 pb-4">
                      <CardTitle className="font-display font-bold text-lg text-gray-900">
                        Monthly Donations Trend
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-400">
                        Visualizing monthly fundraising growth aggregate campaigns.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.donationTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorDonation" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                            <Tooltip
                              contentStyle={{ background: "#111827", borderRadius: "8px", border: "none", color: "#fff" }}
                              labelStyle={{ fontWeight: "bold", fontSize: "12px", fontFamily: "Outfit" }}
                              itemStyle={{ color: "#eef2ff", fontSize: "12px" }}
                              formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Amount"]}
                            />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="#4f46e5"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#colorDonation)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Registered Users breakdown Chart (Right side) */}
                  <Card className="bg-white border border-gray-200 shadow-2xs">
                    <CardHeader className="border-b border-gray-100/50 pb-4">
                      <CardTitle className="font-display font-bold text-lg text-gray-900">
                        Monthly User Registrations
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-400">
                        Active growth rates across both alumni and students.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.userGrowth} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                            <Tooltip
                              contentStyle={{ background: "#111827", borderRadius: "8px", border: "none", color: "#fff" }}
                              labelStyle={{ fontWeight: "bold", fontSize: "12px", fontFamily: "Outfit" }}
                              itemStyle={{ fontSize: "12px" }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", fontFamily: "Inter" }} />
                            <Bar dataKey="alumni" name="Alumni" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="students" name="Students" fill="#0d9488" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* ── Recent Activity & Quick Navigation ── */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Recent Activity Feed (Spans 2 columns) */}
                  <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-2xs">
                    <CardHeader className="border-b border-gray-100/50 pb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="font-display font-bold text-lg text-gray-900">
                            Recent Platform Activities
                          </CardTitle>
                          <CardDescription className="text-xs text-gray-400">
                            Real-time transaction logs and user-generated postings.
                          </CardDescription>
                        </div>
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto scrollbar-thin">
                        {stats.recentActivity.map((activity, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between p-4 hover:bg-gray-50/50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 mt-0.5">
                                {getActivityIcon(activity.type)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800 leading-snug">
                                  {activity.label}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <Badge variant={getActivityBadge(activity.type)} className="text-[10px] px-1 py-0 border-none capitalize font-semibold font-display">
                                    {activity.type}
                                  </Badge>
                                  <span className="text-[11px] text-gray-400">
                                    {formatActivityTime(activity.timestamp)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right Column: Platform Navigation Cards */}
                  <div className="flex flex-col gap-6">
                    <Card className="bg-brand-900 text-white shadow-sm border border-brand-950 overflow-hidden relative group">
                      <div className="absolute top-0 right-0 h-40 w-40 bg-brand-700 rounded-full blur-2xl opacity-30 -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300" />
                      <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full min-h-[175px]">
                        <div>
                          <Badge className="bg-brand-700/80 text-brand-100 border-none font-bold text-3xs tracking-wider uppercase mb-3">
                            Platform Security
                          </Badge>
                          <h4 className="text-xl font-bold font-display leading-tight">
                            User Management
                          </h4>
                          <p className="text-xs text-brand-200/90 mt-1">
                            Review registered user accounts, toggle verified state, or add administrator roles.
                          </p>
                        </div>
                        <Link to="/admin-dashboard/users" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-300 hover:text-white transition-colors">
                          <span>Enter User Directory</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200 shadow-2xs hover:border-brand-300 transition-colors cursor-pointer">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 font-display">
                              Moderation Feed
                            </h4>
                            <p className="text-xs text-gray-500">
                              Review social posts and comments.
                            </p>
                          </div>
                        </div>
                        <Link to="/admin-dashboard/posts">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-brand-600 cursor-pointer">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200 shadow-2xs hover:border-brand-300 transition-colors cursor-pointer">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                            <Network className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 font-display">
                              Connections Log
                            </h4>
                            <p className="text-xs text-gray-500">
                              View alumni and student network status.
                            </p>
                          </div>
                        </div>
                        <Link to="/admin-dashboard/connections">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-brand-600 cursor-pointer">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              </>
            )}
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
