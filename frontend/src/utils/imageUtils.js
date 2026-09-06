// ─────────────────────────────────────────────────────────────────────────────
// CollegeConnect Centralized Image & Fallback Utilities
// Ensures NO image is ever blank or broken across the entire platform.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// ── 1. Category-specific Fallback Images for Crowdfunding Projects ──────────
export const PROJECT_FALLBACK_IMAGES = {
  Infrastructure: "https://images.unsplash.com/photo-1562774053-701939374585?w=900&auto=format&fit=crop&q=80", // Modern campus building
  Scholarship: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80", // Students studying together
  Academic: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&auto=format&fit=crop&q=80", // Digital library
  "Academic Technology": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=80", // E-learning studio
  Sports: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&auto=format&fit=crop&q=80", // Stadium & sports turf
  Research: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=900&auto=format&fit=crop&q=80", // High-tech research lab
  Sustainability: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=900&auto=format&fit=crop&q=80", // Solar panels on campus
  Entrepreneurship: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&auto=format&fit=crop&q=80", // Startup prototype hub
  "Student Welfare": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80", // Medical / health aid
  "Alumni Relations": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&auto=format&fit=crop&q=80", // Alumni hall of fame
  CSR: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&auto=format&fit=crop&q=80", // Rural outreach education
  Events: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&fit=crop&q=80", // Convocation event
  default: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&auto=format&fit=crop&q=80" // Classic college architecture
};

export const getProjectImage = (image, category) => {
  if (image && typeof image === "string") {
    const trimmed = image.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("/uploads/")) {
      return `${API_BASE}${trimmed}`;
    }
  }
  // Check category match or fallback
  return PROJECT_FALLBACK_IMAGES[category] || PROJECT_FALLBACK_IMAGES.default;
};

export const handleProjectImageError = (e, category) => {
  e.target.onerror = null;
  e.target.src = PROJECT_FALLBACK_IMAGES[category] || PROJECT_FALLBACK_IMAGES.default;
};


// ── 2. Category-specific Fallback Images for Events ─────────────────────────
export const EVENT_FALLBACK_IMAGES = {
  Sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&auto=format&fit=crop&q=80", // Athletic sports week
  "Alumni Talk": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=900&auto=format&fit=crop&q=80", // Big tech alumni speaker
  Workshop: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=900&auto=format&fit=crop&q=80", // Tech workshop
  Ceremony: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&auto=format&fit=crop&q=80", // Convocation graduation
  "Placement Drive": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&auto=format&fit=crop&q=80", // Internship interview
  Bootcamp: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&auto=format&fit=crop&q=80", // Deep tech coding boot camp
  Competition: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&auto=format&fit=crop&q=80", // Coding league / hackathon
  Cultural: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&auto=format&fit=crop&q=80", // Freshers orientation / welcome
  "Technical Fest": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&auto=format&fit=crop&q=80", // TechVantage robotics
  Symposium: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=900&auto=format&fit=crop&q=80", // Sustainable symposium conference
  default: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&auto=format&fit=crop&q=80" // College event crowd
};

export const getEventImage = (image, eventType) => {
  if (image && typeof image === "string") {
    const trimmed = image.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("/uploads/")) {
      return `${API_BASE}${trimmed}`;
    }
  }
  return EVENT_FALLBACK_IMAGES[eventType] || EVENT_FALLBACK_IMAGES.default;
};

export const handleEventImageError = (e, eventType) => {
  e.target.onerror = null;
  e.target.src = EVENT_FALLBACK_IMAGES[eventType] || EVENT_FALLBACK_IMAGES.default;
};


// ── 3. Category-specific Fallback Images for News ───────────────────────────
export const NEWS_FALLBACK_IMAGES = {
  Placements: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop&q=80", // College placements celebration
  "Alumni Achievement": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=80", // VP leadership / Forbes
  Achievement: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=900&auto=format&fit=crop&q=80", // Smart India Hackathon gold
  Infrastructure: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&auto=format&fit=crop&q=80", // High tech lab inauguration
  Partnerships: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=900&auto=format&fit=crop&q=80", // IBM MoU handshake
  "Alumni Activities": "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=900&auto=format&fit=crop&q=80", // Endowment fund / donation
  Accreditation: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop&q=80", // NBA certification
  Rankings: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&auto=format&fit=crop&q=80", // National university ranking
  Sports: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&auto=format&fit=crop&q=80", // Basketball tournament win
  "Faculty Achievement": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&auto=format&fit=crop&q=80", // Best teacher citation
  International: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80", // TU Delft student exchange
  Entrepreneurship: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&auto=format&fit=crop&q=80", // Incubation grant
  "Academic Resources": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&auto=format&fit=crop&q=80", // Digital library ebooks
  default: "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=900&auto=format&fit=crop&q=80" // General news banner
};

export const getNewsImage = (image, category) => {
  if (image && typeof image === "string") {
    const trimmed = image.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("/uploads/")) {
      return `${API_BASE}${trimmed}`;
    }
  }
  return NEWS_FALLBACK_IMAGES[category] || NEWS_FALLBACK_IMAGES.default;
};

export const handleNewsImageError = (e, category) => {
  e.target.onerror = null;
  e.target.src = NEWS_FALLBACK_IMAGES[category] || NEWS_FALLBACK_IMAGES.default;
};


// ── 4. Fallback Images for Social Feed Posts ────────────────────────────────
export const POST_SEED_MAP = {
  "posts/rahul_promotion.jpg": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=80", // Google promotion
  "posts/arjun_ev.jpg": "https://images.unsplash.com/photo-1558441719-2347b7378738?w=900&auto=format&fit=crop&q=80", // EV engineering
  "posts/sneha_paper.jpg": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900&auto=format&fit=crop&q=80", // Medical research paper
  "posts/ananya_amazon.jpg": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&auto=format&fit=crop&q=80", // Amazon developer work
  "posts/rohit_isro.jpg": "https://images.unsplash.com/photo-1517976487502-55a290dfc723?w=900&auto=format&fit=crop&q=80", // ISRO rocket lift off
  "posts/tanmay_resume.jpg": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=80", // Coding portfolio
  "posts/kavya_hackathon.jpg": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&auto=format&fit=crop&q=80", // AI hackathon project
  "posts/pooja_gate.jpg": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&auto=format&fit=crop&q=80", // GATE exam preparation
  "posts/divya_aws.jpg": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&auto=format&fit=crop&q=80", // AWS cloud computing
  "posts/nikhil_intern.jpg": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=80", // Automotive engineering
  "posts/admin_fair.jpg": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=900&auto=format&fit=crop&q=80", // Career fair
  default: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&auto=format&fit=crop&q=80"
};

export const getPostImage = (image) => {
  if (!image || typeof image !== "string") return null;
  const trimmed = image.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/uploads/")) {
    return `${API_BASE}${trimmed}`;
  }
  if (POST_SEED_MAP[trimmed]) {
    return POST_SEED_MAP[trimmed];
  }
  return POST_SEED_MAP.default;
};

export const handlePostImageError = (e) => {
  e.target.onerror = null;
  e.target.src = POST_SEED_MAP.default;
};


// ── 5. User Avatars & Profile Pictures ──────────────────────────────────────
export const getAvatarImage = (profilePic, name = "User") => {
  if (profilePic && typeof profilePic === "string") {
    const trimmed = profilePic.trim();
    if (!trimmed.includes("default") && !trimmed.includes("null") && trimmed !== "") {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      if (trimmed.startsWith("/")) {
        return `${API_BASE}${trimmed}`;
      }
      return `${API_BASE}/${trimmed}`;
    }
  }
  // If name is supplied, return a reliable UI avatar
  const cleanName = encodeURIComponent(name.trim() || "Alumni");
  return `https://ui-avatars.com/api/?name=${cleanName}&background=6366f1&color=fff&size=128&bold=true`;
};

export const handleAvatarError = (e, name = "User") => {
  e.target.onerror = null;
  const cleanName = encodeURIComponent(name.trim() || "Alumni");
  e.target.src = `https://ui-avatars.com/api/?name=${cleanName}&background=6366f1&color=fff&size=128&bold=true`;
};
