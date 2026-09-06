import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, ExternalLink, ArrowRight, Clock, Video } from "lucide-react";
import fallbackImage from "../../assets/event-image.webp";
import { getEventImage, handleEventImageError } from "../../utils/imageUtils";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function HomeEvent() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch(`${API}/events?type=latest`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setEvents(data); })
      .catch(() => {});
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      year: d.getFullYear(),
      full: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    };
  };

  if (events.length === 0) {
    return (
      <section className="py-16 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Events</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-10 text-center border border-purple-100">
          <Calendar className="w-12 h-12 text-purple-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No upcoming events right now. Check back soon!</p>
          <Link to="/events" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition">
            Browse past events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 max-w-7xl mx-auto px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Don't Miss Out</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
          <p className="mt-1 text-gray-500 text-sm">Reunions, webinars, and campus happenings</p>
        </div>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-800 transition bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl"
        >
          All Events <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Events grid */}
      <div className="space-y-5">
        {events.slice(0, 4).map((event) => {
          const date = formatDate(event.Event_Date);
          const isOnline = event.Event_Type?.toLowerCase() === "online" || !!event.Event_Link;

          return (
            <article
              key={event.Event_ID}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col lg:flex-row group"
            >
              {/* Image */}
              <div className="relative lg:w-72 h-48 lg:h-auto flex-shrink-0 overflow-hidden bg-slate-100">
                <img
                  src={getEventImage(event.Event_Image, event.Event_Type)}
                  alt={event.Event_Name}
                  onError={(e) => handleEventImageError(e, event.Event_Type)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Date badge */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 text-center shadow-sm">
                  <p className="text-2xl font-bold text-indigo-600 leading-none">{date.day}</p>
                  <p className="text-xs font-medium text-gray-500 uppercase">{date.month}</p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isOnline ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {isOnline ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {isOnline ? "Online" : "In-Person"}
                    </span>
                    {event.Event_Type && (
                      <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                        {event.Event_Type}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {event.Event_Name}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {event.Event_Description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {date.full}
                    </span>
                    {event.Event_Location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {event.Event_Location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <Link
                    to={`/register`}
                    state={{ eventId: event.Event_ID }}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    Register Now
                  </Link>
                  {event.Event_Link && (
                    <a
                      href={event.Event_Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
                    >
                      <ExternalLink className="w-4 h-4" /> Event Link
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
