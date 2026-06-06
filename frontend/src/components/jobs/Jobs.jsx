import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, MapPin, Calendar, Plus, X, Search, Building2,
  Clock, ExternalLink, Users, Star, Filter, ChevronRight, Sparkles
} from "lucide-react";

const MOCK_JOBS = [
  { id: "m1", title: "SDE-I", company: "Amazon", location: "Hyderabad", description: "Design and build scalable distributed systems. Work with world-class engineers on products used by millions.", applyLink: "#", applyFrom: "2026-06-01", applyTo: "2026-07-15", postedDate: "2026-05-20", referral: true, type: "Full-time", postedBy: "Rohit Sharma (B.Tech CSE 2021)" },
  { id: "m2", title: "Data Analyst", company: "Quantiphi", location: "Bengaluru", description: "Analyze large datasets, build dashboards and reports, and provide data-driven insights to stakeholders.", applyLink: "#", applyFrom: "2026-06-05", applyTo: "2026-07-10", postedDate: "2026-05-22", referral: true, type: "Full-time", postedBy: "Priya Nair (M.Tech DS 2020)" },
  { id: "m3", title: "SDE Intern", company: "Microsoft", location: "Remote", description: "6-month internship working on Azure cloud services. Great opportunity to learn from industry leaders.", applyLink: "#", applyFrom: "2026-06-10", applyTo: "2026-08-01", postedDate: "2026-05-25", referral: false, type: "Internship", postedBy: "Ankit Gupta (B.Tech CSE 2022)" },
  { id: "m4", title: "Product Manager", company: "Flipkart", location: "Bengaluru", description: "Own the product lifecycle for consumer-facing features. Collaborate with design and engineering teams.", applyLink: "#", applyFrom: "2026-06-01", applyTo: "2026-06-30", postedDate: "2026-05-18", referral: true, type: "Full-time", postedBy: "Sneha Joshi (MBA 2019)" },
  { id: "m5", title: "ML Engineer", company: "Google", location: "Hyderabad", description: "Build and deploy machine learning models for Google Search quality improvements.", applyLink: "#", applyFrom: "2026-06-15", applyTo: "2026-08-15", postedDate: "2026-05-24", referral: false, type: "Full-time", postedBy: "Vikram Patel (M.Tech AI 2018)" },
  { id: "m6", title: "Frontend Intern", company: "Razorpay", location: "Remote", description: "Work on the payments dashboard used by thousands of businesses. React, TypeScript, and design systems.", applyLink: "#", applyFrom: "2026-06-01", applyTo: "2026-07-20", postedDate: "2026-05-26", referral: true, type: "Internship", postedBy: "Kavya Reddy (B.Tech IT 2023)" },
];

const FILTER_CHIPS = ["All", "Full-time", "Internship", "Remote", "Alumni Referral"];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [jobForm, setJobForm] = useState({ title: "", company: "", location: "", description: "", applyLink: "", applyFrom: "", applyTo: "" });

  const sidebarRef = useRef(null);
  const detailRef = useRef(null);
  const drawerRef = useRef(null);

  // Prevent scroll events from bubbling to LocomotiveScroll container
  useEffect(() => {
    const handleScrollPropagation = (e) => {
      e.stopPropagation();
    };

    const sidebarNode = sidebarRef.current;
    const detailNode = detailRef.current;
    const drawerNode = drawerRef.current;

    if (sidebarNode) {
      sidebarNode.addEventListener("wheel", handleScrollPropagation, { passive: false });
      sidebarNode.addEventListener("touchmove", handleScrollPropagation, { passive: false });
    }
    if (detailNode) {
      detailNode.addEventListener("wheel", handleScrollPropagation, { passive: false });
      detailNode.addEventListener("touchmove", handleScrollPropagation, { passive: false });
    }
    if (drawerNode) {
      drawerNode.addEventListener("wheel", handleScrollPropagation, { passive: false });
      drawerNode.addEventListener("touchmove", handleScrollPropagation, { passive: false });
    }

    return () => {
      if (sidebarNode) {
        sidebarNode.removeEventListener("wheel", handleScrollPropagation);
        sidebarNode.removeEventListener("touchmove", handleScrollPropagation);
      }
      if (detailNode) {
        detailNode.removeEventListener("wheel", handleScrollPropagation);
        detailNode.removeEventListener("touchmove", handleScrollPropagation);
      }
      if (drawerNode) {
        drawerNode.removeEventListener("wheel", handleScrollPropagation);
        drawerNode.removeEventListener("touchmove", handleScrollPropagation);
      }
    };
  }, [filteredJobs, selectedJob, showDrawer]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE_URL}/jobs-api`);
        const data = await res.json();
        const formatted = data.map((job) => ({
          id: job.Job_ID, title: job.Job_Title, company: job.Company_Name,
          location: job.Location, postedDate: new Date(job.Created_At).toISOString().split("T")[0],
          description: job.Description, applyLink: job.Application_Link,
          applyFrom: job.Apply_From, applyTo: job.Apply_To,
          referral: false, type: "Full-time", postedBy: "Alumni",
        }));
        const allJobs = formatted.length > 0 ? formatted : MOCK_JOBS;
        setJobs(allJobs);
        setFilteredJobs(allJobs);
        if (allJobs.length > 0) setSelectedJob(allJobs[0]);
      } catch {
        setJobs(MOCK_JOBS);
        setFilteredJobs(MOCK_JOBS);
        setSelectedJob(MOCK_JOBS[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    let result = jobs;
    const q = searchQuery.toLowerCase();
    if (q) result = result.filter((j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.location.toLowerCase().includes(q));
    if (activeFilter === "Full-time") result = result.filter((j) => j.type === "Full-time");
    else if (activeFilter === "Internship") result = result.filter((j) => j.type === "Internship");
    else if (activeFilter === "Remote") result = result.filter((j) => j.location?.toLowerCase().includes("remote"));
    else if (activeFilter === "Alumni Referral") result = result.filter((j) => j.referral);
    setFilteredJobs(result);
  }, [searchQuery, activeFilter, jobs]);

  const handleSubmitJob = async () => {
    if (!jobForm.title || !jobForm.company || !jobForm.location || !jobForm.description || !jobForm.applyFrom || !jobForm.applyTo) { alert("Please fill all required fields"); return; }
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await fetch(`${API_BASE_URL}/jobs-api`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(jobForm) });
      if (!res.ok) throw new Error("Failed");
      alert("Job posted successfully!");
      setShowDrawer(false);
      setJobForm({ title: "", company: "", location: "", description: "", applyLink: "", applyFrom: "", applyTo: "" });
    } catch { alert("Error posting job"); }
  };

  const getTypeBadge = (type) => {
    const styles = { "Full-time": "bg-indigo-50 text-indigo-700 border-indigo-100", "Internship": "bg-cyan-50 text-cyan-700 border-cyan-100" };
    return styles[type] || "bg-gray-50 text-gray-700 border-gray-100";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading opportunities…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-b from-slate-50 via-white to-indigo-50/20">
      {/* Sleek Page Header */}
      <header className="bg-white border-b border-slate-200/80 px-6 lg:px-8 py-5 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-100 uppercase tracking-wide">
                <Sparkles className="w-3 h-3" /> Career Portal
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Job & Internship opportunities
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Discover, apply, and ask for referrals directly from alumni who post opportunities.
            </p>
          </div>

          {/* Actions & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, company, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all shadow-sm"
              />
            </div>
            <button
              onClick={() => setShowDrawer(true)}
              className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Post a Job
            </button>
          </div>
        </div>
      </header>

      {/* Filter Row */}
      <section className="bg-slate-50/50 border-b border-slate-200/60 px-6 lg:px-8 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <div className="flex gap-2">
              {FILTER_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setActiveFilter(chip)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                    activeFilter === chip
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {chip === "Alumni Referral" && "🤝 "}{chip}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
            Showing {filteredJobs.length} position{filteredJobs.length !== 1 ? "s" : ""}
          </span>
        </div>
      </section>

      {/* Split View Container */}
      <section className="flex-1 overflow-hidden py-6 bg-slate-50/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full">
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Left - Job List */}
            <div
              ref={sidebarRef}
              data-lenis-prevent
              data-scroll-prevent
              className="w-full lg:w-[400px] flex-shrink-0 overflow-y-auto overscroll-contain pr-2 space-y-3 scrollbar-thin"
            >
              {filteredJobs.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200/60 rounded-2xl">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold text-xs">No opportunities match your criteria</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try adjusting your filters or search terms</p>
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`w-full text-left p-4.5 rounded-xl border transition-all duration-150 ${
                      selectedJob?.id === job.id
                        ? "border-indigo-600 bg-indigo-50/10 shadow-sm"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-bold text-slate-800 truncate">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-600 font-semibold">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-colors ${
                          selectedJob?.id === job.id ? "text-indigo-600" : "text-slate-300"
                        }`}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getTypeBadge(job.type)}`}>
                        {job.type}
                      </span>
                      {job.referral && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-semibold">
                          <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" /> Referral
                        </span>
                      )}
                      {job.location?.toLowerCase().includes("remote") && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-semibold">
                          Remote
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Right - Detail */}
            <div
              ref={detailRef}
              data-lenis-prevent
              data-scroll-prevent
              className="flex-1 min-w-0 overflow-y-auto overscroll-contain bg-white rounded-2xl border border-slate-200/80 shadow-sm"
            >
              {selectedJob ? (
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Referral Available Banner */}
                  {selectedJob.referral && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50/80 border border-emerald-100 shadow-sm">
                      <div className="p-2 bg-emerald-500 rounded-lg text-white">
                        <Star className="w-4 h-4 fill-white text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-800">Alumni Referral Available</h4>
                        <p className="text-[11px] text-emerald-600 mt-0.5">Contact the poster to get referred directly to this position.</p>
                      </div>
                    </div>
                  )}

                  {/* Header Details */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                        {selectedJob.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs">
                        <span className="font-bold text-indigo-600 text-sm">{selectedJob.company}</span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-slate-500"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedJob.location}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-center ${getTypeBadge(selectedJob.type)}`}>
                      {selectedJob.type}
                    </span>
                  </div>

                  {/* Meta Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-semibold text-slate-400">Date Posted</p>
                        <p className="font-bold text-slate-800 mt-0.5">{selectedJob.postedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-semibold text-slate-400">Apply By</p>
                        <p className="font-bold text-slate-800 mt-0.5">{selectedJob.applyTo}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Job Description */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Job Description</h3>
                    <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/30 p-5 rounded-xl border border-slate-100/50 font-medium">
                      {selectedJob.description}
                    </div>
                  </div>

                  {/* Application Window Description */}
                  {selectedJob.applyFrom && (
                    <div className="p-4 rounded-xl border border-indigo-50 bg-indigo-50/20">
                      <h4 className="text-xs font-bold text-indigo-800 mb-1.5 uppercase tracking-wide">Application Window</h4>
                      <p className="text-xs text-indigo-900/80 leading-relaxed font-medium">
                        Applications open from <span className="font-bold">{selectedJob.applyFrom}</span> until <span className="font-bold">{selectedJob.applyTo}</span>. Ensure all materials are submitted prior to this date.
                      </p>
                    </div>
                  )}

                  {/* Shared By Alumnus */}
                  {selectedJob.postedBy && (
                    <div className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-100">
                        {selectedJob.postedBy.split(" ")[0][0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Shared By</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedJob.postedBy}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <a
                      href={selectedJob.applyLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" /> Apply Directly
                    </a>
                    {selectedJob.referral && (
                      <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-emerald-200 text-emerald-700 font-bold text-xs hover:bg-emerald-50/80 active:bg-emerald-50 transition-all">
                        <Users className="w-4 h-4 text-emerald-600" /> Request Referral
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                    <Briefcase className="w-7 h-7 text-slate-300" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">Select an Opportunity</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[240px]">Select a job listing from the sidebar to view full descriptions, application details, and referral options.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Post Job Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowDrawer(false)}
            />
            <motion.div
              ref={drawerRef}
              data-lenis-prevent
              data-scroll-prevent
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-0 sm:top-0 sm:w-[480px] bg-white z-50 rounded-t-3xl sm:rounded-none shadow-2xl max-h-[90vh] sm:max-h-full sm:h-full overflow-y-auto scrollbar-thin"
            >
              <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 flex justify-between items-center px-6 py-4.5 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Post an Opportunity</h2>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key: "title", label: "Job Title", ph: "e.g. Software Engineer I", type: "text" },
                  { key: "company", label: "Company Name", ph: "e.g. Amazon", type: "text" },
                  { key: "location", label: "Location", ph: "e.g. Hyderabad / Remote / Bengaluru", type: "text" },
                  { key: "applyFrom", label: "Application Starts", type: "date" },
                  { key: "applyTo", label: "Application Ends", type: "date" },
                ].map(({ key, label, ph, type }) => (
                  <div key={key}>
                    <label className="text-[11px] font-bold text-slate-700 mb-1.5 block uppercase tracking-wide">{label}</label>
                    <input
                      type={type}
                      placeholder={ph}
                      value={jobForm[key]}
                      onChange={(e) => setJobForm({ ...jobForm, [key]: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 hover:bg-white transition-all font-semibold"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1.5 block uppercase tracking-wide">Description & Requirements</label>
                  <textarea
                    rows={4}
                    placeholder="Enter detailed job description, roles, responsibilities, and qualifications..."
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 hover:bg-white transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 mb-1.5 block uppercase tracking-wide">Apply Link <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="https://company.com/careers"
                    value={jobForm.applyLink}
                    onChange={(e) => setJobForm({ ...jobForm, applyLink: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 hover:bg-white transition-all font-semibold"
                  />
                </div>
                <button
                  onClick={handleSubmitJob}
                  className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 hover:shadow-lg transition-all"
                >
                  Submit Opportunity
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
