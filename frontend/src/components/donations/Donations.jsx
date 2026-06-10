import { useState, useEffect } from "react";
import { Heart, Search, Sparkles, BookOpen, Building2, Leaf, Dumbbell, Activity, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { label: "All", value: "all", icon: LayoutGrid },
  { label: "Education", value: "Education", icon: BookOpen },
  { label: "Infrastructure", value: "Infrastructure", icon: Building2 },
  { label: "Environment", value: "Environment", icon: Leaf },
  { label: "Sports", value: "Sports", icon: Dumbbell },
  { label: "Health", value: "Health", icon: Activity },
];

const categoryGradients = {
  Education: "from-blue-500 to-indigo-600",
  Infrastructure: "from-violet-500 to-purple-600",
  Environment: "from-emerald-500 to-teal-600",
  Sports: "from-orange-500 to-red-500",
  Health: "from-pink-500 to-rose-500",
};

const categoryBarColors = {
  Education: "from-blue-400 to-indigo-500",
  Infrastructure: "from-violet-400 to-purple-500",
  Environment: "from-emerald-400 to-teal-500",
  Sports: "from-orange-400 to-red-500",
  Health: "from-pink-400 to-rose-500",
};

const categoryBadgeColors = {
  Education: "bg-blue-100 text-blue-700",
  Infrastructure: "bg-violet-100 text-violet-700",
  Environment: "bg-emerald-100 text-emerald-700",
  Sports: "bg-orange-100 text-orange-700",
  Health: "bg-pink-100 text-pink-700",
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100 animate-pulse">
      <div className="h-48 skeleton-shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-4 skeleton-shimmer rounded-full w-3/4" />
        <div className="h-3 skeleton-shimmer rounded-full w-full" />
        <div className="h-3 skeleton-shimmer rounded-full w-5/6" />
        <div className="h-2 skeleton-shimmer rounded-full w-1/2 mt-4" />
        <div className="h-10 skeleton-shimmer rounded-full mt-2" />
      </div>
    </div>
  );
}

export default function Donations() {
  const navigate = useNavigate();
  const [donationCauses, setDonationCauses] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE_URL}/donations`);
        if (!res.ok) throw new Error("Failed to fetch donation causes");
        const data = await res.json();
        setDonationCauses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCauses();
  }, []);

  const handleDonate = (id) => navigate(`/donations/${id}`);

  const filteredCauses = donationCauses.filter((cause) => {
    const matchesSearch =
      cause.title.toLowerCase().includes(search.toLowerCase()) ||
      cause.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || cause.category?.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const totalRaised = donationCauses.reduce((sum, c) => sum + (c.raised || 0), 0);
  const totalTarget = donationCauses.reduce((sum, c) => sum + (c.target || 0), 0);
  const totalSupporters = donationCauses.reduce((sum, c) => sum + (c.supporters || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-rose-50/30">

      {/* ── HERO BANNER ── */}
      <section className="relative pt-8 pb-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-rose-700 to-amber-600" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 py-8 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Make a Difference
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Give Back to Your{" "}
            <span className="text-amber-200">Alma Mater</span>
          </h1>
          <p className="mt-3 text-rose-100/80 text-lg max-w-xl mx-auto leading-relaxed">
            Contribute towards meaningful causes that support our college and students.
          </p>

          {/* Stats row */}
          {!loading && (
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { label: "Total Raised", value: `₹${(totalRaised / 100000).toFixed(1)}L` },
                { label: "Alumni Supporters", value: totalSupporters.toLocaleString() },
                { label: "Active Causes", value: donationCauses.length },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-4 text-center">
                  <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-xs text-rose-100/70 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SEARCH & FILTER ── */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        {/* Search bar */}
        <div className="relative max-w-lg mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search donation causes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-300 focus:border-rose-300 focus:outline-none transition-all"
          />
        </div>

        {/* Category pill tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 justify-center flex-wrap">
          {CATEGORIES.map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all
                ${filter === value
                  ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-200"
                  : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50"
                }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── CARDS GRID ── */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Heart className="w-7 h-7 text-red-400" />
            </div>
            <p className="text-slate-500 text-sm">Failed to load causes. Please try again later.</p>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCauses.map((cause, idx) => {
              const progress = Math.min(Math.round((cause.raised / cause.target) * 100), 100);
              const grad = categoryGradients[cause.category] || "from-rose-500 to-amber-500";
              const bar = categoryBarColors[cause.category] || "from-rose-400 to-amber-500";
              const badge = categoryBadgeColors[cause.category] || "bg-rose-100 text-rose-700";

              return (
                <div
                  key={cause.id}
                  className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 animate-fade-in flex flex-col"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-52 shrink-0">
                    <img
                      src={cause.image}
                      alt={cause.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${grad} opacity-40`} />
                    {/* Category badge */}
                    <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>
                      {cause.category}
                    </span>
                    {/* Progress % badge */}
                    <span className="absolute top-3 right-3 text-xs font-bold bg-white/90 backdrop-blur-sm text-slate-700 px-2.5 py-1 rounded-full shadow-sm">
                      {progress}% funded
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="text-base font-bold text-slate-800 leading-snug mb-2 line-clamp-2">
                      {cause.title}
                    </h2>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed flex-1">
                      {cause.description}
                    </p>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${bar} transition-all duration-700`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-xs mb-3">
                      <span className="text-slate-700 font-semibold">
                        ₹{cause.raised?.toLocaleString()} <span className="text-slate-400 font-normal">raised</span>
                      </span>
                      <span className="text-slate-400">
                        of ₹{cause.target?.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      <span className="font-medium text-slate-600">{cause.supporters}</span> alumni have contributed
                    </p>

                    {/* Donate button */}
                    <button
                      onClick={() => handleDonate(cause.id)}
                      className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r ${grad} text-white text-sm font-semibold shadow-md hover:opacity-90 hover:scale-[1.02] transition-all`}
                    >
                      <Heart size={15} className="fill-white" />
                      Donate Now
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {filteredCauses.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                  <Heart className="w-7 h-7 text-rose-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-600 mb-1">No causes found</h3>
                <p className="text-slate-400 text-sm">Try adjusting your search or filter.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
