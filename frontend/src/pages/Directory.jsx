import { useState } from "react";
import AlumniList from "../components/alumni/AlumniList";
import { Search, GraduationCap, Users, Sparkles } from "lucide-react";

const DEPARTMENTS = ["All", "CSE", "ECE", "ME", "CE", "EE", "IT", "Architecture"];
const YEARS = ["All", "2024", "2023", "2022", "2021", "2020", "2019"];

const Directory = () => {
  const [activeDept, setActiveDept] = useState("All");
  const [activeYear, setActiveYear] = useState("All");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30">

      {/* Hero Header */}
      <section className="relative pt-8 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
              <Sparkles className="w-3.5 h-3.5" /> Alumni Network
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Alumni <span className="text-indigo-200">Directory</span>
          </h1>
          <p className="mt-3 text-base text-indigo-100/80 max-w-2xl">
            Explore and connect with alumni across different years, departments, and career paths.
          </p>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
            <input
              type="text"
              placeholder="Search by name, company, or department..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 
                text-white placeholder-indigo-200/60 text-sm font-medium
                focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Filter Chips */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 -mt-5 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100/30 border border-gray-100 p-4 sm:p-5">
          {/* Department Filters */}
          <div className="flex items-center gap-3 mb-3">
            <GraduationCap className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    activeDept === dept
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200/50"
                      : "bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-100"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Year Filters */}
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              {YEARS.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setActiveYear(yr)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    activeYear === yr
                      ? "bg-purple-600 text-white shadow-md shadow-purple-200/50"
                      : "bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-600 border border-gray-100"
                  }`}
                >
                  {yr === "All" ? "All Years" : `Batch ${yr}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Alumni List */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <AlumniList data-scroll data-scroll-speed="1.5" />
      </section>
    </div>
  );
};

export default Directory;
