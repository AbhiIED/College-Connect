import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authFetch } from "../utils/api";

const RegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const eventName = queryParams.get("event") || "";
  const eventId = queryParams.get("eventId") || "";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    graduationYear: "",
    course: "",
    event: eventName,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (eventName) {
      setFormData((prev) => ({ ...prev, event: eventName }));
    }
  }, [eventName]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!eventId) {
      setError("Event ID is missing. Please navigate from the events page.");
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch(`/events/${eventId}/register`, {
        method: "POST",
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          graduationYear: formData.graduationYear
            ? parseInt(formData.graduationYear)
            : null,
          course: formData.course || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(data.message || "Registered successfully!");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        graduationYear: "",
        course: "",
        event: eventName,
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 py-16 px-6 mt-6"
      >
        <div
          className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-10 border border-gray-200"
        >
          <h1 className="text-4xl font-bold text-center text-amber-800 mb-4">
            {eventName || "Event Registration"}
          </h1>
          <p className="text-center text-gray-600 mb-10">
            Fill the form below to register for{" "}
            <span className="font-semibold text-amber-700">
              {eventName || "the event"}
            </span>
            .
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Graduation Year
              </label>
              <input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Course
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Event Name
              </label>
              <input
                type="text"
                name="event"
                value={formData.event}
                readOnly
                className="mt-2 block w-full px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-amber-600 text-white font-semibold rounded-lg shadow hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Register Now"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
