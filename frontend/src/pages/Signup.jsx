import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircleIcon, ExclamationCircleIcon, UserIcon, IdentificationIcon, BriefcaseIcon, MapPinIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/common/Logo";
import { API_BASE_URL } from "../utils/api";

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="relative w-full">
    {label && <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-indigo-400" />
        </div>
      )}
      <input
        {...props}
        className={`block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-800
                   shadow-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200
                   transition-all duration-300 ease-in-out ${Icon ? "pl-10" : ""}`}
      />
    </div>
  </div>
);

const SelectBox = ({ label, children, ...props }) => (
  <div className="relative w-full">
    {label && <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">{label}</label>}
    <select
      {...props}
      className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-800
                 shadow-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200
                 transition-all duration-300 ease-in-out cursor-pointer appearance-none"
    >
      {children}
    </select>
  </div>
);

const initialFormData = {
  firstName: "",
  lastName: "",
  gender: "",
  scholarId: "",
  email: "",
  primaryPhone: "",
  secondaryPhone: "",
  department: "",
  branch: "",
  endYear: "",
  currentYear: "",
  semester: "",
  jobTitle: "",
  companyName: "",
  city: "",
  country: "",
  sector: "",
  skills: "",
  address: "",
  password: "",
  role: "",
};

export default function Signup() {
  const [formData, setFormData] = useState(initialFormData);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const isAlumni = formData.role === "1";
  const isStudent = formData.role === "2";

  const semesterOptions = {
    "1st": [1, 2],
    "2nd": [3, 4],
    "3rd": [5, 6],
    "4th": [7, 8],
    "5th": [9, 10],
  };

  const setErrorMessage = (text) => {
    setIsSuccess(false);
    setMessage(text);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        navigate("/verify-otp", { state: { email: formData.email, otp: data.otp } });
      } else {
        setIsSuccess(false);
        setMessage(data.error || "❌ Signup failed. Try again.");
      }
    } catch (error) {
      setErrorMessage("⚠️ Server error. Please try later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.gender || !formData.email || !formData.primaryPhone || !formData.password || !formData.role) {
        return setErrorMessage("Please fill all required fields in Step 1.");
      }
    }
    if (step === 2) {
      if (!formData.scholarId || !formData.endYear || !formData.department || !formData.branch) {
        return setErrorMessage("Please fill all required fields in Step 2.");
      }
      if (isStudent && (!formData.currentYear || !formData.semester)) {
        return setErrorMessage("Please fill your Student Details in Step 2.");
      }
    }
    setErrorMessage("");
    setStep((p) => Math.min(p + 1, 3));
  };
  const prevStep = () => {
    setErrorMessage("");
    setStep((p) => Math.max(p - 1, 1));
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[120px]" />

      {/* LEFT SIDE - Brand */}
      <div className="hidden lg:flex w-[45%] bg-indigo-900 flex-col justify-center items-center p-12 relative overflow-hidden text-white shadow-2xl z-10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 mb-8"
        >
          <Logo size="xl" variant="light" to={null} />
        </motion.div>
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.3 }}
           className="z-10 text-center"
        >
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">Join Your <br/> <span className="text-indigo-300">Legacy.</span></h1>
          <p className="text-lg text-indigo-100 max-w-md font-medium opacity-90">
            Build incredible connections, unlock career paths, and stay tethered to your roots through CollegeConnect.
          </p>
        </motion.div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 sm:p-12 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white p-8 sm:p-10"
        >
          {/* Stepper Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h2>
            <p className="text-sm text-gray-500 mt-2">Step {step} of 3 • {step === 1 ? 'Personal Details' : step === 2 ? 'Academic Details' : 'Professional & Verify'}</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full mt-6 overflow-hidden flex">
              <motion.div 
                className="bg-indigo-600 h-full rounded-full"
                initial={{ width: '33%' }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 mb-6 px-4 py-3 rounded-xl shadow-sm text-sm font-medium border
                ${isSuccess ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"}`
              }
            >
              {isSuccess ? <CheckCircleIcon className="h-5 w-5 text-emerald-600 mt-0.5" /> : <ExclamationCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />}
              <span className="leading-relaxed">{message}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              
              {/* --- STEP 1: Basic Information --- */}
              {step === 1 && (
                <motion.div key="step1" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField label="First Name" icon={UserIcon} type="text" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required />
                    <InputField label="Last Name" type="text" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <SelectBox label="Gender" name="gender" value={formData.gender} onChange={handleChange} required>
                      <option value="">Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </SelectBox>
                    <InputField label="Primary Phone" type="tel" name="primaryPhone" placeholder="+1 234 567 8900" value={formData.primaryPhone} onChange={handleChange} required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField label="Secondary Phone" type="tel" name="secondaryPhone" placeholder="+1 987 654 3210 (Optional)" value={formData.secondaryPhone} onChange={handleChange} />
                    <SelectBox label="Register as" name="role" value={formData.role} onChange={handleChange} required>
                      <option value="">Select Role</option>
                      <option value="2">Student</option>
                      <option value="1">Alumni</option>
                    </SelectBox>
                  </div>
                  
                  <InputField label="Email Address" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                  <InputField label="Password" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                </motion.div>
              )}


              {/* --- STEP 2: Academic Info --- */}
              {step === 2 && (
                <motion.div key="step2" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField label={isAlumni ? "Enrollment No" : "Scholar ID"} icon={IdentificationIcon} type="text" name="scholarId" placeholder={isAlumni ? "e.g. EN12345" : "e.g. 102345"} value={formData.scholarId} onChange={handleChange} required />
                    <InputField label="Graduation Year" type="number" name="endYear" placeholder="e.g. 2026" value={formData.endYear} onChange={handleChange} required />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField label="Department" type="text" name="department" placeholder="Engineering" value={formData.department} onChange={handleChange} required />
                    <InputField label="Branch" type="text" name="branch" placeholder="Computer Science" value={formData.branch} onChange={handleChange} required />
                  </div>

                  {isStudent && (
                    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-4">
                      <h3 className="text-sm font-bold tracking-wide text-indigo-900 uppercase">Student Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <SelectBox label="Current Year" name="currentYear" value={formData.currentYear} onChange={handleChange} required>
                          <option value="">Select Year</option>
                          <option value="1st">1st Year</option>
                          <option value="2nd">2nd Year</option>
                          <option value="3rd">3rd Year</option>
                          <option value="4th">4th Year</option>
                          <option value="5th">5th Year</option>
                        </SelectBox>

                        <SelectBox label="Semester" name="semester" value={formData.semester} onChange={handleChange} required disabled={!formData.currentYear}>
                          <option value="">Select Semester</option>
                          {formData.currentYear && semesterOptions[formData.currentYear]?.map((sem) => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                          ))}
                        </SelectBox>
                      </div>
                    </div>
                  )}

                </motion.div>
              )}


              {/* --- STEP 3: Professional & Verification --- */}
              {step === 3 && (
                <motion.div key="step3" variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ duration: 0.3 }} className="space-y-5">
                  
                  {isAlumni && (
                    <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-4 mb-4">
                      <h3 className="text-sm font-bold tracking-wide text-emerald-900 uppercase flex items-center gap-2"><BriefcaseIcon className="w-4 h-4"/> Alumni Profile</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Job Title" type="text" name="jobTitle" placeholder="Software Engineer" value={formData.jobTitle} onChange={handleChange} />
                        <InputField label="Company" type="text" name="companyName" placeholder="Tech Corp" value={formData.companyName} onChange={handleChange} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="City" type="text" name="city" placeholder="New York" value={formData.city} onChange={handleChange} />
                        <InputField label="Country" type="text" name="country" placeholder="USA" value={formData.country} onChange={handleChange} />
                      </div>
                      <InputField label="Sector" type="text" name="sector" placeholder="IT, Finance..." value={formData.sector} onChange={handleChange} />
                      <InputField label="Skills" type="text" name="skills" placeholder="React, Python, Design..." value={formData.skills} onChange={handleChange} />
                    </div>
                  )}

                  <div className="relative w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Full Address</label>
                    <div className="relative">
                      <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                        <MapPinIcon className="h-5 w-5 text-indigo-400" />
                      </div>
                      <textarea
                        name="address"
                        rows="2"
                        placeholder="123 Main St..."
                        value={formData.address}
                        onChange={handleChange}
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-3 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                      />
                    </div>
                  </div>
                  
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper Navigation */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-8">
              {step > 1 ? (
                 <button type="button" onClick={prevStep} className="px-6 py-2.5 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-100 transition-colors active:scale-95">
                   Back
                 </button>
              ) : <div />}

              {step < 3 ? (
                <button key="btn-continue" type="button" onClick={nextStep} className="px-8 py-3 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-95">
                  Continue
                </button>
              ) : (
                <button key="btn-submit" type="submit" disabled={isSubmitting} className="px-8 py-3 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none active:scale-95 flex items-center gap-2">
                  {isSubmitting ? "Processing..." : "Create Account 🚀"}
                </button>
              )}
            </div>
          </form>

          <p className="text-sm text-center text-gray-500 mt-8 font-medium">
            Already have an account?{" "}
            <Link to="/signin" className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}