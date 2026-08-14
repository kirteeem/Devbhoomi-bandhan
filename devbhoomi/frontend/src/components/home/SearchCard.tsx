import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, GraduationCap, Users2 } from "lucide-react";

const districts = ["Shimla", "Mandi", "Kullu", "Kangra", "Hamirpur", "Una", "Bilaspur", "Solan", "Sirmaur", "Chamba", "Kinnaur", "Lahaul-Spiti"];
const educationLevels = ["Any", "Graduate", "Post Graduate", "Doctorate", "Diploma"];

/**
 * The floating "glass" search widget over the hero.
 * Deliberately avoids boxy native <select> dropdowns (see Shaadi.com reference) —
 * "Looking For" and "Age" are pill-style segmented buttons/steppers instead.
 * District + Education stay as lightweight native selects styled to match, since
 * a full custom combobox isn't worth the complexity here — but they're skinned
 * to disappear into the glass card rather than look like a form.
 */
export const SearchCard = () => {
  const navigate = useNavigate();
  const [lookingFor, setLookingFor] = useState<"bride" | "groom">("bride");
  const [ageRange, setAgeRange] = useState<[number, number]>([24, 32]);
  const [district, setDistrict] = useState("");
  const [education, setEducation] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (district) params.set("district", district);
    if (education) params.set("education", education);
    params.set("minAge", String(ageRange[0]));
    params.set("maxAge", String(ageRange[1]));
    navigate(`/matches?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: "3vh", scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: "-0.5vh" }}
      className="mx-auto max-w-[80vw] rounded-[3vh] border border-white/25 bg-white/10 p-[0.6vw] shadow-[0_3.5vh_7vh_-2.5vh_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-[0.8vw]"
    >
      <div className="grid gap-[1.5vh] rounded-[2.8vh] bg-cream/95 p-[2.5vh] sm:grid-cols-[1.1fr_1.3fr_1fr_1fr_auto] sm:items-end sm:p-[3vh]">
        {/* Looking for — segmented pill control, not a dropdown */}
        <div>
          <label className="mb-[1vh] flex items-center gap-[0.4vw] text-[1.4vh] font-bold uppercase tracking-wide text-muted">
            <Users2 className="w-[1.8vh] h-[1.8vh]" /> Looking For
          </label>
          <div className="flex rounded-[1.2vh] bg-line/60 p-[0.2vw]">
            {(["bride", "groom"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setLookingFor(opt)}
                className={`flex-1 rounded-[1vh] py-[1vh] text-[1.8vh] font-bold capitalize transition-all ${
                  lookingFor === opt ? "bg-maroon text-cream shadow" : "text-ink/60 hover:text-ink"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Age — dual stepper with optimized high-contrast number colors */}
        <div>
          <label className="mb-[1vh] block text-[1.4vh] font-bold uppercase tracking-wide text-muted">Age</label>
          <div className="flex items-center gap-[0.5vw] rounded-[1.2vh] border border-line bg-white px-[0.8vw] py-[1vh]">
            <StepperValue
              value={ageRange[0]}
              onChange={(v) => setAgeRange([Math.max(18, Math.min(v, ageRange[1] - 1)), ageRange[1]])}
            />
            <span className="text-muted">–</span>
            <StepperValue
              value={ageRange[1]}
              onChange={(v) => setAgeRange([ageRange[0], Math.max(v, ageRange[0] + 1)])}
            />
          </div>
        </div>

        {/* District Field */}
        <div>
          <label className="mb-[1vh] flex items-center gap-[0.4vw] text-[1.4vh] font-bold uppercase tracking-wide text-muted">
            <MapPin className="w-[1.8vh] h-[1.8vh]" /> District
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            style={{ color: district ? "#2B2B2B" : "#555", backgroundColor: "#fff" }}
            className="w-full rounded-[1.2vh] border border-line bg-white px-[1vw] py-[1.4vh] text-[1.9vh] font-semibold outline-none transition focus:border-[#8A1538] focus:ring-[0.3vh] focus:ring-[#D4AF37]/30 appearance-none"
          >
            <option value="" style={{ color: "#555" }}>
              Any District
            </option>
            {districts.map((d) => (
              <option key={d} value={d} style={{ color: "#2B2B2B" }}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Education Field */}
        <div>
          <label className="mb-[1vh] flex items-center gap-[0.4vw] text-[1.4vh] font-bold uppercase tracking-wide text-muted">
            <GraduationCap className="w-[1.8vh] h-[1.8vh]" /> Education
          </label>
          <select
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            style={{ color: education ? "#2B2B2B" : "#555", backgroundColor: "#fff" }}
            className="w-full rounded-[1.2vh] border border-line bg-white px-[1vw] py-[1.4vh] text-[1.9vh] font-semibold outline-none transition focus:border-[#8A1538] focus:ring-[0.3vh] focus:ring-[#D4AF37]/30 appearance-none"
          >
            {educationLevels.map((e) => (
              <option 
                key={e} 
                value={e === "Any" ? "" : e} 
                style={{ color: e === "Any" ? "#555" : "#2B2B2B" }}
              >
                {e === "Any" ? "Any" : e}
              </option>
            ))}
          </select>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSearch}
          className="flex items-center justify-center gap-[0.5vw] rounded-[1.2vh] bg-gradient-to-br from-maroon to-maroon-dark px-[2vw] py-[1.4vh] font-bold text-cream shadow-lg shadow-maroon/25 sm:py-[1.6vh] text-[1.9vh]"
        >
          <Search className="w-[2vh] h-[2vh]" /> Search
        </motion.button>
      </div>
    </motion.div>
  );
};

const StepperValue = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex flex-1 items-center justify-between">
    <button 
      type="button"
      onClick={() => onChange(value - 1)} 
      className="h-[3.2vh] w-[3.2vh] rounded-[0.6vh] font-bold text-[#555] hover:bg-line transition duration-150 flex items-center justify-center text-[2vh]" 
      aria-label="Decrease"
    >
      −
    </button>
    {/* FIXED COLOR: Explicitly forced near-black #2B2B2B so the age reading stands out crisply */}
    <span className="text-[1.9vh] font-extrabold text-[#2B2B2B] px-[0.2vw]">{value}</span>
    <button 
      type="button"
      onClick={() => onChange(value + 1)} 
      className="h-[3.2vh] w-[3.2vh] rounded-[0.6vh] font-bold text-[#555] hover:bg-line transition duration-150 flex items-center justify-center text-[2vh]" 
      aria-label="Increase"
    >
      +
    </button>
  </div>
);