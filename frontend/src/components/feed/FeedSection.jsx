import React, { useEffect, useState } from "react";
import { ThumbsUp, MessageCircle, Share2, PenSquare, Sparkles, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Link } from "react-router-dom";
import maledp from "../../assets/dp-male.png";

export default function FeedSection() {
  const [posts, setPosts] = useState([]);
  const [openComments, setOpenComments] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [likedPosts, setLikedPosts] = useState({});

  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const postsWithPics = data.map((p) => ({
          ...p,
          User_Image: p.User_Image ? `${BASE_URL}${p.User_Image}` : null,
        }));
        setPosts(postsWithPics);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, [token]);

  const toggleComments = async (postId) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!openComments[postId]) {
      try {
        const res = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const commentsWithPics = data.map((c) => ({
          ...c,
          User_Image: c.User_Image ? `${BASE_URL}${c.User_Image}` : null,
        }));
        setComments((prev) => ({ ...prev, [postId]: commentsWithPics }));
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    }
  };

  const handleLike = async (postId) => {
    if (likedPosts[postId]) return;
    try {
      await fetch(`${BASE_URL}/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.Post_ID === postId ? { ...p, Likes_Count: (p.Likes_Count || 0) + 1 } : p
        )
      );
      setLikedPosts((prev) => ({ ...prev, [postId]: true }));
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleAddComment = async (postId, e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!newComment[postId]?.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentText: newComment[postId] }),
      });
      const data = await res.json();
      if (data.success) {
        const commentWithPic = {
          ...data.comment,
          User_Image: data.comment.User_Image ? `${BASE_URL}${data.comment.User_Image}` : null,
        };
        setComments((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), commentWithPic],
        }));
        setNewComment((prev) => ({ ...prev, [postId]: "" }));
        setPosts((prev) =>
          prev.map((p) =>
            p.Post_ID === postId ? { ...p, Comment_Count: (p.Comment_Count || 0) + 1 } : p
          )
        );
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30">

      {/* ── HERO BANNER ── */}
      <section className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/4" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-14 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Alumni Network
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Community <span className="text-indigo-200">Feed</span>
          </h1>
          <p className="mt-3 text-indigo-100/80 text-lg max-w-xl mx-auto leading-relaxed">
            Stay connected — share your journey, celebrate achievements, and inspire fellow alumni.
          </p>
          <div className="mt-6">
            <Link
              to="/create-post"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all hover:scale-[1.02]"
            >
              <PenSquare className="w-4 h-4" /> Create a Post
            </Link>
          </div>
        </div>
      </section>

      {/* ── POSTS ── */}
      <section className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {posts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
              <MessageCircle className="w-9 h-9 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-1">No posts yet</h3>
            <p className="text-slate-400 text-sm">Be the first to share something with the community.</p>
            <Link
              to="/create-post"
              className="mt-5 inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md"
            >
              <PenSquare className="w-4 h-4" /> Write a Post
            </Link>
          </div>
        )}

        {posts.map((post, idx) => (
          <article
            key={post.Post_ID}
            className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-md hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Author row */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-slate-50">
              <div className="relative">
                <img
                  src={post.User_Image || maledp}
                  alt={post.User_Fname}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-100"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 leading-tight truncate">
                  {post.User_Fname} {post.User_Lname}
                </p>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                    Class of {post.Graduation_Year}
                  </span>
                  {post.Course && (
                    <span className="text-xs font-medium bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
                      {post.Course}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{formatDate(post.Created_At)}</span>
            </div>

            {/* Content */}
            <div className="px-5 pt-4">
              <p className="text-slate-700 leading-relaxed text-[15px]">{post.Content}</p>
            </div>

            {/* Post image */}
            {post.Image_URL?.trim() && (
              <div className="mt-4 px-5">
                <img
                  src={post.Image_URL}
                  alt="post"
                  className="w-full rounded-xl object-cover max-h-80 shadow-sm"
                />
              </div>
            )}

            {/* Stats row */}
            <div className="px-5 pt-3 pb-1 flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {post.Likes_Count || 0} {post.Likes_Count === 1 ? "like" : "likes"}
              </span>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs text-slate-400">
                {post.Comment_Count || 0} {post.Comment_Count === 1 ? "comment" : "comments"}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex border-t border-slate-100 mx-5 mt-1">
              <button
                type="button"
                onClick={() => handleLike(post.Post_ID)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-xl transition-all
                  ${likedPosts[post.Post_ID]
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
              >
                <ThumbsUp size={16} className={likedPosts[post.Post_ID] ? "fill-indigo-500 text-indigo-500" : ""} />
                Like
              </button>
              <button
                type="button"
                onClick={() => toggleComments(post.Post_ID)}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-500 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all"
              >
                <MessageCircle size={16} />
                Comment
                {openComments[post.Post_ID] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-all"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>

            {/* Comments section */}
            {openComments[post.Post_ID] && (
              <div className="px-5 pb-5 pt-3 bg-slate-50/60 border-t border-slate-100 space-y-3 animate-fade-in">
                {/* Existing comments */}
                {(comments[post.Post_ID] || []).map((c) => (
                  <div key={c.Comment_ID} className="flex items-start gap-3">
                    <img
                      src={c.User_Image || maledp}
                      alt={c.User_Fname}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-100 shrink-0 mt-0.5"
                    />
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm border border-slate-100 flex-1">
                      <p className="text-xs font-semibold text-indigo-700 mb-0.5">
                        {c.User_Fname} {c.User_Lname}
                      </p>
                      <p className="text-sm text-slate-700 leading-snug">{c.Comment}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {formatDate(c.Comment_Date)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* No comments yet */}
                {(comments[post.Post_ID] || []).length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">No comments yet. Be the first!</p>
                )}

                {/* New comment input */}
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={maledp}
                    alt="me"
                    className="w-8 h-8 rounded-full ring-1 ring-indigo-100 shrink-0"
                  />
                  <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-full shadow-sm overflow-hidden pr-1 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <input
                      type="text"
                      placeholder="Write a comment…"
                      value={newComment[post.Post_ID] || ""}
                      onChange={(e) =>
                        setNewComment((prev) => ({ ...prev, [post.Post_ID]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddComment(post.Post_ID, e);
                      }}
                      className="flex-1 px-4 py-2 text-sm text-slate-700 bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleAddComment(post.Post_ID, e)}
                      className="p-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
