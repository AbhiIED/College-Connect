import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Network,
  ArrowRight,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Users
} from "lucide-react";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/admin/connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setConnections(data);
    } catch (err) {
      console.error("Failed to fetch connection logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepted":
        return "success";
      case "Pending":
        return "warning";
      case "Rejected":
        return "danger";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="h-3.5 w-3.5 text-teal-600 shrink-0" />;
      case "Pending":
        return <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />;
      case "Rejected":
        return <XCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />;
      default:
        return null;
    }
  };

  const filteredConnections = connections.filter((conn) => {
    const matchesStatus = statusFilter === "All" || conn.Status === statusFilter;
    const matchesSearch =
      conn.Sender_Fname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.Sender_Lname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.Receiver_Fname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.Receiver_Lname.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate status counters
  const totalCount = connections.length;
  const acceptedCount = connections.filter((c) => c.Status === "Accepted").length;
  const pendingCount = connections.filter((c) => c.Status === "Pending").length;
  const rejectedCount = connections.filter((c) => c.Status === "Rejected").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900">
            Network Connections Monitor
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Audit mentoring connections, student referral requests, and connection logs.
          </p>
        </div>
      </header>

      {/* ── Stats Summary Bar ── */}
      <section className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200/80 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                Total Requests
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1 font-display">
                {totalCount}
              </h3>
            </div>
            <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
              <Network className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200/80 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                Accepted Requests
              </p>
              <h3 className="text-2xl font-bold text-teal-600 mt-1 font-display">
                {acceptedCount}
              </h3>
            </div>
            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200/80 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                Pending Requests
              </p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1 font-display">
                {pendingCount}
              </h3>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200/80 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                Rejected Requests
              </p>
              <h3 className="text-2xl font-bold text-red-600 mt-1 font-display">
                {rejectedCount}
              </h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Filters & Search ── */}
      <section className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by sender or receiver name..."
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
            {["All", "Pending", "Accepted", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1 text-xs font-semibold font-display rounded-md transition-all duration-200 cursor-pointer ${
                  statusFilter === status
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

      {/* ── Connection Logs Table ── */}
      <Card className="bg-white border border-gray-200/80 shadow-3xs overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-sm text-gray-400 font-medium animate-pulse">
              Syncing network databases...
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                <TableRow>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Connection ID</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Sender Member</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider text-center">Direction</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Receiver Member</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Requested At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConnections.length ? (
                  filteredConnections.map((conn) => (
                    <TableRow key={conn.Connection_ID} className="hover:bg-gray-50/30 transition-colors">
                      <TableCell className="font-semibold text-gray-400 font-display text-sm">#{conn.Connection_ID}</TableCell>
                      <TableCell>
                        <div className="font-display font-bold text-sm text-gray-900">
                          {conn.Sender_Fname} {conn.Sender_Lname}
                        </div>
                        <Badge variant={conn.Sender_Type === "Student" ? "success" : "default"} className="mt-0.5 border-none text-3xs py-0 px-1 font-semibold font-display">
                          {conn.Sender_Type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex h-7 w-7 bg-gray-50 rounded-full border border-gray-100 items-center justify-center text-gray-400">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-display font-bold text-sm text-gray-900">
                          {conn.Receiver_Fname} {conn.Receiver_Lname}
                        </div>
                        <Badge variant={conn.Receiver_Type === "Student" ? "success" : "default"} className="mt-0.5 border-none text-3xs py-0 px-1 font-semibold font-display">
                          {conn.Receiver_Type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-1">
                          {getStatusIcon(conn.Status)}
                          <Badge variant={getStatusBadge(conn.Status)} className="font-display font-semibold border-none">
                            {conn.Status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs font-semibold font-display">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {new Date(conn.Created_At).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center py-10 text-gray-500 font-display">
                      No network request logs found matching search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
