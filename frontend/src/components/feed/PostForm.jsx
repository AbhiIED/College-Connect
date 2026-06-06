import React, { useState, useEffect, useRef } from "react";
import { Image, X, Sparkles, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function PostForm() {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState(null); // null | 'success' | 'error' | 'loading'
  const [user, setUser] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("token");
  const MAX_CHARS = 1000;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };
    fetchUser();
  }, [token]);

  // Auto-dismiss status after 4s
  useEffect(() => {
    if (status === "success" || status === "error") {
      const t = setTimeout(() => setStatus(null), 4000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const handleImageChange = (file) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    handleImageChange(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleImageChange(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setStatus("loading");

    const formData = new FormData();
    formData.append("content", content);
    if (imageFile) formData.append("image", imageFile);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await fetch(`${API_BASE_URL}/feeds`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setContent("");
        setImageFile(null);
        setPreview("");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Error posting content:", err);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30">

      {/* ── HERO BANNER ── */}
      <section className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-12 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Share Your Story
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Create a <span className="text-indigo-200">Post</span>
          </h1>
          <p className="mt-3 text-indigo-100/80 text-base max-w-lg mx-auto">
            Share your achievements, memories, or updates with the alumni community.
          </p>
        </div>
      </section>

      {/* ── STATUS TOAST ── */}
      {status === "success" && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl animate-slide-in-right">
          <CheckCircle size={18} />
          <span className="text-sm font-medium">Post shared successfully!</span>
        </div>
      )}
      {status === "error" && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-3 bg-red-600 text-white px-5 py-3 rounded-xl shadow-xl animate-slide-in-right">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">Failed to share post. Try again.</span>
        </div>
      )}

      {/* ── FORM CARD ── */}
      <section className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Profile header */}
          <div className="flex items-center gap-4 px-7 py-5 border-b border-slate-100">
            <div className="relative">
              <img
                src={user.profilePic || "/dp-male.png"}
                alt={user.firstName || "User"}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-200"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 leading-tight">
                {user.firstName || "Your Name"} {user.lastName || ""}
              </h3>
              {user.graduationYear && user.course && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                    Class of {user.graduationYear}
                  </span>
                  <span className="text-xs font-medium bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
                    {user.course}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
            {/* Textarea */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
                placeholder="What's on your mind? Share your story, achievement, or update…"
                rows={6}
                className="w-full border border-slate-200 rounded-2xl px-4 py-4 text-slate-700 text-[15px] leading-relaxed placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 focus:outline-none shadow-sm resize-none transition-all"
                required
              />
              <span className={`absolute bottom-3 right-4 text-xs font-medium ${content.length > MAX_CHARS * 0.85 ? "text-amber-500" : "text-slate-300"}`}>
                {content.length}/{MAX_CHARS}
              </span>
            </div>

            {/* Image upload area */}
            {!preview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-8 px-6 cursor-pointer transition-all
                  ${dragOver ? "border-indigo-400 bg-indigo-50/50" : "border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30"}`}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Image className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600">
                    {dragOver ? "Drop to upload" : "Attach an image"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Drag & drop or click to browse</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                <img src={preview} alt="Preview" className="w-full max-h-72 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all"
                >
                  <X size={14} />
                </button>
                <div className="absolute bottom-3 left-3">
                  <span className="text-xs bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                    {imageFile?.name}
                  </span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Link
                to="/feed"
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!content.trim() || status === "loading"}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Posting…
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
