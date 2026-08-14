import React from "react";
import { Link } from "react-router-dom";
import { Heart, AlertTriangle } from "lucide-react";
import logo from "../../assets/logo.jpeg"; // Main brand logo
import nainadevi from "../../assets/nainadevi.png"; // Naina Devi image

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-black/5 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">

        {/* Top */}
        <div className="grid md:grid-cols-12 gap-12 pb-12">

          {/* Logo */}
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logo}
                alt="Devbhoomi Bandhan"
                className="h-14 w-14 rounded-xl object-cover"
              />
              <div>
                <h2 className="text-2xl font-black text-[#7A1E3A]">
                  देवभूमि बंधन
                </h2>
                <p className="text-xs text-gray-500">
                  Devbhoomi Bandhan
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-gray-600">
              माँ नैणा देवी के आशीर्वाद से हिमाचल प्रदेश के संस्कारी परिवारों
              को जोड़ने वाला सुरक्षित, विश्वसनीय और आधुनिक वैवाहिक मंच।
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">

            {/* Explore */}
            <div>
              <h3 className="mb-5 text-xs uppercase tracking-[0.2em] font-bold text-[#7A1E3A]">
                Explore
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/" className="hover:text-[#7A1E3A] transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/matches" className="hover:text-[#7A1E3A] transition">
                    Browse Matches
                  </Link>
                </li>
                <li>
                  <Link to="/kundali" className="hover:text-[#7A1E3A] transition">
                    Free Kundali
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-[#7A1E3A] transition">
                    Membership Plans
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-5 text-xs uppercase tracking-[0.2em] font-bold text-[#7A1E3A]">
                Support
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/contact" className="hover:text-[#7A1E3A] transition">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-[#7A1E3A] transition">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#7A1E3A] transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/success-stories" className="hover:text-[#7A1E3A] transition">
                    Success Stories
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="mb-5 text-xs uppercase tracking-[0.2em] font-bold text-[#7A1E3A]">
                Legal
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/privacy" className="hover:text-[#7A1E3A] transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#7A1E3A] transition">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-[#7A1E3A] transition">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-800 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <p>
            <span className="font-bold uppercase tracking-wider text-amber-900 mr-1">Important:</span>{" "}
            Devbhoomi Bandhan never asks for money or bank details over phone calls or unauthorized links.
          </p>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="flex items-center gap-2 text-sm text-gray-500">
            © {new Date().getFullYear()} Devbhoomi Bandhan
            <Heart size={14} className="fill-[#7A1E3A] text-[#7A1E3A]" />
            Made in Himachal Pradesh
          </p>

          <div className="flex items-center gap-2 rounded-full border border-[#7A1E3A]/20 bg-[#7A1E3A]/5 px-5 py-2 text-sm font-semibold text-[#7A1E3A]">
            {/* Left Naina Devi Image Slot */}
            <img 
              src={nainadevi} 
              alt="Maa Naina Devi" 
              className="h-5 w-5 rounded-full object-cover" 
            />

            <span>जय माता नैणा देवी</span>

            {/* Right Naina Devi Image Slot */}
            <img 
              src={nainadevi} 
              alt="Maa Naina Devi" 
              className="h-5 w-5 rounded-full object-cover" 
            />
          </div>
        </div>

      </div>
    </footer>
  );
};