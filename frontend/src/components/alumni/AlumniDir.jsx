import React from "react";
import { UserPlus } from "lucide-react";
import maleDP from "../../assets/dp-male.png"; 

const AlumniDir = ({ name, graduationYear, course, jobTitle, companyName }) => {
  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm 
      hover:shadow-amber-300 hover:shadow-2xl hover:-translate-y-1 
      transition-all duration-300 p-8 grid grid-cols-1 md:grid-cols-3 items-center gap-8 mb-8">

      <div className="flex items-center gap-4">
        <img 
          src={maleDP}  
          alt={name}
          className="w-20 h-20 rounded-full object-cover shadow-md ring-2 ring-amber-200"
        />
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">
            {graduationYear} • {course}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-base text-gray-700">
          <span className="font-medium">Post:</span> {jobTitle}
        </p>
        <p className="text-base text-gray-700">
          <span className="font-medium">Company:</span> {companyName}
        </p>
      </div>

      <div className="flex md:justify-end">
        <button
          className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white rounded-full 
            shadow-md transition-all duration-200 
            bg-amber-600 hover:bg-amber-700 
            hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
        >
          <UserPlus size={16} className="text-white" />
          Connect
        </button>
      </div>
    </div>
  );
};

export default AlumniDir;
