import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Item { label: string; value?: string | number | null }

/** Generic "titled card with a key/value grid" — used for every detail section on the profile preview. */
export const DetailGrid = ({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: Item[] }) => {
  const filled = items.filter((i) => i.value !== undefined && i.value !== null && i.value !== "");
  if (filled.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
      className="card p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-maroon/10 text-maroon">
          <Icon size={15} />
        </div>
        <h3 className="font-display text-lg font-extrabold">{title}</h3>
      </div>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {filled.map((item) => (
          <div key={item.label} className="flex items-center justify-between border-b border-line/70 pb-2 text-sm">
            <span className="text-muted">{item.label}</span>
            <span className="font-semibold capitalize text-ink">{item.value}</span>
          </div>
        ))}
      </div>
    </motion.section>
  );
};
