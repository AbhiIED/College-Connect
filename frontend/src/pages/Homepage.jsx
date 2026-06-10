import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, Briefcase, Calendar, HeartHandshake, ArrowRight,
  TrendingUp, GraduationCap, Globe, Sparkles
} from "lucide-react";
import HeroSection from "../components/alumni/HeroSection";
import HomeNews from "../components/news/HomeNews";
import HomeEvent from "../components/events/HomeEvent";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Quick-action card
function QuickAction({ to, icon: Icon, title, desc, gradient }) {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-2xl p-6 text-white transition-all hover:scale-[1.03] hover:shadow-xl ${gradient}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
      <Icon className="w-8 h-8 mb-3 drop-shadow" />
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-sm opacity-80 leading-relaxed">{desc}</p>
      <div className="mt-4 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Explore <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}

// Stat counter card
function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

export default function Homepage() {
  const [stats, setStats] = useState({ alumni: 0, students: 0, events: 0, jobs: 0 });
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/alumni/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((r) => r.json())
      .then((d) => {
        setStats({
          alumni: d.totalAlumni || 0,
          students: d.totalStudents || 0,
          events: d.totalEvents || 0,
          jobs: d.totalJobs || 0,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30">

      {/* ── HERO BANNER ── */}
      <section className="relative pt-6 pb-2 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-5 lg:py-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/10">
                <Sparkles className="w-3.5 h-3.5" /> Welcome back
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              {user.User_Fname ? (
                <>Hello, <span className="text-indigo-200">{user.User_Fname}</span> 👋</>
              ) : (
                <>Your Alumni <span className="text-indigo-200">Network</span> Awaits</>
              )}
            </h1>

            <p className="mt-3 text-base text-indigo-100/90 leading-relaxed max-w-2xl">
              Connect with batchmates, discover career opportunities, attend events,
              and give back to the community — all in one place.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/directory" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:bg-indigo-50 transition-all">
                <Users className="w-4 h-4" /> Explore Directory
              </Link>
              <Link to="/feed" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-semibold text-sm border border-white/20 hover:bg-white/25 transition-all">
                View Feed <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={GraduationCap} value={stats.alumni || "—"} label="Alumni" color="bg-indigo-500" />
            <StatCard icon={Users} value={stats.students || "—"} label="Students" color="bg-purple-500" />
            <StatCard icon={Calendar} value={stats.events || "—"} label="Events" color="bg-amber-500" />
            <StatCard icon={Briefcase} value={stats.jobs || "—"} label="Job Posts" color="bg-emerald-500" />
          </div>
        </div>
      </section>

      {/* ── QUICK ACTIONS ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            to="/directory"
            icon={Users}
            title="Alumni Directory"
            desc="Search and connect with alumni worldwide"
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
          />
          <QuickAction
            to="/jobs"
            icon={Briefcase}
            title="Job Board"
            desc="Discover career opportunities from alumni"
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          />
          <QuickAction
            to="/events"
            icon={Calendar}
            title="Events"
            desc="Reunions, webinars, and campus happenings"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          />
          <QuickAction
            to="/donations"
            icon={HeartHandshake}
            title="Give Back"
            desc="Support projects and scholarships"
            gradient="bg-gradient-to-br from-pink-500 to-rose-600"
          />
        </div>
      </section>

      {/* ── ALUMNI CAROUSEL ── */}
      <HeroSection />

      {/* ── NEWS SECTION ── */}
      <HomeNews />

      {/* ── EVENTS SECTION ── */}
      <HomeEvent />

      {/* ── CTA BANNER ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 p-10 lg:p-16">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full translate-y-16 -translate-x-16" />
          <div className="relative flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                Stay in the loop with your alma mater
              </h2>
              <p className="mt-3 text-indigo-100/80 text-lg max-w-xl">
                Join the conversation, share your journey, and inspire the next generation of graduates.
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/create-post" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all">
                <TrendingUp className="w-4 h-4" /> Share Your Story
              </Link>
              <Link to="/connections" className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/20 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/25 transition-all">
                <Globe className="w-4 h-4" /> My Network
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
