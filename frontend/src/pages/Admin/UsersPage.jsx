import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog";
import {
  Search,
  UserPlus,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  MoreVertical,
  X,
  GraduationCap,
  Building2,
  Briefcase,
  BookOpen,
  Globe,
  Award
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [showQueryDialog, setShowQueryDialog] = useState(false);
  const [queryText, setQueryText] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  const [newAdmin, setNewAdmin] = useState({
    fname: "",
    lname: "",
    gender: "Male",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    role: "Administrator",
  });

  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleViewUser = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedUser(data);
      setShowViewDialog(true);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const handleRaiseQueryClick = (user) => {
    setSelectedUser(user);
    setQueryText("");
    setShowQueryDialog(true);
  };

  const handleSubmitQuery = async () => {
    if (!queryText || !queryText.trim()) {
      return alert("Query message cannot be empty");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.User_ID}/raise-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: queryText }),
      });

      if (res.ok) {
        setShowQueryDialog(false);
        fetchUsers();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to raise query");
      }
    } catch (err) {
      console.error("Error raising query:", err);
    }
  };

  const handleToggleVerification = async (user) => {
    const nextStatus = !user.Is_Verified;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${user.User_ID}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVerified: nextStatus }),
      });

      if (res.ok) {
        // Optimistic UI update
        setUsers(users.map((u) => u.User_ID === user.User_ID ? { ...u, Is_Verified: nextStatus ? 1 : 0 } : u));
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to toggle verification");
      }
    } catch (err) {
      console.error("Error toggling verification:", err);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u.User_ID !== id));
      setShowDeleteDialog(false);
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.fname || !newAdmin.lname || !newAdmin.email || !newAdmin.password || !newAdmin.confirmPassword)
      return alert("Please fill all fields");
    if (newAdmin.password !== newAdmin.confirmPassword)
      return alert("Passwords do not match");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/add-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAdmin),
      });

      const data = await res.json();
      if (res.ok) {
        setShowAddAdminDialog(false);
        // Reset Admin Form
        setNewAdmin({
          fname: "",
          lname: "",
          gender: "Male",
          phone: "",
          email: "",
          password: "",
          confirmPassword: "",
          address: "",
          role: "Administrator",
        });
        fetchUsers();
      } else {
        alert(data.error || "Failed to add admin");
      }
    } catch (err) {
      console.error("Error adding admin:", err);
    }
  };

  const filteredUsers = users.filter((user) => {
    let matchesType = false;
    if (filterType === "All") {
      matchesType = true;
    } else if (filterType === "Pending") {
      matchesType = !user.Is_Verified && user.User_Type !== "Admin";
    } else {
      matchesType = user.User_Type === filterType;
    }
    const matchesSearch =
      user.User_Fname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.User_Lname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.Email_ID.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900">
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse through directory members, verify student/alumni claims, or add administrators.
          </p>
        </div>

        <div>
          <Button
            onClick={() => setShowAddAdminDialog(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-sm cursor-pointer gap-2"
          >
            <UserPlus className="h-4.5 w-4.5" /> Add Admin
          </Button>
        </div>
      </header>

      {/* ── Filters & Search ── */}
      <section className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-white rounded-lg shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-sm transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">
            Filter:
          </span>
          <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200/50">
            {["All", "Alumni", "Student", "Admin", "Pending"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3.5 py-1 text-xs font-semibold font-display rounded-md transition-all duration-200 cursor-pointer ${
                  filterType === type
                    ? "bg-white text-brand-700 shadow-3xs font-bold"
                    : "text-gray-600 hover:text-brand-600"
                }`}
              >
                {type === "All" ? "All Users" : type === "Pending" ? "Pending Approval" : type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── User Database Table ── */}
      <Card className="bg-white border border-gray-200/80 shadow-3xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50 border-b border-gray-100">
              <TableRow>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">User ID</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Member</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Email ID</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Type</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Verification</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Phone</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length ? (
                filteredUsers.map((u) => (
                  <TableRow key={u.User_ID} className="hover:bg-gray-50/30 transition-colors">
                    <TableCell className="font-semibold text-gray-400 font-display text-sm">#{u.User_ID}</TableCell>
                    <TableCell className="font-medium text-gray-900">
                      <div className="font-display font-bold text-sm">
                        {u.User_Fname} {u.User_Lname}
                      </div>
                      <span className="text-3xs text-gray-400 font-medium tracking-wide uppercase">
                        {u.Gender}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">{u.Email_ID}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.User_Type === "Admin"
                            ? "warning"
                            : u.User_Type === "Student"
                            ? "success"
                            : "default"
                        }
                        className="font-display font-semibold border-none"
                      >
                        {u.User_Type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleVerification(u)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer transition-all duration-200 ${
                          u.Is_Verified
                            ? "bg-teal-50 border-teal-100 text-teal-700 hover:bg-teal-100/50"
                            : "bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100/50"
                        }`}
                      >
                        {u.Is_Verified ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Unverified</span>
                          </>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm font-medium">{u.Phone_no || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewUser(u.User_ID)}
                          className="border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                        >
                          View
                        </Button>
                        {u.User_Type !== "Admin" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRaiseQueryClick(u)}
                            className="border-gray-200 text-amber-600 hover:bg-amber-50 hover:border-amber-100 text-xs font-semibold cursor-pointer font-sans transition-colors"
                          >
                            Raise Query
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedUser(u);
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
                    No directory members match search filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Modal 1: User Profile Details view ── */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100 font-sans max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold font-display text-gray-900">
                User Directory Details
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-1">
                Database registration credentials audit.
              </DialogDescription>
            </div>
          </DialogHeader>

          {selectedUser ? (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold font-display text-lg shadow-inner">
                  {(selectedUser.User_Fname?.[0] + selectedUser.User_Lname?.[0]).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 font-display text-base">
                    {selectedUser.User_Fname} {selectedUser.User_Lname}
                  </h4>
                  <Badge variant={selectedUser.User_Type === "Admin" ? "warning" : selectedUser.User_Type === "Student" ? "success" : "default"}>
                    {selectedUser.User_Type}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="font-medium truncate">{selectedUser.Email_ID}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{selectedUser.Phone_no || "No number verified"}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="h-4.5 w-4.5 text-gray-400 mt-0.5" />
                  <span className="leading-snug">{selectedUser.Address || "No addresses listed"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <UserCheck className="h-4.5 w-4.5 text-gray-400" />
                  <span className="font-semibold text-2xs uppercase tracking-wide">
                    Verification State:
                  </span>
                  <Badge variant={selectedUser.Is_Verified ? "success" : "warning"} className="font-bold">
                    {selectedUser.Is_Verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </div>

              {/* Academic Profile (For Students) */}
              {selectedUser.User_Type === "Student" && (
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <h5 className="font-bold text-gray-900 font-display text-sm flex items-center gap-1.5">
                    <GraduationCap className="h-4.5 w-4.5 text-brand-600" />
                    Academic Profile
                  </h5>
                  <div className="grid grid-cols-1 gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-sm">
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-100/50">
                      <span className="text-gray-400 font-medium">Scholar No:</span>
                      <span className="font-semibold text-gray-700">{selectedUser.Scholar_No || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-100/50">
                      <span className="text-gray-400 font-medium">Department:</span>
                      <span className="font-semibold text-gray-700">{selectedUser.Student_Department || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-100/50">
                      <span className="text-gray-400 font-medium">Course:</span>
                      <span className="font-semibold text-gray-700">{selectedUser.Student_Course || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-100/50">
                      <span className="text-gray-400 font-medium">Current Year:</span>
                      <span className="font-semibold text-gray-700">{selectedUser.Current_Year || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-gray-400 font-medium">Graduation Year:</span>
                      <span className="font-semibold text-gray-700">{selectedUser.Student_Graduation_Year || "—"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Profile (For Alumni) */}
              {selectedUser.User_Type === "Alumni" && (
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <h5 className="font-bold text-gray-900 font-display text-sm flex items-center gap-1.5">
                    <Briefcase className="h-4.5 w-4.5 text-brand-600" />
                    Professional & Alumni Profile
                  </h5>
                  <div className="grid grid-cols-1 gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-sm">
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-100/50">
                      <span className="text-gray-400 font-medium">Enrollment No:</span>
                      <span className="font-semibold text-gray-700">{selectedUser.Enrollment_No || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-100/50">
                      <span className="text-gray-400 font-medium">Department:</span>
                      <span className="font-semibold text-gray-700">{selectedUser.Alumni_Department || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-100/50">
                      <span className="text-gray-400 font-medium">Course:</span>
                      <span className="font-semibold text-gray-700">{selectedUser.Alumni_Course || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-100/50">
                      <span className="text-gray-400 font-medium">Graduation Year:</span>
                      <span className="font-semibold text-gray-700">{selectedUser.Alumni_Graduation_Year || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-100/50">
                      <span className="text-gray-400 font-medium">Job Title:</span>
                      <span className="font-semibold text-gray-700">{selectedUser.Job_Title || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-100/50">
                      <span className="text-gray-400 font-medium">Company Name:</span>
                      <span className="font-semibold text-gray-700">{selectedUser.Company_Name || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-100/50">
                      <span className="text-gray-400 font-medium">Current Location:</span>
                      <span className="font-semibold text-gray-700">
                        {selectedUser.Current_City && selectedUser.Current_Country 
                          ? `${selectedUser.Current_City}, ${selectedUser.Current_Country}` 
                          : selectedUser.Current_City || selectedUser.Current_Country || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-gray-100/50">
                      <span className="text-gray-400 font-medium">Sector:</span>
                      <span className="font-semibold text-gray-700">{selectedUser.Sector || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1 py-0.5 border-b border-gray-100/50">
                      <span className="text-gray-400 font-medium flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" /> Skills:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedUser.Skills ? (
                          selectedUser.Skills.split(",").map((s, idx) => (
                            <Badge key={idx} variant="outline" className="text-3xs bg-white text-gray-600 border-gray-200">
                              {s.trim()}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500 font-medium italic text-xs">No skills listed</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 py-0.5">
                      <span className="text-gray-400 font-medium">About:</span>
                      <p className="text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-gray-100 leading-relaxed max-h-24 overflow-y-auto whitespace-pre-line">
                        {selectedUser.About || "No bio description provided."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center py-6 text-sm text-gray-500 font-medium">Loading credentials...</p>
          )}

          <DialogFooter className="pt-4 border-t border-gray-100 flex justify-end">
            <Button variant="outline" onClick={() => setShowViewDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
              Close Audit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal 2: Raise Verification Query ── */}
      <Dialog open={showQueryDialog} onOpenChange={setShowQueryDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100 font-sans">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold font-display text-gray-900 flex items-center gap-2">
              <span className="text-amber-500">⚠️</span> Raise Verification Query
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              Flag this account and notify the user about incorrect or missing details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <p className="text-sm text-gray-600">
              Explain clearly what information needs to be corrected by <strong>{selectedUser?.User_Fname} {selectedUser?.User_Lname}</strong> (e.g. invalid graduation year, outdated employment history, incorrect scholar/enrollment number).
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Query Message</label>
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Enter query details for the user..."
                rows="4"
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none resize-none font-sans"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setShowQueryDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSubmitQuery} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer">
              Submit Query
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal 3: Confirm User account Deletion ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold font-display text-gray-900">
              Confirm Account Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              Warning: Deleting user accounts is absolute and removes all related connections, posts, and details permanently.
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-gray-700 my-4">
            Are you sure you want to permanently erase <strong>{selectedUser?.User_Fname} {selectedUser?.User_Lname}</strong> from directory access database?
          </p>

          <DialogFooter className="flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
              Keep Account
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteUser(selectedUser.User_ID)} className="font-semibold cursor-pointer">
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal 4: Add New Administrator ── */}
      <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold font-display text-gray-900">
              Add New Administrator
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              Add a new administrator to secure platform management control.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="First Name"
                value={newAdmin.fname}
                onChange={(e) => setNewAdmin({ ...newAdmin, fname: e.target.value })}
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
              <input
                placeholder="Last Name"
                value={newAdmin.lname}
                onChange={(e) => setNewAdmin({ ...newAdmin, lname: e.target.value })}
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
              <select
                value={newAdmin.gender}
                onChange={(e) => setNewAdmin({ ...newAdmin, gender: e.target.value })}
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none cursor-pointer"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <input
                placeholder="Phone Number"
                value={newAdmin.phone}
                onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
              <input
                placeholder="Email Address"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none col-span-2"
              />
              <input
                type="password"
                placeholder="System Password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={newAdmin.confirmPassword}
                onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
              <textarea
                placeholder="Residential Address"
                value={newAdmin.address}
                onChange={(e) => setNewAdmin({ ...newAdmin, address: e.target.value })}
                rows="2"
                className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none col-span-2"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setShowAddAdminDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleAddAdmin} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold cursor-pointer">
              Save Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
