import type { WizardFormData } from "../../../types/wizard";
import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Sparkle } from "lucide-react";

interface Props {
  data: WizardFormData;
  update: (patch: Partial<WizardFormData>) => void;
  errors: Record<string, string>;
}

const degreesList = [
  "High School", "Diploma", "ITI", "BA", "B.Com", "B.Sc", "BBA", "BCA", "B.E.", "B.Tech", 
  "B.Pharm", "BDS", "MBBS", "LLB", "MA", "M.Com", "M.Sc", "MBA", "MCA", "M.E.", "M.Tech", 
  "CA", "CS", "ICWA", "IAS", "IPS", "PCS", "PhD", "Other Professional Degrees"
].sort();

const occupationsList = [
  "Advocate", "Air Force", "Architect", "Army", "Banker", "Business Owner", "Chartered Accountant", 
  "Civil Engineer", "Cloud Engineer", "Cyber Security Engineer", "Data Scientist", "Dentist", 
  "Designer", "DevOps Engineer", "Doctor", "Electrical Engineer", "Entrepreneur", "Farmer", 
  "Freelancer", "Government Employee", "Homemaker", "Mechanical Engineer", "Navy", "Nurse", 
  "Pharmacist", "Police", "Private Employee", "Product Manager", "Professor", "Public Sector Employee", 
  "Researcher", "Retired", "Scientist", "Self Employed", "Software Engineer", "Student", 
  "Teacher", "UI/UX Designer", "Other"
].sort();

const incomeRanges = [
  "No Income",
  "Below ₹1 Lakh",
  "₹1–2 Lakh",
  "₹2–3 Lakh",
  "₹3–5 Lakh",
  "₹5–7 Lakh",
  "₹7–10 Lakh",
  "₹10–15 Lakh",
  "₹15–20 Lakh",
  "₹20–30 Lakh",
  "₹30–50 Lakh",
  "₹50–75 Lakh",
  "₹75 Lakh–1 Crore",
  "Above ₹1 Crore"
];

const suggestions = {
  degrees: ["B.Tech", "M.Tech", "MBA", "MBBS", "CA", "PhD"],
  fields: ["Computer Science", "Data Science", "Medicine", "Finance"],
  colleges: ["NIT Hamirpur", "HPU Shimla", "IIT Mandi"],
  occupations: ["Software Engineer", "Government Employee", "Doctor", "Banker"],
  companies: ["H.P. Government", "Central Government", "TCS", "Self-Employed"]
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
};

const blockVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 22 } }
};

export const Step3Education = ({ data, update, errors }: Props) => {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 w-full font-sans antialiased text-zinc-800"
    >
      {/* HEADER SUMMARY SECTION */}
      <div className="relative w-full pb-1">
        <div className="relative z-10 space-y-1">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold tracking-wider uppercase text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
            <GraduationCap size={11} className="text-sky-500" /> PART 03 / PROFESSIONAL CREDENTIALS
          </span>
          <h2 className="text-sm font-bold text-zinc-800">Education & Career</h2>
          <p className="text-xs text-zinc-400 font-medium">Help families understand your intellectual milestones and career trajectory.</p>
        </div>
      </div>

      {/* STACK WRAPPER ENGINE */}
      <div className="space-y-5 w-full">
        
        {/* SECTION I: INTELLECTUAL TRACK */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-1.5">
            <GraduationCap size={14} className="text-sky-500" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-sky-600">Academic Architecture</h3>
          </div>

          <motion.div variants={blockVariants} className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            {/* Highest Degree */}
            <div data-field-error="education.degree" className={`rounded-xl border bg-white p-4 transition-all duration-200 shadow-sm ${
              errors["education.degree"] ? 'border-red-300 bg-red-50/5' : 'border-zinc-200/80 focus-within:border-sky-500'
            }`}>
              <SelectField
                label="Highest Degree" 
                required 
                placeholder="Select Qualification"
                value={data.education.degree} 
                error={errors["education.degree"]}
                options={degreesList.map((deg) => ({ value: deg, label: deg }))}
                onChange={(e) => update({ education: { ...data.education, degree: e.target.value } })}
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {suggestions.degrees.map((deg) => (
                  <button
                    key={deg} type="button"
                    onClick={() => update({ education: { ...data.education, degree: deg } })}
                    className={`text-[9px] px-1.5 py-0.5 rounded transition-all border ${
                      data.education.degree === deg ? "bg-sky-50 text-sky-600 border-sky-200 font-bold" : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100"
                    }`}
                  >
                    {deg}
                  </button>
                ))}
              </div>
            </div>

            {/* Field of Study */}
            <div className="rounded-xl border border-zinc-200/80 bg-white p-4 transition-all duration-200 shadow-sm focus-within:border-sky-500">
              <TextField
                label="Field of Study" placeholder="e.g. Computer Science"
                value={data.education.field}
                onChange={(e) => update({ education: { ...data.education, field: e.target.value } })}
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {suggestions.fields.map((fld) => (
                  <button
                    key={fld} type="button"
                    onClick={() => update({ education: { ...data.education, field: fld } })}
                    className={`text-[9px] px-1.5 py-0.5 rounded transition-all border ${
                      data.education.field === fld ? "bg-sky-50 text-sky-600 border-sky-200 font-bold" : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100"
                    }`}
                  >
                    {fld}
                  </button>
                ))}
              </div>
            </div>

            {/* College / University */}
            <div className="rounded-xl border border-zinc-200/80 bg-white p-4 transition-all duration-200 shadow-sm focus-within:border-sky-500">
              <TextField
                label="College / University" placeholder="e.g. NIT Hamirpur"
                value={data.education.college}
                onChange={(e) => update({ education: { ...data.education, college: e.target.value } })}
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {suggestions.colleges.map((col) => (
                  <button
                    key={col} type="button"
                    onClick={() => update({ education: { ...data.education, college: col } })}
                    className={`text-[9px] px-1.5 py-0.5 rounded transition-all border ${
                      data.education.college === col ? "bg-sky-50 text-sky-600 border-sky-200 font-bold" : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100"
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* SECTION II: PROFESSIONAL CAREER TRACK */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b border-zinc-100 pb-1.5">
            <Briefcase size={14} className="text-sky-500" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-sky-600">Career Architecture</h3>
          </div>

          <motion.div variants={blockVariants} className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            {/* Occupation */}
            <div data-field-error="occupation.title" className={`rounded-xl border bg-white p-4 transition-all duration-200 shadow-sm ${
              errors["occupation.title"] ? 'border-red-300 bg-red-50/5' : 'border-zinc-200/80 focus-within:border-sky-500'
            }`}>
              <SelectField
                label="Current Occupation" 
                required 
                placeholder="Select Occupation"
                value={data.occupation.title} 
                error={errors["occupation.title"]}
                options={occupationsList.map((occ) => ({ value: occ, label: occ }))}
                onChange={(e) => update({ occupation: { ...data.occupation, title: e.target.value } })}
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {suggestions.occupations.map((occ) => (
                  <button
                    key={occ} type="button"
                    onClick={() => update({ occupation: { ...data.occupation, title: occ } })}
                    className={`text-[9px] px-1.5 py-0.5 rounded transition-all border ${
                      data.occupation.title === occ ? "bg-sky-50 text-sky-600 border-sky-200 font-bold" : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100"
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            {/* Company Organization */}
            <div className="rounded-xl border border-zinc-200/80 bg-white p-4 transition-all duration-200 shadow-sm focus-within:border-sky-500">
              <TextField
                label="Company / Organisation" placeholder="e.g. Infosys"
                value={data.occupation.company}
                onChange={(e) => update({ occupation: { ...data.occupation, company: e.target.value } })}
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {suggestions.companies.map((cmp) => (
                  <button
                    key={cmp} type="button"
                    onClick={() => update({ occupation: { ...data.occupation, company: cmp } })}
                    className={`text-[9px] px-1.5 py-0.5 rounded transition-all border ${
                      data.occupation.company === cmp ? "bg-sky-50 text-sky-600 border-sky-200 font-bold" : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100"
                    }`}
                  >
                    {cmp}
                  </button>
                ))}
              </div>
            </div>

            {/* Annual Income Select Range */}
            <div className="rounded-xl border border-zinc-200/80 bg-white p-4 transition-all duration-200 shadow-sm focus-within:border-sky-500">
              <SelectField
                label="Annual Income Context" 
                placeholder="Select Income Range"
                value={data.occupation.annualIncomeRange}
                options={incomeRanges.map((r) => ({ value: r, label: r }))}
                onChange={(e) => update({ occupation: { ...data.occupation, annualIncomeRange: e.target.value } })}
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {incomeRanges.slice(5, 8).map((range) => (
                  <button
                    key={range} type="button"
                    onClick={() => update({ occupation: { ...data.occupation, annualIncomeRange: range } })}
                    className={`text-[9px] px-1.5 py-0.5 rounded transition-all border ${
                      data.occupation.annualIncomeRange === range ? "bg-sky-50 text-sky-600 border-sky-200 font-bold" : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM HELPER BANNER */}
        <motion.div 
          variants={blockVariants}
          className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 flex items-start gap-2"
        >
          <div className="mt-0.5 text-sky-500 shrink-0">
            <Sparkle size={13} />
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-500 font-medium">
            Accurate financial status configurations establish long-term transparency and build match confidence among browsing families.
          </p>
        </motion.div>

      </div>
    </motion.div>
  );
};