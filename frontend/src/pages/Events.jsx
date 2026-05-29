import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectCoverflow,
} from "swiper/modules";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import fallbackImage from "../assets/event-image.webp";


import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

export default function EventSection() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [expiredEvents, setExpiredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE_URL}/events`);

        if (!res.ok) {
          throw new Error(`Failed to fetch events: ${res.statusText}`);
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          const today = new Date();

          const upcoming = data
            .filter((e) => new Date(e.Event_Date) >= today)
            .sort((a, b) => new Date(a.Event_Date) - new Date(b.Event_Date));

          const expired = data
            .filter((e) => new Date(e.Event_Date) < today)
            .sort((a, b) => new Date(b.Event_Date) - new Date(a.Event_Date));

          setUpcomingEvents(upcoming);
          setExpiredEvents(expired);
        } else {
          setError("Invalid data format received");
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center text-lg">
          Loading events...
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center text-red-600 text-lg">
          Error: {error}
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* SECTION: UPCOMING EVENTS */}
      <section className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-amber-900">
              Upcoming Alumni Events 🌟
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Stay connected through reunions, conferences, and networking
              opportunities.
            </p>
          </div>

          {!upcomingEvents.length ? (
            <p className="text-center text-gray-600 py-10 text-lg">
              No upcoming events at the moment.
            </p>
          ) : (
            <Swiper
              modules={[
                Navigation,
                Pagination,
                Autoplay,
                EffectCoverflow,
              ]}
              effect="coverflow"
              grabCursor
              centeredSlides
              slidesPerView="auto"
              loop
              autoplay={{ delay: 3500 }}
              navigation
              pagination={{ clickable: true }}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 180,
                modifier: 2.5,
                slideShadows: false,
              }}
              className="pb-12"
            >
              {upcomingEvents.map((event, index) => (
                <SwiperSlide
                  key={index}
                  className="!w-[350px] sm:!w-[400px] lg:!w-[480px]"
                >
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition">
                    <img
                      src={event.Event_Image || fallbackImage}
                      onError={(e) => (e.target.src = fallbackImage)}
                      alt={event.Event_Name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        {event.Event_Name}
                      </h3>
                      <p className="text-sm text-amber-700 font-medium mb-2">
                        {new Date(event.Event_Date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {event.Event_Description}
                      </p>
                      <a
                        href={event.Event_Link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block text-center py-2 rounded-full bg-amber-600 text-white font-medium shadow-md hover:bg-amber-700 transition"
                      >
                        Register
                      </a>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      {/* SECTION: EXPIRED EVENTS */}
      <section className="bg-white py-16 px-6 border-t border-amber-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
            Past Events 📅
          </h2>

          {expiredEvents.length === 0 ? (
            <p className="text-center text-gray-500">No past events.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {expiredEvents.map((event) => (
                <div
                  key={event.Event_ID}
                  className="bg-gray-50 rounded-xl border shadow hover:shadow-md transition overflow-hidden"
                >
                  <img
                    src={event.Event_Image || fallbackImage}
                    onError={(e) => (e.target.src = fallbackImage)}
                    alt={event.Event_Name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {event.Event_Name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(event.Event_Date).toLocaleDateString()}
                    </p>

                    <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                      {event.Event_Description}
                    </p>

                    <p className="mt-4 inline-block text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                      Expired Event
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
