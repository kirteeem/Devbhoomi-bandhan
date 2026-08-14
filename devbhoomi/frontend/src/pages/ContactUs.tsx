import React, { useState } from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../lib/axios";
import { getFriendlyErrorMessage } from "../lib/errorMessage";

export const ContactUs: React.FC = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await api.post("/contact", formState);
      setIsSubmitted(true);
      setFormState({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setErrorMessage(
        getFriendlyErrorMessage(err, "We couldn't send your message. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] antialiased">
      {/* --- HERO HEADER SECTION --- */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#7B1E3D] to-[#5C132B] px-6 py-20 text-center text-white">
        {/* Decorative Glow Shapes */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-[#E8CD7A] blur-3xl" />
          <div className="absolute -bottom-20 right-20 h-80 w-80 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#E8CD7A] uppercase backdrop-blur-sm">
            <ShieldCheck size={14} /> Here For You
          </span>
          <h1 className="font-display text-4xl font-black tracking-tight sm:text-5xl">
            Let's Start a <span className="text-[#E8CD7A]">Conversation</span>
          </h1>
          <p className="mx-auto max-w-xl text-sm font-medium text-neutral-200/90 leading-relaxed">
            Have questions about verification, premium plans, or need assistance navigating your matrimonial journey? Our dedicated support team is here to help.
          </p>
        </div>
      </div>

      {/* --- MAIN CONTENT SECTION --- */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          
          {/* COLUMN 1 & 2: CONTACT FORM */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="lg:col-span-2 rounded-[24px] border border-[#ECE8E2] bg-white p-6 sm:p-8 shadow-sm"
          >
            {isSubmitted ? (
              <div className="flex h-full min-h-[380px] flex-col items-center justify-center space-y-4 py-12 text-center">
                <div className="rounded-full bg-[#2E6F57]/10 p-4 text-[#2E6F57]">
                  <CheckCircle2 size={44} />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#1A1A1A]">Message Sent Successfully!</h3>
                <p className="max-w-md text-sm text-neutral-500 leading-relaxed">
                  Thank you for reaching out to DevBhoomi Bandhan. A relationship manager has been assigned to your query and will reply within 2 to 4 business hours.
                </p>
                <button 
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 rounded-xl bg-[#7B1E3D] px-6 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#631831] shadow-sm"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#1A1A1A]">Send a Secure Message</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">Your privacy is safe with us. Fields marked with * are required.</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-bold text-neutral-700">Full Name *</label>
                    <input 
                      id="name"
                      name="name"
                      type="text" 
                      required
                      placeholder="e.g., Amit Sharma"
                      className="w-full rounded-xl border border-[#ECE8E2] bg-[#FAF8F5]/40 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#7B1E3D] focus:bg-white focus:ring-2 focus:ring-[#7B1E3D]/10"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-bold text-neutral-700">Email Address *</label>
                    <input 
                      id="email"
                      name="email"
                      type="email" 
                      required
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-[#ECE8E2] bg-[#FAF8F5]/40 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#7B1E3D] focus:bg-white focus:ring-2 focus:ring-[#7B1E3D]/10"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-xs font-bold text-neutral-700">Phone Number</label>
                    <input 
                      id="phone"
                      name="phone"
                      type="tel" 
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full rounded-xl border border-[#ECE8E2] bg-[#FAF8F5]/40 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#7B1E3D] focus:bg-white focus:ring-2 focus:ring-[#7B1E3D]/10"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5 relative">
                    <label htmlFor="subject" className="text-xs font-bold text-neutral-700">Subject *</label>
                    <div className="relative">
                      <select 
                        id="subject"
                        name="subject"
                        required
                        className="w-full rounded-xl border border-[#ECE8E2] bg-[#FAF8F5]/40 px-4 py-3 pr-10 text-sm font-medium outline-none transition-all focus:border-[#7B1E3D] focus:bg-white focus:ring-2 focus:ring-[#7B1E3D]/10 appearance-none cursor-pointer"
                        value={formState.subject}
                        onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                      >
                        <option value="" disabled>Select an option</option>
                        <option value="Premium Subscription">Premium Subscription Plans</option>
                        <option value="Profile Verification">ID / Profile Verification Help</option>
                        <option value="Technical Issue">Report a Technical Bug</option>
                        <option value="Partnership">Business Partnership</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-xs font-bold text-neutral-700">Your Message *</label>
                  <textarea 
                    id="message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Describe how our support team can assist you..."
                    className="w-full rounded-xl border border-[#ECE8E2] bg-[#FAF8F5]/40 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#7B1E3D] focus:bg-white focus:ring-2 focus:ring-[#7B1E3D]/10 resize-none"
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7B1E3D] py-3.5 text-sm font-bold text-white shadow-md shadow-[#7B1E3D]/10 transition-all hover:bg-[#631831] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send size={16} />
                    </>
                  )}
                </button>

                {errorMessage && (
                  <div className="flex items-start gap-3 rounded-xl border border-[#7B1E3D]/20 bg-[#7B1E3D]/5 p-4 text-xs font-semibold text-[#7B1E3D]">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </form>
            )}
          </motion.div>

          {/* COLUMN 3: DIRECT CONTACT INFORMATION */}
          <div className="space-y-6">
            
            {/* Direct Connect Card */}
            <div className="rounded-[24px] border border-[#ECE8E2] bg-white p-6 space-y-6 shadow-sm">
              <h3 className="font-display text-xs font-black uppercase tracking-wider text-[#7B1E3D]">Direct Connect</h3>
              
              <div className="space-y-5">
                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7B1E3D]/5 text-[#7B1E3D]">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-400">Call Support</h4>
                    <p className="text-sm font-bold text-[#1A1A1A] mt-0.5">+91 8219777250</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Toll-free / Premium Helpdesk</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7B1E3D]/5 text-[#7B1E3D]">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-400">Email Address</h4>
                    <p className="text-sm font-bold text-[#1A1A1A] mt-0.5 break-all">kirteemsharma.dev@gmail.com</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Replies within 2-4 business hours</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7B1E3D]/5 text-[#7B1E3D]">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-400">Main Office</h4>
                    <p className="text-sm font-bold text-[#1A1A1A] mt-0.5">Main Bazaar, Rewalsar</p>
                    <p className="text-xs font-medium text-neutral-600">Mandi, Himachal Pradesh - 175023</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7B1E3D]/5 text-[#7B1E3D]">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-400">Operating Hours</h4>
                    <p className="text-sm font-bold text-[#1A1A1A] mt-0.5">9:00 AM - 6:00 PM</p>
                    <p className="text-[11px] text-[#2E6F57] font-semibold mt-0.5">Monday to Saturday Operational</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Base Prompt */}
            <div className="rounded-[24px] border border-dashed border-[#7B1E3D]/30 bg-[#7B1E3D]/5 p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#7B1E3D]">
                <MessageSquare size={18} />
                <h4 className="font-display text-sm font-bold">Looking for instant answers?</h4>
              </div>
              <p className="text-xs font-medium text-neutral-600 leading-relaxed">
                Check out our FAQ page. We have detailed explanations regarding profile visibility rules, horoscope matching criteria, and photo verification timelines.
              </p>
              <a 
                href="/faq" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B1E3D] underline hover:text-[#631831] transition-colors"
              >
                <HelpCircle size={14} /> Read FAQs & Knowledge Base
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;