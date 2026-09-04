import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  MessageSquare,
  Newspaper,
  Network,
  Landmark,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout as doLogout, authFetch } from "../../utils/api";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("admin_sidebar_collapsed");
    return saved === "true";
  });

  const [adminUser, setAdminUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setAdminUser(JSON.parse(userStr));
      }
    } catch (e) {
      console.error("Failed to parse admin user from localStorage", e);
    }
  }, []);

  useEffect(() => {
    const READ_KEY = "admin_read_notifications";

    const fetchCount = async () => {
      try {
        const res = await authFetch("/admin/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          let readIds = new Set();
          try {
            readIds = new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]"));
          } catch {}
          const unread = data.filter((n) => !readIds.has(n.id)).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Sidebar notification count fetch error:", err);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleLogout = () => {
    doLogout(); // clears cookie + localStorage and redirects to /signin
  };

  const navGroups = [
    {
      title: "Analytics",
      items: [
        {
          name: "Overview",
          icon: <LayoutDashboard className="h-5 w-5" />,
          path: "/admin-dashboard",
          end: true,
        },
        {
          name: "Notifications",
          icon: <Bell className="h-5 w-5" />,
          path: "/admin-dashboard/notifications",
          badge: unreadCount,
        },
        {
          name: "Reports & Insights",
          icon: <TrendingUp className="h-5 w-5" />,
          path: "/admin-dashboard/analytics",
        },
      ],
    },
    {
      title: "User Directory",
      items: [
        {
          name: "Users",
          icon: <Users className="h-5 w-5" />,
          path: "/admin-dashboard/users",
        },
        {
          name: "Connections",
          icon: <Network className="h-5 w-5" />,
          path: "/admin-dashboard/connections",
        },
      ],
    },
    {
      title: "Platform Content",
      items: [
        {
          name: "Posts",
          icon: <MessageSquare className="h-5 w-5" />,
          path: "/admin-dashboard/posts",
        },
        {
          name: "Events",
          icon: <Calendar className="h-5 w-5" />,
          path: "/admin-dashboard/events",
        },
        {
          name: "Job Posts",
          icon: <Briefcase className="h-5 w-5" />,
          path: "/admin-dashboard/jobs",
        },
        {
          name: "News Hub",
          icon: <Newspaper className="h-5 w-5" />,
          path: "/admin-dashboard/news",
        },
      ],
    },
    {
      title: "Fundraising",
      items: [
        {
          name: "Projects",
          icon: <Landmark className="h-5 w-5" />,
          path: "/admin-dashboard/projects",
        },
      ],
    },
    {
      title: "System Config",
      items: [
        {
          name: "Settings",
          icon: <Settings className="h-5 w-5" />,
          path: "/admin-dashboard/settings",
        },
      ],
    },
  ];

  // Helper to check if child route is active
  const isLinkActive = (path, end) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Admin initials for avatar fallback
  const getInitials = () => {
    if (!adminUser) return "AD";
    const first = adminUser.User_Fname?.[0] || "";
    const last = adminUser.User_Lname?.[0] || "";
    return (first + last).toUpperCase() || "AD";
  };

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 shadow-sm flex flex-col justify-between fixed h-screen top-0 left-0 transition-all duration-300 ease-in-out z-40 select-none",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* ── Top Header Section ── */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {!isCollapsed && (
            <NavLink to="/admin-dashboard" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-extrabold shadow-sm shadow-brand-500/30">
                CC
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-brand-900">
                College<span className="text-brand-600">Connect</span>
              </span>
            </NavLink>
          )}

          {isCollapsed && (
            <NavLink to="/admin-dashboard" className="mx-auto">
              <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-extrabold shadow-sm shadow-brand-500/30">
                CC
              </div>
            </NavLink>
          )}

          <button
            onClick={toggleSidebar}
            className="hidden lg:flex h-6 w-6 rounded-full border border-gray-200 bg-white items-center justify-center text-gray-500 hover:text-brand-600 hover:border-brand-300 absolute -right-3 top-5 shadow-xs transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* ── Grouped Navigation Items ── */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-3 text-2xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5 font-display">
                  {group.title}
                </h3>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isLinkActive(item.path, item.end);
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group relative",
                        active
                          ? "bg-brand-50 text-brand-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-brand-600"
                      )}
                    >
                      <div className={cn("transition-colors relative", active ? "text-brand-600" : "text-gray-400 group-hover:text-brand-500")}>
                        {item.icon}
                        {isCollapsed && item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-white" />
                        )}
                      </div>
                      {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
                      {!isCollapsed && item.badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] flex items-center justify-center shadow-sm">
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-16 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md z-50 whitespace-nowrap">
                          {item.name}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* ── Admin User Badge Profile Section ── */}
      <div className="border-t border-gray-100 p-3 bg-gray-50/50">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-1">
              {adminUser?.Profile_Pic ? (
                <img
                  src={adminUser.Profile_Pic}
                  alt="Admin"
                  className="h-10 w-10 rounded-lg object-cover ring-2 ring-brand-100"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold font-display text-sm tracking-wide">
                  {getInitials()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate font-display">
                  {adminUser ? `${adminUser.User_Fname} ${adminUser.User_Lname}` : "Administrator"}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                  <span className="text-3xs font-semibold uppercase text-brand-700 tracking-wider">
                    System Admin
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50/30 transition-all duration-200 cursor-pointer shadow-2xs"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {adminUser?.Profile_Pic ? (
              <img
                src={adminUser.Profile_Pic}
                alt="Admin"
                className="h-9 w-9 rounded-lg object-cover ring-2 ring-brand-100"
              />
            ) : (
              <div className="h-9 w-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold font-display text-xs">
                {getInitials()}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors shadow-2xs cursor-pointer group relative"
            >
              <LogOut className="h-4 w-4" />
              {/* Logout Tooltip */}
              <div className="absolute left-16 bg-red-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md z-50 whitespace-nowrap">
                Sign Out
              </div>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
