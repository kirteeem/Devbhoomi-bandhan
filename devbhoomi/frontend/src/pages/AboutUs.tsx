import React from "react";
import { motion } from "framer-motion";

export const AboutUs: React.FC = () => {
  const stats = [
    { value: "10,000+", label: "Verified Profiles" },
    { value: "98.5%", label: "Match Accuracy" },
    { value: "15+", label: "Years of Trust" },
    { value: "100%", label: "Privacy Assured" },
  ];

  const features = [
    {
      title: "Verified & Authentic Profiles",
      description:
        "Every member undergoes stringent identity and background verification for absolute peace of mind.",
      icon: (
        <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Discreet & Private Matchmaking",
      description:
        "Your privacy is our priority. You remain in complete control of who views your photos and contact details.",
      icon: (
        <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: "Cultural & Astro Compatibility",
      description:
        "Combining Kundali compatibility and Vedic insights with modern preferences and long-term family goals.",
      icon: (
        <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-800">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-200">
          Devbhoomi Bandhan
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
          Crafting Sacred & Timeless <span className="text-amber-700 italic">Love Stories</span>
        </h1>
        <p className="text-slate-600 text-base md:text-lg leading-relaxed pt-2">
          Where traditions meet modern expectations. We bring together individuals and families grounded in shared values, family heritage, and lifelong commitment.
        </p>
      </motion.div>

      {/* Feature Cards Grid */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="p-8 rounded-2xl bg-white border border-amber-200/70 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-5 border border-amber-100">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold font-serif text-slate-900 mb-2">{item.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Luxury Stats Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-20 py-12 px-6 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white shadow-xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center border border-amber-500/20"
      >
        {stats.map((stat, idx) => (
          <div key={idx} className="space-y-1">
            <p className="text-3xl md:text-4xl font-serif font-bold text-amber-400">{stat.value}</p>
            <p className="text-xs md:text-sm text-slate-300 uppercase tracking-wider font-medium">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default AboutUs;