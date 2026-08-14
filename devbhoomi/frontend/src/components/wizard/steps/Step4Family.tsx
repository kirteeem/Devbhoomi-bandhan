import type { WizardFormData } from "../../../types/wizard";
import { StepHeader } from "./StepHeader";
import { TextField } from "../fields/TextField";
import { RadioPillGroup } from "../fields/RadioPillGroup";

interface Props {
  data: WizardFormData;
  update: (patch: Partial<WizardFormData>) => void;
  errors: Record<string, string>;
}

export const Step4Family = ({ data, update, errors }: Props) => (
  <div>
    <StepHeader title="Family Details" subtitle="A little about the family behind the profile." />
    <div className="grid gap-6 sm:grid-cols-2">
      <TextField
        label="Father's Occupation" placeholder="e.g. Retired Government Officer"
        value={data.family.fatherOccupation}
        onChange={(e) => update({ family: { ...data.family, fatherOccupation: e.target.value } })}
      />
      <TextField
        label="Mother's Occupation" placeholder="e.g. Homemaker"
        value={data.family.motherOccupation}
        onChange={(e) => update({ family: { ...data.family, motherOccupation: e.target.value } })}
      />
    </div>

    <div data-field-error="family.siblings" className="mt-6 max-w-xs">
      <TextField
        label="Number of Siblings" type="number" min={0} max={20}
        error={errors?.["family.siblings"]}
        value={data.family.siblings}
        onChange={(e) => update({ family: { ...data.family, siblings: e.target.value === "" ? "" : Number(e.target.value) } })}
      />
    </div>

    <div className="mt-6">
      <RadioPillGroup
        label="Family Type" value={data.family.familyType}
        onChange={(v) => update({ family: { ...data.family, familyType: v as WizardFormData["family"]["familyType"] } })}
        options={[
          { value: "nuclear", label: "Nuclear Family" },
          { value: "joint", label: "Joint Family" },
        ]}
      />
    </div>

    <div className="mt-6">
      <RadioPillGroup
        label="Family Values" value={data.family.familyValues}
        onChange={(v) => update({ family: { ...data.family, familyValues: v as WizardFormData["family"]["familyValues"] } })}
        options={[
          { value: "traditional", label: "Traditional" },
          { value: "moderate", label: "Moderate" },
          { value: "liberal", label: "Liberal" },
        ]}
      />
    </div>
  </div>
);
