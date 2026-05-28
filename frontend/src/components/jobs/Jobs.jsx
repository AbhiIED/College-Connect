import { useState, useEffect } from "react";
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30">
      {/* Hero */}
      <section className="relative pt-8 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
              <Sparkles className="w-3.5 h-3.5" /> Career Opportunities
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Job & Internship <span className="text-indigo-200">Portal</span>
          </h1>
          <p className="mt-3 text-base text-indigo-100/80 max-w-2xl">
            Discover career opportunities shared by alumni. Get referrals from your network.
          </p>
          {/* Search */}
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
            <input type="text" placeholder="Search by title, company, or location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-indigo-200/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all" />
          </div>
        </div>
      </section>

      {/* Filter Chips */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 -mt-5 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100/30 border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              {FILTER_CHIPS.map((chip) => (
                <button key={chip} onClick={() => setActiveFilter(chip)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${activeFilter === chip ? "bg-indigo-600 text-white shadow-md shadow-indigo-200/50" : "bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-100"}`}>
                  {chip === "Alumni Referral" && "🤝 "}{chip}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-gray-400 font-medium hidden sm:block">{filteredJobs.length} result{filteredJobs.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </section>

      {/* Split View */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left - Job List */}
          <div className="w-full lg:w-[420px] flex-shrink-0 space-y-3 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-2">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No jobs match your criteria</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <button key={job.id} onClick={() => setSelectedJob(job)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${selectedJob?.id === job.id ? "border-indigo-300 bg-indigo-50/50 shadow-md shadow-indigo-100/30" : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{job.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600 font-medium">{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">{job.location}</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 transition-colors ${selectedJob?.id === job.id ? "text-indigo-500" : "text-gray-300"}`} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className={`badge-chip border text-[10px] ${getTypeBadge(job.type)}`}>{job.type}</span>
                    {job.referral && <span className="badge-chip bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px]"><Star className="w-2.5 h-2.5" /> Alumni Referral</span>}
                    {job.location?.toLowerCase().includes("remote") && <span className="badge-chip bg-amber-50 text-amber-700 border border-amber-100 text-[10px]">Remote</span>}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Right - Detail */}
          <div className="flex-1 min-w-0">
            {selectedJob ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 lg:sticky lg:top-24">
                {selectedJob.referral && (
                  <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <Star className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700">Alumni Referral Available</span>
                    <span className="text-xs text-emerald-600 ml-auto">Ask for a referral from your network!</span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-base font-semibold text-indigo-600">{selectedJob.company}</span>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="w-3.5 h-3.5" />{selectedJob.location}</span>
                    </div>
                  </div>
                  <span className={`badge-chip border ${getTypeBadge(selectedJob.type)}`}>{selectedJob.type}</span>
                </div>

                <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> Posted {selectedJob.postedDate}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> Apply by {selectedJob.applyTo}</span>
                </div>

                <hr className="my-6 border-gray-100" />

                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedJob.description}</p>
                </div>

                {selectedJob.applyFrom && (
                  <div className="mt-5 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Application Window</h4>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{selectedJob.applyFrom}</span> — <span className="font-semibold">{selectedJob.applyTo}</span>
                    </p>
                  </div>
                )}

                {selectedJob.postedBy && (
                  <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs text-gray-600">Posted by <span className="font-semibold text-indigo-700">{selectedJob.postedBy}</span></span>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <a href={selectedJob.applyLink || "#"} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-200/50 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                    <ExternalLink className="w-4 h-4" /> Apply Now
                  </a>
                  {selectedJob.referral && (
                    <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-emerald-200 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition-all">
                      <Users className="w-4 h-4" /> Ask Referral
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Briefcase className="w-12 h-12 mb-3" />
                <p className="font-medium">Select a job to view details</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAB */}
      <button onClick={() => setShowDrawer(true)}
        className="fixed bottom-8 right-8 flex items-center bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200/50 px-5 py-3.5 z-40 hover:bg-indigo-700 hover:shadow-2xl hover:-translate-y-0.5 transition-all font-semibold text-sm gap-2">
        <Plus size={18} /> Post Job
      </button>

      {/* Post Job Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowDrawer(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-0 sm:top-0 sm:w-[480px] bg-white z-50 rounded-t-3xl sm:rounded-none shadow-2xl max-h-[90vh] sm:max-h-full sm:h-full overflow-y-auto">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 flex justify-between items-center px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Post a Job</h2>
                <button onClick={() => setShowDrawer(false)} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key: "title", label: "Job Title", ph: "e.g. SDE-I", type: "text" },
                  { key: "company", label: "Company", ph: "e.g. Amazon", type: "text" },
                  { key: "location", label: "Location", ph: "e.g. Hyderabad / Remote", type: "text" },
                  { key: "applyFrom", label: "Apply From", type: "date" },
                  { key: "applyTo", label: "Apply To", type: "date" },
                ].map(({ key, label, ph, type }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">{label}</label>
                    <input type={type} placeholder={ph} value={jobForm[key]} onChange={(e) => setJobForm({ ...jobForm, [key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 bg-gray-50 hover:bg-white transition-all" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Description</label>
                  <textarea rows={4} placeholder="Job description and requirements..." value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 bg-gray-50 hover:bg-white transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Apply Link <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="text" placeholder="https://..." value={jobForm.applyLink} onChange={(e) => setJobForm({ ...jobForm, applyLink: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 bg-gray-50 hover:bg-white transition-all" />
                </div>
                <button onClick={handleSubmitJob}
                  className="w-full py-3 mt-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-200/50 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                  Submit Job Posting
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
