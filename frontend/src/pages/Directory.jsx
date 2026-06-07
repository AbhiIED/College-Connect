import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Filter, Users, GraduationCap, Building2, MapPin,
  Briefcase, BookOpen, Sparkles, ChevronDown, X, Loader2
} from "lucide-react";
import AlumniCard from "../components/alumni/AlumniCard";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/* ── Filter pill component ── */
function FilterPill({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
        active
          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200/50"
          : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function Directory() {
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/signin"); return; }

    fetch(`${API}/alumni`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) { navigate("/signin"); throw new Error("Unauthorized"); }
        return res.json();
      })
      .then((data) => { setAlumni(data); setLoading(false); })
      .catch((err) => { console.error("Error fetching alumni:", err); setLoading(false); });
  }, [navigate]);

  const handleConnect = async (alumniId, targetUserId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/connections/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: targetUserId })
      });
      if (res.ok) {
        setAlumni((prev) =>
          prev.map((item) =>
            item.Alumni_ID === alumniId
              ? { ...item, connectionStatus: "Pending", connectionSenderID: JSON.parse(localStorage.getItem("user") || "{}").User_ID }
              : item
          )
        );
      } else {
        const err = await res.json();
        console.error(err.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespond = async (alumniId, connectionId, status) => {
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
        setAlumni((prev) =>
          prev.map((item) =>
            item.Alumni_ID === alumniId
              ? { ...item, connectionStatus: status }
              : item
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Derived filter options ── */
  const departments = useMemo(() => {
    const depts = [...new Set(alumni.map((a) => a.Department).filter(Boolean))];
    return depts.sort();
  }, [alumni]);

  const years = useMemo(() => {
    const yrs = [...new Set(alumni.map((a) => a.Graduation_Year).filter(Boolean))];
    return yrs.sort((a, b) => b - a);
  }, [alumni]);

  /* ── Filtered results ── */
  const filtered = useMemo(() => {
    return alumni.filter((item) => {
      const fullName = `${item.User_Fname} ${item.User_Lname}`.toLowerCase();
      const matchesSearch =
        !search.trim() ||
        fullName.includes(search.toLowerCase()) ||
        (item.Department || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.Course || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.Company_Name || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.Job_Title || "").toLowerCase().includes(search.toLowerCase());

      const matchesDept = departmentFilter === "all" || item.Department === departmentFilter;
      const matchesYear = yearFilter === "all" || String(item.Graduation_Year) === String(yearFilter);

      return matchesSearch && matchesDept && matchesYear;
    });
  }, [alumni, search, departmentFilter, yearFilter]);

  const activeFilterCount = [departmentFilter !== "all", yearFilter !== "all"].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setDepartmentFilter("all");
    setYearFilter("all");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 -mt-16">

      {/* ── HERO BANNER ── */}
      <section className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                <Sparkles className="w-3.5 h-3.5" /> Alumni Network
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Alumni <span className="text-indigo-200">Directory</span>
            </h1>

            <p className="mt-4 text-lg text-indigo-100/90 leading-relaxed max-w-2xl">
              Explore and connect with alumni across different years, departments, and industries.
              Build your professional network today.
            </p>
          </div>

          {/* ── Stats bar ── */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{alumni.length}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Alumni</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Departments</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {[...new Set(alumni.map((a) => a.Company_Name).filter(Boolean))].length}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Companies</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {[...new Set(alumni.map((a) => a.currentCity).filter(Boolean))].length}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Cities</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH & FILTERS ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100/30 border border-gray-100 p-5">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, department, company, or job title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50/50 transition-all"
                id="directory-search"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all border ${
                showFilters || activeFilterCount > 0
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
              id="directory-filter-toggle"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Expandable filter panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2">
              {/* Department filters */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Department
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterPill
                    label="All Departments"
                    active={departmentFilter === "all"}
                    onClick={() => setDepartmentFilter("all")}
                  />
                  {departments.map((dept) => (
                    <FilterPill
                      key={dept}
                      label={dept}
                      active={departmentFilter === dept}
                      onClick={() => setDepartmentFilter(dept)}
                      count={alumni.filter((a) => a.Department === dept).length}
                    />
                  ))}
                </div>
              </div>

              {/* Year filters */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Graduation Year
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterPill
                    label="All Years"
                    active={yearFilter === "all"}
                    onClick={() => setYearFilter("all")}
                  />
                  {years.map((yr) => (
                    <FilterPill
                      key={yr}
                      label={String(yr)}
                      active={yearFilter === String(yr)}
                      onClick={() => setYearFilter(String(yr))}
                      count={alumni.filter((a) => String(a.Graduation_Year) === String(yr)).length}
                    />
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── RESULTS ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "alumnus" : "alumni"}
            {(search || departmentFilter !== "all" || yearFilter !== "all") && (
              <span className="text-gray-400"> (filtered)</span>
            )}
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading alumni directory...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No alumni found</h3>
            <p className="text-gray-500 max-w-md mb-6">
              {search || departmentFilter !== "all" || yearFilter !== "all"
                ? "Try adjusting your search or filter criteria to find more results."
                : "No alumni data is available at the moment."}
            </p>
            {(search || departmentFilter !== "all" || yearFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md"
              >
                <X className="w-4 h-4" /> Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Alumni grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <AlumniCard
                key={item.Alumni_ID}
                alumni={item}
                currentUserId={JSON.parse(localStorage.getItem("user") || "{}").User_ID}
                onConnect={(targetUserId) => handleConnect(item.Alumni_ID, targetUserId)}
                onRespond={(connectionId, status) => handleRespond(item.Alumni_ID, connectionId, status)}
                onClick={() => navigate(`/alumni/${item.User_ID}`)}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
