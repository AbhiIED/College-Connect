import React from "react";
import {
  UserPlus, MapPin, Briefcase, Building2, GraduationCap,
  ArrowRight, BookOpen, UserCheck, UserX, Clock
} from "lucide-react";

/**
 * Professional alumni directory card with a modern design.
 * Matches the indigo-based theme of the Homepage.
 */
export default function AlumniCard({ alumni, currentUserId, onConnect, onRespond, onClick }) {
  const fullName = `${alumni.User_Fname || ""} ${alumni.User_Lname || ""}`.trim();
  const initials = `${(alumni.User_Fname || "?")[0]}${(alumni.User_Lname || "?")[0]}`.toUpperCase();

  // Generate a consistent gradient for each alumni based on their ID
  const gradients = [
    "from-indigo-500 to-purple-600",
    "from-purple-500 to-pink-600",
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-indigo-600 to-blue-600",
    "from-fuchsia-500 to-purple-600",
  ];
  const gradient = gradients[(alumni.Alumni_ID || 0) % gradients.length];

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1"
    >
      {/* Card header with gradient */}
      <div className={`relative h-24 bg-gradient-to-br ${gradient}`}>
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")"
        }} />
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />

        {/* View profile hint */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/30">
            View Profile <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Avatar */}
      <div className="relative px-5 -mt-10">
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-200/50 ring-4 ring-white`}>
          {initials}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-3 pb-5">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
          {fullName || "Unknown Alumni"}
        </h3>

        {/* Department & Year tag */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {alumni.Course && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              <BookOpen className="w-3 h-3" />
              {alumni.Course}
            </span>
          )}
          {alumni.Graduation_Year && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              <GraduationCap className="w-3 h-3" />
              {alumni.Graduation_Year}
            </span>
          )}
        </div>

        {/* Department */}
        {alumni.Department && (
          <p className="text-sm text-gray-500 mt-2 truncate">
            {alumni.Department}
          </p>
        )}

        {/* Divider */}
        <div className="my-3 border-t border-gray-100" />

        {/* Details */}
        <div className="space-y-2">
          {alumni.Job_Title && (
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{alumni.Job_Title}</span>
            </div>
          )}
          {alumni.Company_Name && (
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{alumni.Company_Name}</span>
            </div>
          )}
          {alumni.currentCity && (
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{alumni.currentCity}</span>
            </div>
          )}
        </div>

        {/* Connect button states */}
        {alumni.User_ID !== currentUserId && (() => {
          const status = alumni.connectionStatus;
          const isSender = alumni.connectionSenderID === currentUserId;

          if (status === "Accepted") {
            return (
              <button
                disabled
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100"
              >
                <UserCheck className="w-4 h-4" />
                Connected
              </button>
            );
          }

          if (status === "Pending") {
            if (isSender) {
              return (
                <button
                  disabled
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-gray-50 text-gray-500 border border-gray-150 cursor-not-allowed"
                >
                  <Clock className="w-4 h-4 animate-pulse" />
                  Pending Request
                </button>
              );
            } else {
              return (
                <div className="mt-4 flex gap-2 w-full">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRespond(alumni.connectionId, "Accepted");
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                  >
                    <UserCheck className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRespond(alumni.connectionId, "Rejected");
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <UserX className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              );
            }
          }

          // Default "Connect" button
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConnect(alumni.User_ID);
              }}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              Connect
            </button>
          );
        })()}
      </div>
    </div>
  );
}
