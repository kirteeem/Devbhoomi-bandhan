import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, HelpCircle, Sparkles, PhoneCall, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Account & Profile",
    question: "How do I verify my profile on Devbhoomi Bandhan?",
    answer: "Profile verification is done manually by our team: complete your profile, add a photo, and optionally submit the name on your government ID in Settings. Once our team reviews and confirms it, your profile receives a 'Verified' badge, which increases credibility and matching rates by over 60%."
  },
  {
    category: "Account & Profile",
    question: "Can I hide my profile photo from specific members?",
    answer: "Yes. Our advanced privacy controls allow you to choose who views your profile photos. You can set visibility options to 'All Members', 'Premium Only', or 'Only Accepted Matches' within your Settings panel."
  },
  {
    category: "Kundali & Matching",
    question: "How accurate is the Free Kundali matching system?",
    answer: "Our automated Kundali matching platform runs on authentic Vedic astrology calculations. It evaluates Guna Milan, Dosha configurations (like Manglik Dosha), and planetary alignments to provide an deeply analytical compatibility rating report."
  },
  {
    category: "Premium Membership",
    question: "What are the benefits of upgrading to a Premium Plan?",
    answer: "Premium memberships instantly lift the curtain on your profile insights. You can see who visited your profile, access unlocked high-definition photo views, initiate direct chat messaging protocols, and get priority visibility features."
  },
  {
    category: "Premium Membership",
    question: "Is my payment details secure?",
    answer: "Completely secure. All financial transactions are processed through enterprise-grade encrypted payment pathways (Razorpay/Stripe). Devbhoomi Bandhan never records or keeps your credit card details on our local database logs."
  },
  {
    category: "Support & Security",
    question: "How do you protect members from fake profiles?",
    answer: "Every individual application profile undergoes a thorough manual screening process managed by our security operations team. We actively monitor suspicious behaviors and prompt users for automated validation protocols to guarantee a secure environment."
  }
];

const categories = ["All", "Account & Profile", "Kundali & Matching", "Premium Membership", "Support & Security"];

export const Faq: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#FBF9F6] text-[#1C1917] antialiased selection:bg-[#6B122F]/10 relative px-[4vw] py-[6vh]">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 -z-10 w-[70vw] sm:w-[40vw] aspect-square bg-gradient-to-b from-[#6B122F]/8 via-transparent to-transparent blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute top-[30vh] -left-10 -z-10 w-[60vw] sm:w-[35vw] aspect-square bg-gradient-to-tr from-[#7A1E3A]/4 to-transparent blur-3xl opacity-40 pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="text-center space-y-[1.5vh] mb-[5vh]">
          <div className="inline-flex items-center gap-[1.5vw] sm:gap-[0.5vw] rounded-full bg-[#6B122F]/5 px-[3vw] sm:px-[1.2vw] py-[0.8vh] text-[2.5vw] sm:text-[1.4vw] lg:text-[0.75vw] font-bold uppercase tracking-widest text-[#6B122F]">
            <Sparkles className="w-[3vw] h-[3vw] sm:w-[1.2vw] sm:h-[1.2vw] lg:w-[0.9vw] lg:h-[0.9vw] fill-[#6B122F]/10" /> 
            Support Desk
          </div>

          <h1 className="font-serif text-[7.5vw] sm:text-[5.5vw] lg:text-[3.2vw] font-black tracking-tight text-[#1C1917] leading-[1.12]">
            Frequently Asked <span className="font-light italic text-[#6B122F]">Questions</span>
          </h1>

          <p className="text-[3.6vw] sm:text-[2vw] lg:text-[0.95vw] font-medium text-[#78716C] max-w-lg mx-auto leading-relaxed">
            Everything you need to know about finding your perfect life partner securely under the blessings of Maa Naina Devi.
          </p>

          {/* Search Engine Input */}
          <div className="w-full max-w-xl mx-auto mt-[3vh] relative">
            <div className="absolute inset-y-0 left-[3vw] sm:left-[1.2vw] flex items-center pointer-events-none text-stone-400">
              <Search className="w-[4vw] h-[4vw] sm:w-[2vw] sm:h-[2vw] lg:w-[1.1vw] lg:h-[1.1vw]" />
            </div>
            <input
              type="text"
              placeholder="Search running concerns, guidelines, setup questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#EFECE6] rounded-[3vw] sm:rounded-[1.5vw] lg:rounded-2xl py-[1.8vh] pl-[9vw] sm:pl-[4vw] lg:pl-[3vw] pr-[4vw] text-[3.2vw] sm:text-[1.8vw] lg:text-[0.85vw] font-medium text-[#1C1917] placeholder-stone-400 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#6B122F]/20 focus:border-[#6B122F]"
            />
          </div>
        </div>

        {/* FILTER CATEGORY PILLS BAR (Scrollbar hidden inline) */}
        <div 
          className="flex items-center sm:justify-center gap-[1.5vw] sm:gap-[0.8vw] mb-[4vh] border-b border-[#EFECE6] pb-[2.5vh] overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => { setActiveCategory(category); setExpandedIndex(null); }}
              className={`whitespace-nowrap px-[3.5vw] sm:px-[1.5vw] py-[1vh] rounded-[2vw] sm:rounded-[1vw] text-[2.8vw] sm:text-[1.5vw] lg:text-[0.75vw] font-bold tracking-wide transition-all ${
                activeCategory === category
                  ? "bg-[#6B122F] text-white shadow-md shadow-[#6B122F]/10"
                  : "bg-white border border-[#EFECE6] text-[#78716C] hover:border-[#6B122F]/20 hover:text-[#6B122F]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* ACCORDION LIST WRAPPER */}
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-[6vh] border border-dashed border-[#EFECE6] rounded-[4vw] sm:rounded-[2vw] bg-white p-[4vw]">
            <HelpCircle className="w-[8vw] h-[8vw] sm:w-[4vw] sm:h-[4vw] lg:w-[2vw] lg:h-[2vw] mx-auto text-stone-300 mb-[1.5vh]" />
            <p className="text-[3.2vw] sm:text-[1.8vw] lg:text-[0.85vw] font-medium text-[#78716C]">
              No answers match your specific parameters.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-[1.5vh]">
            {filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-[3vw] sm:rounded-[1.5vw] lg:rounded-2xl border border-[#EFECE6] bg-white overflow-hidden transition-all duration-300 hover:border-[#6B122F]/20 hover:shadow-sm"
                >
                  <button
                    onClick={() => toggleExpand(idx)}
                    className="w-full flex items-center justify-between gap-[3vw] p-[3.5vw] sm:p-[1.8vw] text-left font-serif font-bold text-[3.8vw] sm:text-[2.2vw] lg:text-[1.1vw] text-[#1C1917] hover:text-[#6B122F] transition-colors"
                  >
                    <span className="leading-tight">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className={`shrink-0 text-stone-400 ${isExpanded ? "text-[#6B122F]" : ""}`}
                    >
                      <ChevronDown className="w-[4vw] h-[4vw] sm:w-[2vw] sm:h-[2vw] lg:w-[1.2vw] lg:h-[1.2vw]" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-[3.5vw] sm:px-[1.8vw] pb-[3.5vw] sm:pb-[1.8vw] pt-[0.5vh] text-[3.2vw] sm:text-[1.8vw] lg:text-[0.85vw] leading-relaxed text-[#78716C] font-medium border-t border-dashed border-[#FAF8F5]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* HELPLINE CTA BANNER */}
        <div className="mt-[6vh] rounded-[4vw] sm:rounded-[2vw] border border-[#EFECE6] bg-gradient-to-br from-white to-[#FAF8F5] p-[5vw] sm:p-[3vw] text-center shadow-sm">
          <h3 className="font-serif text-[4.5vw] sm:text-[2.8vw] lg:text-[1.3vw] font-bold text-[#1C1917]">
            Still have pending concerns?
          </h3>
          <p className="text-[3vw] sm:text-[1.6vw] lg:text-[0.8vw] font-medium text-[#78716C] mt-[0.5vh]">
            Our customer experience agents are available live to guide you.
          </p>
          
          <div className="mt-[3vh] flex flex-col sm:flex-row items-center justify-center gap-[2vh] sm:gap-[1vw]">
            <Link 
              to="/contact"
              className="flex w-full sm:w-auto items-center justify-center gap-[2vw] sm:gap-[0.5vw] rounded-[2vw] sm:rounded-[1vw] bg-[#6B122F] px-[5vw] sm:px-[2vw] py-[1.5vh] text-[3.2vw] sm:text-[1.6vw] lg:text-[0.8vw] font-bold text-white shadow-md shadow-[#6B122F]/5 transition-all hover:bg-[#520B21]"
            >
              <MessageCircle className="w-[3.8vw] h-[3.8vw] sm:w-[1.8vw] sm:h-[1.8vw] lg:w-[0.9vw] lg:h-[0.9vw]" /> 
              Send Message
            </Link>
            <a 
              href="tel:+91XXXXXXXXXX"
              className="flex w-full sm:w-auto items-center justify-center gap-[2vw] sm:gap-[0.5vw] rounded-[2vw] sm:rounded-[1vw] border border-[#EFECE6] bg-white px-[5vw] sm:px-[2vw] py-[1.5vh] text-[3.2vw] sm:text-[1.6vw] lg:text-[0.8vw] font-bold text-[#78716C] hover:border-[#6B122F]/20 hover:text-[#6B122F] transition-all"
            >
              <PhoneCall className="w-[3.8vw] h-[3.8vw] sm:w-[1.8vw] sm:h-[1.8vw] lg:w-[0.9vw] lg:h-[0.9vw]" /> 
              Call Helpline
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};