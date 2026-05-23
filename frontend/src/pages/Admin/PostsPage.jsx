import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog";
import {
  Search,
  Trash2,
  FileText,
  Clock,
  Heart,
  MessageSquare,
  User,
  ShieldAlert,
  Image as ImageIcon
} from "lucide-react";
import jsPDF from "jspdf";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(
          data.map((p) => ({
            id: p.Post_ID,
            author: `${p.User_Fname} ${p.User_Lname}`,
            authorEmail: p.Email_ID,
            authorType: p.User_Type || "Member",
            content: p.Content,
            image: p.Image_URL,
            likes: p.Likes_Count,
            comments: p.Comment_Count,
            createdAt: p.Created_At,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenViewDialog = async (post) => {
    setSelectedPost(post);
    setShowViewDialog(true);
    // Fetch comments in real-time
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${post.id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        setComments([]);
      }
    } catch (e) {
      console.error("Error loading comments", e);
      setComments([]);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedPost) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/posts/${selectedPost.id}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setComments(comments.filter((c) => c.Comment_ID !== commentId));
        // Update local comment count
        setPosts(posts.map((p) => p.id === selectedPost.id ? { ...p, comments: Math.max(0, p.comments - 1) } : p));
        setSelectedPost(prev => prev ? { ...prev, comments: Math.max(0, prev.comments - 1) } : null);
      } else {
        alert("Failed to delete comment");
      }
    } catch (err) {
      console.error("Comment deletion error:", err);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${selectedPost.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== selectedPost.id));
        setShowDeleteDialog(false);
      } else {
        alert("Failed to delete post");
      }
    } catch (err) {
      console.error("Delete Post Error:", err);
    }
  };

  const handleDownloadReport = (post) => {
    const doc = new jsPDF();
    doc.setFont("Inter", "sans-serif");
    doc.setFontSize(18);
    doc.text("📄 Post Summary Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Author: ${post.author} (${post.authorType})`, 14, 35);
    doc.text(`Email ID: ${post.authorEmail}`, 14, 42);
    doc.text(`Likes: ${post.likes}`, 14, 49);
    doc.text(`Comments Count: ${post.comments}`, 14, 56);
    doc.text(`Created On: ${new Date(post.createdAt).toLocaleDateString()}`, 14, 63);
    doc.text("Content:", 14, 73);
    doc.text(post.content || "No content available", 14, 80, { maxWidth: 180 });
    doc.save(`${post.author.replace(/\s+/g, "_")}_Post_Report.pdf`);
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900">
            Content Moderation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review user-generated social posts, audit comments sections, or remove policy-violating content.
          </p>
        </div>
      </header>

      {/* ── Search & Filter ── */}
      <section className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by author or content keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-white rounded-lg shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-sm transition-all duration-200"
          />
        </div>
      </section>

      {/* ── Table Grid ── */}
      <Card className="bg-white border border-gray-200/80 shadow-3xs overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-sm text-gray-400 font-medium animate-pulse font-display">
              Syncing content logs...
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                <TableRow>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Author</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Email Credentials</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Post Content Preview</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider text-center">Likes</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider text-center">Comments</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Published Date</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.length ? (
                  filteredPosts.map((post) => (
                    <TableRow key={post.id} className="hover:bg-gray-50/30 transition-colors">
                      <TableCell className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-brand-50 text-brand-700 rounded-lg flex items-center justify-center font-bold font-display text-sm shadow-inner shrink-0">
                            {post.author?.[0]?.toUpperCase() || <User className="h-4.5 w-4.5" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-display font-bold text-sm text-gray-900 truncate leading-snug">
                              {post.author}
                            </h4>
                            <Badge variant={post.authorType === "Student" ? "success" : "default"} className="mt-0.5 border-none text-[10px] py-0 px-1 font-semibold font-display">
                              {post.authorType}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">{post.authorEmail}</TableCell>
                      <TableCell className="max-w-xs truncate text-gray-600 text-sm p-4">
                        <div className="flex items-center gap-2">
                          {post.image && <ImageIcon className="h-4 w-4 text-brand-500 shrink-0" />}
                          <span className="truncate">{post.content}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold font-display text-gray-700 text-sm">
                        {post.likes}
                      </TableCell>
                      <TableCell className="text-center font-semibold font-display text-gray-700 text-sm">
                        {post.comments}
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs font-semibold font-display">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenViewDialog(post)}
                            className="border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedPost(post);
                              setShowDeleteDialog(true);
                            }}
                            className="text-xs font-semibold cursor-pointer"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="7" className="text-center py-10 text-gray-500 font-display">
                      No feed listings drafted by students or alumni.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Modal 1: Post detail view with Comments moderation ── */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl shadow-xl border border-gray-100 text-left">
          {selectedPost && (
            <div className="space-y-5 font-sans">
              <DialogHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-bold font-display text-gray-900 leading-snug">
                    {selectedPost.author}'s Social Post
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-400 mt-0.5">
                    {selectedPost.authorEmail}
                  </DialogDescription>
                </div>
                <Badge variant={selectedPost.authorType === "Student" ? "success" : "default"}>
                  {selectedPost.authorType}
                </Badge>
              </DialogHeader>

              {/* Content Body */}
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                  {selectedPost.content}
                </div>

                {selectedPost.image && (
                  <div className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                      src={selectedPost.image}
                      alt="Post attachment"
                      className="max-h-60 object-contain w-full"
                    />
                  </div>
                )}

                {/* Audit metrics */}
                <div className="flex gap-4 text-xs font-semibold font-display text-gray-500 px-1.5">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-rose-500 fill-rose-50" /> {selectedPost.likes} Likes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-brand-600" /> {selectedPost.comments} Comments
                  </span>
                </div>

                {/* Comments sub-section */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <h4 className="text-2xs font-bold text-gray-400 uppercase tracking-widest font-display">
                    Interactive comments section ({comments.length})
                  </h4>
                  <div className="space-y-2">
                    {comments.length ? (
                      comments.map((comment) => (
                        <div
                          key={comment.Comment_ID}
                          className="flex items-start justify-between p-3 rounded-lg border border-gray-100 bg-white/50 text-xs"
                        >
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <span className="font-bold text-gray-900 font-display">
                              {comment.User_Fname} {comment.User_Lname}
                            </span>
                            <p className="text-gray-700 leading-normal whitespace-pre-line">
                              {comment.Comment}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteComment(comment.Comment_ID)}
                            className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 text-gray-400 cursor-pointer transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-2xs text-gray-400 font-medium italic pl-1">
                        No responses submitted.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <DialogFooter className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
                <Button
                  onClick={() => handleDownloadReport(selectedPost)}
                  className="bg-brand-50 text-brand-700 border border-brand-100/50 hover:bg-brand-100 flex gap-2 font-semibold cursor-pointer"
                >
                  <FileText className="h-4 w-4" /> Download PDF
                </Button>
                <Button variant="outline" onClick={() => setShowViewDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
                  Close Audit
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Modal 2: Delete Post ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold font-display text-gray-900 flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-red-600" /> Confirm Content Removal
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              Warning: Deleting user social feed listings removes them completely from all homepages and profile histories.
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-gray-700 my-4">
            Are you sure you want to permanently delete this social post authored by <strong>{selectedPost?.author}</strong> from portal servers?
          </p>

          <DialogFooter className="flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePost} className="font-semibold cursor-pointer">
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
