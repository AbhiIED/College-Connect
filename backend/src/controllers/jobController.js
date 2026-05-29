const pool = require("../config/db");

// Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT Job_ID, Posted_By, Job_Title, Company_Name, Location, Description, 
              Application_Link, Apply_From, Apply_To, Created_At 
       FROM Job_Postings 
       ORDER BY Created_At DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching jobs:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// Create a job posting
exports.createJob = async (req, res) => {
  try {
    const postedBy = req.user.id;
    const { title, company, location, description, applyLink, applyFrom, applyTo } = req.body;

    if (!title || !company || !location || !description || !applyFrom || !applyTo) {
      return res.status(400).json({ error: "Please fill all required fields." });
    }

    if (new Date(applyFrom) > new Date(applyTo)) {
      return res.status(400).json({ error: "Apply To date must be greater than Apply From date." });
    }

    const query = `
      INSERT INTO Job_Postings
      (Posted_By, Job_Title, Company_Name, Location, Description, Application_Link, 
       Apply_From, Apply_To, Created_At)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    await pool.query(query, [
      postedBy, title, company, location, description,
      applyLink || null, applyFrom, applyTo,
    ]);

    res.json({ success: true, message: "Job posted successfully!" });
  } catch (err) {
    console.error("❌ Error posting job:", err);
    res.status(500).json({ error: "Failed to post job" });
  }
};

// Delete a job posting
exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const [result] = await pool.query("DELETE FROM Job_Postings WHERE Job_ID = ?", [jobId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found." });
    }

    res.json({ success: true, message: "Job deleted successfully!" });
  } catch (err) {
    console.error("❌ Error deleting job:", err);
    res.status(500).json({ error: "Failed to delete job" });
  }
};

// Update a job posting
exports.updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { title, company, location, description, applyLink, applyFrom, applyTo } = req.body;

    if (!title || !company || !location || !description || !applyFrom || !applyTo) {
      return res.status(400).json({ error: "Please fill all required fields." });
    }

    if (new Date(applyFrom) > new Date(applyTo)) {
      return res.status(400).json({ error: "Apply To date must be greater than Apply From date." });
    }

    const query = `
      UPDATE Job_Postings
      SET Job_Title = ?, Company_Name = ?, Location = ?, Description = ?, 
          Application_Link = ?, Apply_From = ?, Apply_To = ?
      WHERE Job_ID = ?
    `;

    const [result] = await pool.query(query, [
      title, company, location, description,
      applyLink || null, applyFrom, applyTo, jobId
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found." });
    }

    res.json({ success: true, message: "Job updated successfully!" });
  } catch (err) {
    console.error("❌ Error updating job:", err);
    res.status(500).json({ error: "Failed to update job" });
  }
};
