import { useState } from "react";
import { 
  RotateCcw, 
  Ban, 
  Mail, 
  Clock, 
  ChevronRight, 
  CreditCard,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2
} from "lucide-react";

export function RefundAndCancellation() {
  const [activeSection, setActiveSection] = useState("subscriptions");

  const navItems = [
    { id: "subscriptions", label: "1. Subscription Plans", icon: CreditCard },
    { id: "cancellation", label: "2. Service Cancellation by Us", icon: RotateCcw },
    { id: "no-refund", label: "3. No Refund Cases", icon: Ban },
    { id: "request", label: "4. Requesting a Refund", icon: Mail },
  ];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Gradient Blurs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Header Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 p-8 sm:p-12 text-white shadow-xl mb-10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-200 backdrop-blur-md mb-4 border border-white/10">
              <RotateCcw className="h-4 w-4" /> Payment Governance
            </div>
            <h1 className="text-3xl font-extrabold sm:text-5xl font-serif text-amber-50">
              Refund & Cancellation Policy
            </h1>
            <p className="mt-4 text-base sm:text-lg text-amber-100/90 leading-relaxed font-light">
              Transparent, straightforward guidelines governing subscription renewals, service disruptions, and refund eligibility at Dev Bhoomi Bandhan.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-amber-200/80">
              <Clock className="h-4 w-4" />
              <span>Last Updated: July 22, 2026</span>
            </div>
          </div>

          {/* Decorative Background Pattern */}
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <RotateCcw className="h-80 w-80 text-white" />
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Sticky Sidebar Nav */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 space-y-2 rounded-2xl bg-white/80 backdrop-blur-md p-4 border border-amber-100 shadow-sm">
              <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-amber-900/60">
                Navigation
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-amber-900 text-amber-50 shadow-md translate-x-1"
                        : "text-gray-700 hover:bg-amber-50/80 hover:text-amber-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? "text-amber-300" : "text-amber-700"}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 opacity-50 ${isActive ? "block" : "hidden"}`} />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Column: Content Cards */}
          <main className="lg:col-span-8 space-y-8">
            
            {/* Section 1 */}
            <section
              id="subscriptions"
              className="scroll-mt-28 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-amber-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
                  1. Subscription Plans
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                All subscription fees are non-refundable once the plan is activated.
              </p>
              <div className="mt-4 rounded-xl bg-amber-50/60 p-4 border-l-4 border-amber-700 text-xs sm:text-sm text-amber-900 leading-relaxed">
                <span className="font-semibold">Auto-Renewal Cancellation:</span> You can cancel auto-renewal anytime directly from your account settings. Cancellation will be effective starting from the next billing cycle.
              </div>
            </section>

            {/* Section 2 */}
            <section
              id="cancellation"
              className="scroll-mt-28 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-amber-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
                  2. Service Cancellation by Us
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                If Dev Bhoomi Bandhan cancels a service due to technical reasons or platform maintenance, a <strong>100% refund</strong> will be processed within <strong>7 working days</strong> back to your original payment method.
              </p>
            </section>

            {/* Section 3 */}
            <section
              id="no-refund"
              className="scroll-mt-28 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-amber-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-red-50 text-red-800 border border-red-200">
                  <Ban className="h-6 w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
                  3. No Refund Cases
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
                Refunds will strictly not be issued under the following circumstances:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mb-2" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Unused Plans</h3>
                    <p className="text-xs text-gray-600">The user chose not to utilize the active subscription during its duration.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                  <ShieldAlert className="h-5 w-5 text-red-600 mb-2" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">False Profiles</h3>
                    <p className="text-xs text-gray-600">Providing false, misleading, or inaccurate information in your profile.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                  <Ban className="h-5 w-5 text-red-600 mb-2" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">T&C Violations</h3>
                    <p className="text-xs text-gray-600">Account suspension or ban due to violation of our Terms & Conditions.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section
              id="request"
              className="scroll-mt-28 rounded-2xl bg-gradient-to-r from-amber-50/80 to-orange-50/50 p-6 sm:p-8 border border-amber-200/80 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-amber-900 text-amber-50">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
                  4. How to Request a Refund
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
                If your situation qualifies for a refund under our policy, please email our billing team with your <strong>Payment ID</strong> within <strong>48 hours</strong> of transaction.
              </p>
              
              <div className="mb-6 rounded-xl bg-white/80 p-4 border border-amber-200/60 text-xs sm:text-sm text-gray-700">
                <p className="font-semibold text-amber-900 mb-1">Contact Email:</p>
                <a href="mailto:support@devbhoomibandhan.com" className="text-amber-800 underline font-medium hover:text-amber-950">
                  support@devbhoomibandhan.com
                </a>
                <p className="mt-2 text-gray-500 text-xs">We evaluate all requests and respond within 3 working days.</p>
              </div>

              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-900 px-6 py-3 text-sm font-medium text-amber-50 shadow-md hover:bg-amber-800 hover:shadow-lg transition-all"
              >
                Go to Help Center <ChevronRight className="h-4 w-4" />
              </a>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}

export default RefundAndCancellation;