import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  MessageCircle, Search, X, Users, Sparkles, Loader2,
  UserCheck, UserX, Clock, Briefcase, Building2, GraduationCap,
  Send, ChevronDown, Filter, ArrowRight, UserMinus, AlertTriangle
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token");

/* ── Gradient helpers ── */
const gradients = [
  "from-indigo-500 to-purple-600", "from-purple-500 to-pink-600",
  "from-blue-500 to-indigo-600", "from-violet-500 to-purple-600",
  "from-indigo-600 to-blue-600", "from-fuchsia-500 to-purple-600",
];
const getGradient = (id) => gradients[(id || 0) % gradients.length];
const getInitials = (fname, lname) =>
  `${(fname || "?")[0]}${(lname || "?")[0]}`.toUpperCase();

/* ═══════════════════════════ ConnectionCard ═══════════════════════════ */
function ConnectionCard({ conn, onChat, onViewProfile, onRemove }) {
  const name = `${conn.User_Fname} ${conn.User_Lname}`;
  const gradient = getGradient(conn.Connected_User_ID);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-300 overflow-hidden hover:-translate-y-1">
      {/* Header gradient */}
      <div className={`relative h-20 bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")"
        }} />
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
        {/* Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
          <button onClick={() => onViewProfile(conn)} title="View profile">
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/30">
              Profile <ArrowRight className="w-3 h-3" />
            </span>
          </button>
          <button
            onClick={() => onRemove(conn)}
            title="Remove connection"
            className="inline-flex items-center gap-1 bg-red-500/80 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full border border-red-300/30 hover:bg-red-600/90 transition"
          >
            <UserMinus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Avatar */}
      <div className="px-5 -mt-8">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg font-bold shadow-lg ring-4 ring-white`}>
          {conn.Profile_Pic && !conn.Profile_Pic.includes("default") ? (
            <img src={conn.Profile_Pic.startsWith("http") ? conn.Profile_Pic : `${API}${conn.Profile_Pic}`}
              alt={name} className="w-full h-full rounded-2xl object-cover" />
          ) : getInitials(conn.User_Fname, conn.User_Lname)}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-3 pb-5">
        <h3 className="text-base font-bold text-gray-900 truncate">{name}</h3>

        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            conn.User_Type_ID === 2 
              ? "text-purple-700 bg-purple-50" 
              : "text-indigo-700 bg-indigo-50"
          }`}>
            <GraduationCap className="w-3 h-3" /> 
            {conn.User_Type_ID === 2 ? "Student" : "Alumni"}
          </span>
          {conn.Course && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              {conn.Course} {conn.Graduation_Year && `'${String(conn.Graduation_Year).slice(-2)}`}
            </span>
          )}
        </div>

        <div className="my-2.5 border-t border-gray-100" />

        <div className="space-y-1.5 min-h-[40px] flex flex-col justify-center">
          {conn.User_Type_ID === 2 ? (
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <GraduationCap className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>Current Year: {conn.Current_Year || "N/A"}</span>
            </div>
          ) : (
            <>
              {conn.Job_Title && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{conn.Job_Title}</span>
                </div>
              )}
              {conn.Company_Name && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{conn.Company_Name}</span>
                </div>
              )}
            </>
          )}
        </div>

        <button onClick={() => onChat(conn)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
          <MessageCircle className="w-4 h-4" /> Message
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════ PendingRequestCard ═══════════════════════════ */
function PendingRequestCard({ req, onRespond }) {
  const [responding, setResponding] = useState(false);
  const name = `${req.User_Fname} ${req.User_Lname}`;

  const handleRespond = async (status) => {
    setResponding(true);
    await onRespond(req.Connection_ID, status);
    setResponding(false);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradient(req.Sender_ID)} flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0`}>
        {req.Profile_Pic && !req.Profile_Pic.includes("default") ? (
          <img src={req.Profile_Pic.startsWith("http") ? req.Profile_Pic : `${API}${req.Profile_Pic}`}
            alt={name} className="w-full h-full rounded-xl object-cover" />
        ) : getInitials(req.User_Fname, req.User_Lname)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-400 mt-0.5">Wants to connect with you</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={() => handleRespond("Accepted")} disabled={responding}
          className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50" title="Accept">
          <UserCheck className="w-4 h-4" />
        </button>
        <button onClick={() => handleRespond("Rejected")} disabled={responding}
          className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50" title="Decline">
          <UserX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════ ChatWindow ═══════════════════════════ */
function ChatWindow({ user, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const name = `${user.User_Fname} ${user.User_Lname}`;
  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").User_ID;
  const partnerId = user.Connected_User_ID || user.User_ID || user.Sender_ID;
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Establish socket connection to backend URL
    socketRef.current = io(API);

    // Register active user session
    socketRef.current.emit("register_user", currentUserId);

    // Register listener for incoming real-time messages
    socketRef.current.on("receive_message", (msg) => {
      if (msg.Sender_ID === partnerId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Cleanup connection
    return () => {
      socketRef.current.disconnect();
    };
  }, [partnerId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const msgPayload = {
      senderId: currentUserId,
      receiverId: partnerId,
      text: input
    };

    // Broadcast message via WebSockets
    socketRef.current.emit("send_message", msgPayload);

    // Instantly push to screen locally
    const localMsg = {
      Message_ID: Math.random(),
      Sender_ID: currentUserId,
      Receiver_ID: partnerId,
      Message: input,
      Sent_At: new Date()
    };

    setMessages((prev) => [...prev, localMsg]);
    setInput("");
  };

  return createPortal(
    <div className="fixed bottom-6 right-6 w-80 h-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-[9999] overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold`}>
            {getInitials(user.User_Fname, user.User_Lname)}
          </div>
          <h2 className="font-semibold text-sm truncate">{name}</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto text-sm space-y-2">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-xs">Start a conversation with {user.User_Fname}</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.Sender_ID === currentUserId;
            return (
              <div key={msg.Message_ID || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                  isMe ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"
                }`}>{msg.Message}</div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white">
        <input type="text" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          placeholder="Type a message..." />
        <button onClick={sendMessage}
          className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm">
          <Send size={14} />
        </button>
      </div>
    </div>,
    document.body
  );
}

/* ═══════════════════════════ Main Component ═══════════════════════════ */
export default function Connections() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [chatUser, setChatUser] = useState(null);
  const [activeTab, setActiveTab] = useState("connections");
  const [confirmRemove, setConfirmRemove] = useState(null); // connection object

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [connRes, pendRes] = await Promise.all([
          fetch(`${API}/connections`, { headers }),
          fetch(`${API}/connections/pending`, { headers }),
        ]);

        if (!connRes.ok || !pendRes.ok) {
          if (connRes.status === 401 || pendRes.status === 401) throw new Error("Unauthorized");
          throw new Error("Failed to fetch connections");
        }

        const [connData, pendData] = await Promise.all([connRes.json(), pendRes.json()]);
        setConnections(connData);
        setPending(pendData);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRespond = async (connectionId, status) => {
    try {
      const res = await fetch(`${API}/connections/${connectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setPending((p) => p.filter((r) => r.Connection_ID !== connectionId));
        if (status === "Accepted") {
          // Refresh connections
          const connRes = await fetch(`${API}/connections`, { headers: { Authorization: `Bearer ${getToken()}` } });
          if (connRes.ok) setConnections(await connRes.json());
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleRemoveConnection = async () => {
    if (!confirmRemove) return;
    try {
      const res = await fetch(`${API}/connections/${confirmRemove.Connection_ID}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setConnections((prev) => prev.filter((c) => c.Connection_ID !== confirmRemove.Connection_ID));
      }
    } catch (err) { console.error(err); }
    finally { setConfirmRemove(null); }
  };

  const filtered = connections.filter((c) => {
    const name = `${c.User_Fname} ${c.User_Lname}`.toLowerCase();
    return !search.trim() || name.includes(search.toLowerCase()) ||
      (c.Job_Title || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.Company_Name || "").toLowerCase().includes(search.toLowerCase());
  });

  const tabs = [
    { key: "connections", label: "My Connections", count: connections.length, icon: Users },
    { key: "pending", label: "Pending Requests", count: pending.length, icon: Clock },
  ];

  /* ── Loading ── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Loading your network...</p>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4"><span className="text-2xl">😕</span></div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">Something went wrong</h3>
      <p className="text-gray-500 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 -mt-16">
      {/* ── Hero Banner ── */}
      <section className="relative pt-18 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Your Network
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              My <span className="text-indigo-200">Connections</span>
            </h1>
            <p className="mt-4 text-lg text-indigo-100/90 leading-relaxed max-w-2xl">
              Build meaningful professional relationships. Manage your connections and respond to new requests.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500"><Users className="w-6 h-6 text-white" /></div>
              <div><p className="text-2xl font-bold text-gray-900">{connections.length}</p><p className="text-xs text-gray-500 uppercase tracking-wide">Connections</p></div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500"><Clock className="w-6 h-6 text-white" /></div>
              <div><p className="text-2xl font-bold text-gray-900">{pending.length}</p><p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p></div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500"><Building2 className="w-6 h-6 text-white" /></div>
              <div><p className="text-2xl font-bold text-gray-900">{[...new Set(connections.map(c => c.Company_Name).filter(Boolean))].length}</p><p className="text-xs text-gray-500 uppercase tracking-wide">Companies</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs + Search ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100/30 border border-gray-100 p-5">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Tabs */}
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    activeTab === tab.key
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200/50"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                  }`}>
                  <tab.icon className="w-4 h-4" /> {tab.label}
                  {tab.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.key ? "bg-white/20" : "bg-gray-100"
                    }`}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Search (connections tab only) */}
            {activeTab === "connections" && (
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search connections..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50/50 transition-all" />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Connections Tab */}
        {activeTab === "connections" && (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Showing <span className="font-semibold text-gray-900">{filtered.length}</span> connection{filtered.length !== 1 && "s"}
              {search && <span className="text-gray-400"> (filtered)</span>}
            </p>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {search ? "No matches found" : "No connections yet"}
                </h3>
                <p className="text-gray-500 max-w-md mb-6">
                  {search ? "Try a different search term." : "Start connecting with alumni from the directory to grow your network."}
                </p>
                {!search && (
                  <button onClick={() => navigate("/directory")}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md">
                    <Users className="w-4 h-4" /> Explore Directory
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((conn) => (
                  <ConnectionCard key={conn.Connection_ID} conn={conn}
                    onChat={(c) => setChatUser(c)}
                    onRemove={(c) => setConfirmRemove(c)}
                    onViewProfile={(c) => navigate(`/alumni/${c.Connected_User_ID}`)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Pending Tab */}
        {activeTab === "pending" && (
          <>
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-semibold text-gray-900">{pending.length}</span> pending request{pending.length !== 1 && "s"}
            </p>

            {pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                  <Clock className="w-10 h-10 text-amber-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No pending requests</h3>
                <p className="text-gray-500 max-w-md">You're all caught up! New connection requests will appear here.</p>
              </div>
            ) : (
              <div className="max-w-2xl space-y-3">
                {pending.map((req) => (
                  <PendingRequestCard key={req.Connection_ID} req={req} onRespond={handleRespond} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {chatUser && <ChatWindow user={chatUser} onClose={() => setChatUser(null)} />}

      {/* Remove Connection Confirmation */}
      {confirmRemove && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setConfirmRemove(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Remove Connection</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to remove <span className="font-semibold text-gray-800">{confirmRemove.User_Fname} {confirmRemove.User_Lname}</span> from your connections? You can reconnect later.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveConnection}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition shadow-md"
              >
                Remove
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
