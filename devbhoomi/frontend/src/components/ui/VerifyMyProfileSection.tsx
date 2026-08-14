import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Clock, XCircle, BadgeCheck, ShieldQuestion, Loader2 } from "lucide-react";
import { Button } from "./Button";
import { VerifiedBadge } from "./VerifiedBadge";
import { fetchMyVerificationStatus, submitVerificationDocument, type DocumentType } from "../../lib/verificationApi";
import { getFriendlyErrorMessage } from "../../lib/errorMessage";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const BENEFITS = [
  "A Blue Verified Badge shown next to your name everywhere your profile appears",
  "Higher trust from other members — verified profiles get more genuine interest",
  "Helps us keep Devbhoomi Bandhan a safe, fraud-free community",
];

export const VerifyMyProfileSection = () => {
  const queryClient = useQueryClient();
  const [documentType, setDocumentType] = useState<DocumentType>("aadhaar");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  const { data: status, isLoading } = useQuery({
    queryKey: ["my-verification-status"],
    queryFn: fetchMyVerificationStatus,
  });

  const submit = useMutation({
    mutationFn: () => submitVerificationDocument(documentType, file as File),
    onSuccess: () => {
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["my-verification-status"] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    submit.reset();
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setFileError("Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    if (f.size > MAX_SIZE_BYTES) {
      setFileError("File is too large — please upload an image under 5MB.");
      return;
    }
    setFile(f);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
        <Loader2 size={14} className="animate-spin" /> Loading verification status…
      </div>
    );
  }

  const isVerified = status?.isProfileVerified;
  const latest = status?.latestRequest;
  const isPending = latest?.status === "pending";
  const isRejected = latest?.status === "rejected";

  // --- Already verified ---------------------------------------------------
  if (isVerified) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-xl border border-[#1D9BF0]/20 bg-[#1D9BF0]/5 px-4 py-3 text-xs font-bold text-[#1D9BF0]">
          <VerifiedBadge verified size="md" /> Your profile is verified.
        </div>
        <p className="text-[11px] text-zinc-500">
          Your Blue Verified Badge is now visible on your profile, in search results, and everywhere else your name appears.
        </p>
      </div>
    );
  }

  // --- Pending review -------------------------------------------------------
  if (isPending) {
    return (
      <div className="space-y-3 max-w-md">
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
          <Clock size={14} /> Pending Verification
        </div>
        <p className="text-[11px] text-zinc-500">
          We've received your {latest?.documentType === "pan" ? "PAN" : "Aadhaar"} card and our team is reviewing it.
          This usually takes 24-48 hours. You can't submit another document while this one is pending.
        </p>
      </div>
    );
  }

  // --- Rejected — can resubmit, or first-time submission -------------------
  return (
    <div className="space-y-4 max-w-md">
      <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          <ShieldQuestion size={13} /> Why verify?
        </p>
        <ul className="space-y-1">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-[11px] text-zinc-600">
              <BadgeCheck size={13} className="mt-0.5 flex-shrink-0 text-[#1D9BF0]" /> {b}
            </li>
          ))}
        </ul>
      </div>

      {isRejected && (
        <div className="space-y-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs">
          <p className="flex items-center gap-1.5 font-bold text-red-700">
            <XCircle size={14} /> Not approved
          </p>
          <p className="text-red-700/90">{latest?.rejectionReason || "Please review your document and try again."}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Choose a document</label>
        <div className="flex gap-2">
          {(["aadhaar", "pan"] as DocumentType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setDocumentType(t)}
              className={`rounded-xl border px-4 py-2 text-xs font-bold transition-colors ${
                documentType === t
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {t === "aadhaar" ? "Aadhaar Card" : "PAN Card"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          Upload the front of your {documentType === "aadhaar" ? "Aadhaar" : "PAN"} card
        </label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="block w-full text-[11px] text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-950 file:px-3 file:py-2 file:text-[11px] file:font-bold file:text-white hover:file:bg-zinc-800"
        />
        <p className="text-[10px] text-zinc-400">JPG, PNG, or WEBP · Max 5MB · Make sure your name is clearly readable.</p>
        {fileError && <p className="text-[11px] font-bold text-red-600">{fileError}</p>}
      </div>

      {submit.isError && (
        <p className="text-[11px] font-bold text-red-600">{getFriendlyErrorMessage(submit.error)}</p>
      )}
      {submit.isSuccess && (
        <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
          <ShieldCheck size={14} /> Submitted! We'll email you once it's reviewed.
        </p>
      )}

      <Button
        variant="primary"
        type="button"
        disabled={!file || submit.isPending}
        onClick={() => submit.mutate()}
        className="!rounded-xl !bg-zinc-950 !px-4 !py-2.5 !text-xs !font-bold !text-white hover:!bg-zinc-800"
      >
        {submit.isPending ? "Submitting…" : "Submit For Verification"}
      </Button>
    </div>
  );
};
