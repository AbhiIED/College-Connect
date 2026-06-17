import React, { useState, useEffect } from "react";
import { 
  Newspaper, Calendar, ArrowRight, Sparkles, Clock, Tag,
  LayoutGrid, Building2, Users, Briefcase
} from "lucide-react";
import NewsDetailModal from "./NewsDetailModal";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const FALLBACK_NEWS = [
  {
    News_ID: "f1",
    Title: "Annual Alumni Reunion 2025 Announced",
    Description:
      "We are excited to welcome back alumni from across the globe for our annual reunion. This year’s event will feature keynote speakers, networking opportunities, and campus tours.",
    Details:
      "The Alumni Reunion 2025 is scheduled for July 15–17, 2025, at the main campus. The event will open with a keynote address by a distinguished alumnus. Attendees will participate in skill-building workshops, panel discussions, and guided tours. Cultural performances, networking dinners, and a gala night are also included.",
    Image_URL:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
    Category: "Event",
    Published_At: "2025-06-15T10:00:00.000Z",
  },
  {
    News_ID: "f2",
    Title: "Alumni Scholarship Fund Reaches $2 Million Milestone",
    Description:
      "Thanks to the generous contributions of our global alumni network, the scholarship fund has crossed the $2 million mark, helping support over 500 underprivileged students.",
    Details:
      "Established in 2010, the scholarship fund has now supported over 500 students. With alumni contributions worldwide, the fund crossed $2 million in 2025. Plans are underway to expand scholarships and mentorship programs, ensuring talented students can pursue education regardless of financial barriers.",
    Image_URL:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    Category: "Alumni",
    Published_At: "2025-06-10T14:30:00.000Z",
  },
  {
    News_ID: "f3",
    Title: "Alumni Startup Spotlight: GreenTech Solutions Honored",
    Description:
      "GreenTech Solutions, founded by MANIT alumni, has been recognized among the top 50 sustainable business ventures for innovative work in renewable energy solutions.",
    Details:
      "Founded in 2018 by engineering and business alumni, GreenTech introduced solar panel technology that cut costs by 20%. Recently, the company secured $10 million in funding, expanding into Asia and Africa. Their success inspires sustainability-focused entrepreneurs worldwide.",
    Image_URL:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
    Category: "Placement",
    Published_At: "2025-06-05T09:15:00.000Z",
  },
  {
    News_ID: "f4",
    Title: "New Campus Innovation Hub Inaugrated",
    Description:
      "A state-of-the-art incubation hub has been opened to provide support, infrastructure, and mentor networking for student and alumni entrepreneurs.",
    Details:
      "The Innovation Hub provides advanced labs for AI, robotics, and clean energy, alongside co-working spaces. Backed by alumni investments, it will host hackathons, seed pitch competitions, and startup accelerator cohorts starting next semester.",
    Image_URL:
      "https://images.unsplash.com/photo-1581090700227-4c4f50b1d83f?q=80&w=1200&auto=format&fit=crop",
    Category: "Campus",
    Published_At: "2025-06-01T11:45:00.000Z",
  },
];

const CATEGORIES = [
  { label: "All Updates", value: "All", icon: LayoutGrid },
  { label: "Campus", value: "Campus", icon: Building2 },
  { label: "Alumni", value: "Alumni", icon: Users },
  { label: "Events", value: "Event", icon: Calendar },
  { label: "Placements", value: "Placement", icon: Briefcase },
];

const categoryColors = {
  Campus: "bg-blue-50 text-blue-700 border-blue-100",
  Alumni: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Event: "bg-purple-50 text-purple-700 border-purple-100",
  Placement: "bg-amber-50 text-amber-700 border-amber-100",
};

export default function NewsSection() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    fetch(`${API}/news`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch news");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNewsList(data);
        } else {
          setNewsList(FALLBACK_NEWS);
        }
      })
      .catch((err) => {
        console.error("Error loading news:", err);
        setNewsList(FALLBACK_NEWS);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredNews = newsList.filter((item) => {
    return filter === "All" || item.Category === filter;
  });

  const featured = filteredNews[0];
  const gridItems = filteredNews.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* ── HEADER SECTION ── */}
      <header className="mb-12 text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-150 text-indigo-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4 shadow-3xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Newsroom & Portal Logs
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Keep Up With MANIT Connect
        </h1>
        <p className="mt-3 text-slate-500 text-[15px] sm:text-base leading-relaxed">
          Stay updated with accomplishments, campus announcements, student activities, and global milestones from our alumni network.
        </p>
      </header>

      {/* ── CATEGORY FILTER TABS ── */}
      <section className="flex justify-center border-b border-slate-100 pb-5 mb-10 overflow-x-auto gap-2.5 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = filter === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                isActive
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </section>

      {/* ── LOADING SKELETON STATE ── */}
      {loading ? (
        <div className="space-y-10">
          {/* Featured Skeleton */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col lg:flex-row gap-8 animate-pulse shadow-xs">
            <div className="lg:w-7/12 h-80 bg-slate-200 rounded-2xl" />
            <div className="lg:w-5/12 flex flex-col justify-center space-y-4">
              <div className="h-6 bg-slate-200 rounded-full w-24" />
              <div className="h-8 bg-slate-200 rounded-full w-5/6" />
              <div className="h-4 bg-slate-100 rounded-full w-full" />
              <div className="h-4 bg-slate-100 rounded-full w-4/5" />
              <div className="h-10 bg-slate-200 rounded-xl w-32 mt-4" />
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 animate-pulse shadow-2xs">
                <div className="h-48 bg-slate-200 rounded-xl w-full" />
                <div className="h-5 bg-slate-200 rounded-full w-3/4" />
                <div className="h-3 bg-slate-100 rounded-full w-full" />
                <div className="h-3 bg-slate-100 rounded-full w-5/6" />
                <div className="h-9 bg-slate-200 rounded-lg w-24 mt-2" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* ── EMPTY STATE ── */}
          {filteredNews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl mb-4">
                📰
              </div>
              <h3 className="text-lg font-bold text-slate-800">No articles found</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-xs">
                We couldn't find any announcements in the "{filter}" category right now.
              </p>
            </div>
          )}

          {/* ── PORTAL NEWS CONTENT ── */}
          {filteredNews.length > 0 && (
            <div className="space-y-12">
              
              {/* 1. Highlight Featured Card (Hero Row) */}
              {featured && (
                <div 
                  onClick={() => setSelectedArticle(featured)}
                  className="group relative bg-white border border-slate-100 hover:border-indigo-200 rounded-3xl overflow-hidden p-5 sm:p-7 flex flex-col lg:flex-row gap-8 shadow-xs hover:shadow-xl hover:shadow-indigo-100/20 transition-all duration-300 cursor-pointer"
                >
                  {/* Left Column: Big Image Banner */}
                  <div className="lg:w-7/12 w-full h-80 lg:h-96 rounded-2xl overflow-hidden relative border border-slate-100 shrink-0">
                    <img 
                      src={featured.Image_URL || "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=1200&q=80"} 
                      alt={featured.Title} 
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-indigo-700 shadow-sm border border-indigo-50 backdrop-blur-xs">
                        ★ Featured Story
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Featured description details */}
                  <div className="lg:w-5/12 w-full flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${categoryColors[featured.Category] || "bg-gray-50 text-gray-600 border-gray-100"}`}>
                        {featured.Category || "News"}
                      </span>
                      {featured.Published_At && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(featured.Published_At).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-indigo-600 leading-snug transition-colors">
                      {featured.Title}
                    </h2>

                    <p className="mt-4 text-slate-500 text-sm sm:text-base leading-relaxed line-clamp-4">
                      {featured.Description}
                    </p>

                    <div className="mt-6">
                      <button 
                        className="inline-flex items-center gap-2 text-indigo-600 group-hover:text-indigo-700 font-bold text-sm"
                      >
                        Read Featured Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Grid for the Rest of the News */}
              {gridItems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {gridItems.map((article) => {
                    const dateText = article.Published_At
                      ? new Date(article.Published_At).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "";

                    return (
                      <div
                        key={article.News_ID}
                        onClick={() => setSelectedArticle(article)}
                        className="group bg-white border border-slate-100 hover:border-indigo-150 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-100/10 transition-all duration-300 flex flex-col cursor-pointer shadow-3xs"
                      >
                        {/* Card Top: Image banner */}
                        <div className="relative h-48 w-full overflow-hidden shrink-0 border-b border-slate-50">
                          <img
                            src={article.Image_URL || "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80"}
                            alt={article.Title}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                          />
                          <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs backdrop-blur-xs uppercase tracking-wide ${categoryColors[article.Category] || "bg-white text-slate-700 border-slate-100"}`}>
                            {article.Category || "News"}
                          </span>
                        </div>

                        {/* Card Body: Text content */}
                        <div className="p-5 flex flex-col flex-1">
                          {dateText && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-semibold mb-2">
                              <Calendar className="w-3.5 h-3.5" />
                              {dateText}
                            </span>
                          )}

                          <h3 className="text-base font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {article.Title}
                          </h3>

                          <p className="mt-2.5 text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-3 flex-1">
                            {article.Description}
                          </p>

                          <div className="mt-5 pt-3.5 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-indigo-600 group-hover:text-indigo-700 font-semibold text-xs transition-colors">
                              Read Article
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── ARTICLE MODAL ── */}
      {selectedArticle && (
        <NewsDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
