import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AlumniDir from "./AlumniDir";
import MentorshipModal from "../mentorship/MentorshipModal";

const AlumniList = () => {
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState([]);
  const [mentorshipTarget, setMentorshipTarget] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    fetch(`${API_BASE_URL}/alumni`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          navigate("/signin");
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => setAlumni(data))
      .catch((err) => console.error("Error fetching alumni:", err));
  }, [navigate]);

  return (
    <>
      <div className="space-y-2">
        {alumni.map((item) => (
          <div
            key={item.Alumni_ID}
            onClick={() => navigate(`/alumni/${item.Alumni_ID}`)}
            style={{ cursor: "pointer" }}
          >
            <AlumniDir
              name={`${item.User_Fname} ${item.User_Lname}`}
              graduationYear={item.Graduation_Year}
              course={`${item.Course} ${item.Department}`}
              jobTitle={item.Job_Title}
              companyName={item.Company_Name}
              onBookMentorship={() => setMentorshipTarget({
                id: item.Alumni_ID,
                name: `${item.User_Fname} ${item.User_Lname}`,
                jobTitle: item.Job_Title,
                company: item.Company_Name,
              })}
            />
          </div>
        ))}
      </div>

      {/* Mentorship Modal */}
      {mentorshipTarget && (
        <MentorshipModal
          alumni={mentorshipTarget}
          onClose={() => setMentorshipTarget(null)}
        />
      )}
    </>
  );
};

export default AlumniList;
