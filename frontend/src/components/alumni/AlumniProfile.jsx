import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  UserPlus, MapPin, Briefcase, Building2, GraduationCap,
  BookOpen, Mail, Globe, ArrowLeft, Loader2, Sparkles,
  Code, Award, UserCheck, UserX, Clock
} from "lucide-react";
import MentorshipModal from "../mentorship/MentorshipModal";

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
  const [showMentorship, setShowMentorship] = useState(false);

  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").User_ID;

  const handleConnect = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/connections/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: alumni.User_ID })
      });
      if (res.ok) {
        setAlumni((prev) => ({
          ...prev,
          connectionStatus: "Pending",
          connectionSenderID: currentUserId
        }));
      } else {
        const err = await res.json();
        console.error(err.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespond = async (status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/connections/${alumni.connectionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setAlumni((prev) => ({
          ...prev,
          connectionStatus: status
        }));
      } else {
        const err = await res.json();
        console.error(err.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
      <section className="relative pt-18 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-6 lg:py-8">
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
                  <Sparkles className="w-3.5 h-3.5" /> {alumni.User_Type_ID === 2 ? "Student" : "Alumni"}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                {fullName || "Unknown Alumni"}
              </h1>
              <p className="mt-2 text-indigo-200 text-sm sm:text-base">
                {alumni.User_Type_ID === 2
                  ? `${alumni.Course || "Student"} — Current Year ${alumni.Current_Year || "N/A"}`
                  : (alumni.Job_Title && alumni.Company_Name
                    ? `${alumni.Job_Title} at ${alumni.Company_Name}`
                    : alumni.Job_Title || alumni.Company_Name || "Alumni Member")}
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
            {alumni.User_ID !== currentUserId && (
              <div className="flex gap-3">
                {(() => {
                  const status = alumni.connectionStatus;
                  const isSender = alumni.connectionSenderID === currentUserId;

                  if (status === "Accepted") {
                    return (
                      <div className="flex gap-2">
                        <button
                          disabled
                          className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 px-6 py-3 rounded-xl font-semibold text-sm cursor-not-allowed"
                        >
                          <UserCheck className="w-4 h-4" />
                          Connected
                        </button>
                        {alumni.User_Type_ID === 1 && (
                          <button
                            onClick={() => setShowMentorship(true)}
                            className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 px-6 py-3 rounded-xl font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
                          >
                            Book Mentorship
                          </button>
                        )}
                      </div>
                    );
                  }

                  if (status === "Pending") {
                    if (isSender) {
                      return (
                        <button
                          disabled
                          className="inline-flex items-center gap-2 bg-white/10 text-white/70 border border-white/20 px-6 py-3 rounded-xl font-semibold text-sm cursor-not-allowed"
                        >
                          <Clock className="w-4 h-4 animate-pulse" />
                          Pending Request
                        </button>
                      );
                    } else {
                      return (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespond("Accepted")}
                            className="inline-flex items-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 px-5 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all active:scale-[0.98]"
                          >
                            <UserCheck className="w-4 h-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleRespond("Rejected")}
                            className="inline-flex items-center gap-2 bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-500/30 px-5 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
                          >
                            <UserX className="w-4 h-4" />
                            Decline
                          </button>
                        </div>
                      );
                    }
                  }

                  return (
                    <button
                      onClick={handleConnect}
                      className="inline-flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all active:scale-[0.98]"
                    >
                      <UserPlus className="w-4 h-4" />
                      Connect
                    </button>
                  );
                })()}
              </div>
            )}
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

            {/* Professional / Academic details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  {alumni.User_Type_ID === 2 ? (
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Briefcase className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                {alumni.User_Type_ID === 2 ? "Academic & Personal Details" : "Professional Details"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alumni.User_Type_ID === 2 ? (
                  <>
                    <InfoItem
                      icon={Award}
                      label="Scholar ID"
                      value={alumni.Scholar_No}
                      color="bg-indigo-100 text-indigo-600"
                    />
                    <InfoItem
                      icon={GraduationCap}
                      label="Current Year"
                      value={alumni.Current_Year ? `Year ${alumni.Current_Year}` : null}
                      color="bg-purple-100 text-purple-600"
                    />
                  </>
                ) : (
                  <>
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
                  </>
                )}
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

            {/* Quick actions (only show if not self) */}
            {alumni.User_ID !== currentUserId && (
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                {(() => {
                  const status = alumni.connectionStatus;
                  const isSender = alumni.connectionSenderID === currentUserId;

                  if (status === "Accepted") {
                    return (
                      <>
                        <h3 className="text-lg font-bold mb-2 relative">You are connected!</h3>
                        <p className="text-sm text-indigo-100/80 leading-relaxed mb-4 relative">
                          You are now connected with {alumni.User_Fname || "this user"}. Go to your connections to start messaging.
                        </p>
                        <div className="flex flex-col gap-2 relative">
                          <button
                            onClick={() => navigate("/connections")}
                            className="w-full inline-flex items-center justify-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all"
                          >
                            <Mail className="w-4 h-4" /> Message User
                          </button>
                          {alumni.User_Type_ID === 1 && (
                            <button
                              onClick={() => setShowMentorship(true)}
                              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white border border-indigo-400/50 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                            >
                              Request Mentorship Session
                            </button>
                          )}
                        </div>
                      </>
                    );
                  }

                  if (status === "Pending") {
                    if (isSender) {
                      return (
                        <>
                          <h3 className="text-lg font-bold mb-2 relative">Connection Pending</h3>
                          <p className="text-sm text-indigo-100/80 leading-relaxed mb-4 relative">
                            Your request is pending review. You'll be able to send messages once they accept.
                          </p>
                          <button
                            disabled
                            className="w-full inline-flex items-center justify-center gap-2 bg-white/20 text-white/80 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-not-allowed relative border border-white/10"
                          >
                            <Clock className="w-4 h-4 animate-pulse" /> Pending Request
                          </button>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <h3 className="text-lg font-bold mb-2 relative">Connection Request</h3>
                          <p className="text-sm text-indigo-100/80 leading-relaxed mb-4 relative">
                            {alumni.User_Fname || "This user"} wants to connect with you. Accept to start direct chatting.
                          </p>
                          <div className="flex flex-col gap-2 relative">
                            <button
                              onClick={() => handleRespond("Accepted")}
                              className="w-full inline-flex items-center justify-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:bg-indigo-50 transition-all"
                            >
                              <UserCheck className="w-4 h-4" /> Accept Request
                            </button>
                            <button
                              onClick={() => handleRespond("Rejected")}
                              className="w-full inline-flex items-center justify-center gap-2 bg-red-500/20 text-red-100 border border-red-500/30 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-500/30 transition-all"
                            >
                              <UserX className="w-4 h-4" /> Decline Request
                            </button>
                          </div>
                        </>
                      );
                    }
                  }

                  return (
                    <>
                      <h3 className="text-lg font-bold mb-2 relative">Want to connect?</h3>
                      <p className="text-sm text-indigo-100/80 leading-relaxed mb-4 relative">
                        Send a connection request to {alumni.User_Fname || "this user"} and start building your network.
                      </p>
                      <button
                        onClick={handleConnect}
                        className="w-full inline-flex items-center justify-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all relative"
                      >
                        <UserPlus className="w-4 h-4" /> Send Request
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </section>

      {showMentorship && (
        <MentorshipModal
          alumni={{
            id: alumni.Alumni_ID || alumni.id,
            name: fullName,
            jobTitle: alumni.Job_Title || alumni.jobTitle,
            company: alumni.Company_Name || alumni.companyName
          }}
          onClose={() => setShowMentorship(false)}
        />
      )}
    </div>
  );
}
