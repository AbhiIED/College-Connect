import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Users,
  Rss,
  Briefcase,
  HeartHandshake,
  Bell,
  User,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Settings,
  Calendar,
  PenSquare,
  FileText,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import logo from "../../assets/logo.png";

/* ───────────────────────────── helpers ───────────────────────────── */

/** Close any open dropdown when clicking outside */
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

/* ───────────────────────────── component ─────────────────────────── */

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  /* ── state ── */
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  /* ── refs for click-outside ── */
  const feedRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useClickOutside(feedRef, () => setFeedOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));
  useClickOutside(notifRef, () => setNotifOpen(false));

  /* ── scroll listener ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── lock body scroll when mobile menu is open ── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* ── logout ── */
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/signin");
  };

  /* ── active-link helper ── */
  const linkClass = ({ isActive }) =>
    `relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
      ? "text-brand-600 bg-brand-50"
      : "text-gray-600 hover:text-brand-600 hover:bg-brand-50/60"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${isActive
      ? "text-brand-700 bg-brand-50 border-l-4 border-brand-600"
      : "text-gray-700 hover:text-brand-600 hover:bg-brand-50/60"
    }`;

  /* ── sample notifications ── */
  const notifications = [
    { id: 1, text: "New event this weekend!", icon: "🎉", time: "2h ago" },
    { id: 2, text: "John Doe sent you a connection request.", icon: "👤", time: "5h ago" },
    { id: 3, text: "New article posted in your feed.", icon: "📰", time: "1d ago" },
    { id: 4, text: "New job posting available.", icon: "💼", time: "1d ago" },
    { id: 5, text: "Alumni meetup tomorrow!", icon: "📅", time: "2d ago" },
  ];

  /* ── dropdown animation config ── */
  const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: "easeOut" } },
    exit: { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.12 } },
  };

  /* ────────────────────────────── JSX ────────────────────────────── */
  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-indigo-100/30 border-b border-gray-200/60"
          : "bg-white/95 backdrop-blur-md border-b border-gray-100"
          }`}
      >
        <nav
          aria-label="Global"
          className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16"
        >
          {/* ─── LEFT: logo ─── */}
          <Link to="/homepage" className="flex items-center gap-3 group" id="navbar-logo">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
              <img
                src={logo}
                alt="College Connect"
                className="relative h-10 w-auto object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">
                College Connect
              </span>
              <span className="block text-[10px] font-medium text-gray-400 -mt-0.5 tracking-wide">
                MANIT Bhopal
              </span>
            </div>
          </Link>

          {/* ─── CENTER: nav links (desktop) ─── */}
          <div className="hidden lg:flex items-center gap-1" id="navbar-desktop-links">
            <NavLink to="/homepage" className={linkClass} id="nav-home">
              <Home className="h-4 w-4" /> Home
            </NavLink>

            <NavLink to="/directory" className={linkClass} id="nav-directory">
              <BookOpen className="h-4 w-4" /> Directory
            </NavLink>

            <NavLink to="/connections" className={linkClass} id="nav-connections">
              <Users className="h-4 w-4" /> Connections
            </NavLink>

            {/* Feed dropdown */}
            <div className="relative" ref={feedRef}>
              <button
                onClick={() => { setFeedOpen(!feedOpen); setProfileOpen(false); setNotifOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all duration-200"
                id="nav-feed-toggle"
              >
                <Rss className="h-4 w-4" /> Feed
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${feedOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {feedOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute top-full mt-2 left-0 w-52 bg-white rounded-2xl shadow-xl shadow-indigo-100/40 border border-gray-100 overflow-hidden"
                    id="feed-dropdown"
                  >
                    <div className="p-2">
                      <NavLink
                        to="/feed"
                        onClick={() => setFeedOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <FileText className="h-4 w-4" /> View All Feed
                      </NavLink>
                      <NavLink
                        to="/create-post"
                        onClick={() => setFeedOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <PenSquare className="h-4 w-4" /> Create Post
                      </NavLink>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/events" className={linkClass} id="nav-events">
              <Calendar className="h-4 w-4" /> Events
            </NavLink>

            <NavLink to="/jobs" className={linkClass} id="nav-jobs">
              <Briefcase className="h-4 w-4" /> Jobs
            </NavLink>

            <NavLink to="/donations" className={linkClass} id="nav-donate">
              <HeartHandshake className="h-4 w-4" /> Donate
            </NavLink>
          </div>

          {/* ─── RIGHT: actions (desktop) ─── */}
          <div className="hidden lg:flex items-center gap-2" id="navbar-desktop-actions">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); setFeedOpen(false); }}
                className="relative p-2.5 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all duration-200"
                id="nav-notifications-toggle"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white" />
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute top-full mt-2 right-0 w-80 bg-white rounded-2xl shadow-xl shadow-indigo-100/40 border border-gray-100 overflow-hidden"
                    id="notifications-dropdown"
                  >
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {notifications.length} new
                      </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className="flex items-start gap-3 px-5 py-3 hover:bg-indigo-50/40 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
                        >
                          <span className="text-lg mt-0.5">{n.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 leading-snug">{n.text}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-3 border-t border-gray-100">
                      <button className="w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                        View all notifications →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); setFeedOpen(false); }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-indigo-50/60 transition-all duration-200"
                id="nav-profile-toggle"
              >
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-200/50">
                  {user.User_Fname ? user.User_Fname[0].toUpperCase() : <User className="h-4 w-4" />}
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute top-full mt-2 right-0 w-60 bg-white rounded-2xl shadow-xl shadow-indigo-100/40 border border-gray-100 overflow-hidden"
                    id="profile-dropdown"
                  >
                    {/* User info header */}
                    <div className="px-5 py-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                          {user.User_Fname ? user.User_Fname[0].toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {user.User_Fname ? `${user.User_Fname} ${user.User_Lname || ""}` : "User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.User_Email || "user@alumni.com"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      {user.User_Type_ID === 3 && (
                        <NavLink
                          to="/admin-dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                        >
                          <ShieldCheck className="h-4 w-4 text-brand-600" /> Admin Portal
                        </NavLink>
                      )}
                      <NavLink
                        to="/manage-account"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-gray-400" /> Profile Settings
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-gray-400" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ─── MOBILE: hamburger ─── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all"
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </header>

      {/* ─── MOBILE DRAWER ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 lg:hidden shadow-2xl"
              id="mobile-drawer"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-indigo-600" />
                  <span className="text-lg font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">
                    Alumni Connect
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User card */}
              <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-lg">
                    {user.User_Fname ? user.User_Fname[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="font-bold">
                      {user.User_Fname ? `${user.User_Fname} ${user.User_Lname || ""}` : "User"}
                    </p>
                    <p className="text-xs text-indigo-200">{user.User_Email || "user@alumni.com"}</p>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="px-4 mt-6 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                <NavLink to="/homepage" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  <Home className="h-5 w-5" /> Home
                </NavLink>
                <NavLink to="/directory" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  <BookOpen className="h-5 w-5" /> Alumni Directory
                </NavLink>
                <NavLink to="/connections" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  <Users className="h-5 w-5" /> My Connections
                </NavLink>
                <NavLink to="/feed" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  <Rss className="h-5 w-5" /> Feed
                </NavLink>
                <NavLink to="/create-post" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  <PenSquare className="h-5 w-5" /> Create Post
                </NavLink>
                <NavLink to="/events" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  <Calendar className="h-5 w-5" /> Events
                </NavLink>
                <NavLink to="/jobs" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  <Briefcase className="h-5 w-5" /> Jobs
                </NavLink>
                <NavLink to="/donations" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  <HeartHandshake className="h-5 w-5" /> Donate
                </NavLink>

                <div className="my-3 border-t border-gray-100" />

                <NavLink to="/manage-account" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  <Settings className="h-5 w-5" /> Profile Settings
                </NavLink>
              </div>

              {/* Logout button */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
