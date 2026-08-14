import type { WizardFormData } from "../../../types/wizard";
import { HP_DISTRICTS } from "../../../types/wizard";
import { HP_TEHSILS_BY_DISTRICT } from "../../../data/hpLocations";
import { TextField } from "../fields/TextField";
import { TextAreaField } from "../fields/TextAreaField";
import { SelectField } from "../fields/SelectField";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Globe, Compass, Sparkle, Home, TreePine } from "lucide-react";

interface Props {
  data: WizardFormData;
  update: (patch: Partial<WizardFormData>) => void;
  errors: Record<string, string>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
};

const blockVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 22 } }
};

export const Step2Location = ({ data, update, errors }: Props) => {
  const safeData = data || {} as WizardFormData;
  const safeErrors = errors || {};

  const safeDistrictsArray = Array.isArray(HP_DISTRICTS) ? HP_DISTRICTS : [];
  const districtOptions = [
    ...safeDistrictsArray.map((d) => ({ value: d, label: d })),
    { value: "Other", label: "Other / Outside Himachal" }
  ];

  const popularTownSuggestions = ["Shimla", "Dharamshala", "Manali", "Mandi", "Solan", "Kangra"];

  const availableTehsils = HP_TEHSILS_BY_DISTRICT[safeData.district] || [];
  const tehsilOptions = availableTehsils.map((t) => ({ value: t, label: t }));

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 w-full font-sans antialiased text-zinc-800"
    >
      {/* IMMERSIVE COMPACT HEADER */}
      <div className="relative w-full pb-1">
        <div className="relative z-10 space-y-1">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold tracking-wider uppercase text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
            <MapPin size={11} className="text-sky-500" /> PART 02 / GEOGRAPHICAL ANCHOR
          </span>
          <h2 className="text-sm font-bold text-zinc-800">Where is your family based?</h2>
          <p className="text-xs text-zinc-400 font-medium">Declare your native origins and operational residence for lineage mapping.</p>
        </div>
      </div>

      {/* COMPACT CLEAN CONTENT STACK */}
      <div className="space-y-4 w-full">
        
        {/* ROW 1: DISTRICT & CITY TIMELINES */}
        <motion.div variants={blockVariants} className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          
          {/* Native District Select Field */}
          <div data-field-error="district" className={`relative rounded-xl border bg-white p-4 transition-all duration-200 shadow-sm group ${
            safeErrors.district ? 'border-red-300 bg-red-50/5' : 'border-zinc-200/80 focus-within:border-sky-500'
          }`}>
            <div className="absolute top-4 right-4 text-zinc-300 group-focus-within:text-sky-500 transition-colors">
              <Compass size={15} />
            </div>
            <div className="space-y-1">
              <SelectField
                label="Native District" 
                required 
                placeholder="Select district"
                value={safeData.district || ""} 
                error={safeErrors.district}
                options={districtOptions}
                onChange={(e: any) => {
                  const val = e.target.value;
                  update({ 
                    district: val,
                    tehsil: "",
                    ...(val !== "Other" && { customDistrict: "" }) 
                  });
                }}
              />
            </div>
          </div>

          {/* City / Town Input Field */}
          <div data-field-error="city" className={`relative rounded-xl border bg-white p-4 transition-all duration-200 shadow-sm group ${
            safeErrors.city ? 'border-red-300 bg-red-50/5' : 'border-zinc-200/80 focus-within:border-sky-500'
          }`}>
            <div className="absolute top-4 right-4 text-zinc-300 group-focus-within:text-sky-500 transition-colors">
              <MapPin size={15} />
            </div>
            <div className="space-y-1">
              <TextField
                label="City / Town / Village" 
                required 
                placeholder="e.g. Shimla"
                value={safeData.city || ""} 
                error={safeErrors.city}
                onChange={(e: any) => update({ city: e.target.value })}
              />
            </div>
            
            <div className="mt-2.5 space-y-1">
              <div className="flex flex-wrap gap-1">
                {popularTownSuggestions.map((town) => (
                  <button
                    key={town}
                    type="button"
                    onClick={() => update({ city: town })}
                    className={`text-[10px] px-2 py-0.5 rounded transition-all ${
                      safeData.city === town
                        ? "bg-sky-50 text-sky-600 border border-sky-200 font-semibold"
                        : "bg-zinc-50 text-zinc-500 border border-zinc-200 hover:bg-zinc-100"
                    }`}
                  >
                    {town}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </motion.div>

        {/* ROW 1.5: TEHSIL & VILLAGE — narrows the district down for closer-to-home matching */}
        <motion.div variants={blockVariants} className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          <div data-field-error="tehsil" className="relative rounded-xl border border-zinc-200/80 bg-white p-4 transition-all duration-200 shadow-sm group focus-within:border-sky-500">
            <div className="absolute top-4 right-4 text-zinc-300 group-focus-within:text-sky-500 transition-colors">
              <Compass size={15} />
            </div>
            <div className="space-y-1">
              <SelectField
                label="Tehsil"
                placeholder={availableTehsils.length ? "Select tehsil" : "Select a district first"}
                value={safeData.tehsil || ""}
                options={tehsilOptions}
                onChange={(e: any) => update({ tehsil: e.target.value })}
              />
            </div>
          </div>

          <div data-field-error="village" className="relative rounded-xl border border-zinc-200/80 bg-white p-4 transition-all duration-200 shadow-sm group focus-within:border-sky-500">
            <div className="absolute top-4 right-4 text-zinc-300 group-focus-within:text-sky-500 transition-colors">
              <TreePine size={15} />
            </div>
            <div className="space-y-1">
              <TextField
                label="Village (optional)"
                placeholder="e.g. Naggar"
                value={safeData.village || ""}
                onChange={(e: any) => update({ village: e.target.value })}
              />
            </div>
          </div>
        </motion.div>

        {/* ROW 2: COUNTRY & RESIDENTIAL DETAILS */}
        <motion.div variants={blockVariants} className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          
          {/* Current Residence Country Panel */}
          <div className="sm:col-span-1 relative rounded-xl border border-zinc-200/80 bg-white p-4 transition-all duration-200 shadow-sm group focus-within:border-sky-500">
            <div className="absolute top-4 right-4 text-zinc-300 group-focus-within:text-sky-500 transition-colors">
              <Globe size={15} />
            </div>
            <div className="space-y-1">
              <TextField
                label="Residence Country"
                placeholder="e.g. India"
                value={safeData.currentResidenceCountry || ""}
                onChange={(e: any) => update({ currentResidenceCountry: e.target.value })}
              />
            </div>
          </div>

          {/* FULL RESIDENTIAL ADDRESS */}
          <div data-field-error="address" className={`sm:col-span-2 relative rounded-xl border bg-white p-4 transition-all duration-200 shadow-sm group ${
            safeErrors.address ? 'border-red-300 bg-red-50/5' : 'border-zinc-200/80 focus-within:border-sky-500'
          }`}>
            <div className="absolute top-4 right-4 text-zinc-300 group-focus-within:text-sky-500 transition-colors">
              <Home size={15} />
            </div>
            <div className="space-y-1">
              <TextAreaField
                label="Full Address (Privacy Protected)"
                required
                rows={1}
                placeholder="House no., street, locality, pincode"
                value={safeData.address || ""}
                error={safeErrors.address}
                onChange={(e: any) => update({ address: e.target.value })}
              />
            </div>
          </div>

        </motion.div>

        {/* CONDITIONAL INPUT FOR 'OTHER' DISTRICT */}
        <AnimatePresence mode="wait">
          {safeData.district === "Other" && (
            <motion.div
              key="custom-district-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full overflow-hidden"
            >
              <div data-field-error="customDistrict" className="rounded-xl border border-sky-100 bg-sky-50/30 p-4 shadow-sm">
                <div className="max-w-xl">
                  <TextField
                    label="Specify Custom District / State Location"
                    required
                    placeholder="e.g. Kangra (Migrated to Delhi)"
                    value={safeData.customDistrict || ""}
                    error={safeErrors.customDistrict}
                    onChange={(e: any) => update({ customDistrict: e.target.value })}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* COMPACT FOOTNOTE HINT */}
        <motion.div 
          variants={blockVariants}
          className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 flex items-start gap-2"
        >
          <div className="mt-0.5 text-sky-500 shrink-0">
            <Sparkle size={13} />
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-500 font-medium">
            Full address remains strictly confidential and is only visible to premium matched accounts you accept.
          </p>
        </motion.div>

      </div>
    </motion.div>
  );
};