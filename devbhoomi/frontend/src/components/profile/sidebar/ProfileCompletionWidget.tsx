import { Link } from "react-router-dom";
import { ProgressBar } from "../../ui/ProgressBar";

export const ProfileCompletionWidget = ({ value }: { value: number }) => (
  <div className="card p-5">
    <ProgressBar value={value} label="Profile Completion" />
    {value < 100 && (
      <Link to="/profile/create" className="mt-3 inline-block text-xs font-bold text-maroon">
        Complete your profile →
      </Link>
    )}
  </div>
);
