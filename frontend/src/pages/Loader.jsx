import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  LogIn,
  UserPlus,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Users
} from "lucide-react";
import Logo from "../components/common/Logo";

export default function Loader() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100 flex flex-col justify-between text-slate-900 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* ── Subtle Background Accent ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-indigo-200/40 via-purple-100/20 to-transparent blur-3xl rounded-full" />
      </div>

      {/* ── Top Header Bar ── */}
      <header className="w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between z-10">
        <Logo size="md" to="/" subtitle="Alumni & Student Network" />

        <div className="flex items-center gap-3 text-sm">
          <Link
            to="/signin"
            className="font-medium text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3.5 py-1.5 rounded-lg transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* ── Centered Main Card ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/60 p-8 sm:p-10 text-center"
        >
          {/* Centered Logo Badge */}
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100/80 shadow-sm">
              <Logo size="lg" to={null} showText={false} />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Welcome to <span className="text-indigo-600">CollegeConnect</span>
          </h1>

          {/* Clean concise description */}
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto">
            The dedicated platform connecting students, alumni, and administrators for mentorship, career opportunities, and community growth.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/signin"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 text-indigo-200" />
            </Link>

            <Link
              to="/signup"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-700 border border-slate-300 hover:border-indigo-300 font-semibold text-sm transition-all duration-200 active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4 text-slate-500" />
              <span>Create Account</span>
            </Link>
          </div>

          {/* Minimal 3-Pillar Feature Highlights */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">Alumni Network</span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">Global Directory</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">Career Portal</span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">Jobs & Referrals</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">Mentorship</span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">Direct 1-on-1</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── Clean Minimal Footer ── */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 z-10">
        <div>
          <span>CollegeConnect</span>
          <span className="mx-2">•</span>
          <span>Institutional Portal</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secure Institutional Sign-In</span>
        </div>
      </footer>
    </div>
  );
}
