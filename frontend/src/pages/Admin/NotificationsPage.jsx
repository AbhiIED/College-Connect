import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  Heart, 
  Flag, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  Eye,
  RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const POLL_INTERVAL_MS = 30_000;
const READ_KEY = "admin_read_notifications";

function getReadIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveReadIds(ids) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

function severityConfig(severity) {
  switch (severity) {
    case "danger":
      return {
        icon: <Flag className="h-5 w-5" />,
        dotColor: "bg-red-500",
        iconBg: "bg-red-50",
        iconColor: "text-red-600",
        borderClass: "border-l-4 border-l-red-500",
        badgeColor: "bg-red-50 text-red-700 border-red-100",
        label: "Flagged Post",
      };
    case "warning":
      return {
        icon: <AlertTriangle className="h-5 w-5" />,
        dotColor: "bg-amber-500",
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        borderClass: "border-l-4 border-l-amber-500",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
        label: "Pending Verification",
      };
    case "success":
      return {
        icon: <Heart className="h-5 w-5" />,
        dotColor: "bg-emerald-500",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        borderClass: "border-l-4 border-l-emerald-500",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
        label: "Donation Received",
      };
    case "info":
    default:
      return {
        icon: <Calendar className="h-5 w-5" />,
        dotColor: "bg-blue-500",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        borderClass: "border-l-4 border-l-blue-500",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-100",
        label: "Event Threshold",
      };
  }
}

function timeAgo(ts) {
  if (!ts) return "";
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(getReadIds);
  const [activeTab, setActiveTab] = useState("all"); // all | unread | verification | donation | report | event
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const fetchNotifications = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      if (notifications.length === 0) setLoading(true);
      else setRefreshing(true);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_BASE_URL, token, notifications.length]);

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadNotifications = notifications.filter((n) => !readIds.has(n.id));
  const unreadCount = unreadNotifications.length;

  const markAllRead = () => {
    const newIds = new Set([...readIds, ...notifications.map((n) => n.id)]);
    setReadIds(newIds);
    saveReadIds(newIds);
  };

  const clearAllNotifications = () => {
    // Clear by marking all as read and resetting storage
    const newIds = new Set([...readIds, ...notifications.map((n) => n.id)]);
    setReadIds(newIds);
    saveReadIds(newIds);
  };

  const markRead = (id) => {
    const newIds = new Set([...readIds, id]);
    setReadIds(newIds);
    saveReadIds(newIds);
  };

  const handleNotificationClick = (notif) => {
    markRead(notif.id);
    navigate(notif.link);
  };

  // Filter list based on active tab
  const filteredNotifications = notifications.filter((notif) => {
    const isUnread = !readIds.has(notif.id);
    if (activeTab === "unread") return isUnread;
    if (activeTab === "all") return true;
    return notif.type === activeTab;
  });

  // Category counts for badges
  const getTabCount = (tab) => {
    if (tab === "all") return notifications.length;
    if (tab === "unread") return unreadCount;
    return notifications.filter((n) => n.type === tab).length;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Bell className="h-7 w-7" />
            </div>
            Admin Alert Center
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 ml-0.5">
            Monitor real-time security alerts, registration spikes, donation campaigns, and pending verifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fetchNotifications(false)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 cursor-pointer shadow-3xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 transition-all duration-200 cursor-pointer border border-brand-100 shadow-3xs"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>
      </header>

      {/* ── Filters & Tabs ── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200/60 w-fit">
          {[
            { id: "all", label: "All Alerts" },
            { id: "unread", label: "Unread" },
            { id: "verification", label: "Verifications" },
            { id: "donation", label: "Donations" },
            { id: "report", label: "Flagged Posts" },
            { id: "event", label: "Events" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const count = getTabCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-white text-brand-600 shadow-sm border border-gray-200/40"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive 
                      ? (tab.id === "unread" ? "bg-red-500 text-white" : "bg-brand-100 text-brand-700") 
                      : (tab.id === "unread" ? "bg-red-500/10 text-red-600" : "bg-gray-200 text-gray-700")
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Alerts Main Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="h-8 w-8 rounded-full border-3 border-brand-500 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading system alerts...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="border border-dashed border-gray-300/80 bg-white/50 rounded-2xl shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <ShieldCheck className="h-10 w-10 text-gray-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 font-display">
                No alerts found
              </h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                {activeTab === "all"
                  ? "All system components are healthy. No notifications computed."
                  : activeTab === "unread"
                  ? "You have no unread notifications. Awesome job!"
                  : `No alerts under the "${activeTab}" category.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredNotifications.map((notif) => {
            const cfg = severityConfig(notif.severity);
            const isRead = readIds.has(notif.id);
            return (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl border border-gray-100 shadow-3xs overflow-hidden transition-all duration-300 group hover:shadow-2xs ${
                  cfg.borderClass
                } ${!isRead ? "bg-brand-50/10" : ""}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
                  {/* Left Column: Icon + Text */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`p-2.5 rounded-xl ${cfg.iconBg} ${cfg.iconColor} relative`}>
                        {cfg.icon}
                        {!isRead && (
                          <span className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ${cfg.dotColor} border-2 border-white`} />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`text-sm font-bold leading-snug ${isRead ? "text-gray-700" : "text-gray-900"}`}>
                          {notif.title}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${cfg.badgeColor}`}>
                          {cfg.label}
                        </span>
                        {!isRead && (
                          <Badge variant="secondary" className="bg-red-500/10 text-red-700 text-[9px] hover:bg-red-500/10 font-bold border-none uppercase px-1.5">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {new Date(notif.timestamp).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })} ({timeAgo(notif.timestamp)})
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    {!isRead && (
                      <button
                        onClick={() => markRead(notif.id)}
                        title="Mark as read"
                        className="p-2 rounded-xl text-gray-400 hover:text-brand-600 hover:bg-brand-50 border border-transparent hover:border-brand-100 transition-all duration-200 cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleNotificationClick(notif)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-brand-600 hover:text-white bg-brand-50 hover:bg-brand-600 border border-brand-100/60 hover:border-brand-600 transition-all duration-300 cursor-pointer shadow-3xs"
                    >
                      Take Action
                      <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
