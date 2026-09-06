import React, { useState, useEffect } from "react";
import { Search, UserPlus, Check, ChevronLeft, ChevronRight, Users, UserCheck, UserX, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function HeroSection() {
  const [alumni, setAlumni] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [scrollEl, setScrollEl] = useState(null);

  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").User_ID;

  useEffect(() => {
    fetch(`${API}/alumni/hero`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAlumni(data);
          setFiltered(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!search.trim()) setFiltered(alumni);
    else
      setFiltered(
        alumni.filter(
          (m) =>
            m.name?.toLowerCase().includes(search.toLowerCase()) ||
            m.course?.toLowerCase().includes(search.toLowerCase())
        )
      );
  }, [search, alumni]);

  const handleConnect = async (memberId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/connections/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: memberId })
      });
      if (res.ok) {
        const updateList = (prev) =>
          prev.map((item) =>
            item.id === memberId
              ? { ...item, connectionStatus: "Pending", connectionSenderID: currentUserId }
              : item
          );
        setAlumni(updateList);
        setFiltered(updateList);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespond = async (memberId, connectionId, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/connections/${connectionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updateList = (prev) =>
          prev.map((item) =>
            item.id === memberId ? { ...item, connectionStatus: status } : item
          );
        setAlumni(updateList);
        setFiltered(updateList);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const scroll = (dir) => {
    if (!scrollEl) return;
    const amount = 320;
    scrollEl.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (alumni.length === 0) return null;

  return (
    <section className="py-16 px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Your Network</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Connect with Batchmates
          </h2>
          <p className="mt-1 text-gray-500 text-sm max-w-md">
            Discover alumni from your department and build professional connections
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm transition"
          />
        </div>
      </div>

      {/* Carousel */}
      <div className="relative group">
        {/* Nav arrows */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>

        <div
          ref={setScrollEl}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-4 scrollbar-none snap-x snap-mandatory"
        >
          {filtered.map((member) => {
            const status = member.connectionStatus;
            const isSender = member.connectionSenderID === currentUserId;
            return (
              <div
                key={member.id}
                className="flex-none w-48 snap-start bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col items-center text-center group/card"
              >
                {/* Avatar */}
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-indigo-50 shadow-sm">
                    <img
                      src={member.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6366f1&color=fff&size=80`}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6366f1&color=fff&size=80`;
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>

                <h3 className="text-sm font-semibold text-gray-900 truncate w-full">
                  {member.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate w-full">
                  {member.course}
                </p>

                {(() => {
                  if (status === "Accepted") {
                    return (
                      <button
                        disabled
                        className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 cursor-not-allowed"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Connected
                      </button>
                    );
                  }

                  if (status === "Pending") {
                    if (isSender) {
                      return (
                        <button
                          disabled
                          className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-150 cursor-not-allowed"
                        >
                          <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending
                        </button>
                      );
                    } else {
                      return (
                        <div className="mt-3 flex gap-1.5 w-full">
                          <button
                            onClick={() => handleRespond(member.id, member.connectionId, "Accepted")}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                            title="Accept"
                          >
                            <UserCheck className="w-3 h-3" /> Accept
                          </button>
                          <button
                            onClick={() => handleRespond(member.id, member.connectionId, "Rejected")}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Decline"
                          >
                            <UserX className="w-3 h-3" /> Decline
                          </button>
                        </div>
                      );
                    }
                  }

                  return (
                    <button
                      onClick={() => handleConnect(member.id)}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-[0.98]"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Connect
                    </button>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>

      {/* View all link */}
      <div className="mt-6 text-center">
        <Link
          to="/directory"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
        >
          View full alumni directory <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
