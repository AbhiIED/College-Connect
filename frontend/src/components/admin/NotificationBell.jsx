import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, X, CheckCheck, AlertTriangle, Heart, Flag, Calendar, ShieldCheck, ArrowRight } from "lucide-react";

const POLL_INTERVAL_MS = 30_000; // 30 seconds
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
        icon: <Flag className="h-4 w-4" />,
        dotColor: "bg-red-500",
        iconBg: "bg-red-50",
        iconColor: "text-red-600",
        border: "border-red-100",
        label: "Flagged",
        labelColor: "text-red-600 bg-red-50",
      };
    case "warning":
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        dotColor: "bg-amber-500",
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        border: "border-amber-100",
        label: "Pending",
        labelColor: "text-amber-600 bg-amber-50",
      };
    case "success":
      return {
        icon: <Heart className="h-4 w-4" />,
        dotColor: "bg-emerald-500",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        border: "border-emerald-100",
        label: "Donation",
        labelColor: "text-emerald-600 bg-emerald-50",
      };
    case "info":
    default:
      return {
        icon: <Calendar className="h-4 w-4" />,
        dotColor: "bg-blue-500",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        border: "border-blue-100",
        label: "Event",
        labelColor: "text-blue-600 bg-blue-50",
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

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(getReadIds);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
    }
  }, [API_BASE_URL, token]);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markAllRead = () => {
    const newIds = new Set([...readIds, ...notifications.map((n) => n.id)]);
    setReadIds(newIds);
    saveReadIds(newIds);
  };

  const markRead = (id) => {
    const newIds = new Set([...readIds, id]);
    setReadIds(newIds);
    saveReadIds(newIds);
  };

  const handleNotificationClick = (notification) => {
    markRead(notification.id);
    setOpen(false);
    navigate(notification.link);
  };

  // Show only latest 8 in dropdown
  const previewList = notifications.slice(0, 8);

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Bell Button ── */}
      <button
        onClick={() => { setOpen((p) => !p); fetchNotifications(); }}
        className="relative flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 transition-all duration-200 cursor-pointer shadow-3xs"
        aria-label="Notifications"
        id="admin-notification-bell"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-4.5 min-w-[1.125rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      {open && (
        <div className="absolute right-0 top-11 w-[380px] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-brand-600" />
              <h3 className="text-sm font-bold text-gray-900 font-display">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
            {previewList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <div className="p-3 rounded-full bg-gray-100">
                  <ShieldCheck className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500 font-display">
                  All clear! No alerts right now.
                </p>
                <p className="text-xs text-gray-400">
                  The platform is running smoothly.
                </p>
              </div>
            ) : (
              previewList.map((notif) => {
                const cfg = severityConfig(notif.severity);
                const isRead = readIds.has(notif.id);
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-all duration-150 cursor-pointer group ${
                      isRead
                        ? "hover:bg-gray-50/70"
                        : "bg-blue-50/30 hover:bg-blue-50/60"
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`p-2 rounded-lg ${cfg.iconBg} ${cfg.iconColor} relative`}>
                        {cfg.icon}
                        {!isRead && (
                          <span className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ${cfg.dotColor} border border-white`} />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-bold leading-snug ${isRead ? "text-gray-600" : "text-gray-900"}`}>
                          {notif.title}
                        </p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${cfg.labelColor}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">
                        {timeAgo(notif.timestamp)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => { setOpen(false); navigate("/admin-dashboard/notifications"); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer py-1"
              >
                View all {notifications.length} notifications
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
