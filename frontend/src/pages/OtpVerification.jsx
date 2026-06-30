import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OtpVerification() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentOtp, setResentOtp] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state?.email, otp }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsSuccess(true);
        setMessage("✅ Email verified successfully! Redirecting to sign in...");
        setTimeout(() => navigate("/signin"), 2000);
      } else {
        setIsSuccess(false);
        setMessage(data.error || "❌ Invalid OTP. Try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setIsSuccess(false);
      setMessage("⚠️ Server error. Please try later.");
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state?.email }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsSuccess(true);
        if (data.otp) {
          setResentOtp(data.otp);
          setMessage("📧 A new code has been generated (shown below).");
        } else {
          setMessage("📧 A new code has been sent to your email.");
        }
      } else {
        setIsSuccess(false);
        setMessage(data.error || "❌ Failed to resend OTP.");
      }
    } catch (error) {
      console.error("Error:", error);
      setIsSuccess(false);
      setMessage("⚠️ Server error. Please try later.");
    } finally {
      setResending(false);
    }
  };

  if (!state?.email) {
    return (
      <div className="flex h-screen justify-center items-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">No email provided</h2>
          <p className="text-gray-600 mb-4">Please sign up first to receive a verification code.</p>
          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Go to Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          We sent a 6-digit code to <strong>{state.email}</strong>
        </p>
        {(state.otp || resentOtp) && (
          <div className="mb-6 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
            <span className="block text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-1">
              🔑 Dev Mode Auto-generated OTP
            </span>
            <span className="text-xl font-mono font-bold text-indigo-700 tracking-widest">
              {resentOtp || state.otp}
            </span>
          </div>
        )}
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            maxLength="6"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="block w-full rounded-lg border-2 border-gray-400 px-4 py-3 text-center text-2xl tracking-widest focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500 transition"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Verify OTP
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={handleResendOTP}
            disabled={resending}
            className="text-indigo-600 text-sm font-medium hover:underline disabled:text-gray-400"
          >
            {resending ? "Sending..." : "Didn't receive the code? Resend"}
          </button>
        </div>

        {message && (
          <p className={`text-center text-sm mt-3 ${isSuccess ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
