import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const RegisterPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const eventName = queryParams.get("event") || "";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    graduationYear: "",
    course: "",
    event: eventName,
  });

  useEffect(() => {
    if (eventName) {
      setFormData((prev) => ({ ...prev, event: eventName }));
    }
  }, [eventName]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    alert(`✅ Registered successfully for "${formData.event}"!`);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      graduationYear: "",
      course: "",
      event: eventName,
    });
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
                className="px-6 py-2 bg-amber-600 text-white font-semibold rounded-lg shadow hover:bg-amber-700 transition"
              >
                Register Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
