import React from "react";
import { UserPlus, Building2, GraduationCap, CalendarHeart } from "lucide-react";
import maleDP from "../../assets/dp-male.png";

const AlumniDir = ({ name, graduationYear, course, jobTitle, companyName, onBookMentorship }) => {
  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm 
      card-hover p-6 sm:p-8 grid grid-cols-1 md:grid-cols-[1fr_1.2fr_auto] items-center gap-6 mb-5
      hover:border-indigo-100 group">

      {/* Profile Section */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <img 
            src={maleDP}  
            alt={name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-md ring-2 ring-indigo-100 
              group-hover:ring-indigo-300 transition-all duration-300"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate">{name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <p className="text-sm text-gray-500 truncate">
              {graduationYear} • {course}
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-wrap gap-2">
        {jobTitle && (
          <span className="badge-chip bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Building2 className="w-3 h-3" />
            {jobTitle}
          </span>
        )}
        {companyName && (
          <span className="badge-chip bg-purple-50 text-purple-700 border border-purple-100">
            {companyName}
          </span>
        )}
        {graduationYear && (
          <span className="badge-chip bg-slate-50 text-slate-600 border border-slate-200">
            <GraduationCap className="w-3 h-3" />
            Batch {graduationYear}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:justify-end">
        <button
          onClick={(e) => { e.stopPropagation(); onBookMentorship?.(); }}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl 
            transition-all duration-200 border border-indigo-200 text-indigo-600
            hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-sm"
        >
          <CalendarHeart size={15} />
          Mentorship
        </button>
        <button
          className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-xl 
            shadow-md transition-all duration-200 
            bg-indigo-600 hover:bg-indigo-700 
            hover:shadow-lg hover:shadow-indigo-200/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        >
          <UserPlus size={15} />
          Connect
        </button>
      </div>
    </div>
  );
};

export default AlumniDir;
