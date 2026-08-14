import type { WizardFormData } from "../../../types/wizard";
import { StepHeader } from "./StepHeader";
import { RadioPillGroup } from "../fields/RadioPillGroup";
import { ChipMultiSelect } from "../fields/ChipMultiSelect";

interface Props {
  data: WizardFormData;
  update: (patch: Partial<WizardFormData>) => void;
  errors: Record<string, string>;
}

const INTEREST_OPTIONS = [
  "Trekking", "Music", "Reading", "Cooking", "Travel", "Yoga", "Photography",
  "Cricket", "Dancing", "Movies", "Gardening", "Volunteering", "Fitness", "Art & Craft",
];

export const Step6Lifestyle = ({ data, update }: Props) => (
  <div>
    <StepHeader title="Lifestyle" subtitle="Everyday habits families often ask about." />

    <RadioPillGroup
      label="Diet" value={data.lifestyle.diet}
      onChange={(v) => update({ lifestyle: { ...data.lifestyle, diet: v as WizardFormData["lifestyle"]["diet"] } })}
      columns={2}
      options={[
        { value: "vegetarian", label: "Vegetarian" },
        { value: "non_vegetarian", label: "Non-Vegetarian" },
        { value: "eggetarian", label: "Eggetarian" },
        { value: "vegan", label: "Vegan" },
      ]}
    />

    <div className="mt-6">
      <RadioPillGroup
        label="Smoking" value={data.lifestyle.smoking}
        onChange={(v) => update({ lifestyle: { ...data.lifestyle, smoking: v as WizardFormData["lifestyle"]["smoking"] } })}
        options={[
          { value: "no", label: "No" },
          { value: "occasionally", label: "Occasionally" },
          { value: "yes", label: "Yes" },
        ]}
      />
    </div>

    <div className="mt-6">
      <RadioPillGroup
        label="Drinking" value={data.lifestyle.drinking}
        onChange={(v) => update({ lifestyle: { ...data.lifestyle, drinking: v as WizardFormData["lifestyle"]["drinking"] } })}
        options={[
          { value: "no", label: "No" },
          { value: "occasionally", label: "Occasionally" },
          { value: "yes", label: "Yes" },
        ]}
      />
    </div>

    <div className="mt-8">
      <ChipMultiSelect
        label="Interests" hint="Pick as many as apply — this helps with smart match suggestions."
        options={INTEREST_OPTIONS}
        value={data.interests}
        onChange={(v) => update({ interests: v })}
      />
    </div>
  </div>
);
