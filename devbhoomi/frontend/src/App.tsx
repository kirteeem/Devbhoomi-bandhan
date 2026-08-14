import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { useLenis } from "./hooks/useLenis";

import { Home } from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import TermsAndPolicies from "./pages/TermsAndPolicies"; // Added TermsAndPolicies import
import { Login } from "./pages/Login";
import { LoginOtp } from "./pages/LoginOtp";
import { ForgotPassword } from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { VerifyEmail } from "./pages/VerifyEmail";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { Matches } from "./pages/Matches";
import { Kundali } from "./pages/Kundali";
import { KundaliReport } from "./pages/KundaliReport";
import { SuccessStories } from "./pages/SuccessStories";
import { Settings } from "./pages/Settings";
import { Subscription } from "./pages/Subscription";
import { NotFound } from "./pages/NotFound";
import { ProfileWizard } from "./pages/ProfileWizard"; 
import { ProfilePreview } from "./pages/ProfilePreview";
import { Shortlist } from "./pages/Shortlist";
import { Visitors } from "./pages/Visitors";
import { PaymentHistory } from "./pages/PaymentHistory";
import { Checkout } from "./pages/Checkout";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { Notifications } from "./pages/Notifications";
import { Pricing } from "./pages/Pricing";
import { ContactUs } from "./pages/ContactUs"; 
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { Faq } from "./components/home/FAQ"; 
import RefundAndCancellation from "./pages/RefundAndCancellation";
export function App() {
  useLenis(); // site-wide smooth scroll
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF8F3]">
      <Navbar />

      {/* Hero offsets layout automatically. All secondary routing subpages get dynamic padding top */}
      <main className={`flex-grow ${location.pathname === "/" ? "" : "pt-[76px]"}`}>
        <Routes>
          {/* Public Routing Architecture */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/terms-and-policies" element={<TermsAndPolicies />} /> {/* Route for Terms & Policies */}
          <Route path="/terms" element={<TermsAndPolicies />} /> {/* Optional alias so /terms also works */}
          <Route path="/login" element={<Login />} />
          <Route path="/login/otp" element={<LoginOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/kundali" element={<Kundali />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/refund-policy" element={<RefundAndCancellation />} />

          {/* Secure Protected Architectures */}
          <Route
            path="/kundali/report/:requestId"
            element={
              <ProtectedRoute>
                <KundaliReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <ProfilePreview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/create"
            element={
              <ProtectedRoute>
                <ProfileWizard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/billing"
            element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/:planId"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/success"
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments/history"
            element={
              <ProtectedRoute>
                <PaymentHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shortlist"
            element={
              <ProtectedRoute>
                <Shortlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visitors"
            element={
              <ProtectedRoute>
                <Visitors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin", "priest"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;