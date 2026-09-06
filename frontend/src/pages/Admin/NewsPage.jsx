import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Newspaper,
  Calendar,
  CheckCircle,
  XCircle,
  Image,
  Tag
} from "lucide-react";
import { getNewsImage, handleNewsImageError } from "../../utils/imageUtils";

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [newArticle, setNewArticle] = useState({
    Title: "",
    Description: "",
    Details: "",
    Image_URL: "",
    Category: "Campus",
  });

  const [editArticleData, setEditArticleData] = useState({
    News_ID: "",
    Title: "",
    Description: "",
    Details: "",
    Image_URL: "",
    Category: "Campus",
    Is_Published: 1,
  });

  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchNews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/news?all=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setNews(data);
    } catch (err) {
      console.error("Failed to fetch news:", err);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleCreateNews = async () => {
    if (!newArticle.Title || !newArticle.Description) {
      return alert("Title and Description are required");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newArticle),
      });

      if (res.ok) {
        setShowCreateDialog(false);
        setNewArticle({
          Title: "",
          Description: "",
          Details: "",
          Image_URL: "",
          Category: "Campus",
        });
        fetchNews();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to create article");
      }
    } catch (err) {
      console.error("Error creating news article:", err);
    }
  };

  const handleEditClick = (article) => {
    setEditArticleData({
      News_ID: article.News_ID,
      Title: article.Title,
      Description: article.Description,
      Details: article.Details || "",
      Image_URL: article.Image_URL || "",
      Category: article.Category || "Campus",
      Is_Published: article.Is_Published,
    });
    setShowEditDialog(true);
  };

  const handleUpdateNews = async () => {
    if (!editArticleData.Title || !editArticleData.Description) {
      return alert("Title and Description are required");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/news/${editArticleData.News_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editArticleData),
      });

      if (res.ok) {
        setShowEditDialog(false);
        fetchNews();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update article");
      }
    } catch (err) {
      console.error("Error updating article:", err);
    }
  };

  const handleTogglePublish = async (article) => {
    const nextStatus = article.Is_Published === 1 ? 0 : 1;
    try {
      const res = await fetch(`${API_BASE_URL}/news/${article.News_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Title: article.Title,
          Description: article.Description,
          Details: article.Details,
          Image_URL: article.Image_URL,
          Category: article.Category,
          Is_Published: nextStatus,
        }),
      });

      if (res.ok) {
        setNews(news.map((n) => n.News_ID === article.News_ID ? { ...n, Is_Published: nextStatus } : n));
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to toggle status");
      }
    } catch (err) {
      console.error("Error toggling publish status:", err);
    }
  };

  const handleDeleteNews = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setNews(news.filter((n) => n.News_ID !== id));
        setShowDeleteDialog(false);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to delete article");
      }
    } catch (err) {
      console.error("Error deleting article:", err);
    }
  };

  const filteredNews = news.filter((article) => {
    const matchesCategory = filterCategory === "All" || article.Category === filterCategory;
    const matchesSearch =
      article.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.Description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (category) => {
    switch (category) {
      case "Campus":
        return "default";
      case "Alumni":
        return "success";
      case "Event":
        return "warning";
      case "Placement":
        return "outline";
      default:
        return "gray";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900">
            News Hub Moderation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Author and manage official announcements, placement highlights, campus news, and events updates.
          </p>
        </div>

        <div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-sm cursor-pointer gap-2"
          >
            <Plus className="h-4.5 w-4.5" /> Compose News
          </Button>
        </div>
      </header>

      {/* ── Search & Filter ── */}
      <section className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search news by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-white rounded-lg shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-sm transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">
            Category:
          </span>
          <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200/50">
            {["All", "Campus", "Alumni", "Event", "Placement"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 text-xs font-semibold font-display rounded-md transition-all duration-200 cursor-pointer ${
                  filterCategory === cat
                    ? "bg-white text-brand-700 shadow-3xs font-bold"
                    : "text-gray-600 hover:text-brand-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Table Grid ── */}
      <Card className="bg-white border border-gray-200/80 shadow-3xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50 border-b border-gray-100">
              <TableRow>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">News Article</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Category</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Published Date</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNews.length ? (
                filteredNews.map((article) => (
                  <TableRow key={article.News_ID} className="hover:bg-gray-50/30 transition-colors">
                    <TableCell className="max-w-md p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getNewsImage(article.Image_URL, article.Category)}
                          onError={(e) => handleNewsImageError(e, article.Category)}
                          alt="News"
                          className="h-10 w-16 object-cover rounded-lg border border-gray-100/50 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-display font-bold text-sm text-gray-900 truncate leading-snug">
                            {article.Title}
                          </h4>
                          <p className="text-xs text-gray-400 truncate mt-0.5 leading-normal">
                            {article.Description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getCategoryBadge(article.Category)} className="font-semibold font-display">
                        {article.Category || "Announcement"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs font-semibold font-display">
                      {new Date(article.Published_At).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleTogglePublish(article)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer transition-all duration-200 ${
                          article.Is_Published === 1
                            ? "bg-teal-50 border-teal-100 text-teal-700 hover:bg-teal-100/50"
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {article.Is_Published === 1 ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(article)}
                          className="border-gray-200 text-brand-600 hover:bg-brand-50 hover:border-brand-100 text-xs font-semibold cursor-pointer"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedArticle(article);
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
                  <TableCell colSpan="5" className="text-center py-10 text-gray-500 font-display">
                    No articles drafted. Click Compose News to write one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Modal 1: Compose News ── */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold font-display text-gray-900">
              Compose Announcement
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              Publish official announcements or campus newsletters to the feed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Category</label>
                <select
                  value={newArticle.Category}
                  onChange={(e) => setNewArticle({ ...newArticle, Category: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none cursor-pointer"
                >
                  <option>Campus</option>
                  <option>Alumni</option>
                  <option>Event</option>
                  <option>Placement</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Header Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/banner.jpg"
                  value={newArticle.Image_URL}
                  onChange={(e) => setNewArticle({ ...newArticle, Image_URL: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Article Title</label>
              <input
                type="text"
                placeholder="Major campus update..."
                value={newArticle.Title}
                onChange={(e) => setNewArticle({ ...newArticle, Title: e.target.value })}
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Short Description</label>
              <input
                type="text"
                placeholder="Brief summary of announcement..."
                value={newArticle.Description}
                onChange={(e) => setNewArticle({ ...newArticle, Description: e.target.value })}
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Details (HTML/Markdown allowed)</label>
              <textarea
                placeholder="Detailed explanation..."
                value={newArticle.Details}
                onChange={(e) => setNewArticle({ ...newArticle, Details: e.target.value })}
                rows="4"
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleCreateNews} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold cursor-pointer">
              Publish Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal 2: Edit News ── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold font-display text-gray-900">
              Edit Announcement
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              Modify news attributes and update details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Category</label>
                <select
                  value={editArticleData.Category}
                  onChange={(e) => setEditArticleData({ ...editArticleData, Category: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none cursor-pointer"
                >
                  <option>Campus</option>
                  <option>Alumni</option>
                  <option>Event</option>
                  <option>Placement</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Header Image URL</label>
                <input
                  type="text"
                  value={editArticleData.Image_URL}
                  onChange={(e) => setEditArticleData({ ...editArticleData, Image_URL: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Article Title</label>
              <input
                type="text"
                value={editArticleData.Title}
                onChange={(e) => setEditArticleData({ ...editArticleData, Title: e.target.value })}
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Short Description</label>
              <input
                type="text"
                value={editArticleData.Description}
                onChange={(e) => setEditArticleData({ ...editArticleData, Description: e.target.value })}
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Details (Markdown supported)</label>
              <textarea
                value={editArticleData.Details}
                onChange={(e) => setEditArticleData({ ...editArticleData, Details: e.target.value })}
                rows="4"
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleUpdateNews} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold cursor-pointer">
              Update Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal 3: Delete News ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold font-display text-gray-900">
              Discard Announcement
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              Confirm cancellation. This action removes the article permanently from user access feed.
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-gray-700 my-4">
            Are you sure you want to permanently delete <strong>{selectedArticle?.Title}</strong> from college portal logs?
          </p>

          <DialogFooter className="flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteNews(selectedArticle.News_ID)} className="font-semibold cursor-pointer">
              Discard Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
