import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  UserPlus, MapPin, Briefcase, Building2, GraduationCap,
  BookOpen, Mail, Globe, ArrowLeft, Loader2, Sparkles,
  Code, Award
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/* ── Info row component ── */
function InfoItem({ icon: Icon, label, value, color = "bg-gray-100 text-gray-600" }) {
  if (!value || value === "—") return null;
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

export default function AlumniProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/signin"); return; }

    fetch(`${API}/alumni/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch alumni profile");
        return res.json();
      })
      .then((data) => { setAlumni(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 -mt-16">
        <div className="flex flex-col items-center justify-center pt-40">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading alumni profile…</p>
        </div>
      </div>
    );
  }

  if (error || !alumni) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 -mt-16">
        <div className="flex flex-col items-center justify-center pt-40 text-center px-6">
          <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <span className="text-3xl">😕</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-500 mb-6">The alumni profile you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/directory"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const fullName = `${alumni.User_Fname || ""} ${alumni.User_Lname || ""}`.trim();
  const initials = `${(alumni.User_Fname || "?")[0]}${(alumni.User_Lname || "?")[0]}`.toUpperCase();

  // Parse skills into array
  const skillsList = alumni.skills
    ? alumni.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 -mt-16">

      {/* ── Hero banner ── */}
      <section className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          {/* Back button */}
          <button
            onClick={() => navigate("/directory")}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-4xl font-bold shadow-xl ring-4 ring-white/20">
              {alumni.Profile_Pic && !alumni.Profile_Pic.includes("default") ? (
                <img
                  src={alumni.Profile_Pic.startsWith("http") ? alumni.Profile_Pic : `${API}${alumni.Profile_Pic}`}
                  alt={fullName}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                  <Sparkles className="w-3.5 h-3.5" /> Alumni
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                {fullName || "Unknown Alumni"}
              </h1>
              <p className="mt-2 text-indigo-200 text-sm sm:text-base">
                {alumni.Job_Title && alumni.Company_Name
                  ? `${alumni.Job_Title} at ${alumni.Company_Name}`
                  : alumni.Job_Title || alumni.Company_Name || "Alumni Member"}
              </p>

              {/* Tags */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
                {alumni.Course && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-white bg-white/15 px-2.5 py-1 rounded-full border border-white/20">
                    <BookOpen className="w-3 h-3" /> {alumni.Course}
                  </span>
                )}
                {alumni.Department && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-white bg-white/15 px-2.5 py-1 rounded-full border border-white/20">
                    <GraduationCap className="w-3 h-3" /> {alumni.Department}
                  </span>
                )}
                {alumni.Graduation_Year && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-white bg-white/15 px-2.5 py-1 rounded-full border border-white/20">
                    Class of {alumni.Graduation_Year}
                  </span>
                )}
              </div>
            </div>

            {/* Connect button */}
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all">
                <UserPlus className="w-4 h-4" /> Connect
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Profile content ── */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - About */}
          <div className="lg:col-span-2 space-y-6">
            {/* About section */}
            {alumni.About && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Award className="w-4 h-4 text-indigo-600" />
                  </div>
                  About
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{alumni.About}</p>
              </div>
            )}

            {/* Professional details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                </div>
                Professional Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoItem
                  icon={Briefcase}
                  label="Job Title"
                  value={alumni.Job_Title}
                  color="bg-indigo-100 text-indigo-600"
                />
                <InfoItem
                  icon={Building2}
                  label="Company"
                  value={alumni.Company_Name}
                  color="bg-purple-100 text-purple-600"
                />
                <InfoItem
                  icon={MapPin}
                  label="Current City"
                  value={alumni.currentCity}
                  color="bg-amber-100 text-amber-600"
                />
                <InfoItem
                  icon={Globe}
                  label="Country"
                  value={alumni.currentCountry}
                  color="bg-emerald-100 text-emerald-600"
                />
                <InfoItem
                  icon={Mail}
                  label="Email"
                  value={alumni.Email_ID}
                  color="bg-blue-100 text-blue-600"
                />
              </div>
            </div>

            {/* Skills section */}
            {skillsList.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Code className="w-4 h-4 text-emerald-600" />
                  </div>
                  Skills & Expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Education */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                </div>
                Education
              </h2>
              <div className="space-y-4">
                <div className="border-l-2 border-indigo-200 pl-4">
                  <p className="text-sm font-bold text-gray-900">MANIT Bhopal</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {alumni.Course || "N/A"} — {alumni.Department || "N/A"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Class of {alumni.Graduation_Year || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
              <h3 className="text-lg font-bold mb-2 relative">Want to connect?</h3>
              <p className="text-sm text-indigo-100/80 leading-relaxed mb-4 relative">
                Send a connection request to {alumni.User_Fname || "this alumni"} and start building your professional network.
              </p>
              <button className="w-full inline-flex items-center justify-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all relative">
                <UserPlus className="w-4 h-4" /> Send Request
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
