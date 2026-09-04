const pool = require("../config/db");

// Get all events (with optional "latest" filter)
exports.getAllEvents = async (req, res) => {
  const type = req.query.type;

  let query = `
    SELECT 
      e.Event_ID,
      e.Event_Name,
      e.Event_Description,
      e.Event_Date,
      e.Event_Type,
      e.Event_Link,
      e.Event_Image, 
      e.Event_Location
    FROM Event_Table e
  `;

  if (type === "latest") {
    query += ` ORDER BY e.Creation_Date DESC LIMIT 5;`;
  } else {
    query += `
      ORDER BY
        CASE
          WHEN e.Event_Date >= CURDATE() THEN 0
          ELSE 1
        END,
        e.Event_Date ASC;
    `;
  }

  try {
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`SELECT * FROM Event_Table WHERE Event_ID = ?`, [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Event not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching event:", err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

// Create event (admin only)
exports.createEvent = async (req, res) => {
  try {
    const Organizer_ID = req.user.id;

    if (!Organizer_ID) {
      return res.status(403).json({ error: "Organizer ID missing or unauthorized" });
    }

    const {
      Event_Name, Event_Description, Event_Date, Creation_Date,
      Event_Type, Event_Link, Event_Location, Event_Image,
    } = req.body;

    if (!Event_Name || !Event_Date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO Event_Table 
      (Organizer_ID, Event_Name, Event_Description, Event_Date, Creation_Date, Event_Type, Event_Link, Event_Location, Event_Image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      Organizer_ID, Event_Name, Event_Description, Event_Date,
      Creation_Date || new Date().toISOString().split("T")[0],
      Event_Type, Event_Link, Event_Location, Event_Image,
    ]);

    res.status(201).json({ message: "✅ Event created successfully", eventId: result.insertId });
  } catch (err) {
    console.error("❌ Error creating event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

// Update event (admin only)
exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const {
    Event_Name,
    Event_Description,
    Event_Date,
    Event_Type,
    Event_Link,
    Event_Location,
    Event_Image
  } = req.body;

  const updateData = {};
  if (Event_Name !== undefined) updateData.Event_Name = Event_Name;
  if (Event_Description !== undefined) updateData.Event_Description = Event_Description;
  if (Event_Date !== undefined) updateData.Event_Date = Event_Date;
  if (Event_Type !== undefined) updateData.Event_Type = Event_Type;
  if (Event_Link !== undefined) updateData.Event_Link = Event_Link;
  if (Event_Location !== undefined) updateData.Event_Location = Event_Location;
  if (Event_Image !== undefined) updateData.Event_Image = Event_Image;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No update fields provided" });
  }

  try {
    const [result] = await pool.query(`UPDATE Event_Table SET ? WHERE Event_ID = ?`, [updateData, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "✅ Event updated successfully" });
  } catch (err) {
    console.error("❌ Error updating event:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
};

// Delete event (admin only)
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(`DELETE FROM Event_Table WHERE Event_ID = ?`, [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "🗑️ Event deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting event:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};

// Register for an event (NEW)
exports.registerForEvent = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : null;
  const { fullName, email, phone, graduationYear, course } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    // Check if event exists
    const [event] = await pool.query("SELECT Event_ID FROM Event_Table WHERE Event_ID = ?", [id]);
    if (event.length === 0) return res.status(404).json({ error: "Event not found" });

    await pool.query(
      `INSERT INTO Event_Registration (Event_ID, User_ID, Full_Name, Email, Phone, Graduation_Year, Course)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, fullName, email, phone || null, graduationYear || null, course || null]
    );

    res.status(201).json({ message: "✅ Registered successfully!" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "You are already registered for this event" });
    }
    console.error("❌ Error registering for event:", err);
    res.status(500).json({ error: "Failed to register" });
  }
};

// Get registrations for an event (admin)
exports.getEventRegistrations = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM Event_Registration WHERE Event_ID = ? ORDER BY Registered_At DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching registrations:", err);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
};
