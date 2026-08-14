import type { WizardFormData } from "../../../types/wizard";
import { HP_DISTRICTS } from "../../../types/wizard";
import { StepHeader } from "./StepHeader";
import { RangeField } from "../fields/RangeField";
import { TextField } from "../fields/TextField";
import { ChipMultiSelect } from "../fields/ChipMultiSelect";

interface Props {
  data: WizardFormData;
  update: (patch: Partial<WizardFormData>) => void;
  errors: Record<string, string>;
}

const EDUCATION_OPTIONS = ["Graduate", "Post Graduate", "Doctorate", "Diploma", "Professional"];
const MARITAL_OPTIONS = ["never_married", "divorced", "widowed", "awaiting_divorce"];

export const Step7PartnerPreference = ({ data, update, errors }: Props) => (
  <div>
    <StepHeader title="Partner Preference" subtitle="What kind of match are you hoping to find?" />

    <div className="grid gap-6 sm:grid-cols-2">
      <div data-field-error="partnerPreference.ageMin">
        <RangeField
          label="Preferred Age (years)"
          minValue={data.partnerPreference.ageMin} maxValue={data.partnerPreference.ageMax}
          error={errors?.["partnerPreference.ageMin"] || errors?.["partnerPreference.ageMax"]}
          onMinChange={(v) => update({ partnerPreference: { ...data.partnerPreference, ageMin: v } })}
          onMaxChange={(v) => update({ partnerPreference: { ...data.partnerPreference, ageMax: v } })}
        />
      </div>
      <div data-field-error="partnerPreference.heightMinCm">
        <TextField
          label="Minimum Height (cm)" type="number" placeholder="e.g. 155"
          error={errors?.["partnerPreference.heightMinCm"]}
          value={data.partnerPreference.heightMinCm}
          onChange={(e) => update({ partnerPreference: { ...data.partnerPreference, heightMinCm: e.target.value === "" ? "" : Number(e.target.value) } })}
        />
      </div>
    </div>

    <div className="mt-8">
      <ChipMultiSelect
        label="Preferred Districts" options={HP_DISTRICTS}
        value={data.partnerPreference.districts}
        onChange={(v) => update({ partnerPreference: { ...data.partnerPreference, districts: v } })}
      />
    </div>

    <div className="mt-8">
      <ChipMultiSelect
        label="Preferred Education" options={EDUCATION_OPTIONS}
        value={data.partnerPreference.education}
        onChange={(v) => update({ partnerPreference: { ...data.partnerPreference, education: v } })}
      />
    </div>

    <div className="mt-8">
      <ChipMultiSelect
        label="Preferred Marital Status"
        options={MARITAL_OPTIONS}
        value={data.partnerPreference.maritalStatus}
        onChange={(v) => update({ partnerPreference: { ...data.partnerPreference, maritalStatus: v } })}
      />
    </div>
  </div>
);
