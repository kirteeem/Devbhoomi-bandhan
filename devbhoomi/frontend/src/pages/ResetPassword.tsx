import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ArrowLeft 
} from "lucide-react";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Retrieve token from URL query params
  const token = new URLSearchParams(location.search).get("token");

  // Form States
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Real-time Validation States
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid = hasMinLength && hasNumber && hasLetter && passwordsMatch;

  // Auto-focus the first password field when token is present
  useEffect(() => {
    if (token && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [token]);

  // Success redirect countdown with cross-platform browser typing
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isSuccess && countdown === 0) {
      navigate("/login");
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading || !token) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      await axios.post("/api/auth/reset-password", {
        token,
        password,
      });
      setIsSuccess(true);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message || 
          "Failed to reset password. The link might have expired or is invalid."
        );
      } else {
        setErrorMessage("A network error occurred. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // State 1: Invalid or Missing Token Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#F5EFEB] p-8 text-center space-y-6 transform transition-all duration-300">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 border border-red-100">
            <XCircle className="h-8 w-8 text-[#800020]" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[#1A212F] tracking-tight">
              Invalid Reset Link
            </h2>
            <p className="text-[#6E6E6E] text-sm leading-relaxed">
              This password reset link is invalid, malformed, or has expired. Please request a new password reset link.
            </p>
          </div>

          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-[#800020] hover:bg-[#68001a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800020] transition-colors duration-200"
          >
            Request New Link
          </button>

          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center text-sm font-medium text-[#800020] hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // State 2: Success Screen
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#F5EFEB] p-8 text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 border border-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[#1A212F] tracking-tight">
              Password Reset Successful
            </h2>
            <p className="text-[#6E6E6E] text-sm leading-relaxed">
              Your password has been changed successfully. You will be automatically redirected to the login page in{" "}
              <span className="font-semibold text-[#800020]">{countdown}s</span>.
            </p>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-[#800020] hover:bg-[#68001a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800020] transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // State 3: Active Form Reset Screen
  return (
    <div className="min-h-screen bg-[#FCFBF7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        {/* Premium Brand Logo */}
        <div className="inline-flex items-center justify-center space-x-2">
          <span className="text-2xl font-bold tracking-wider text-[#800020]" style={{ fontFamily: "serif" }}>
            Devbhoomi Bandhan
          </span>
        </div>
        <p className="mt-1 text-xs tracking-widest text-[#9A8A78] uppercase font-semibold">
          Premium Matrimony Platform
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl border border-[#F5EFEB]">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#FCFBF7] border border-[#F5EFEB] mb-3">
              <Lock className="h-5 w-5 text-[#800020]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1A212F]">
              Set New Password
            </h2>
            <p className="text-xs text-[#6E6E6E] mt-1">
              Please enter your new password details to access your account.
            </p>
          </div>

          {errorMessage && (
            <div 
              role="alert" 
              className="mb-5 p-3.5 bg-red-50 border-l-4 border-[#800020] rounded-r-lg flex items-start space-x-2.5"
            >
              <AlertCircle className="h-5 w-5 text-[#800020] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#800020] font-medium leading-relaxed">
                {errorMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-xs font-semibold text-[#1A212F] uppercase tracking-wider mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  ref={passwordInputRef}
                  required
                  aria-invalid={!isFormValid}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-[#FCFBF7] border border-[#EBE6DF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800020] focus:border-transparent transition-all duration-150 text-[#1A212F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label 
                htmlFor="confirm-password" 
                className="block text-xs font-semibold text-[#1A212F] uppercase tracking-wider mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  aria-invalid={!passwordsMatch}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-[#FCFBF7] border border-[#EBE6DF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800020] focus:border-transparent transition-all duration-150 text-[#1A212F]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Validation Checklist */}
            <div className="p-3 bg-[#FCFBF7] rounded-xl border border-[#EBE6DF] space-y-2">
              <span className="block text-[11px] font-bold text-[#9A8A78] uppercase tracking-wider mb-1">
                Password Criteria
              </span>
              <ul className="space-y-1.5">
                <li className="flex items-center text-xs">
                  {hasMinLength ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mr-2 flex-shrink-0" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-300 mr-3 ml-1" />
                  )}
                  <span className={hasMinLength ? "text-green-700 font-medium" : "text-gray-500"}>
                    At least 8 characters
                  </span>
                </li>
                <li className="flex items-center text-xs">
                  {hasLetter ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mr-2 flex-shrink-0" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-300 mr-3 ml-1" />
                  )}
                  <span className={hasLetter ? "text-green-700 font-medium" : "text-gray-500"}>
                    At least one letter
                  </span>
                </li>
                <li className="flex items-center text-xs">
                  {hasNumber ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mr-2 flex-shrink-0" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-300 mr-3 ml-1" />
                  )}
                  <span className={hasNumber ? "text-green-700 font-medium" : "text-gray-500"}>
                    At least one number
                  </span>
                </li>
                <li className="flex items-center text-xs">
                  {passwordsMatch ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mr-2 flex-shrink-0" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-300 mr-3 ml-1" />
                  )}
                  <span className={passwordsMatch ? "text-green-700 font-medium" : "text-gray-500"}>
                    Passwords match
                  </span>
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-semibold rounded-xl text-white transition-all duration-200
                ${isFormValid && !isLoading
                  ? "bg-[#800020] hover:bg-[#68001a] cursor-pointer" 
                  : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          {/* Secondary Action Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center text-xs font-medium text-[#800020] hover:underline"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}