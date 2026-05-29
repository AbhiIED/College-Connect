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

  const handleDownloadReport = (event, registrationsList = []) => {
    const doc = new jsPDF();
    doc.setFont("Inter", "sans-serif");
    doc.setFontSize(18);
    doc.text("🎓 Event Summary & Registrations", 14, 20);
    doc.setFontSize(12);
    doc.text(`Event Name: ${event.name}`, 14, 35);
    doc.text(`Date Scheduled: ${event.date}`, 14, 42);
    doc.text(`Type: ${event.type}`, 14, 49);
    doc.text(`Location/Venue: ${event.location}`, 14, 56);
    if (event.link) doc.text(`Broadcast Link: ${event.link}`, 14, 63);
    
    if (registrationsList.length > 0) {
      autoTable(doc, {
        startY: 75,
        head: [["Name", "Email", "Phone", "Course", "Grad Year"]],
        body: registrationsList.map((r) => [
          r.Full_Name || "",
          r.Email || "",
          r.Phone || "—",
          r.Course || "—",
          r.Graduation_Year || "—"
        ]),
      });
    }

    doc.save(`${event.name.replace(/\s+/g, "_")}_Report.pdf`);
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
                        {event.image ? (
                          <img
                            src={event.image}
                            alt="Event"
                            className="h-10 w-16 object-cover rounded-lg border border-gray-100/50 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-16 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-gray-300 shrink-0">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
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
        <DialogContent className="max-w-xl bg-white p-6 rounded-2xl shadow-xl border border-gray-100 text-left flex flex-col max-h-[85vh]">
          {selectedEvent && (
            <div className="space-y-4 font-sans flex-1 flex flex-col min-h-0">
              <DialogHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between flex-shrink-0">
                <div>
                  <DialogTitle className="text-lg font-bold font-display text-gray-900 leading-snug">
                    {selectedEvent.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-400 mt-0.5">
                    Summits & Workshops details.
                  </DialogDescription>
                </div>
                <Badge variant={selectedEvent.type === "Online" ? "default" : "success"}>
                  {selectedEvent.type}
                </Badge>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
                <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="h-4.5 w-4.5 text-gray-400 shrink-0" />
                    <span className="font-semibold text-xs text-gray-900">{selectedEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 truncate">
                    <MapPin className="h-4.5 w-4.5 text-gray-400 shrink-0" />
                    <span className="font-semibold text-xs text-gray-900 truncate">{selectedEvent.location}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-2xs font-bold text-gray-400 uppercase tracking-widest font-display">
                    Event Overview
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed bg-gray-50/20 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Live Sign-ups Table */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <h4 className="text-2xs font-bold text-gray-400 uppercase tracking-widest font-display">
                    Audited Member Registrations ({registrations.length})
                  </h4>
                  <div className="border border-gray-200/60 rounded-xl overflow-hidden shadow-3xs bg-white">
                    <Table className="text-xs">
                      <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                        <TableRow>
                          <TableHead className="font-display font-semibold text-gray-500 uppercase py-2">Registrant</TableHead>
                          <TableHead className="font-display font-semibold text-gray-500 uppercase py-2">Email</TableHead>
                          <TableHead className="font-display font-semibold text-gray-500 uppercase py-2">Course</TableHead>
                          <TableHead className="font-display font-semibold text-gray-500 uppercase py-2 text-right">Batch</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registrations.length ? (
                          registrations.map((r) => (
                            <TableRow key={r.Registration_ID} className="hover:bg-gray-50/30 transition-colors">
                              <TableCell className="font-semibold text-gray-900 leading-none py-2">
                                {r.Full_Name}
                              </TableCell>
                              <TableCell className="text-gray-500 text-[10px] py-2">{r.Email}</TableCell>
                              <TableCell className="text-gray-600 font-medium py-2">{r.Course || "—"}</TableCell>
                              <TableCell className="text-right font-bold text-gray-700 py-2">{r.Graduation_Year || "—"}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan="4" className="text-center text-gray-400 py-4 font-display text-[10px] italic">
                              No sign-up ledger entries loaded.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-gray-100 flex justify-end gap-2.5 flex-shrink-0">
                <Button
                  onClick={() => handleDownloadReport(selectedEvent, registrations)}
                  className="bg-brand-50 text-brand-700 border border-brand-100/50 hover:bg-brand-100 flex gap-2 font-semibold cursor-pointer text-xs"
                >
                  <FileText className="h-4 w-4" /> Download Report
                </Button>
                <Button variant="outline" onClick={() => setShowViewDialog(false)} className="border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer text-xs">
                  Close details
                </Button>
              </DialogFooter>
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
