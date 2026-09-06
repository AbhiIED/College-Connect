import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  FileText,
  UserCheck,
  CheckCircle,
  XCircle,
  Video,
  Image as ImageIcon,
  Check
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getEventImage, handleEventImageError } from "../../utils/imageUtils";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [registrantSearchQuery, setRegistrantSearchQuery] = useState("");

  const [addStep, setAddStep] = useState(1);
  const [editStep, setEditStep] = useState(1);

  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    location: "",
    type: "Offline",
    link: "",
    description: "",
    image: "",
  });

  const [editEvent, setEditEvent] = useState({
    id: "",
    name: "",
    date: "",
    location: "",
    type: "Offline",
    link: "",
    description: "",
    image: "",
  });

  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/events`);
      const data = await res.json();

      setEvents(
        data.map((e) => ({
          id: e.Event_ID,
          name: e.Event_Name,
          description: e.Event_Description,
          date: e.Event_Date ? e.Event_Date.split("T")[0] : "",
          type: e.Event_Type === 1 ? "Online" : "Offline",
          link: e.Event_Link || "",
          location: e.Event_Location,
          image: e.Event_Image || "",
        }))
      );
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenViewDialog = async (event) => {
    setSelectedEvent(event);
    setShowViewDialog(true);
    // Fetch registrations in real-time
    try {
      const res = await fetch(`${API_BASE_URL}/admin/events/${event.id}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      } else {
        setRegistrations([]);
      }
    } catch (e) {
      console.error("Error fetching event signups", e);
      setRegistrations([]);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.name || !newEvent.date || !newEvent.location) {
      return alert("Please fill all required fields");
    }

    const eventData = {
      Event_Name: newEvent.name,
      Event_Description: newEvent.description,
      Event_Date: newEvent.date,
      Event_Type: newEvent.type === "Online" ? 1 : 0,
      Event_Link: newEvent.type === "Online" ? newEvent.link : "",
      Event_Location: newEvent.location,
      Event_Image: newEvent.image || "",
    };

    try {
      const res = await fetch(`${API_BASE_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        setShowAddDialog(false);
        setNewEvent({ name: "", date: "", location: "", type: "Offline", link: "", description: "", image: "" });
        setAddStep(1);
        fetchEvents();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add event");
      }
    } catch (err) {
      console.error("Add Event Error:", err);
    }
  };

  const handleEditClick = (event) => {
    setEditEvent({
      id: event.id,
      name: event.name,
      date: event.date,
      location: event.location,
      type: event.type,
      link: event.link,
      description: event.description,
      image: event.image,
    });
    setEditStep(1);
    setShowEditDialog(true);
  };

  const handleEditSave = async () => {
    if (!editEvent.name || !editEvent.date || !editEvent.location) {
      return alert("Please fill all required fields");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/events/${editEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Event_Name: editEvent.name,
          Event_Description: editEvent.description,
          Event_Date: editEvent.date,
          Event_Type: editEvent.type === "Online" ? 1 : 0,
          Event_Link: editEvent.type === "Online" ? editEvent.link : "",
          Event_Location: editEvent.location,
          Event_Image: editEvent.image,
        }),
      });

      if (res.ok) {
        setShowEditDialog(false);
        fetchEvents();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update event");
      }
    } catch (err) {
      console.error("Update Event Error:", err);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/events/${selectedEvent.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setEvents(events.filter((e) => e.id !== selectedEvent.id));
        setShowDeleteDialog(false);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete event");
      }
    } catch (err) {
      console.error("Delete Event Error:", err);
    }
  };

  const handleExportCSV = (event, registrationsList) => {
    if (!registrationsList || registrationsList.length === 0) {
      alert("No registrations available to export.");
      return;
    }
    
    // CSV Header including Scholar ID
    const headers = ["Registration ID", "Scholar/Enrollment ID", "Full Name", "Email", "Phone", "Course", "Graduation Batch", "Registered At"];
    
    // CSV Rows
    const rows = registrationsList.map((r) => [
      r.Registration_ID,
      `"${(r.Scholar_ID || "—").replace(/"/g, '""')}"`,
      `"${(r.Full_Name || "").replace(/"/g, '""')}"`,
      `"${(r.Email || "").replace(/"/g, '""')}"`,
      `"${(r.Phone || "").replace(/"/g, '""')}"`,
      `"${(r.Course || "").replace(/"/g, '""')}"`,
      r.Graduation_Year || "—",
      r.Registered_At ? new Date(r.Registered_At).toLocaleString("en-IN") : ""
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    // Create download trigger
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${event.name.replace(/\s+/g, "_")}_Registrations.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReport = (event, registrationsList = []) => {
    const doc = new jsPDF();
    
    // Design elegant premium header layout
    doc.setFillColor(2, 132, 199); // Sky blue brand color (#0284c7)
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("COLLEGE-CONNECT PORTAL", 14, 25);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`ADMIN AUDIT REPORT | GENERATED ON ${new Date().toLocaleDateString("en-IN")}`, 14, 33);
    
    // Event Metadata Summary Cards section
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Event Overview & Metadata", 14, 52);
    
    doc.setDrawColor(220, 220, 220);
    doc.rect(14, 58, 182, 45); // border box for overview stats
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Event Name:", 20, 68);
    doc.text("Format:", 20, 75);
    doc.text("Date Scheduled:", 20, 82);
    doc.text("Location / Link:", 20, 89);
    doc.text("Total Attendees:", 20, 96);
    
    doc.setFont("helvetica", "normal");
    doc.text(event.name || "—", 55, 68);
    doc.text(event.type || "—", 55, 75);
    doc.text(event.date || "—", 55, 82);
    doc.text(event.location || event.link || "—", 55, 89);
    doc.text(`${registrationsList.length} registered members`, 55, 96);
    
    // Add Registrant detail table if records exist
    if (registrationsList.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Registrants List Ledger (${registrationsList.length})`, 14, 115);
      
      autoTable(doc, {
        startY: 120,
        head: [["Scholar/Enroll. ID", "Registrant Name", "Email Address", "Phone", "Course", "Batch Year"]],
        body: registrationsList.map((r) => [
          r.Scholar_ID || "—",
          r.Full_Name || "—",
          r.Email || "—",
          r.Phone || "—",
          r.Course || "—",
          r.Graduation_Year || "—"
        ]),
        headStyles: {
          fillColor: [2, 132, 199],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8.5
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        margin: { left: 14, right: 14 }
      });
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(11);
      doc.text("No active registrants signed up for this summit yet.", 14, 115);
    }
    
    // Add page number footers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 196, 287, { align: "right" });
      doc.text("Confidential — Internal System Audit Report", 14, 287);
    }
    
    doc.save(`${event.name.replace(/\s+/g, "_")}_Audit_Report.pdf`);
  };

  const filteredEvents = events.filter((event) => {
    const matchesType = filterType === "All" || event.type === filterType;
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900">
            Events Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Publish dynamic college networking summits, webinar links, and export live sign-up records.
          </p>
        </div>

        <div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-sm cursor-pointer gap-2"
          >
            <Plus className="h-4.5 w-4.5" /> Compose Event
          </Button>
        </div>
      </header>

      {/* ── Search & Filter ── */}
      <section className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events by name or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-white rounded-lg shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-sm transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">
            Format:
          </span>
          <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200/50">
            {["All", "Online", "Offline"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3.5 py-1 text-xs font-semibold font-display rounded-md transition-all duration-200 cursor-pointer ${
                  filterType === type
                    ? "bg-white text-brand-700 shadow-3xs font-bold"
                    : "text-gray-600 hover:text-brand-600"
                }`}
              >
                {type === "All" ? "All Formats" : type}
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
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Event ID</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Event Name</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Schedule Date</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Format</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider">Location / Link</TableHead>
                <TableHead className="font-display font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length ? (
                filteredEvents.map((event) => (
                  <TableRow key={event.id} className="hover:bg-gray-50/30 transition-colors">
                    <TableCell className="font-semibold text-gray-400 font-display text-sm">#{event.id}</TableCell>
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getEventImage(event.image, event.category)}
                          onError={(e) => handleEventImageError(e, event.category)}
                          alt="Event"
                          className="h-10 w-16 object-cover rounded-lg border border-gray-100/50 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-display font-bold text-sm text-gray-900 truncate leading-snug">
                            {event.name}
                          </h4>
                          <p className="text-xs text-gray-400 truncate mt-0.5 leading-normal">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900 font-semibold font-display text-xs">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.type === "Online" ? "default" : "success"} className="font-display border-none font-semibold">
                        {event.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-gray-600 text-sm">
                      {event.type === "Online" ? (
                        <div className="flex items-center gap-1 text-brand-600">
                          <Video className="h-4 w-4 text-brand-400 shrink-0" />
                          <span className="truncate">{event.link || "No links listed"}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenViewDialog(event)}
                          className="border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(event)}
                          className="border-gray-200 text-brand-600 hover:bg-brand-50 hover:border-brand-100 text-xs font-semibold cursor-pointer"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedEvent(event);
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
                    No active events listed in the archives.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Modal 1: Add New Event (Multi-Step Form) ── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <DialogHeader className="pb-3 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-xl font-bold font-display text-gray-900">
                  Compose Summit Event
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-400 mt-1">
                  Step {addStep} of 2 — Provide event properties.
                </DialogDescription>
              </div>
              <div className="flex gap-1 bg-gray-100 rounded-full p-0.5 border border-gray-200/50">
                <span className={`h-2 w-6 rounded-full inline-block ${addStep >= 1 ? "bg-brand-600" : "bg-gray-300"}`} />
                <span className={`h-2 w-6 rounded-full inline-block ${addStep >= 2 ? "bg-brand-600" : "bg-gray-300"}`} />
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-4 text-left">
            {addStep === 1 ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Event Name *</label>
                  <input
                    type="text"
                    placeholder="Alumni Reunion Summit 2026"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Format</label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                      className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Offline">Offline</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Date *</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">
                    {newEvent.type === "Online" ? "Broadcast Link *" : "Venue Address *"}
                  </label>
                  <input
                    type="text"
                    placeholder={newEvent.type === "Online" ? "https://meet.google.com/xyz" : "Seminar Hall-1, MANIT"}
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Banner Poster URL (optional)</label>
                  <input
                    type="text"
                    placeholder="https://example.com/poster.jpg"
                    value={newEvent.image}
                    onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
                    className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Summit Description</label>
                  <textarea
                    placeholder="Detailed explanation of event schedule..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    rows="4"
                    className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex justify-between gap-2.5">
            {addStep === 2 ? (
              <Button variant="outline" onClick={() => setAddStep(1)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
                Previous
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
                Cancel
              </Button>
            )}

            {addStep === 1 ? (
              <Button onClick={() => setAddStep(2)} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold cursor-pointer">
                Next Steps
              </Button>
            ) : (
              <Button onClick={handleAddEvent} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold cursor-pointer">
                Publish Summit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal 2: Edit Event (Multi-Step Form) ── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <DialogHeader className="pb-3 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-xl font-bold font-display text-gray-900">
                  Edit Summit Event
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-400 mt-1">
                  Step {editStep} of 2 — Update event specifications.
                </DialogDescription>
              </div>
              <div className="flex gap-1 bg-gray-100 rounded-full p-0.5 border border-gray-200/50">
                <span className={`h-2 w-6 rounded-full inline-block ${editStep >= 1 ? "bg-brand-600" : "bg-gray-300"}`} />
                <span className={`h-2 w-6 rounded-full inline-block ${editStep >= 2 ? "bg-brand-600" : "bg-gray-300"}`} />
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-4 text-left">
            {editStep === 1 ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Event Name *</label>
                  <input
                    type="text"
                    value={editEvent.name}
                    onChange={(e) => setEditEvent({ ...editEvent, name: e.target.value })}
                    className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Format</label>
                    <select
                      value={editEvent.type}
                      onChange={(e) => setEditEvent({ ...editEvent, type: e.target.value })}
                      className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Offline">Offline</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Date *</label>
                    <input
                      type="date"
                      value={editEvent.date}
                      onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                      className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">
                    {editEvent.type === "Online" ? "Broadcast Link *" : "Venue Address *"}
                  </label>
                  <input
                    type="text"
                    value={editEvent.location}
                    onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
                    className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Banner Poster URL (optional)</label>
                  <input
                    type="text"
                    value={editEvent.image}
                    onChange={(e) => setEditEvent({ ...editEvent, image: e.target.value })}
                    className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 font-display uppercase tracking-wider">Summit Description</label>
                  <textarea
                    value={editEvent.description}
                    onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                    rows="4"
                    className="w-full border border-gray-200 px-3.5 py-2 rounded-lg text-sm bg-white shadow-2xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100 flex justify-between gap-2.5">
            {editStep === 2 ? (
              <Button variant="outline" onClick={() => setEditStep(1)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
                Previous
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
                Cancel
              </Button>
            )}

            {editStep === 1 ? (
              <Button onClick={() => setEditStep(2)} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold cursor-pointer">
                Next Steps
              </Button>
            ) : (
              <Button onClick={handleEditSave} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold cursor-pointer">
                Save Summit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal 3: View event details with Registrations list ── */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-5xl w-[90vw] bg-white p-6 rounded-2xl shadow-xl border border-gray-100 text-left flex flex-col max-h-[85vh] overflow-hidden">
          {selectedEvent && (
            <div className="flex flex-col md:flex-row gap-6 min-h-0 flex-1">
              {/* Left Column: Event Metadata Overview (1/3 width) */}
              <div className="md:w-1/3 flex flex-col space-y-4 pr-0 md:pr-4 md:border-r border-gray-100 flex-shrink-0">
                <div className="space-y-1">
                  <Badge variant={selectedEvent.type === "Online" ? "default" : "success"} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 w-fit border-none">
                    {selectedEvent.type}
                  </Badge>
                  <h3 className="text-xl font-bold font-display text-gray-900 leading-snug">
                    {selectedEvent.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Event Control Summary & Stats
                  </p>
                </div>

                {/* Event banner poster */}
                {selectedEvent && (
                  <div className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50 max-h-36 flex items-center justify-center shrink-0">
                    <img
                      src={getEventImage(selectedEvent.image, selectedEvent.category)}
                      onError={(e) => handleEventImageError(e, selectedEvent.category)}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-3 text-xs bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4 text-brand-500 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Date Scheduled</p>
                      <p className="font-semibold text-gray-900 mt-0.5">{selectedEvent.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-brand-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Venue/Location</p>
                      <p className="font-semibold text-gray-900 mt-0.5 truncate" title={selectedEvent.location}>
                        {selectedEvent.location}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.type === "Online" && selectedEvent.link && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Video className="h-4 w-4 text-brand-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Broadcast Link</p>
                        <a
                          href={selectedEvent.link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-brand-600 hover:text-brand-700 hover:underline mt-0.5 block truncate"
                        >
                          {selectedEvent.link}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic student vs alumni attendee stats */}
                <div className="space-y-2 bg-brand-50/20 p-4 rounded-xl border border-brand-100/50 text-xs">
                  <p className="font-bold text-brand-800 uppercase tracking-widest text-[9px]">Dynamic Sign-ups Metrics</p>
                  
                  <div className="grid grid-cols-3 gap-2 mt-1.5 text-center">
                    <div className="p-2 bg-white rounded-lg border border-brand-100/40 shadow-3xs">
                      <p className="text-sm font-black text-brand-700">{registrations.length}</p>
                      <p className="text-[9px] font-semibold text-gray-400 mt-0.5">Total</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-brand-100/40 shadow-3xs">
                      <p className="text-sm font-black text-emerald-600">
                        {(() => {
                          const pastYear = new Date().getFullYear();
                          return registrations.filter(r => r.Graduation_Year && Number(r.Graduation_Year) < pastYear).length;
                        })()}
                      </p>
                      <p className="text-[9px] font-semibold text-gray-400 mt-0.5">Alumni</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-brand-100/40 shadow-3xs">
                      <p className="text-sm font-black text-blue-600">
                        {(() => {
                          const pastYear = new Date().getFullYear();
                          const alumni = registrations.filter(r => r.Graduation_Year && Number(r.Graduation_Year) < pastYear).length;
                          return registrations.length - alumni;
                        })()}
                      </p>
                      <p className="text-[9px] font-semibold text-gray-400 mt-0.5">Students</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-36 scrollbar-thin text-xs pr-1">
                  <p className="font-bold text-gray-400 uppercase tracking-widest text-[9px] mb-1">Description Overview</p>
                  <p className="text-gray-600 leading-relaxed font-sans font-medium whitespace-pre-wrap">
                    {selectedEvent.description || "No event description provided."}
                  </p>
                </div>
              </div>

              {/* Right Column: Registrant Search & Grid Table (2/3 width) */}
              <div className="md:w-2/3 flex flex-col min-h-0 flex-1">
                {/* Search Bar & Stats Header */}
                <div className="flex items-center justify-between gap-4 pb-3 border-b border-gray-100 flex-shrink-0">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display flex items-center gap-1.5">
                    Member Registry List 
                    <span className="bg-brand-100 text-brand-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0">
                      {registrations.length}
                    </span>
                  </h4>
                  
                  <div className="relative w-52 shrink-0">
                    <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search sign-ups..."
                      value={registrantSearchQuery}
                      onChange={(e) => setRegistrantSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 border border-gray-200 bg-white rounded-lg shadow-3xs focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none text-[11px] font-semibold transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Table View Wrapper */}
                <div className="flex-1 overflow-y-auto border border-gray-200/50 rounded-xl shadow-3xs mt-3 bg-white scrollbar-thin min-h-0">
                  {(() => {
                    const filtered = registrations.filter((r) => {
                      const query = registrantSearchQuery.toLowerCase();
                      return (
                        r.Full_Name?.toLowerCase().includes(query) ||
                        r.Email?.toLowerCase().includes(query) ||
                        r.Phone?.toLowerCase().includes(query) ||
                        r.Course?.toLowerCase().includes(query) ||
                        (r.Graduation_Year && String(r.Graduation_Year).includes(query)) ||
                        (r.Scholar_ID && r.Scholar_ID.toLowerCase().includes(query))
                      );
                    });

                    return (
                      <Table className="text-xs">
                        <TableHeader className="bg-gray-50/50 border-b border-gray-100 sticky top-0 z-10">
                          <TableRow>
                            <TableHead className="font-display font-semibold text-gray-500 uppercase tracking-wider py-2">ID</TableHead>
                            <TableHead className="font-display font-semibold text-gray-500 uppercase tracking-wider py-2">Registrant</TableHead>
                            <TableHead className="font-display font-semibold text-gray-500 uppercase tracking-wider py-2">Contact Details</TableHead>
                            <TableHead className="font-display font-semibold text-gray-500 uppercase tracking-wider py-2">Degree/Course</TableHead>
                            <TableHead className="font-display font-semibold text-gray-500 uppercase tracking-wider py-2 text-center">Batch</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.length ? (
                            filtered.map((r) => (
                              <TableRow key={r.Registration_ID} className="hover:bg-gray-50/30 transition-colors">
                                <TableCell className="font-mono text-[10px] text-gray-400 font-bold shrink-0 py-2">
                                  {r.Scholar_ID || "—"}
                                </TableCell>
                                <TableCell className="py-2">
                                  <div className="font-semibold text-gray-900 leading-snug">
                                    {r.Full_Name}
                                  </div>
                                  <div className="text-[10px] text-gray-400 mt-0.5 font-medium leading-none">
                                    Signed up: {r.Registered_At ? new Date(r.Registered_At).toLocaleDateString("en-IN", { dateStyle: "short" }) : "—"}
                                  </div>
                                </TableCell>
                                <TableCell className="py-2 space-y-0.5">
                                  <div className="text-gray-600 font-medium font-mono text-[10px]">{r.Email}</div>
                                  <div className="text-gray-400 font-semibold font-mono text-[10px]">{r.Phone || "—"}</div>
                                </TableCell>
                                <TableCell className="text-gray-600 font-semibold py-2">
                                  {r.Course || "—"}
                                </TableCell>
                                <TableCell className="text-center font-bold text-gray-700 py-2">
                                  {r.Graduation_Year || "—"}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="5" className="text-center text-gray-400 py-8 font-display text-[11px] italic">
                                {registrations.length === 0 
                                  ? "No registry sign-up entries compiled yet."
                                  : "No matches found for search filters."}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    );
                  })()}
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap justify-between gap-3 items-center mt-3 flex-shrink-0">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleExportCSV(selectedEvent, registrations)}
                      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-100/50 flex gap-1.5 font-bold cursor-pointer text-xs h-9 px-3.5 rounded-xl shadow-3xs"
                    >
                      Export to CSV
                    </Button>
                    <Button
                      onClick={() => handleDownloadReport(selectedEvent, registrations)}
                      className="bg-brand-50 text-brand-700 hover:bg-brand-100 hover:text-brand-800 border border-brand-100/50 flex gap-1.5 font-bold cursor-pointer text-xs h-9 px-3.5 rounded-xl shadow-3xs"
                    >
                      <FileText className="h-4 w-4" /> Download PDF Report
                    </Button>
                  </div>
                  
                  <Button variant="outline" onClick={() => setShowViewDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-bold cursor-pointer text-xs h-9 px-4 rounded-xl">
                    Close Command Panel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Modal 4: Delete Event ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold font-display text-gray-900">
              Confirm Event Cancellation
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              Warning: Cancelling summits removes all registrations and feed postings permanently.
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-gray-700 my-4">
            Are you sure you want to permanently delete event <strong>{selectedEvent?.name}</strong>?
          </p>

          <DialogFooter className="flex justify-end gap-2.5">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer">
              Cancel Deletion
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="font-semibold cursor-pointer">
              Erase Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
