import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Shield,
  Activity,
  UserCheck,
  Clock,
  Server,
  Mail,
  ShieldAlert,
  ArrowRight,
  Database
} from "lucide-react";
import { authFetch, API_BASE_URL } from "../../utils/api";

export default function SystemSettingsPage() {
  const [admins, setAdmins] = useState([]);
  const [otpLogs, setOtpLogs] = useState([]);
  const [serverHealth, setServerHealth] = useState({ status: "Connecting", dbTime: "" });
  const [activeTab, setActiveTab] = useState("admins");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch admins (uses authFetch for auto token refresh)
      const resAdmins = await authFetch("/admin/users");
      const dataAdmins = await resAdmins.json();
      if (Array.isArray(dataAdmins)) {
        setAdmins(dataAdmins.filter(u => u.User_Type === "Admin"));
      }

      // Fetch OTP Logs
      const resOtp = await authFetch("/admin/otp-logs");
      const dataOtp = await resOtp.json();
      if (Array.isArray(dataOtp)) {
        setOtpLogs(dataOtp);
      }

      // Check Server Health (public endpoint — raw fetch is fine)
      const resHealth = await fetch(`${API_BASE_URL}/`);
      const text = await resHealth.text();
      setServerHealth({
        status: "Healthy",
        dbTime: text.includes("DB time") ? text.split("DB time:")[1].trim().replace(")", "") : new Date().toLocaleTimeString()
      });

    } catch (err) {
      console.error("Failed to fetch system configurations:", err);
      setServerHealth({ status: "Offline", dbTime: "Error connecting to pool" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900 flex items-center gap-2">
            <Settings className="h-7 w-7 text-gray-700 animate-spin-slow" /> System Configs & Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Perform server health diagnostics, manage platform administrators, and review auth OTP verification logs.
          </p>
        </div>
      </header>

      {/* ── System Diagnostics Grid ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Server State */}
        <Card className="bg-white border border-gray-200/80 shadow-2xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                Server Diagnostics
              </p>
              <h4 className="text-lg font-bold text-gray-900 font-display mt-0.5 flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full inline-block ${serverHealth.status === "Healthy" ? "bg-teal-500 animate-ping" : "bg-red-500"}`} />
                {serverHealth.status}
              </h4>
            </div>
          </CardContent>
        </Card>

        {/* Database Sync */}
        <Card className="bg-white border border-gray-200/80 shadow-2xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                Database Pool Sync
              </p>
              <h4 className="text-2xs font-semibold text-gray-700 mt-1 select-all font-mono leading-tight">
                {serverHealth.dbTime || "Reading database pool..."}
              </h4>
            </div>
          </CardContent>
        </Card>

        {/* Admin Coverage */}
        <Card className="bg-white border border-gray-200/80 shadow-2xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">
                Admin Privilege List
              </p>
              <h4 className="text-lg font-bold text-gray-900 font-display mt-0.5">
                {admins.length} Verified profiles
              </h4>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Sub Navigation Tabs ── */}
      <section className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("admins")}
          className={`pb-3 px-4 text-sm font-semibold font-display border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === "admins"
              ? "border-brand-600 text-brand-700 font-bold"
              : "border-transparent text-gray-500 hover:text-brand-600"
          }`}
        >
          Administrators Directory
        </button>
        <button
          onClick={() => setActiveTab("otp")}
          className={`pb-3 px-4 text-sm font-semibold font-display border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === "otp"
              ? "border-brand-600 text-brand-700 font-bold"
              : "border-transparent text-gray-500 hover:text-brand-600"
          }`}
        >
          Auth Security Audits (OTP Verification Logs)
        </button>
      </section>

      {/* ── Tab Contents ── */}
      <Card className="bg-white border border-gray-200/80 shadow-3xs overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-sm text-gray-400 font-medium animate-pulse">
              Syncing secure databases...
            </div>
          ) : activeTab === "admins" ? (
            <Table>
              <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                <TableRow>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Admin ID</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Member Name</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Email Credentials</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Phone</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Privilege Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.User_ID} className="hover:bg-gray-50/30 transition-colors">
                    <TableCell className="font-semibold text-gray-400 font-display text-sm">#{admin.User_ID}</TableCell>
                    <TableCell className="font-display font-bold text-sm text-gray-900">
                      {admin.User_Fname} {admin.User_Lname}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">{admin.Email_ID}</TableCell>
                    <TableCell className="text-gray-600 text-sm font-semibold">{admin.Phone_no || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="warning" className="font-display font-semibold border-none">
                        System Admin
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                <TableRow>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">OTP ID</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Email Destination</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">OTP Code</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Purpose</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Issued Timestamp</TableHead>
                  <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Used Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otpLogs.length ? (
                  otpLogs.map((log) => (
                    <TableRow key={log.OTP_ID} className="hover:bg-gray-50/30 transition-colors">
                      <TableCell className="font-semibold text-gray-400 font-display text-sm">#{log.OTP_ID}</TableCell>
                      <TableCell className="font-semibold text-gray-800 text-sm">{log.Email}</TableCell>
                      <TableCell className="font-mono font-bold text-xs select-all text-brand-700 bg-brand-50/30 border border-brand-100/50 px-2 py-0.5 rounded-md inline-block mt-2">
                        {log.OTP_Code}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-display font-semibold uppercase tracking-wider text-[10px]">
                          {log.Purpose}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-xs font-semibold font-display">
                        {new Date(log.Created_At).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={log.Is_Used === 1 ? "success" : "warning"}
                          className="font-display font-semibold border-none"
                        >
                          {log.Is_Used === 1 ? "Used" : "Active"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center py-10 text-gray-500 font-display">
                      No security OTP codes issued recently.
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
