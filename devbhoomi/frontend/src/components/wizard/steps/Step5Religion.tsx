import type { WizardFormData } from "../../../types/wizard";
import { StepHeader } from "./StepHeader";
import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";

interface Props {
  data: WizardFormData;
  update: (patch: Partial<WizardFormData>) => void;
  errors: Record<string, string>;
}

// 1. PRODUCTION-READY RELIGION LIST
const religionOptions = [
  { value: "Hindu", label: "Hindu" },
  { value: "Sikh", label: "Sikh" },
  { value: "Muslim", label: "Muslim" },
  { value: "Christian", label: "Christian" },
  { value: "Buddhist", label: "Buddhist" },
  { value: "Jain", label: "Jain" },
  { value: "Jewish", label: "Jewish" },
  { value: "Zoroastrian", label: "Zoroastrian" },
  { value: "Baháʼí", label: "Baháʼí" },
  { value: "Tribal", label: "Tribal" },
  { value: "Spiritual", label: "Spiritual" },
  { value: "No Religion", label: "No Religion" },
  { value: "Other", label: "Other" }
];

// 2. COMPREHENSIVE CASTE DICTIONARY
const hinduCastes = [
  "Brahmin", "Rajput", "Kshatriya", "Kayastha", "Baniya", "Jat", "Yadav", 
  "Arora", "Khatri", "Sood", "Mahajan", "Ghirth", "Rathi", "Chhang", 
  "Koli", "Lohar", "Tarkhan", "Chamar", "Julaha", "OBC", "SC", "ST"
].sort();

// 3. DYNAMIC SUB-CASTE MAPPER (Tailored example for key regional groups)
const subCasteMap: Record<string, string[]> = {
  "Brahmin": ["Gaur", "Saraswat", "Kanyakubja", "Bhargava", "Sharma", "Sandilya", "Vashista"],
  "Rajput": ["Katoch", "Pathania", "Chauhan", "Rathore", "Tomar", "Sisodia", "Chandel", "Jaswal", "Guleria"],
  "Mahajan": ["Gupta", "Shah", "Mehta", "Garg", "Bansal"],
  "Sood": ["Goyal", "Mandal", "Kuthiala"]
};

export const Step5Religion = ({ data, update, errors }: Props) => {
  
  // Handle structural cascade reset on religion switch
  const handleReligionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    update({ 
      religion: val,
      caste: "", 
      subCaste: "" 
    });
  };

  // Handle structural cascade reset on caste switch
  const handleCasteChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    update({ 
      caste: e.target.value, 
      subCaste: "" 
    });
  };

  const isHindu = data.religion === "Hindu";
  const availableSubCastes = subCasteMap[data.caste] || [];

  return (
    <div className="space-y-8 w-full font-sans antialiased max-w-5xl mx-auto">
      <StepHeader 
        title="Religion & Horoscope" 
        subtitle="Used for our free priest-guided kundali matching." 
      />

      {/* SECTION I: FAITH PROFILE */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#ECE8E2] shadow-sm space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 border-b border-gray-100 pb-2">
          Religion & Lineage
        </h3>
        
        <div className="grid gap-6 sm:grid-cols-2">
          <div data-field-error="religion">
            <SelectField 
              label="Religion" 
              required
              placeholder="Select Religion"
              value={data.religion} 
              error={errors?.religion}
              options={religionOptions}
              onChange={handleReligionChange} 
            />
          </div>

          {isHindu ? (
            <div data-field-error="caste">
              <SelectField 
                label="Caste" 
                required
                placeholder="Select Caste"
                value={data.caste} 
                error={errors?.caste}
                options={hinduCastes.map(c => ({ value: c, label: c }))}
                onChange={handleCasteChange} 
              />
            </div>
          ) : (
            <TextField 
              label="Caste (Optional)" 
              placeholder="Enter caste details"
              value={data.caste} 
              onChange={(e) => update({ caste: e.target.value })} 
            />
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {isHindu && availableSubCastes.length > 0 ? (
            <SelectField 
              label="Sub Caste" 
              placeholder="Select Sub Caste"
              value={data.subCaste} 
              error={errors?.subCaste}
              options={availableSubCastes.map(sc => ({ value: sc, label: sc }))}
              onChange={(e) => update({ subCaste: e.target.value })} 
            />
          ) : (
            <TextField 
              label="Sub Caste (Optional)" 
              placeholder="e.g. Katoch"
              value={data.subCaste} 
              onChange={(e) => update({ subCaste: e.target.value })} 
            />
          )}

          <TextField 
            label="Gotra (Optional)" 
            placeholder="e.g. Kashyap"
            value={data.gotra} 
            onChange={(e) => update({ gotra: e.target.value })} 
          />
        </div>
      </div>

      {/* SECTION II: ASTROLOGICAL FRAMEWORK */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#ECE8E2] shadow-sm space-y-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 border-b border-gray-100 pb-2">
            Horoscope Details
          </h3>
          <p className="mt-1 text-xs text-zinc-400 font-medium">
            Optional, but helps Pandit ji prepare a highly accurate custom kundali report.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            label="Birth Time" 
            type="time"
            value={data.horoscope?.birthTime || ""}
            onChange={(e) => update({ horoscope: { ...data.horoscope, birthTime: e.target.value } })}
          />
          <TextField
            label="Birth Place" 
            placeholder="e.g. Shimla, HP"
            value={data.horoscope?.birthPlace || ""}
            onChange={(e) => update({ horoscope: { ...data.horoscope, birthPlace: e.target.value } })}
          />
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            label="Rashi (Moon Sign)" 
            placeholder="e.g. Mesh"
            value={data.horoscope?.rashi || ""}
            onChange={(e) => update({ horoscope: { ...data.horoscope, rashi: e.target.value } })}
          />
          <TextField
            label="Nakshatra" 
            placeholder="e.g. Rohini"
            value={data.horoscope?.nakshatra || ""}
            onChange={(e) => update({ horoscope: { ...data.horoscope, nakshatra: e.target.value } })}
          />
        </div>
      </div>
    </div>
  );
};