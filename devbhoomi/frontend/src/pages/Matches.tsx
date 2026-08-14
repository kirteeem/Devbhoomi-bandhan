import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  SlidersHorizontal, Search, Users, X, Filter, ChevronDown, RotateCcw, Sparkles
} from "lucide-react";
import { api } from "../lib/axios";
import { ProfileCard } from "../components/ui/ProfileCard";
import type { Profile } from "../types";

const districts = [
  "Shimla", "Mandi", "Kullu", "Kangra", "Hamirpur", "Una", 
  "Bilaspur", "Solan", "Sirmaur", "Chamba", "Kinnaur", "Lahaul-Spiti"
];

const maritalStatuses = [
  { value: "never_married", label: "Never Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "awaiting_divorce", label: "Awaiting Divorce" },
];

const manglikOptions = [
  { value: "yes", label: "Manglik" },
  { value: "no", label: "Non-Manglik" },
  { value: "dont_know", label: "Don't Know" },
];

const habitOptions = [
  { value: "no", label: "No" },
  { value: "occasionally", label: "Occasionally" },
  { value: "yes", label: "Yes" },
];

const familyTypes = [
  { value: "nuclear", label: "Nuclear" },
  { value: "joint", label: "Joint" },
];

const sortOptions = [
  { value: "newest", label: "Newest Profiles" },
  { value: "recentlyActive", label: "Recently Active" },
  { value: "highestMatch", label: "Highest Match Score" },
  { value: "premium", label: "Premium Members" },
  { value: "verified", label: "Verified Members" },
];

type Filters = {
  district: string;
  minAge: string;
  maxAge: string;
  minHeight: string;
  maxHeight: string;
  education: string;
  profession: string;
  income: string;
  religion: string;
  community: string;
  subCaste: string;
  gotra: string;
  maritalStatus: string;
  manglik: string;
  smoking: string;
  drinking: string;
  familyType: string;
};

const emptyFilters: Filters = {
  district: "", minAge: "", maxAge: "", minHeight: "", maxHeight: "",
  education: "", profession: "", income: "", religion: "", community: "",
  subCaste: "", gotra: "",
  maritalStatus: "", manglik: "", smoking: "", drinking: "", familyType: "",
};

export const Matches = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    ...emptyFilters,
    district: searchParams.get("district") ?? "",
  });
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const setFilter = (key: keyof Filters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } = useInfiniteQuery({
    queryKey: ["matches", filters, sortBy],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, string> = { page: String(pageParam), limit: "12", sortBy };
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      const { data } = await api.get("/matches", { params });
      return data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });

  const allProfiles: Profile[] = data?.pages.flatMap((p) => p.results) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const profiles = useMemo(() => {
    if (!searchTerm.trim()) return allProfiles;
    const q = searchTerm.trim().toLowerCase();
    return allProfiles.filter(
      (p) =>
        p.user?.fullName?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.occupation?.title?.toLowerCase().includes(q) ||
        p.education?.degree?.toLowerCase().includes(q)
    );
  }, [allProfiles, searchTerm]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters, sortBy]);

  const resetFilters = () => setFilters(emptyFilters);

  const FilterField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-extrabold tracking-widest text-stone-400 uppercase">
        {label}
      </label>
      <div>{children}</div>
    </div>
  );

  const selectClass =
    "w-full rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-2 text-xs font-medium text-stone-800 outline-none transition focus:border-[#6B1F2A] focus:bg-white focus:ring-2 focus:ring-[#6B1F2A]/10";
  const inputClass = selectClass;

  const FiltersPanel = (
    <div className="space-y-5">
      <FilterField label="District / Region">
        <select
          value={filters.district}
          onChange={(e) => setFilter("district", e.target.value)}
          className={selectClass}
        >
          <option value="">All Himachal Districts</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Age Limits (Years)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minAge}
            onChange={(e) => setFilter("minAge", e.target.value)}
            className={`${inputClass} text-center`}
          />
          <span className="text-xs font-semibold text-stone-400">to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxAge}
            onChange={(e) => setFilter("maxAge", e.target.value)}
            className={`${inputClass} text-center`}
          />
        </div>
      </FilterField>

      <FilterField label="Height (cm)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minHeight}
            onChange={(e) => setFilter("minHeight", e.target.value)}
            className={`${inputClass} text-center`}
          />
          <span className="text-xs font-semibold text-stone-400">to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxHeight}
            onChange={(e) => setFilter("maxHeight", e.target.value)}
            className={`${inputClass} text-center`}
          />
        </div>
      </FilterField>

      <FilterField label="Education Level">
        <input
          type="text"
          placeholder="e.g. B.Tech, MBA, MBBS"
          value={filters.education}
          onChange={(e) => setFilter("education", e.target.value)}
          className={inputClass}
        />
      </FilterField>

      <FilterField label="Profession">
        <input
          type="text"
          placeholder="e.g. Engineer, Doctor, Officer"
          value={filters.profession}
          onChange={(e) => setFilter("profession", e.target.value)}
          className={inputClass}
        />
      </FilterField>

      <FilterField label="Annual Income">
        <input
          type="text"
          placeholder="e.g. 10 LPA+"
          value={filters.income}
          onChange={(e) => setFilter("income", e.target.value)}
          className={inputClass}
        />
      </FilterField>

      <FilterField label="Community & Caste">
        <input
          type="text"
          placeholder="e.g. Rajput, Brahmin"
          value={filters.community}
          onChange={(e) => setFilter("community", e.target.value)}
          className={inputClass}
        />
      </FilterField>

      <FilterField label="Sub-Caste">
        <input
          type="text"
          placeholder="e.g. Kanet"
          value={filters.subCaste}
          onChange={(e) => setFilter("subCaste", e.target.value)}
          className={inputClass}
        />
      </FilterField>

      <FilterField label="Gotra">
        <input
          type="text"
          placeholder="e.g. Kashyap"
          value={filters.gotra}
          onChange={(e) => setFilter("gotra", e.target.value)}
          className={inputClass}
        />
      </FilterField>

      <FilterField label="Marital Status">
        <select
          value={filters.maritalStatus}
          onChange={(e) => setFilter("maritalStatus", e.target.value)}
          className={selectClass}
        >
          <option value="">Any Status</option>
          {maritalStatuses.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Manglik Status">
        <select
          value={filters.manglik}
          onChange={(e) => setFilter("manglik", e.target.value)}
          className={selectClass}
        >
          <option value="">Any</option>
          {manglikOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Lifestyle Habits">
        <div className="grid grid-cols-2 gap-2">
          <select
            value={filters.smoking}
            onChange={(e) => setFilter("smoking", e.target.value)}
            className={selectClass}
          >
            <option value="">Smoking: Any</option>
            {habitOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={filters.drinking}
            onChange={(e) => setFilter("drinking", e.target.value)}
            className={selectClass}
          >
            <option value="">Drinking: Any</option>
            {habitOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </FilterField>

      <FilterField label="Family Structure">
        <select
          value={filters.familyType}
          onChange={(e) => setFilter("familyType", e.target.value)}
          className={selectClass}
        >
          <option value="">Any Structure</option>
          {familyTypes.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FilterField>

      {activeFilterCount > 0 && (
        <button
          onClick={resetFilters}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-600 transition hover:bg-stone-100"
        >
          <RotateCcw size={13} /> Reset Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans antialiased text-stone-800 selection:bg-[#6B1F2A]/10 selection:text-[#6B1F2A]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <div className="relative mb-8 rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-10 shadow-sm overflow-hidden">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#6B1F2A]/5 blur-3xl" />
          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/80 px-3.5 py-1 text-[11px] font-bold text-amber-900 shadow-2xs backdrop-blur-md">
                <Sparkles size={12} className="text-amber-600 fill-amber-600" />
                <span>Verified Matrimonial Network</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 leading-tight">
                Discover Himachal’s Most <span className="italic text-[#6B1F2A]">Eligible Matches</span>
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-xl">
                {isLoading
                  ? "Searching curations for you..."
                  : `Showing ${total} verified profile${total === 1 ? "" : "s"} tailored to your preference.`}
              </p>
            </div>

            {/* SEARCH & MOBILE FILTER BUTTON */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search name, district, career..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200/80 bg-stone-50/60 py-3 pl-10 pr-4 text-xs font-medium text-stone-800 outline-none transition focus:border-[#6B1F2A] focus:bg-white focus:ring-2 focus:ring-[#6B1F2A]/10 shadow-inner"
                />
              </div>
              
              <button
                onClick={() => setShowMobileFilters(true)}
                className="relative inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-stone-200 px-4 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 shadow-sm hover:bg-stone-50 lg:hidden shrink-0"
              >
                <Filter size={15} className="text-[#6B1F2A]" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6B1F2A] text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-bold text-stone-900">
              Profiles
            </span>
            <span className="rounded-md bg-stone-200/60 px-2 py-0.5 text-[11px] font-bold text-stone-600">
              {profiles.length}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Sort By
            </span>
            <div className="relative w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none rounded-xl border border-stone-200 bg-white py-2 pl-3 pr-8 text-xs font-bold text-stone-700 shadow-sm outline-none focus:border-[#6B1F2A] focus:ring-2 focus:ring-[#6B1F2A]/10"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
          </div>
        </div>

        {/* LAYOUT GRID */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          
          {/* SIDEBAR FILTERS (DESKTOP) */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transform overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out lg:sticky lg:top-20 lg:z-0 lg:block lg:col-span-3 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:w-auto lg:max-w-none lg:transform-none lg:rounded-3xl lg:border lg:border-stone-200/80 lg:shadow-sm
            ${showMobileFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2 text-[#6B1F2A]">
                <SlidersHorizontal size={18} />
                <h2 className="font-serif text-base font-bold text-stone-900">Refine Search</h2>
              </div>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 lg:hidden"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5">{FiltersPanel}</div>
          </aside>

          {/* MOBILE OVERLAY */}
          {showMobileFilters && (
            <div
              className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
          )}

          {/* PROFILE RESULTS GRID */}
          <main className="w-full lg:col-span-9">
            {isLoading && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm">
                    <div className="aspect-[4/5] w-full bg-stone-200/60" />
                    <div className="space-y-3 p-5">
                      <div className="h-4 w-2/3 rounded bg-stone-200/60" />
                      <div className="h-3 w-1/2 rounded bg-stone-200/60" />
                      <div className="h-3 w-1/3 rounded bg-stone-200/60" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && profiles.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {profiles.map((profile) => (
                    <ProfileCard key={profile._id} profile={profile} />
                  ))}
                </div>

                {hasNextPage && (
                  <div className="mt-12 flex justify-center">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetching}
                      className="rounded-2xl bg-[#6B1F2A] px-10 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-[#541821] active:scale-95 disabled:opacity-60"
                    >
                      {isFetching ? "Loading Profiles..." : "Explore More Profiles"}
                    </button>
                  </div>
                )}
              </>
            )}

            {!isLoading && profiles.length === 0 && (
              <div className="w-full rounded-3xl border border-dashed border-stone-300 bg-white py-20 px-4 text-center shadow-xs">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-[#6B1F2A] border border-amber-200/60">
                  <Users size={28} />
                </div>
                <h3 className="mt-5 font-serif text-2xl font-bold text-stone-900">
                  No Matching Profiles Found
                </h3>
                <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-stone-500 leading-relaxed">
                  We couldn't find any member profile matching your exact search criteria. Try relaxing a few filters.
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6B1F2A] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow transition hover:bg-[#541821]"
                  >
                    <RotateCcw size={14} /> Clear All Filters
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};