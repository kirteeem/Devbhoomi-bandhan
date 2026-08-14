import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../../lib/axios";

export const SuggestedMatchesWidget = () => {
  const { data: suggested } = useQuery({
    queryKey: ["suggested-matches"],
    queryFn: async () => (await api.get("/matches/suggested")).data.data.suggestions as any[],
  });

  if (!suggested || suggested.length === 0) return null;

  return (
    <div className="card p-5">
      <h4 className="mb-3 text-sm font-extrabold">Suggested Matches</h4>
      <div className="space-y-3">
        {suggested.slice(0, 4).map((p) => (
          <Link key={p._id} to={`/profile/${p.user._id}`} className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-line/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-forest to-forest-dark text-cream">🌸</div>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold">{p.user.fullName}</div>
              <div className="truncate text-[11px] text-muted">{p.district}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
