import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Landmark,
  Plus,
  Edit3,
  Trash2,
  DollarSign,
  Heart,
  TrendingUp,
  Clock,
  ArrowRight,
  FileText,
  Calendar,
  Image as ImageIcon
} from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("projects");

  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    target: "",
    category: "Education",
    image: "",
    startDate: "",
    endDate: "",
  });

  const [editData, setEditData] = useState({
    id: null,
    title: "",
    description: "",
    target: "",
    category: "Education",
    image: "",
    status: "Ongoing",
    raised: 0,
    startDate: "",
    endDate: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const categories = ["Education", "Health", "Environment", "Welfare", "Infrastructure", "Other"];
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const normalizeProjects = (data = []) =>
    data.map((p) => ({
      id: p.id ?? p.Project_ID ?? p.projectId,
      title: p.title ?? p.Project_title ?? p.projectTitle ?? "",
      description: p.description ?? p.Project_Description ?? "",
      target: Number(p.target ?? p.Funds_Required ?? p.FundsRequired ?? 0),
      raised: Number(p.raised ?? p.Fund_Raised ?? p.FundRaised ?? 0),
      category: p.category ?? p.Category ?? "",
      status: p.status ?? p.Project_Status ?? "Ongoing",
      image: p.image ?? p.Image ?? null,
      startDate: p.Start_Date ? p.Start_Date.split("T")[0] : null,
      endDate: p.End_Date ? p.End_Date.split("T")[0] : null,
    }));

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/projects`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(normalizeProjects(data));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllDonations = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/donations`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setAllDonations(data);
      }
    } catch (err) {
      console.error("Failed to fetch all donations log", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchAllDonations();
  }, []);

  const fetchTransactions = async (projectId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/donations/${projectId}/transactions`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        setTransactions([]);
        return;
      }
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Error fetching transactions", err);
      setTransactions([]);
    }
  };

  const handleViewTransactions = async (project) => {
    setSelectedProject(project);
    await fetchTransactions(project.id);
    setShowTransactionDialog(true);
  };

  const handleAddProject = async () => {
    if (!newProject.title || !newProject.target || !newProject.category) {
      alert("Please fill required fields");
      return;
    }

    const payload = {
      Project_title: newProject.title,
      Project_Description: newProject.description,
      Funds_Required: Number(newProject.target),
      Fund_Raised: 0,
      Category: newProject.category,
      Image: newProject.image || null,
      Start_Date: newProject.startDate || null,
      End_Date: newProject.endDate || null,
    };

    try {
      const res = await fetch(`${API_BASE}/admin/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to add project");
      }

      setShowAddDialog(false);
      setNewProject({ title: "", description: "", target: "", category: "Education", image: "", startDate: "", endDate: "" });
      fetchProjects();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEditDialog = (project) => {
    setEditData({
      id: project.id,
      title: project.title,
      description: project.description,
      target: project.target,
      category: project.category,
      image: project.image || "",
      status: project.status,
      raised: project.raised,
      startDate: project.startDate ?? "",
      endDate: project.endDate ?? "",
    });
    setSelectedProject(project);
    setShowEditDialog(true);
  };

  const handleEditSave = async () => {
    const id = editData.id;
    if (!id) return;

    const payload = {
      Project_title: editData.title,
      Project_Description: editData.description,
      Funds_Required: Number(editData.target),
      Fund_Raised: Number(editData.raised),
      Category: editData.category,
      Image: editData.image || null,
      Project_Status: editData.status || "Ongoing",
      Start_Date: editData.startDate || null,
      End_Date: editData.endDate || null,
    };

    try {
      const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to update project");
      }

      setShowEditDialog(false);
      fetchProjects();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`${API_BASE}/admin/projects/${selectedProject.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete");
      setShowDeleteDialog(false);
      fetchProjects();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownloadReport = (project, transactionsList = []) => {
    const doc = new jsPDF();
    doc.setFont("Inter", "sans-serif");
    doc.setFontSize(18);
    doc.text("🎓 Project Donation Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Project: ${project?.title || ""}`, 14, 35);
    doc.text(`Target: ₹${project?.target ?? 0}`, 14, 42);
    doc.text(`Raised: ₹${project?.raised ?? 0}`, 14, 49);
    const progress = project?.target ? ((project.raised / project.target) * 100).toFixed(1) : "0.0";
    doc.text(`Progress: ${progress}%`, 14, 56);

    if (transactionsList.length > 0) {
      autoTable(doc, {
        startY: 70,
        head: [["Donor", "Amount", "Mode", "Status", "Date"]],
        body: transactionsList.map((t) => [
          t.Donor_Name || `${t.User_Fname || "Anonymous"} ${t.User_Lname || ""}`,
          `₹${t.Amount ?? 0}`,
          t.Payment_Mode || "",
          t.Payment_Status || "",
          new Date(t.Payment_Time || t.Donation_Date || Date.now()).toLocaleDateString(),
        ]),
      });
    }

    doc.save(`${(project?.title || "project").replace(/\s+/g, "_")}_Report.pdf`);
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchesStatus =
      filterStatus === "All" ||
      (filterStatus === "Completed" && p.raised >= p.target) ||
      (filterStatus === "Active" && p.raised < p.target);
    return matchesSearch && matchesStatus;
  });

  const totalFundsTarget = projects.reduce((acc, curr) => acc + curr.target, 0);
  const totalFundsRaised = projects.reduce((acc, curr) => acc + curr.raised, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900">
            Fundraising & Finance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Oversee fundraising projects, track financial donations, and review system transaction logs.
          </p>
        </div>

        <div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-sm cursor-pointer gap-2"
          >
            <Plus className="h-4.5 w-4.5" /> Create Campaign
          </Button>
        </div>
      </header>

      {/* ── Financial KPI Snapshots ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-gray-200/80 shadow-2xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                Campaigns Active
              </p>
              <h3 className="text-2xl font-bold text-gray-900 font-display mt-0.5">
                {projects.length} Campaigns
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200/80 shadow-2xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                Total Funds Raised
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 font-display mt-0.5">
                ₹{totalFundsRaised.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200/80 shadow-2xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <Heart className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                Total Contributions
              </p>
              <h3 className="text-2xl font-bold text-rose-600 font-display mt-0.5">
                {allDonations.length} Contributions
              </h3>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Sub Navigation Tabs ── */}
      <section className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-3 px-4 text-sm font-semibold font-display border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === "projects"
              ? "border-brand-600 text-brand-700 font-bold"
              : "border-transparent text-gray-500 hover:text-brand-600"
          }`}
        >
          Active Campaigns
        </button>
        <button
          onClick={() => setActiveTab("donations")}
          className={`pb-3 px-4 text-sm font-semibold font-display border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === "donations"
              ? "border-brand-600 text-brand-700 font-bold"
              : "border-transparent text-gray-500 hover:text-brand-600"
          }`}
        >
          Donation Ledger
        </button>
      </section>

      {/* ── Tab Content ── */}
      {activeTab === "projects" ? (
        <>
          {/* Filters */}
          <section className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects or categories..."
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
                {["All", "Active", "Completed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3.5 py-1 text-xs font-semibold font-display rounded-md transition-all duration-200 cursor-pointer ${
                      filterStatus === status
                        ? "bg-white text-brand-700 shadow-3xs font-bold"
                        : "text-gray-600 hover:text-brand-600"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Table */}
          <Card className="bg-white border border-gray-200/80 shadow-3xs overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                  <TableRow>
                    <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">ID</TableHead>
                    <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Project Title</TableHead>
                    <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Target</TableHead>
                    <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Raised</TableHead>
                    <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Progress</TableHead>
                    <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Status</TableHead>
                    <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length ? (
                    filteredProjects.map((project) => {
                      const progress = project.target ? (project.raised / project.target) * 100 : 0;
                      const status = progress >= 100 ? "Completed" : "Active";
                      return (
                        <TableRow key={project.id} className="hover:bg-gray-50/30 transition-colors">
                          <TableCell className="font-semibold text-gray-400 font-display text-sm">#{project.id}</TableCell>
                          <TableCell className="p-4">
                            <div className="font-display font-bold text-sm text-gray-900 leading-snug">
                              {project.title}
                            </div>
                            <span className="text-3xs text-gray-400 font-semibold uppercase tracking-wider">
                              {project.category}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-950 font-bold font-display text-sm">₹{Number(project.target).toLocaleString()}</TableCell>
                          <TableCell className="text-brand-600 font-bold font-display text-sm">₹{Number(project.raised).toLocaleString()}</TableCell>
                          <TableCell className="w-48">
                            <div className="flex flex-col gap-1 pt-2">
                              <Progress value={progress} className="h-1.5" />
                              <span className="text-3xs text-gray-500 font-semibold font-display">
                                {progress.toFixed(1)}% of target met
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={status === "Active" ? "success" : "default"} className="font-display border-none font-semibold">
                              {status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right p-4">
                            <div className="flex justify-end gap-2 flex-wrap max-w-xs ml-auto">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowViewDialog(true);
                                }}
                                className="border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(project)}
                                className="border-gray-200 text-brand-600 hover:bg-brand-50 hover:border-brand-100 text-xs font-semibold cursor-pointer"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleViewTransactions(project)}
                                className="bg-brand-50 text-brand-700 border border-brand-100/50 hover:bg-brand-100 text-xs font-semibold cursor-pointer"
                              >
                                Transactions
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-xs font-semibold cursor-pointer"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan="7" className="text-center py-10 text-gray-500 font-display">
                        No projects launched yet. Click Create Campaign to launch one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Donations Ledger Tab */
        <Card className="bg-white border border-gray-200/80 shadow-3xs overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                <TableRow>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Donation ID</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Project Destination</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Amount (₹)</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Payment Mode</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Payment Status</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Donation Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allDonations.length ? (
                  allDonations.map((donation) => (
                    <TableRow key={donation.donationId} className="hover:bg-gray-50/30 transition-colors">
                      <TableCell className="font-semibold text-gray-400 font-display text-sm">#{donation.donationId}</TableCell>
                      <TableCell className="p-4">
                        <div className="font-display font-bold text-sm text-gray-900 leading-snug">
                          {donation.projectTitle}
                        </div>
                        <span className="text-3xs text-gray-400 font-semibold uppercase tracking-wider">
                          {donation.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-emerald-600 font-bold font-display text-sm">
                        ₹{Number(donation.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-gray-600 text-xs font-semibold uppercase">{donation.paymentMode || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={donation.paymentStatus === "Success" ? "default" : "secondary"}>
                          {donation.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs font-semibold font-display">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {new Date(donation.donationDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center py-10 text-gray-500 font-display">
                      No donations records synchronized in platform ledgers.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ── Dialog 1: Transactions for a specific project ── */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="max-w-4xl bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col max-h-[85vh]">
          <DialogHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold font-display text-gray-900 leading-snug">
                {selectedProject?.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                💸 Audit ledger entries and payment transactions.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {transactions.length > 0 ? (
              <div className="border border-gray-200/60 rounded-xl shadow-2xs overflow-hidden bg-white">
                <Table className="text-sm">
                  <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                    <TableRow>
                      <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Donor Name</TableHead>
                      <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Email Credentials</TableHead>
                      <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Amount</TableHead>
                      <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Mode</TableHead>
                      <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Status</TableHead>
                      <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Date</TableHead>
                      <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.Donation_ID} className="hover:bg-gray-50/30 transition-colors">
                        <TableCell className="font-display font-bold text-sm text-gray-900">
                          {txn.Donor_Name} {txn.Donor_LName || ""}
                        </TableCell>
                        <TableCell className="text-gray-500 text-xs">{txn.Donor_Email}</TableCell>
                        <TableCell className="text-right text-emerald-600 font-bold font-display text-xs">
                          ₹{Number(txn.Amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-500 text-xs uppercase font-semibold">{txn.Payment_Mode || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={txn.Payment_Status === "Success" ? "default" : "secondary"} className="border-none font-semibold text-[10px]">
                            {txn.Payment_Status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400 text-xs">
                          {new Date(txn.Payment_Time || txn.Donation_Date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-gray-500 text-xs italic">
                          {txn.Message || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-gray-400 py-10 font-display text-sm font-semibold">
                No financial donations audited for this campaign.
              </p>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-gray-100 flex justify-end gap-2.5">
            <Button
              className="bg-brand-50 text-brand-700 border border-brand-100/50 hover:bg-brand-100 flex gap-2 font-semibold cursor-pointer text-xs"
              onClick={() => handleDownloadReport(selectedProject, transactions)}
            >
              <FileText className="h-4 w-4" /> Download Report
            </Button>
            <Button variant="outline" onClick={() => setShowTransactionDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer text-xs">
              Close Audit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog 2: View project details ── */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100 text-left">
          {selectedProject && (
            <div className="space-y-4 font-sans">
              <DialogHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-bold font-display text-gray-900 leading-snug">
                    {selectedProject.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-400 mt-0.5">
                    {selectedProject.category}
                  </DialogDescription>
                </div>
                <Badge variant={selectedProject.status === "Ongoing" ? "success" : "default"}>
                  {selectedProject.status}
                </Badge>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-sm">
                <div>
                  <span className="text-3xs text-gray-400 uppercase tracking-wide font-semibold block">Target Required</span>
                  <span className="font-display font-bold text-gray-900">₹{Number(selectedProject.target).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-3xs text-gray-400 uppercase tracking-wide font-semibold block">Fund Raised</span>
                  <span className="font-display font-bold text-emerald-600">₹{Number(selectedProject.raised).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-2xs font-semibold text-gray-400 uppercase tracking-widest font-display">
                  Project Description
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/20 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap max-h-40 overflow-y-auto scrollbar-thin">
                  {selectedProject.description}
                </p>
              </div>

              {selectedProject.image && (
                <div className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50 max-h-48 flex items-center justify-center">
                  <img src={selectedProject.image} alt="Project" className="object-cover w-full h-full" />
                </div>
              )}

              <DialogFooter className="pt-4 border-t border-gray-100 flex justify-end">
                <Button variant="outline" onClick={() => setShowViewDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
                  Close details
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog 3: Edit Project ── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold font-display text-gray-900">
              Edit Campaign Details
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              Modify campaign goals, targets, and launch windows.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4 text-left">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Project Title</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Category</label>
                <select
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2.5 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Target Amount (₹)</label>
                <input
                  type="number"
                  value={editData.target}
                  onChange={(e) => setEditData({ ...editData, target: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2.5 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none cursor-pointer"
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Launch Date</label>
                <input
                  type="date"
                  value={editData.startDate ?? ""}
                  onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  value={editData.endDate ?? ""}
                  onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Image URL</label>
              <input
                type="text"
                value={editData.image}
                onChange={(e) => setEditData({ ...editData, image: e.target.value })}
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Campaign Overview</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows="3"
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleEditSave} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold cursor-pointer">
              Save Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog 4: Add New Project ── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold font-display text-gray-900">
              Launch Fundraising Campaign
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              Add new project parameters and details to open the donation pipeline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4 text-left">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Project Title *</label>
                <input
                  placeholder="Campaign title..."
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Category *</label>
                <select
                  value={newProject.category}
                  onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2.5 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none cursor-pointer font-medium text-gray-700"
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Launch Date</label>
                <input
                  type="date"
                  value={newProject.startDate || ""}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  value={newProject.endDate || ""}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Target Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="Required funds..."
                  value={newProject.target}
                  onChange={(e) => setNewProject({ ...newProject, target: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Image URL</label>
                <input
                  placeholder="Campaign poster link..."
                  value={newProject.image}
                  onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                  className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Campaign Overview</label>
              <textarea
                placeholder="Detailed explanation of required funds..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows="3"
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleAddProject} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold cursor-pointer">
              Launch Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog 5: Confirm Delete ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold font-display text-gray-900">
              Confirm Campaign Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              Warning: Erasing campaigns deletes their entries and transaction histories permanently.
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-gray-700 my-4">
            Are you sure you want to permanently delete campaign <strong>{selectedProject?.title}</strong>?
          </p>

          <DialogFooter className="flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
              Cancel Deletion
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject} className="font-semibold cursor-pointer">
              Erase Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
