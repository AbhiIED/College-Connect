import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, FileText, Phone, Target, Calendar, Clock, Send,
  User, Building2, CheckCircle2
} from "lucide-react";

const SESSION_TYPES = [
  {
    id: "resume",
    icon: FileText,
    emoji: "📄",
    title: "Resume Review",
    desc: "Get feedback on your resume & LinkedIn profile",
    color: "indigo",
  },
  {
    id: "call",
    icon: Phone,
    emoji: "☎️",
    title: "15-Min Informational Call",
    desc: "Learn about their career path & company culture",
    color: "purple",
  },
  {
    id: "placement",
    icon: Target,
    emoji: "🎯",
    title: "Placement Prep Ask",
    desc: "Mock interview or placement strategy session",
    color: "emerald",
  },
];

const TIME_SLOTS = [
  { id: "morning", label: "Morning", sub: "9 AM – 12 PM", icon: "🌅" },
  { id: "afternoon", label: "Afternoon", sub: "12 PM – 5 PM", icon: "☀️" },
  { id: "evening", label: "Evening", sub: "5 PM – 9 PM", icon: "🌆" },
];

export default function MentorshipModal({ alumni, onClose }) {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedType || !selectedDate || !selectedTime) return;
    setSubmitted(true);
    // In a real app, this would POST to /mentorship-requests
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  const colorMap = {
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      activeBg: "bg-indigo-600",
      text: "text-indigo-700",
      ring: "ring-indigo-500",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      activeBg: "bg-purple-600",
      text: "text-purple-700",
      ring: "ring-purple-500",
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      activeBg: "bg-emerald-600",
      text: "text-emerald-700",
      ring: "ring-emerald-500",
    },
  };

  // Minimum date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Book Mentorship</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="mx-6 mt-4 mb-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
            🚧 <span>Coming Soon — This feature is under development. Submissions are not saved yet.</span>
          </p>
        </div>

        {submitted ? (
          /* Success State */
          <div className="flex flex-col items-center justify-center h-[calc(100%-64px)] px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent! 🎉</h3>
            <p className="text-sm text-gray-500 text-center max-w-xs">
              Your mentorship request has been sent to <strong>{alumni.name}</strong>. 
              They'll get back to you soon.
            </p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-6">
            {/* Alumni Info Card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {alumni.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-gray-900 truncate">{alumni.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  {alumni.jobTitle && (
                    <span className="text-xs text-indigo-600 font-medium">{alumni.jobTitle}</span>
                  )}
                  {alumni.jobTitle && alumni.company && (
                    <span className="text-xs text-gray-300">•</span>
                  )}
                  {alumni.company && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Building2 className="w-3 h-3" />
                      {alumni.company}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Session Type Selection */}
            <div>
              <label className="text-sm font-semibold text-gray-800 mb-3 block">
                What do you need help with?
              </label>
              <div className="space-y-2.5">
                {SESSION_TYPES.map((type) => {
                  const colors = colorMap[type.color];
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? `${colors.bg} ${colors.border} ring-1 ${colors.ring}`
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-xl mt-0.5">{type.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold ${isSelected ? colors.text : "text-gray-900"}`}>
                          {type.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">{type.desc}</p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`w-5 h-5 rounded-full ${colors.activeBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Picker */}
            <div>
              <label className="text-sm font-semibold text-gray-800 mb-2 block">
                <Calendar className="w-4 h-4 inline mr-1.5 text-indigo-500" />
                Preferred Date
              </label>
              <input
                type="date"
                min={minDate}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all
                  bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Time Slot */}
            <div>
              <label className="text-sm font-semibold text-gray-800 mb-2 block">
                <Clock className="w-4 h-4 inline mr-1.5 text-indigo-500" />
                Preferred Time
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedTime(slot.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 ${
                      selectedTime === slot.id
                        ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-500"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">{slot.icon}</span>
                    <span className={`text-xs font-bold ${selectedTime === slot.id ? "text-indigo-700" : "text-gray-700"}`}>
                      {slot.label}
                    </span>
                    <span className="text-[10px] text-gray-400">{slot.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-semibold text-gray-800 mb-2 block">
                Additional Message <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell them a bit about yourself and what you'd like to discuss..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700
                  placeholder-gray-400 resize-none
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all
                  bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!selectedType || !selectedDate || !selectedTime}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                selectedType && selectedDate && selectedTime
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200/50 hover:-translate-y-0.5"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              Send Mentorship Request
            </button>

            <p className="text-xs text-gray-400 text-center pb-4">
              The alumni will receive a notification and can accept or suggest a different time.
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
