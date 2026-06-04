import React, { useEffect, useState } from "react";
import {
  Calendar, MapPin, Clock, Users, ExternalLink, Sparkles,
  Monitor, MessageSquare, Building2, Wrench, Code, Filter, Tag
} from "lucide-react";
import fallbackImage from "../assets/event-image.webp";

const MOCK_EVENTS = [
  { Event_ID: "m1", Event_Name: "Life at FAANG — Alumni Webinar", Event_Date: "2026-06-15", Event_Description: "Hear first-hand experiences from MANIT alumni working at Google, Amazon, and Meta. Learn about interview prep, work culture, and career growth.", Event_Link: "#", Event_Image: null, category: "Webinar", speaker: "Rahul Verma (Google SWE), Priya Nair (Meta PM)" },
  { Event_ID: "m2", Event_Name: "CSE Department Alumni Panel", Event_Date: "2026-06-22", Event_Description: "An interactive panel with CSE alumni sharing insights on placements, higher studies, and startup opportunities.", Event_Link: "#", Event_Image: null, category: "Alumni Panel", speaker: "Multiple CSE Alumni" },
  { Event_ID: "m3", Event_Name: "Placement Prep Bootcamp", Event_Date: "2026-07-01", Event_Description: "Intensive 2-day bootcamp covering DSA, system design, and behavioral interviews. Led by alumni mentors.", Event_Link: "#", Event_Image: null, category: "Workshop", speaker: "Alumni Mentors Team" },
  { Event_ID: "m4", Event_Name: "AI/ML Research Meetup", Event_Date: "2026-07-10", Event_Description: "Department-specific meetup for AI/ML enthusiasts. Research paper discussions and project showcases.", Event_Link: "#", Event_Image: null, category: "Department Meetup", speaker: "Dr. Sharma & AI Lab Alumni" },
  { Event_ID: "m5", Event_Name: "Startup Stories — Founders Night", Event_Date: "2026-07-18", Event_Description: "Alumni founders share their journey from campus to building successful startups.", Event_Link: "#", Event_Image: null, category: "Webinar", speaker: "MANIT Alumni Founders" },
  { Event_ID: "m6", Event_Name: "HackMANIT 2026", Event_Date: "2026-08-05", Event_Description: "Annual hackathon sponsored by alumni. Build projects, win prizes, and get noticed by recruiters.", Event_Link: "#", Event_Image: null, category: "Hackathon", speaker: "Organized by Alumni Association" },
];

const PAST_MOCK = [
  { Event_ID: "p1", Event_Name: "Resume Workshop 2025", Event_Date: "2025-11-15", Event_Description: "Workshop on crafting impactful resumes and LinkedIn profiles.", Event_Image: null, category: "Workshop" },
  { Event_ID: "p2", Event_Name: "ECE Alumni Meetup", Event_Date: "2025-10-20", Event_Description: "Department meetup with alumni from semiconductor and electronics industry.", Event_Image: null, category: "Department Meetup" },
];

const CATEGORIES = ["All", "Webinar", "Alumni Panel", "Department Meetup", "Workshop", "Hackathon"];

const categoryIcon = (cat) => {
  const map = { "Webinar": Monitor, "Alumni Panel": MessageSquare, "Department Meetup": Building2, "Workshop": Wrench, "Hackathon": Code };
  return map[cat] || Tag;
};

const categoryColor = (cat) => {
  const map = { "Webinar": "bg-blue-50 text-blue-700 border-blue-100", "Alumni Panel": "bg-purple-50 text-purple-700 border-purple-100", "Department Meetup": "bg-amber-50 text-amber-700 border-amber-100", "Workshop": "bg-emerald-50 text-emerald-700 border-emerald-100", "Hackathon": "bg-rose-50 text-rose-700 border-rose-100" };
  return map[cat] || "bg-gray-50 text-gray-700 border-gray-100";
};

export default function EventSection() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [expiredEvents, setExpiredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE_URL}/events`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const today = new Date();
          setUpcomingEvents(data.filter((e) => new Date(e.Event_Date) >= today).sort((a, b) => new Date(a.Event_Date) - new Date(b.Event_Date)));
          setExpiredEvents(data.filter((e) => new Date(e.Event_Date) < today).sort((a, b) => new Date(b.Event_Date) - new Date(a.Event_Date)));
        } else {
          setUpcomingEvents(MOCK_EVENTS);
          setExpiredEvents(PAST_MOCK);
        }
      } catch {
        setUpcomingEvents(MOCK_EVENTS);
        setExpiredEvents(PAST_MOCK);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = activeCategory === "All" ? upcomingEvents : upcomingEvents.filter((e) => e.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading events…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30">
      {/* Hero */}
      <section className="relative pt-8 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
              <Sparkles className="w-3.5 h-3.5" /> Stay Connected
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Events & <span className="text-indigo-200">Meetups</span>
          </h1>
          <p className="mt-3 text-base text-indigo-100/80 max-w-2xl">
            Join webinars, alumni panels, department meetups, and networking events.
          </p>
          {/* Stats */}
          <div className="mt-6 flex gap-6">
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-semibold">{upcomingEvents.length} upcoming</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{expiredEvents.length} past events</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 -mt-5 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100/30 border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const CatIcon = categoryIcon(cat);
                return (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${activeCategory === cat ? "bg-indigo-600 text-white shadow-md shadow-indigo-200/50" : "bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-100"}`}>
                    {cat !== "All" && <CatIcon className="w-3 h-3" />}
                    {cat}
                  </button>
                );
              })}
            </div>
            <span className="ml-auto text-xs text-gray-400 font-medium hidden sm:block">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </section>

      {/* Upcoming Events Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No events in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event, idx) => {
              const CatIcon = categoryIcon(event.category);
              return (
                <div key={event.Event_ID} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-hover">
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden">
                    <img src={event.Event_Image || fallbackImage} onError={(e) => (e.target.src = fallbackImage)} alt={event.Event_Name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {idx === 0 && (
                      <span className="absolute top-3 left-3 badge-chip bg-amber-500 text-white text-[10px] shadow-lg">
                        <Sparkles className="w-2.5 h-2.5" /> Featured
                      </span>
                    )}
                    <span className={`absolute top-3 right-3 badge-chip border ${categoryColor(event.category)} text-[10px]`}>
                      <CatIcon className="w-2.5 h-2.5" /> {event.category}
                    </span>
                    {/* Date badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm">
                        <p className="text-[10px] font-bold text-indigo-600 uppercase">
                          {new Date(event.Event_Date).toLocaleDateString("en-US", { month: "short" })}
                        </p>
                        <p className="text-lg font-extrabold text-gray-900 -mt-0.5 leading-none">
                          {new Date(event.Event_Date).getDate()}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {event.Event_Name}
                    </h3>
                    {event.speaker && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <p className="text-xs text-gray-500 truncate">{event.speaker}</p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{event.Event_Description}</p>
                    <a href={event.Event_Link || "#"} target="_blank" rel="noopener noreferrer"
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-md shadow-indigo-200/40 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                      <ExternalLink className="w-3.5 h-3.5" /> Register Now
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Past Events */}
      {expiredEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Past Events</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {expiredEvents.map((event) => (
              <div key={event.Event_ID} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                <div className="relative h-32 overflow-hidden">
                  <img src={event.Event_Image || fallbackImage} onError={(e) => (e.target.src = fallbackImage)} alt={event.Event_Name}
                    className="w-full h-full object-cover grayscale" />
                  <div className="absolute inset-0 bg-black/30" />
                  <span className="absolute top-2 right-2 badge-chip bg-gray-800/80 text-white text-[10px]">Archived</span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-gray-800">{event.Event_Name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{new Date(event.Event_Date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{event.Event_Description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
