import { useState, useEffect } from "react";
import { Briefcase, MapPin, Calendar, Plus, X } from "lucide-react";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer modal state
  const [showDrawer, setShowDrawer] = useState(false);

  // Job form state (UPDATED)
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    applyLink: "",
    applyFrom: "",
    applyTo: "",
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE_URL}/jobs-api`);
        const data = await res.json();

        const formattedJobs = data.map((job) => ({
          id: job.Job_ID,
          title: job.Job_Title,
          company: job.Company_Name,
          location: job.Location,
          postedDate: new Date(job.Created_At).toISOString().split("T")[0],
          description: job.Description,
          applyLink: job.Application_Link,
          applyFrom: job.Apply_From,
          applyTo: job.Apply_To,
        }));

        setJobs(formattedJobs);
        setFilteredJobs(formattedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSearch = () => {
    const q = searchQuery.toLowerCase();
    setFilteredJobs(
      jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q)
      )
    );
  };

  // Submit job posting
  const handleSubmitJob = async () => {
    // Basic validation
    if (
      !jobForm.title ||
      !jobForm.company ||
      !jobForm.location ||
      !jobForm.description ||
      !jobForm.applyFrom ||
      !jobForm.applyTo
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await fetch(`${API_BASE_URL}/jobs-api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobForm),
      });

      if (!res.ok) throw new Error("Failed to post job");

      alert("Job posted successfully!");
      setShowDrawer(false);

      setJobForm({
        title: "",
        company: "",
        location: "",
        description: "",
        applyLink: "",
        applyFrom: "",
        applyTo: "",
      });

      // Refresh job list
      const refresh = await fetch(`${API_BASE_URL}/jobs-api`);
      const data = await refresh.json();
      setFilteredJobs(
        data.map((job) => ({
          id: job.Job_ID,
          title: job.Job_Title,
          company: job.Company_Name,
          location: job.Location,
          postedDate: new Date(job.Created_At).toISOString().split("T")[0],
          description: job.Description,
          applyLink: job.Application_Link,
          applyFrom: job.Apply_From,
          applyTo: job.Apply_To,
        }))
      );
    } catch (err) {
      console.error(err);
      alert("Error posting job");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg font-medium text-gray-600 animate-pulse">
          Loading job postings…
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 py-12 px-6 relative mt-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-3">
          Job Opportunities
        </h1>
        <p className="text-gray-600 text-center mb-10">
          Discover career opportunities shared by alumni and companies.
        </p>

        {/* Search bar */}
        <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder="Search by title, company, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-5 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>

        {/* Job list */}
        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <p className="text-center text-gray-500">No jobs found.</p>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="text-blue-600" size={20} />
                  {job.title}
                </h2>

                <p className="text-gray-700 font-medium mt-1">{job.company}</p>
                <p className="flex items-center text-gray-500 text-sm mt-2 gap-1">
                  <MapPin size={16} className="text-blue-500" />
                  {job.location}
                </p>
                <p className="flex items-center text-gray-400 text-xs mt-1 gap-1">
                  <Calendar size={14} /> Posted on: {job.postedDate}
                </p>

                <p className="mt-3 text-gray-600 text-sm">{job.description}</p>

                {/* NEW: Apply From / To */}
                <p className="text-sm text-gray-500 mt-2">
                  📅 Apply From: <b>{job.applyFrom}</b> — <b>{job.applyTo}</b>
                </p>

                <a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 transition"
                >
                  Apply Now
                </a>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Post Job Button */}
      <button
        onClick={() => setShowDrawer(true)}
        className="fixed bottom-120 right-6 flex items-center bg-blue-600 text-white rounded-full shadow-lg px-4 py-3 z-50 hover:bg-blue-700"
      >
        <Plus size={20} className="mr-2" />
        Post Job
      </button>

      {/* Drawer Modal */}
      {showDrawer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-end">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 shadow-xl animate-slide-up">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Post a Job</h2>
              <button onClick={() => setShowDrawer(false)}>
                <X size={24} className="text-gray-600 hover:text-black" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Job Title"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                className="w-full border rounded-lg p-2"
              />

              <input
                type="text"
                placeholder="Company Name"
                value={jobForm.company}
                onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                className="w-full border rounded-lg p-2"
              />

              <input
                type="text"
                placeholder="Location"
                value={jobForm.location}
                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                className="w-full border rounded-lg p-2"
              />

              {/* Apply From */}
              <input
                type="date"
                value={jobForm.applyFrom}
                onChange={(e) =>
                  setJobForm({ ...jobForm, applyFrom: e.target.value })
                }
                className="w-full border rounded-lg p-2"
              />

              {/* Apply To */}
              <input
                type="date"
                value={jobForm.applyTo}
                onChange={(e) =>
                  setJobForm({ ...jobForm, applyTo: e.target.value })
                }
                className="w-full border rounded-lg p-2"
              />

              <textarea
                placeholder="Job Description"
                rows={4}
                value={jobForm.description}
                onChange={(e) =>
                  setJobForm({ ...jobForm, description: e.target.value })
                }
                className="w-full border rounded-lg p-2"
              />

              <input
                type="text"
                placeholder="Apply Link"
                value={jobForm.applyLink}
                onChange={(e) =>
                  setJobForm({ ...jobForm, applyLink: e.target.value })
                }
                className="w-full border rounded-lg p-2"
              />
            </div>

            <button
              onClick={handleSubmitJob}
              className="w-full mt-5 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
            >
              Submit Job
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
