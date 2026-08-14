import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, HeartHandshake } from "lucide-react";
import { api } from "../lib/axios";
import { Button } from "../components/ui/Button";

interface KundaliReportData {
  gunMilanScore?: number;
  manglikDosha?: "none" | "partial" | "full";
  summary?: string;
  recommendation?: "favourable" | "favourable_with_remedy" | "not_recommended";
  reportFileUrl?: string;
}

interface KundaliRequestData {
  requestType: string;
  status: string;
  profileB?: { fullName: string };
  assignedPriest?: { displayName: string };
}

const doshaStyles: Record<string, string> = {
  none: "bg-forest/10 text-forest",
  partial: "bg-gold/15 text-[#8a6d17]",
  full: "bg-maroon/10 text-maroon",
};

const doshaLabel: Record<string, string> = {
  none: "No Manglik Dosha",
  partial: "Partial Manglik Dosha",
  full: "Full Manglik Dosha",
};

const recommendationStyles: Record<string, string> = {
  favourable: "bg-forest text-cream",
  favourable_with_remedy: "bg-gold text-[#2b1c05]",
  not_recommended: "bg-maroon text-cream",
};

const recommendationLabel: Record<string, string> = {
  favourable: "Favourable Match",
  favourable_with_remedy: "Favourable, With Remedy",
  not_recommended: "Not Recommended",
};

export const KundaliReport = () => {
  const { requestId } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["kundali-report", requestId],
    queryFn: async () => {
      const res = await api.get(`/kundali/report/${requestId}`);
      return res.data.data as { report: KundaliReportData; request: KundaliRequestData };
    },
  });

  if (isLoading) return <div className="py-24 text-center text-muted">Loading your report...</div>;

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-extrabold">Report not ready yet</h1>
        <p className="mt-3 text-sm text-muted">
          Our priest is still reviewing this request. Please check back soon — we'll notify you the moment it's ready.
        </p>
        <Link to="/kundali" className="mt-8 inline-block">
          <Button variant="ghost">
            <ArrowLeft size={16} /> Back to Kundali Requests
          </Button>
        </Link>
      </div>
    );
  }

  const { report, request } = data;
  const scorePercent = report.gunMilanScore != null ? Math.round((report.gunMilanScore / 36) * 100) : 0;
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (circumference * scorePercent) / 100;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link to="/kundali" className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-maroon">
        <ArrowLeft size={15} /> Back to Kundali Requests
      </Link>

      <div className="rounded-[28px] bg-gradient-to-br from-forest to-forest-dark p-10 text-center text-cream">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-4 border-gold/50 bg-gradient-to-br from-gold-soft to-gold text-3xl">
          🕉️
        </div>
        <h1 className="font-display text-2xl font-extrabold">Kundli Milan Report</h1>
        <p className="mt-2 text-sm text-gold-soft capitalize">{request.requestType.replace(/_/g, " ")}</p>
        {request.profileB?.fullName && (
          <p className="mt-1 text-sm text-cream/80">Matched with {request.profileB.fullName}</p>
        )}
        {request.assignedPriest?.displayName && (
          <p className="mt-4 text-xs text-cream/60">Prepared by {request.assignedPriest.displayName}</p>
        )}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {report.gunMilanScore != null && (
          <div className="card flex flex-col items-center justify-center gap-4 p-8">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#EFE8DD" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-display text-3xl font-extrabold text-maroon">{report.gunMilanScore}</span>
                <span className="text-[11px] font-bold text-muted">out of 36</span>
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Gun Milan Score</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {report.manglikDosha && (
            <div className="card p-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Manglik Dosha</p>
              <span className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${doshaStyles[report.manglikDosha]}`}>
                {doshaLabel[report.manglikDosha]}
              </span>
            </div>
          )}
          {report.recommendation && (
            <div className="card p-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Priest's Recommendation</p>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${recommendationStyles[report.recommendation]}`}
              >
                <HeartHandshake size={14} /> {recommendationLabel[report.recommendation]}
              </span>
            </div>
          )}
        </div>
      </div>

      {report.summary && (
        <div className="card mt-6 p-6">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
            <Sparkles size={13} /> Priest's Notes
          </p>
          <p className="text-sm leading-relaxed text-ink/85">{report.summary}</p>
        </div>
      )}

      {report.reportFileUrl && (
        <a
          href={report.reportFileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block"
        >
          <Button variant="gold">Download Full Report</Button>
        </a>
      )}
    </div>
  );
};
