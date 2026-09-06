import React, { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Newspaper, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import NewsDetailModal from "./NewsDetailModal";
import { getNewsImage, handleNewsImageError } from "../../utils/imageUtils";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Fallback news for when DB is empty
const FALLBACK_NEWS = [
  {
    News_ID: "f1", Title: "Alumni drives career growth workshop",
    Description: "Senior alumni conducted a session on resume building and interviews.",
    Category: "Career", Published_At: "2025-03-16",
    Image_URL: "https://images.unsplash.com/photo-1496128858413-b36217c2ce36?auto=format&fit=crop&w=800&q=80",
  },
  {
    News_ID: "f2", Title: "Record placements for Batch of 2025",
    Description: "Alumni referrals played a key role in boosting this year's offers.",
    Category: "Placement", Published_At: "2025-03-10",
    Image_URL: "https://images.unsplash.com/photo-1547586696-ea22b4d4235d?auto=format&fit=crop&w=800&q=80",
  },
  {
    News_ID: "f3", Title: "Startup by alumni raises seed funding",
    Description: "Two alumni-founded startups secured seed funding this quarter.",
    Category: "Business", Published_At: "2025-02-12",
    Image_URL: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=80",
  },
  {
    News_ID: "f4", Title: "Alumni mentorship program launched",
    Description: "Students can now connect with alumni mentors for career guidance.",
    Category: "Mentorship", Published_At: "2025-02-05",
    Image_URL: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
  },
  {
    News_ID: "f5", Title: "Annual alumni reunion announced",
    Description: "The annual alumni meet will be held on campus this summer.",
    Category: "Event", Published_At: "2025-01-20",
    Image_URL: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
  },
];

const categoryColors = {
  Career: "bg-blue-100 text-blue-700",
  Placement: "bg-emerald-100 text-emerald-700",
  Business: "bg-amber-100 text-amber-700",
  Mentorship: "bg-purple-100 text-purple-700",
  Event: "bg-pink-100 text-pink-700",
};

export default function HomeNews() {
  const scrollRef = useRef(null);
  const [news, setNews] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    fetch(`${API}/news?limit=6`)
      .then((r) => r.json())
      .then((data) => {
        setNews(Array.isArray(data) && data.length > 0 ? data : FALLBACK_NEWS);
      })
      .catch(() => setNews(FALLBACK_NEWS));
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Newspaper className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Latest Updates</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">News & Announcements</h2>
            <p className="mt-1 text-gray-500 text-sm">Stay updated with the latest from your alma mater</p>
          </div>
          <Link
            to="/all-news"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl"
          >
            View All News <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative group">
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
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-4 scrollbar-none snap-x snap-mandatory"
          >
            {news.map((item) => {
              const cat = item.Category || "News";
              const color = categoryColors[cat] || "bg-gray-100 text-gray-700";
              const date = item.Published_At
                ? new Date(item.Published_At).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "";

              return (
                <article
                  key={item.News_ID}
                  onClick={() => setSelectedArticle(item)}
                  className="flex-none w-80 snap-start bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group/card cursor-pointer hover:-translate-y-0.5 duration-200"
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={getNewsImage(item.Image_URL, item.Category)}
                      onError={(e) => handleNewsImageError(e, item.Category)}
                      alt={item.Title}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
                        {cat}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {date && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                        <Clock className="w-3 h-3" /> {date}
                      </div>
                    )}
                    <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2 group-hover/card:text-indigo-600 transition-colors">
                      {item.Title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {item.Description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
      {selectedArticle && (
        <NewsDetailModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </section>
  );
}
