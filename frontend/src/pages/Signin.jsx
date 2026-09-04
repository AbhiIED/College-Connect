import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL, setToken } from "../utils/api";
import Logo from "../components/common/Logo";

export default function Signin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignin = async (e) => {
    e.preventDefault();
    setError("");
    
    // Client-side Validation
    let hasError = false;
    const errors = { email: "", password: "" };

    if (!email.trim()) {
      errors.email = "Email address is required";
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
      hasError = true;
    }

    if (!password) {
      errors.password = "Password is required";
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({ email: "", password: "" });
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // receive httpOnly refresh token cookie
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setToken(data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.User_Type_ID === 3) {
          navigate("/admin-dashboard");
        } else {
          navigate("/homepage");
        }
      } else if (res.status === 403 && data.needsVerification) {
        // Email not verified — redirect to OTP page
        navigate("/verify-otp", { state: { email: data.email } });
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Signin error:", err);
      setError("Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 lg:grid lg:grid-cols-2">
      <div className="hidden bg-indigo-700 text-white lg:flex flex-col justify-center items-center p-10">
        <Logo size="xl" variant="light" to={null} className="mb-6" />
        <h1 className="text-3xl font-bold text-center">Welcome Back to CollegeConnect</h1>
        <p className="text-center mt-4 text-indigo-100 max-w-sm">
          Reconnect with your network, stay updated, and continue your journey with us.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-4 lg:hidden">
            <Logo size="lg" to={null} showText={false} />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Sign In</h2>
          <p className="text-sm text-gray-500 text-center mb-8">Access your CollegeConnect account.</p>

          <form onSubmit={handleSignin} className="space-y-6" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: "" }));
                }}
                className={`block w-full rounded-lg border-2 bg-white px-3 py-2 text-base text-gray-900 shadow-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                  fieldErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-300"
                }`}
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: "" }));
                }}
                className={`block w-full rounded-lg border-2 bg-white px-3 py-2 text-base text-gray-900 shadow-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                  fieldErrors.password ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-300"
                }`}
              />
              {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold text-lg shadow-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transform transition"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-semibold text-indigo-700 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
