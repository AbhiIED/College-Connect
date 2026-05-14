import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, MapPin, Building2, GraduationCap, Briefcase,
  Calendar, Shield, Bell, Eye, EyeOff, Lock, Camera, Save,
  BookOpen, Award, Globe, Wrench, ChevronRight, Settings, UserCog
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token");

// Reusable toggle switch
function Toggle({ enabled, onChange, label }) {
  return (
    <div className="flex items-center justify-between py-3 px-1">
      <span className="text-sm text-gray-700 font-medium">{label}</span>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? "bg-indigo-600" : "bg-gray-300"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

// Info row for profile details
function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-indigo-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm text-gray-800 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function ManageAccount() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  // Settings state
  const [profileType, setProfileType] = useState("public");
  const [settings, setSettings] = useState({
    showBranch: true, showBatch: true, showLocation: true,
    showWorkplace: true, showExperience: true,
  });
  const [notification, setNotification] = useState(true);
  const [connectRequests, setConnectRequests] = useState(true);
  const [protection, setProtection] = useState(true);

  // Password state
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch profile
  useEffect(() => {
    const token = getToken();
    if (!token) { navigate("/signin"); return; }

    fetch(`${API}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (r.status === 401) { navigate("/signin"); return null; } return r.json(); })
      .then((data) => {
        if (!data) return;
        if (data.profilePic && !data.profilePic.startsWith("http")) {
          data.profilePic = `${API}${data.profilePic}`;
        }
        setUser(data);
      })
      .catch(() => showToast("Failed to load profile", "error"))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Upload profile pic
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("profilePic", file);
    try {
      const res = await fetch(`${API}/api/user/upload-pic`, {
        method: "POST", headers: { Authorization: `Bearer ${getToken()}` }, body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setUser((p) => ({ ...p, profilePic: `${API}${data.imagePath}` }));
        showToast("Profile picture updated!");
      } else showToast(data.error || "Upload failed", "error");
    } catch { showToast("Upload failed", "error"); }
  };

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/user/update-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          profileType, profileSettings: settings, notification,
          connectRequests, protection, about: user.about,
        }),
      });
      const data = await res.json();
      if (res.ok) showToast("Settings saved!");
      else showToast(data.error || "Save failed", "error");
    } catch { showToast("Save failed", "error"); }
    finally { setSaving(false); }
  };

  // Change password
  const handleChangePwd = async () => {
    if (passwords.new !== passwords.confirm) { showToast("Passwords don't match!", "error"); return; }
    if (passwords.new.length < 6) { showToast("Password must be 6+ characters", "error"); return; }
    try {
      const res = await fetch(`${API}/api/user/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ oldPassword: passwords.current, newPassword: passwords.new }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Password updated!");
        setPasswords({ current: "", new: "", confirm: "" });
        setShowPwdForm(false);
      } else showToast(data.error || "Failed", "error");
    } catch { showToast("Failed to change password", "error"); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading profile...</p>
      </div>
    </div>
  );

  if (!user) return null;

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "privacy", label: "Privacy & Settings", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
  ];

  const roleBadgeColor = user.userRole === "Alumni"
    ? "bg-emerald-100 text-emerald-700" : user.userRole === "Student"
    ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700";

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 animate-[slideIn_0.3s_ease] ${toast.type === "success" ? "bg-emerald-600" : "bg-red-500"}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}

      <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header Card */}
          <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            {/* Cover gradient */}
            <div className="h-32 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600" />

            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-14">
                {/* Avatar */}
                <div className="relative group">
                  <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                        <User className="w-12 h-12 text-indigo-400" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-1 right-1 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleUpload} className="hidden" />
                </div>

                {/* Name + Meta */}
                <div className="flex-1 text-center sm:text-left sm:pb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadgeColor}`}>
                      {user.userRole}
                    </span>
                    {user.department && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {user.department}
                      </span>
                    )}
                    {user.graduationYear && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" /> Batch of {user.graduationYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <t.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <>
                {/* Left: Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Personal Info */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <UserCog className="w-5 h-5 text-indigo-600" /> Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                      <InfoRow icon={Mail} label="Email" value={user.email} />
                      <InfoRow icon={Phone} label="Phone" value={user.phone} />
                      <InfoRow icon={User} label="Gender" value={user.gender} />
                      <InfoRow icon={MapPin} label="Address" value={user.address} />
                    </div>
                  </div>

                  {/* Academic Info */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-600" /> Academic Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                      <InfoRow icon={Award} label="Enrollment / Scholar No" value={user.enrollmentNo} />
                      <InfoRow icon={BookOpen} label="Department" value={user.department} />
                      <InfoRow icon={BookOpen} label="Course / Branch" value={user.course} />
                      <InfoRow icon={Calendar} label="Graduation Year" value={user.graduationYear} />
                      {user.currentYear && <InfoRow icon={Calendar} label="Current Year" value={`Year ${user.currentYear}`} />}
                    </div>
                  </div>

                  {/* Professional Info (alumni only) */}
                  {user.userType === 1 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-indigo-600" /> Professional Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                        <InfoRow icon={Briefcase} label="Job Title" value={user.jobTitle} />
                        <InfoRow icon={Building2} label="Company" value={user.companyName} />
                        <InfoRow icon={Globe} label="Location" value={[user.currentCity, user.currentCountry].filter(Boolean).join(", ")} />
                        <InfoRow icon={Wrench} label="Sector" value={user.sector} />
                      </div>
                      {user.skills && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {user.skills.split(",").map((s, i) => (
                              <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: About */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" /> About Me
                    </h3>
                    <textarea
                      value={user.about}
                      onChange={(e) => setUser({ ...user, about: e.target.value })}
                      placeholder="Tell the alumni community about yourself..."
                      rows="5"
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition"
                    />
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save About"}
                    </button>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                    <h3 className="font-semibold mb-4">Quick Info</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="opacity-80">Role</span><span className="font-medium">{user.userRole}</span></div>
                      {user.department && <div className="flex justify-between"><span className="opacity-80">Department</span><span className="font-medium">{user.department}</span></div>}
                      {user.course && <div className="flex justify-between"><span className="opacity-80">Branch</span><span className="font-medium">{user.course}</span></div>}
                      {user.graduationYear && <div className="flex justify-between"><span className="opacity-80">Batch</span><span className="font-medium">{user.graduationYear}</span></div>}
                      {user.companyName && <div className="flex justify-between"><span className="opacity-80">Company</span><span className="font-medium">{user.companyName}</span></div>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── PRIVACY TAB ── */}
            {activeTab === "privacy" && (
              <>
                <div className="lg:col-span-2 space-y-6">
                  {/* Profile Visibility */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-indigo-600" /> Profile Visibility
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">Control who can see your profile in the alumni directory</p>
                    <div className="flex gap-3">
                      {["public", "private"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setProfileType(type)}
                          className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            profileType === type
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                              : "border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          {type === "public" ? "🌐 Public" : "🔒 Private"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* What to show */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <UserCog className="w-5 h-5 text-indigo-600" /> Display Preferences
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">Choose what information is visible on your public profile</p>
                    <div className="divide-y divide-gray-100">
                      <Toggle label="Show Branch / Department" enabled={settings.showBranch} onChange={() => setSettings(p => ({ ...p, showBranch: !p.showBranch }))} />
                      <Toggle label="Show Batch / Graduation Year" enabled={settings.showBatch} onChange={() => setSettings(p => ({ ...p, showBatch: !p.showBatch }))} />
                      <Toggle label="Show Location" enabled={settings.showLocation} onChange={() => setSettings(p => ({ ...p, showLocation: !p.showLocation }))} />
                      <Toggle label="Show Workplace / Company" enabled={settings.showWorkplace} onChange={() => setSettings(p => ({ ...p, showWorkplace: !p.showWorkplace }))} />
                      <Toggle label="Show Experience / Job Title" enabled={settings.showExperience} onChange={() => setSettings(p => ({ ...p, showExperience: !p.showExperience }))} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Notifications */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-indigo-600" /> Notifications
                    </h3>
                    <div className="divide-y divide-gray-100">
                      <Toggle label="Email Notifications" enabled={notification} onChange={() => setNotification(!notification)} />
                      <Toggle label="Connection Requests" enabled={connectRequests} onChange={() => setConnectRequests(!connectRequests)} />
                      <Toggle label="Information Protection" enabled={protection} onChange={() => setProtection(!protection)} />
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save All Settings"}
                  </button>
                </div>
              </>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === "security" && (
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-600" /> Change Password
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">Ensure your account stays secure by updating your password regularly</p>

                  {!showPwdForm ? (
                    <button
                      onClick={() => setShowPwdForm(true)}
                      className="flex items-center gap-3 w-full p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition">
                        <Lock className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-800">Update your password</p>
                        <p className="text-xs text-gray-400">Click to change your current password</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 ml-auto" />
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {[
                        { key: "current", label: "Current Password", placeholder: "Enter current password" },
                        { key: "new", label: "New Password", placeholder: "Enter new password (6+ chars)" },
                        { key: "confirm", label: "Confirm Password", placeholder: "Confirm new password" },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                          <div className="relative">
                            <input
                              type={showPwd[key] ? "text" : "password"}
                              placeholder={placeholder}
                              value={passwords[key]}
                              onChange={(e) => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPwd(p => ({ ...p, [key]: !p[key] }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPwd[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleChangePwd}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                        >
                          Update Password
                        </button>
                        <button
                          onClick={() => { setShowPwdForm(false); setPasswords({ current: "", new: "", confirm: "" }); }}
                          className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Account info card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" /> Account Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Account Email</span>
                      <span className="font-medium text-gray-800">{user.email}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Account Type</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadgeColor}`}>{user.userRole}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Account ID</span>
                      <span className="font-mono text-gray-400 text-xs">#{String(user.id).padStart(6, "0")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
