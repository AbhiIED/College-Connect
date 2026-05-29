import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from "recharts";
import {
  TrendingUp,
  Users,
  Calendar,
  Briefcase,
  Heart,
  MessageSquare,
  ThumbsUp,
  Network,
  Award,
  BookOpen,
  ArrowUpRight,
  TrendingDown
} from "lucide-react";

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState("posts");

  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 p-4">
        <header className="flex flex-col gap-1 border-b border-gray-200/60 pb-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-100 rounded animate-pulse mt-2" />
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-white border border-gray-100">
              <CardHeader className="h-20 bg-gray-50/50 border-b border-gray-50"></CardHeader>
              <CardContent className="h-24"></CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-white border border-gray-100 h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 font-display">Failed to load platform analytics</h2>
        <p className="text-sm text-gray-500">Something went wrong while executing metrics queries.</p>
        <Button onClick={fetchAnalytics} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold">
          Retry Sync
        </Button>
      </div>
    );
  }

  // Derived aggregates for KPI headers
  const totalEventRegs = analyticsData.eventRegistrationRates.reduce((acc, curr) => acc + curr.registrationCount, 0);
  
  const acceptedConns = analyticsData.connectionStats.summary.find(s => s.Status === "Accepted")?.count || 0;
  const totalConns = analyticsData.connectionStats.summary.reduce((acc, curr) => acc + curr.count, 0);
  const connAcceptancePercent = totalConns > 0 ? Math.round((acceptedConns / totalConns) * 100) : 0;

  const topActiveCampaign = analyticsData.topCampaigns[0];

  const getLeaderboardData = () => {
    switch (leaderboardTab) {
      case "connections":
        return analyticsData.activeUsers.byConnections;
      case "donations":
        return analyticsData.activeUsers.byDonations;
      case "posts":
      default:
        return analyticsData.activeUsers.byPosts;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900">
            Platform Reports & Insights
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time visual reports tracking event signups, user networking, campaign success, and engagement growth.
          </p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" className="border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-semibold cursor-pointer">
          Refresh Reports
        </Button>
      </header>

      {/* ── KPI Banners ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1: Connection Acceptance Rate */}
        <Card className="bg-white border border-gray-200/80 shadow-3xs">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                  Network Connection Acceptance Rate
                </p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2 font-display">
                  {connAcceptancePercent}%
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600">
                <Network className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-2xs font-medium text-gray-500 mt-4">
              <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
              <span className="text-teal-700 font-semibold">{acceptedConns} accepted</span>
              <span>out of {totalConns} requests</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Total Signups */}
        <Card className="bg-white border border-gray-200/80 shadow-3xs">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                  Platform Event Attendees
                </p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2 font-display">
                  {totalEventRegs.toLocaleString()}
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-2xs font-medium text-gray-500 mt-4">
              <Badge variant="warning" className="px-1.5 py-0.5 text-3xs font-bold uppercase border-none">
                {analyticsData.eventRegistrationRates.length} Events
              </Badge>
              <span className="text-3xs">actively tracked with signups</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Top Fundraising Campaign */}
        <Card className="bg-white border border-gray-200/80 shadow-3xs">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                  Top Performing Campaign
                </p>
                <h3 className="text-base font-bold text-gray-900 mt-2 font-display truncate max-w-[200px]">
                  {topActiveCampaign ? topActiveCampaign.Project_title : "No campaigns active"}
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
                <Heart className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-2xs font-medium text-gray-500 mt-4">
              {topActiveCampaign ? (
                <>
                  <Badge variant="success" className="px-1.5 py-0.5 text-3xs font-bold border-none">
                    {topActiveCampaign.successPercentage}% Met
                  </Badge>
                  <span className="text-3xs font-semibold text-rose-600">
                    ₹{Number(topActiveCampaign.Fund_Raised).toLocaleString()} Raised
                  </span>
                </>
              ) : (
                <span className="text-3xs">Create your first donation campaign</span>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Charts Grid ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Platform Engagement (Posts, Comments, Likes per Month) */}
        <Card className="bg-white border border-gray-200 shadow-2xs">
          <CardHeader className="border-b border-gray-100/50 pb-4">
            <CardTitle className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" /> Platform Engagement Rates
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Monthly activity volume trends for posts, comments, and likes.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.platformEngagement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "#111827", borderRadius: "8px", border: "none", color: "#fff" }}
                    labelStyle={{ fontWeight: "bold", fontSize: "12px", fontFamily: "Outfit" }}
                    itemStyle={{ fontSize: "12px" }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", fontFamily: "Inter" }} />
                  <Line type="monotone" dataKey="posts" name="Posts" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="comments" name="Comments" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="likes" name="Likes" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Connection Acceptance Rate Over Time */}
        <Card className="bg-white border border-gray-200 shadow-2xs">
          <CardHeader className="border-b border-gray-100/50 pb-4">
            <CardTitle className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
              <Network className="h-5 w-5 text-teal-600" /> Connection Acceptance Trends
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">
              The percentage of network requests accepted by month.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.connectionStats.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} formatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ background: "#111827", borderRadius: "8px", border: "none", color: "#fff" }}
                    labelStyle={{ fontWeight: "bold", fontSize: "12px", fontFamily: "Outfit" }}
                    itemStyle={{ color: "#e6fffa", fontSize: "12px" }}
                    formatter={(value) => [`${value}%`, "Acceptance Rate"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#0d9488"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRate)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Event Registration Rates per Event */}
        <Card className="bg-white border border-gray-200 shadow-2xs">
          <CardHeader className="border-b border-gray-100/50 pb-4">
            <CardTitle className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600" /> Event Registration Rates
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Comparing registration attendees count across registered events.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px]">
              {analyticsData.eventRegistrationRates.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.eventRegistrationRates} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="Event_Name" tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: "#111827", borderRadius: "8px", border: "none", color: "#fff" }}
                      labelStyle={{ fontWeight: "bold", fontSize: "12px", fontFamily: "Outfit" }}
                      itemStyle={{ color: "#fffbeb", fontSize: "12px" }}
                      formatter={(value) => [value, "Registrations"]}
                    />
                    <Bar dataKey="registrationCount" name="Registrations" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400 font-medium italic">
                  No event registration metrics recorded yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart 4: Job Listing Click/Apply Trends */}
        <Card className="bg-white border border-gray-200 shadow-2xs">
          <CardHeader className="border-b border-gray-100/50 pb-4">
            <CardTitle className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-emerald-600" /> Job Application Trends
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Clicks versus applications trends driven by real job postings.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.jobListingTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "#111827", borderRadius: "8px", border: "none", color: "#fff" }}
                    labelStyle={{ fontWeight: "bold", fontSize: "12px", fontFamily: "Outfit" }}
                    itemStyle={{ fontSize: "12px" }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", fontFamily: "Inter" }} />
                  <Bar dataKey="clicks" name="Clicks" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="applications" name="Applications" fill="#047857" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Lower Double Widget Grid ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Top Campaigns (Spans 2 columns on lg) */}
        <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-2xs">
          <CardHeader className="border-b border-gray-100/50 pb-4">
            <CardTitle className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-600" /> Top Performing Campaigns Success
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Active campaigns organized by percentage of targets completed.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {analyticsData.topCampaigns.length ? (
              <div className="space-y-5">
                {analyticsData.topCampaigns.map((proj) => (
                  <div key={proj.Project_ID} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-800 font-display">{proj.Project_title}</span>
                      <span className="font-semibold text-gray-500">
                        ₹{Number(proj.Fund_Raised).toLocaleString()} / ₹{Number(proj.Funds_Required).toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200/40">
                      <div
                        style={{ width: `${Math.min(proj.successPercentage, 100)}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          proj.successPercentage >= 100
                            ? "bg-emerald-500"
                            : proj.successPercentage >= 50
                            ? "bg-indigo-500"
                            : "bg-rose-500"
                        }`}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-3xs bg-gray-50 text-gray-600 border-gray-200 font-display font-semibold uppercase">
                        {proj.Category}
                      </Badge>
                      <span className={`text-xs font-bold font-display ${
                        proj.successPercentage >= 100
                          ? "text-emerald-600"
                          : proj.successPercentage >= 50
                          ? "text-indigo-600"
                          : "text-rose-600"
                      }`}>
                        {proj.successPercentage}% target achieved
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-gray-400 font-medium italic">
                No active campaigns created yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Column 2: Leaderboard Lists */}
        <Card className="bg-white border border-gray-200 shadow-2xs flex flex-col">
          <CardHeader className="border-b border-gray-100/50 pb-4">
            <CardTitle className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" /> Platform Leaderboards
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Discover the most active accounts on the network.
            </CardDescription>
          </CardHeader>
          
          {/* Tabs header */}
          <div className="flex bg-gray-100 p-0.5 border-b border-gray-100 text-xs">
            {[
              { id: "posts", label: "Posts" },
              { id: "connections", label: "Connections" },
              { id: "donations", label: "Donations" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLeaderboardTab(tab.id)}
                className={`flex-1 py-2 text-center font-semibold font-display transition-all duration-200 cursor-pointer ${
                  leaderboardTab === tab.id
                    ? "bg-white text-brand-700 shadow-3xs font-bold"
                    : "text-gray-500 hover:text-brand-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <CardContent className="flex-1 p-0 overflow-y-auto max-h-[300px]">
            {getLeaderboardData().length ? (
              <div className="divide-y divide-gray-100">
                {getLeaderboardData().map((u, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold font-display text-xs">
                        #{idx + 1}
                      </div>
                      <span className="font-bold text-gray-800 text-sm font-display truncate max-w-[140px]">{u.name}</span>
                    </div>
                    <Badge className="bg-brand-50 text-brand-700 border-none font-bold font-display">
                      {leaderboardTab === "donations"
                        ? `₹${Number(u.totalDonated).toLocaleString()}`
                        : `${u.count} ${leaderboardTab}`}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 font-medium italic py-12">
                No active records found for this category.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
