import { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  CreditCard, 
  HelpCircle, 
  ChevronRight, 
  FileText,
  Clock
} from "lucide-react";

export function TermsAndPolicies() {
  const [activeSection, setActiveSection] = useState("terms");

  const navItems = [
    { id: "terms", label: "1. Acceptance of Terms", icon: ShieldCheck },
    { id: "privacy", label: "2. Privacy & Data Protection", icon: Lock },
    { id: "conduct", label: "3. User Conduct & Verification", icon: UserCheck },
    { id: "payments", label: "4. Billing & Subscriptions", icon: CreditCard },
    { id: "support", label: "5. Contact & Inquiries", icon: HelpCircle },
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
              <FileText className="h-4 w-4" /> Legal & Governance
            </div>
            <h1 className="text-3xl font-extrabold sm:text-5xl font-serif text-amber-50">
              Terms & Policies
            </h1>
            <p className="mt-4 text-base sm:text-lg text-amber-100/90 leading-relaxed font-light">
              Transparent rules and strict privacy commitments designed to safeguard your journey on Devbhoomi Bandhan.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-amber-200/80">
              <Clock className="h-4 w-4" />
              <span>Last revised: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>

          {/* Decorative Background Pattern */}
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <ShieldCheck className="h-80 w-80 text-white" />
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
              id="terms"
              className="scroll-mt-28 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-amber-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
                  1. Acceptance of Terms
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Welcome to Devbhoomi Bandhan. By accessing our platform, website, or associated mobile applications, you agree to enter into a legally binding agreement and strictly adhere to these Terms & Policies.
              </p>
              <div className="mt-4 rounded-xl bg-amber-50/60 p-4 border-l-4 border-amber-700 text-xs sm:text-sm text-amber-900 leading-relaxed">
                <span className="font-semibold">Note:</span> If you do not consent to any section of these guidelines, please discontinue using our portal immediately.
              </div>
            </section>

            {/* Section 2 */}
            <section
              id="privacy"
              className="scroll-mt-28 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-amber-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
                  2. Privacy & Data Protection
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
                Your personal details, profile photos, and horoscopes (Kundalis) are handled with extreme confidentiality and standard modern encryption protocols.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Data Ownership</h3>
                  <p className="text-xs text-gray-600">You retain full ownership of your data. We never sell profile data to advertising aggregators.</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Privacy Controls</h3>
                  <p className="text-xs text-gray-600">Customize photo visibility, contact details, and Kundali access directly from Settings.</p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section
              id="conduct"
              className="scroll-mt-28 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-amber-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <UserCheck className="h-6 w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
                  3. User Conduct & Verification
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
                Devbhoomi Bandhan is built on trust and cultural integrity. To ensure a safe community, all members are expected to maintain authentic profiles.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="h-2 w-2 rounded-full bg-amber-700 mt-2 flex-shrink-0" />
                  <span>Misrepresentation of age, marital status, or government ID details will result in permanent account suspension.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-2 w-2 rounded-full bg-amber-700 mt-2 flex-shrink-0" />
                  <span>Harassment, spamming, or inappropriate messaging is zero-tolerated and flagged directly to community admins.</span>
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section
              id="payments"
              className="scroll-mt-28 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-amber-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
                  4. Billing & Subscriptions
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Membership packages and paid Kundali generation services are processed transparently. Refunds follow strict verification guidelines detailed in our subscription terms.
              </p>
            </section>

            {/* Section 5 */}
            <section
              id="support"
              className="scroll-mt-28 rounded-2xl bg-gradient-to-r from-amber-50/80 to-orange-50/50 p-6 sm:p-8 border border-amber-200/80 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-amber-900 text-amber-50">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
                  5. Need Legal Clarification?
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-6">
                Have specific questions or concerns about your profile privacy and terms? Our dedicated compliance team is here to assist.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-900 px-6 py-3 text-sm font-medium text-amber-50 shadow-md hover:bg-amber-800 hover:shadow-lg transition-all"
              >
                Reach Out to Support <ChevronRight className="h-4 w-4" />
              </a>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}

export default TermsAndPolicies;