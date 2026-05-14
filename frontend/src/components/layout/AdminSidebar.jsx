  import React from "react";
  import { NavLink, useNavigate } from "react-router-dom";
  import { Users, Calendar, Briefcase, MessageSquare, Settings, LogOut, Landmark } from "lucide-react";
import Signup from "@/pages/Signup";
import Loader from "@/pages/Loader";

  export default function AdminSidebar() {
    const navigate = useNavigate();

    const menuItems = [
  { name: "Users", icon: <Users className="h-5 w-5 mr-3" />, path: "/admin-dashboard/users" },
  { name: "Events", icon: <Calendar className="h-5 w-5 mr-3" />, path: "/admin-dashboard/events" },
  { name: "Job Posts", icon: <Briefcase className="h-5 w-5 mr-3" />, path: "/admin-dashboard/jobs" },
  { name: "Posts", icon: <MessageSquare className="h-5 w-5 mr-3" />, path: "/admin-dashboard/posts" },
  { name: "Projects", icon: <Landmark className="h-5 w-5 mr-3" />, path: "/admin-dashboard/projects" },

];
 

    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/signin");
    };

    return (
      <aside className="w-64 bg-white border-r shadow-md flex flex-col justify-between fixed h-screen">
        <div className="p-6">
          <NavLink to="/admin-dashboard" className="flex items-center mb-8">
          <h2 className="text-2xl font-bold text-blue-600 tracking-tight mb-8 text-center">
            CollegeConnect
          </h2>
          </NavLink>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t">
          <NavLink to="/Loader">
          <button
            onClick={handleLogout}
            className="flex items-center w-full justify-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            <LogOut className="h-5 w-5 mr-2" /> Logout
          </button>
          </NavLink>
        </div>
      </aside>
    );
  }
