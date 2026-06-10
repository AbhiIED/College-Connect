import React, { useEffect, useState } from "react";
import { ThumbsUp, MessageCircle, Share2, PenSquare, Sparkles, ChevronDown, ChevronUp, Send, Trash2, AlertTriangle, Pencil, X, Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import maledp from "../../assets/dp-male.png";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";

export default function FeedSection() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);
  const [openComments, setOpenComments] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [copiedPostId, setCopiedPostId] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [commentToDelete, setCommentToDelete] = useState(null); // { postId, commentId }
  const [editingPost, setEditingPost] = useState(null); // { postId, content }
  const [editSaving, setEditSaving] = useState(false);

  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Parse user info
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = Number(user.User_ID);
  const isAdmin = Number(user.User_Type_ID) === 3;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
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

        // Map liked state from database HasLiked field
        const initialLikes = {};
        data.forEach((p) => {
          if (p.HasLiked) {
            initialLikes[p.Post_ID] = true;
          }
        });
        setLikedPosts(initialLikes);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
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
    try {
      const res = await fetch(`${BASE_URL}/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLikedPosts((prev) => ({ ...prev, [postId]: data.liked }));
        setPosts((prev) =>
          prev.map((p) =>
            p.Post_ID === postId
              ? {
                  ...p,
                  Likes_Count: data.liked
                    ? (p.Likes_Count || 0) + 1
                    : Math.max((p.Likes_Count || 0) - 1, 0),
                }
              : p
          )
        );
      }
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

  const handleDeletePost = (postId) => {
    setPostToDelete(postId);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    const postId = postToDelete;
    try {
      const res = await fetch(`${BASE_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.Post_ID !== postId));
      } else {
        alert(data.message || "Failed to delete post.");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("An error occurred while deleting the post.");
    } finally {
      setPostToDelete(null);
    }
  };

  const handleDeleteComment = (postId, commentId) => {
    setCommentToDelete({ postId, commentId });
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    const { postId, commentId } = commentToDelete;
    try {
      const res = await fetch(`${BASE_URL}/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).filter((c) => c.Comment_ID !== commentId),
        }));
        setPosts((prev) =>
          prev.map((p) =>
            p.Post_ID === postId
              ? { ...p, Comment_Count: Math.max((p.Comment_Count || 0) - 1, 0) }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    } finally {
      setCommentToDelete(null);
    }
  };

  const handleShare = (postId) => {
    const shareUrl = `${window.location.origin}/feed#post-${postId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedPostId(postId);
      setTimeout(() => {
        setCopiedPostId(null);
      }, 2000);
    }).catch(err => {
      console.error("Failed to copy link:", err);
    });
  };

  const handleEditPost = (post) => {
    setEditingPost({ postId: post.Post_ID, content: post.Content });
  };

  const confirmEditPost = async () => {
    if (!editingPost || !editingPost.content.trim()) return;
    setEditSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/posts/${editingPost.postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: editingPost.content }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.Post_ID === editingPost.postId ? { ...p, Content: data.content } : p
          )
        );
        setEditingPost(null);
      }
    } catch (err) {
      console.error("Error editing post:", err);
    } finally {
      setEditSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  /* ── Skeleton Loader ── */
  const SkeletonCard = () => (
    <div className="bg-white/90 border border-slate-100 rounded-2xl shadow-md overflow-hidden animate-pulse">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div className="w-11 h-11 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-200 rounded-full w-32" />
          <div className="h-2.5 bg-slate-100 rounded-full w-20" />
        </div>
      </div>
      <div className="px-5 space-y-2 pb-4">
        <div className="h-3 bg-slate-100 rounded-full w-full" />
        <div className="h-3 bg-slate-100 rounded-full w-5/6" />
        <div className="h-3 bg-slate-100 rounded-full w-2/3" />
      </div>
      <div className="flex border-t border-slate-100 mx-5 py-2 gap-2">
        <div className="flex-1 h-8 bg-slate-100 rounded-xl" />
        <div className="flex-1 h-8 bg-slate-100 rounded-xl" />
        <div className="flex-1 h-8 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );

  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30">

      {/* ── HERO BANNER ── */}
      <section className="relative pt-8 pb-4 overflow-hidden">
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
        <div className="relative max-w-5xl mx-auto px-6 py-8 text-center">
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
        {/* Skeleton loaders */}
        {loading && [1, 2, 3].map((n) => <SkeletonCard key={n} />)}

        {!loading && posts.length === 0 && (
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

        {!loading && visiblePosts.map((post, idx) => (
          <article
            key={post.Post_ID}
            id={`post-${post.Post_ID}`}
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
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400">{formatDate(post.Created_At)}</span>
                {Number(post.User_ID) === currentUserId && (
                  <button
                    type="button"
                    onClick={() => handleEditPost(post)}
                    title="Edit Post"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200"
                  >
                    <Pencil size={14} />
                  </button>
                )}
                {(Number(post.User_ID) === currentUserId || isAdmin) && (
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.Post_ID)}
                    title="Delete Post"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Content — or inline edit mode */}
            <div className="px-5 pt-4">
              {editingPost?.postId === post.Post_ID ? (
                <div className="space-y-2">
                  <textarea
                    autoFocus
                    rows={4}
                    value={editingPost.content}
                    onChange={(e) => setEditingPost((p) => ({ ...p, content: e.target.value }))}
                    className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 resize-none bg-indigo-50/30"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingPost(null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                    >
                      <X size={12} /> Cancel
                    </button>
                    <button
                      onClick={confirmEditPost}
                      disabled={editSaving || !editingPost.content.trim()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                      {editSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      {editSaving ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-700 leading-relaxed text-[15px]">{post.Content}</p>
              )}
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
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => handleShare(post.Post_ID)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-all"
                >
                  <Share2 size={16} />
                  Share
                </button>
                {copiedPostId === post.Post_ID && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded shadow-lg animate-bounce whitespace-nowrap z-10">
                    Link Copied!
                  </span>
                )}
              </div>
            </div>

            {/* Comments section */}
            {openComments[post.Post_ID] && (
              <div className="px-5 pb-5 pt-3 bg-slate-50/60 border-t border-slate-100 space-y-3 animate-fade-in">
                {/* Existing comments */}
                {(comments[post.Post_ID] || []).map((c) => (
                  <div key={c.Comment_ID} className="flex items-start gap-3 group">
                    <img
                      src={c.User_Image || maledp}
                      alt={c.User_Fname}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-100 shrink-0 mt-0.5"
                    />
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm border border-slate-100 flex-1 relative">
                      <p className="text-xs font-semibold text-indigo-700 mb-0.5">
                        {c.User_Fname} {c.User_Lname}
                      </p>
                      <p className="text-sm text-slate-700 leading-snug">{c.Comment}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {formatDate(c.Comment_Date)}
                      </span>
                      {(Number(c.User_ID) === currentUserId || Number(post.User_ID) === currentUserId || isAdmin) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(post.Post_ID, c.Comment_ID)}
                          title="Delete Comment"
                          className="absolute top-2 right-2 p-1 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
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
                    src={user.Profile_Pic ? `${BASE_URL}${user.Profile_Pic}` : maledp}
                    alt="me"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-100 shrink-0"
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

        {/* Load More button */}
        {!loading && hasMore && (
          <div className="pt-2 pb-8 text-center">
            <button
              onClick={() => setVisibleCount((c) => c + 5)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-indigo-200 text-indigo-700 font-semibold text-sm bg-white hover:bg-indigo-50 shadow-sm hover:shadow-md transition-all"
            >
              <ChevronDown className="w-4 h-4" />
              Load more posts ({posts.length - visibleCount} remaining)
            </button>
          </div>
        )}
        {!loading && !hasMore && posts.length > 5 && (
          <p className="text-center text-xs text-slate-400 pb-8">You've seen all {posts.length} posts ✓</p>
        )}
      </section>

      {/* Delete Post Confirmation Modal */}
      <Dialog open={postToDelete !== null} onOpenChange={(open) => !open && setPostToDelete(null)} size="md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle>Delete Post</DialogTitle>
          </div>
        </DialogHeader>
        <DialogContent>
          <DialogDescription>
            Are you sure you want to delete this post? This action is permanent and cannot be undone. All comments, likes, and attachments associated with this post will be deleted.
          </DialogDescription>
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setPostToDelete(null)}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDeletePost}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
          >
            Confirm Delete
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Comment Confirmation Modal */}
      <Dialog open={commentToDelete !== null} onOpenChange={(open) => !open && setCommentToDelete(null)} size="md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle>Delete Comment</DialogTitle>
          </div>
        </DialogHeader>
        <DialogContent>
          <DialogDescription>
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogDescription>
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setCommentToDelete(null)}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDeleteComment}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
          >
            Delete Comment
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
