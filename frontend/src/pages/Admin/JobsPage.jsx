import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Briefcase,
  MapPin,
  Calendar,
  Link as LinkIcon,
  FileText,
  Clock,
  ChevronRight
} from "lucide-react";
import jsPDF from "jspdf";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    applyLink: "",
    applyFrom: "",
    applyTo: "",
  });

  const [editJobData, setEditJobData] = useState({
    id: "",
    title: "",
    company: "",
    location: "",
    description: "",
    applyLink: "",
    applyFrom: "",
    applyTo: "",
  });

  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs-api`);
      const data = await res.json();

      const today = new Date();
      const formattedJobs = data.map((j) => ({
        id: j.Job_ID,
        title: j.Job_Title,
        company: j.Company_Name,
        location: j.Location,
        description: j.Description,
        link: j.Application_Link || "",
        applyFrom: j.Apply_From ? j.Apply_From.split("T")[0] : "",
        applyTo: j.Apply_To ? j.Apply_To.split("T")[0] : "",
        createdAt: j.Created_At,
        status: new Date(j.Apply_To) >= today ? "Active" : "Closed",
      }));

      setJobs(formattedJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async () => {
    const { title, company, location, description, applyLink, applyFrom, applyTo } = newJob;
    if (!title || !company || !location || !description || !applyFrom || !applyTo) {
      return alert("Please fill all required fields");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/jobs-api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newJob),
      });

      if (res.ok) {
        setShowCreateDialog(false);
        setNewJob({
          title: "",
          company: "",
          location: "",
          description: "",
          applyLink: "",
          applyFrom: "",
          applyTo: "",
        });
        fetchJobs();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to post job");
      }
    } catch (err) {
      console.error("Error posting job:", err);
    }
  };

  const handleEditClick = (job) => {
    setEditJobData({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      applyLink: job.link,
      applyFrom: job.applyFrom,
      applyTo: job.applyTo,
    });
    setShowEditDialog(true);
  };

  const handleUpdateJob = async () => {
    const { id, title, company, location, description, applyLink, applyFrom, applyTo } = editJobData;
    if (!title || !company || !location || !description || !applyFrom || !applyTo) {
      return alert("Please fill all required fields");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/jobs-api/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editJobData),
      });

      if (res.ok) {
        setShowEditDialog(false);
        fetchJobs();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update job");
      }
    } catch (err) {
      console.error("Error updating job:", err);
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs-api/${selectedJob.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setJobs(jobs.filter((j) => j.id !== selectedJob.id));
        setShowDeleteDialog(false);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to delete job");
      }
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  const handleDownloadPDF = (job) => {
    const doc = new jsPDF();
    doc.setFont("Inter", "sans-serif");
    doc.setFontSize(18);
    doc.text("💼 Job Details Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Job Title: ${job.title}`, 14, 35);
    doc.text(`Company: ${job.company}`, 14, 42);
    doc.text(`Location: ${job.location}`, 14, 49);
    doc.text(`Apply From: ${job.applyFrom}`, 14, 56);
    doc.text(`Apply To: ${job.applyTo}`, 14, 63);
    doc.text(`Application Link: ${job.link || "N/A"}`, 14, 70);
    doc.text("Description:", 14, 80);
    doc.text(job.description || "No description provided", 14, 88, { maxWidth: 180 });
    doc.save(`${job.title}_Details.pdf`);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = statusFilter === "All" || job.status === statusFilter;
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900">
            Jobs & Referrals Directory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse through career listings, review referral pipelines, and moderate active job opportunities.
          </p>
        </div>

        <div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-sm cursor-pointer gap-2"
          >
            <Plus className="h-4.5 w-4.5" /> Post Career opportunity
          </Button>
        </div>
      </header>

      {/* ── Search & Filters ── */}
      <section className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by job title, company, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-white rounded-lg shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-sm transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">
            Status:
          </span>
          <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200/50">
            {["All", "Active", "Closed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1 text-xs font-semibold font-display rounded-md transition-all duration-200 cursor-pointer ${
                  statusFilter === status
                    ? "bg-white text-brand-700 shadow-3xs font-bold"
                    : "text-gray-600 hover:text-brand-600"
                }`}
              >
                {status === "All" ? "All Statuses" : status}
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
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Job ID</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Title / Company</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Location</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Apply Window</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length ? (
                filteredJobs.map((job) => (
                  <TableRow key={job.id} className="hover:bg-gray-50/30 transition-colors">
                    <TableCell className="font-semibold text-gray-400 font-display text-sm">#{job.id}</TableCell>
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                          <Briefcase className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-display font-bold text-sm text-gray-900 truncate leading-snug">
                            {job.title}
                          </h4>
                          <p className="text-xs text-gray-400 truncate mt-0.5 font-medium">
                            {job.company}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 text-sm font-medium">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{job.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs font-semibold font-display">
                      <div className="flex items-center gap-1 text-gray-400 font-medium">
                        <span>{job.applyFrom}</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-gray-700">{job.applyTo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={job.status === "Active" ? "success" : "gray"} className="font-display border-none font-semibold">
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedJob(job);
                            setShowViewDialog(true);
                          }}
                          className="border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(job)}
                          className="border-gray-200 text-brand-600 hover:bg-brand-50 hover:border-brand-100 text-xs font-semibold cursor-pointer"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedJob(job);
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
                  <TableCell colSpan="6" className="text-center py-10 text-gray-500 font-display">
                    No active job placements scheduled.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Modal 1: Post job opportunity ── */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold font-display text-gray-900">
              Post Career Opportunity
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              Add a new job listing with referral details for active students.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4 text-left">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Job Title</label>
                <input
                  type="text"
                  placeholder="Software Development Engineer"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  placeholder="Salesforce"
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Office Location</label>
                <input
                  type="text"
                  placeholder="Bangalore, India (Hybrid)"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Application Link</label>
                <input
                  type="text"
                  placeholder="https://company.com/careers"
                  value={newJob.applyLink}
                  onChange={(e) => setNewJob({ ...newJob, applyLink: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Apply Window Start</label>
                <input
                  type="date"
                  value={newJob.applyFrom}
                  onChange={(e) => setNewJob({ ...newJob, applyFrom: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Apply Window End</label>
                <input
                  type="date"
                  value={newJob.applyTo}
                  onChange={(e) => setNewJob({ ...newJob, applyTo: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Description (Requirements / Details)</label>
              <textarea
                placeholder="Detailed job expectations..."
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                rows="4"
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleCreateJob} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold cursor-pointer">
              Post Placement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal 2: Edit job opportunity ── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold font-display text-gray-900">
              Edit Job Details
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              Modify career opportunity details and update active window settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4 text-left">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Job Title</label>
                <input
                  type="text"
                  value={editJobData.title}
                  onChange={(e) => setEditJobData({ ...editJobData, title: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  value={editJobData.company}
                  onChange={(e) => setEditJobData({ ...editJobData, company: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Office Location</label>
                <input
                  type="text"
                  value={editJobData.location}
                  onChange={(e) => setEditJobData({ ...editJobData, location: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Application Link</label>
                <input
                  type="text"
                  value={editJobData.applyLink}
                  onChange={(e) => setEditJobData({ ...editJobData, applyLink: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Apply Window Start</label>
                <input
                  type="date"
                  value={editJobData.applyFrom}
                  onChange={(e) => setEditJobData({ ...editJobData, applyFrom: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Apply Window End</label>
                <input
                  type="date"
                  value={editJobData.applyTo}
                  onChange={(e) => setEditJobData({ ...editJobData, applyTo: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Description (Requirements / Details)</label>
              <textarea
                value={editJobData.description}
                onChange={(e) => setEditJobData({ ...editJobData, description: e.target.value })}
                rows="4"
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleUpdateJob} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold cursor-pointer">
              Save Placements
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal 3: View job details ── */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100 text-left">
          {selectedJob && (
            <div className="space-y-4 font-sans">
              <DialogHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-bold font-display text-gray-900 leading-snug">
                    {selectedJob.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-400 mt-0.5">
                    {selectedJob.company}
                  </DialogDescription>
                </div>
                <Badge variant={selectedJob.status === "Active" ? "success" : "gray"}>
                  {selectedJob.status}
                </Badge>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4.5 w-4.5 text-gray-400 shrink-0" />
                  <span>{selectedJob.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4.5 w-4.5 text-gray-400 shrink-0" />
                  <span className="font-semibold text-2xs uppercase tracking-wide">Apply Window:</span>
                  <span className="text-xs font-semibold text-gray-700 font-display">
                    {selectedJob.applyFrom} to {selectedJob.applyTo}
                  </span>
                </div>
                {selectedJob.link && (
                  <div className="flex items-center gap-2 text-gray-600 min-w-0">
                    <LinkIcon className="h-4.5 w-4.5 text-gray-400 shrink-0" />
                    <a
                      href={selectedJob.link}
                      className="text-brand-600 hover:text-brand-800 font-semibold underline truncate text-xs"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {selectedJob.link}
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <h4 className="text-2xs font-semibold text-gray-400 uppercase tracking-widest font-display">
                  Placement Description
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/20 p-4 rounded-xl border border-gray-100 whitespace-pre-line max-h-40 overflow-y-auto scrollbar-thin">
                  {selectedJob.description}
                </p>
              </div>

              <DialogFooter className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
                <Button
                  onClick={() => handleDownloadPDF(selectedJob)}
                  className="bg-brand-50 text-brand-700 border border-brand-100/50 hover:bg-brand-100 flex gap-2 font-semibold cursor-pointer"
                >
                  <FileText className="h-4 w-4" /> Download PDF
                </Button>
                <Button variant="outline" onClick={() => setShowViewDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
                  Close Details
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Modal 4: Delete job posting ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold font-display text-gray-900">
              Confirm Placement Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              Warning: Discarding career listings removes their listings from all student job dashboards permanently.
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-gray-700 my-4">
            Are you sure you want to permanently erase <strong>{selectedJob?.title}</strong> job referral listing?
          </p>

          <DialogFooter className="flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
              Cancel Deletion
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="font-semibold cursor-pointer">
              Erase Placement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
