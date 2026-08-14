import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const districts = [
  "Shimla", "Mandi", "Kullu", "Kangra", "Hamirpur", "Una",
  "Bilaspur", "Solan", "Sirmaur", "Chamba", "Kinnaur", "Lahaul-Spiti",
];

/** District explorer grid — each card has a faint mountain-ridge illustration and lifts on hover. */
export const Districts = () => (
  <section className="mx-auto max-w-6xl px-6 py-28">
    <div className="mx-auto mb-16 max-w-xl text-center">
      <span className="mb-4 inline-block rounded-full bg-maroon/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-maroon">
        District Explorer
      </span>
      <h2 className="font-display text-4xl font-extrabold">Browse Profiles by District</h2>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {districts.map((d, i) => (
        <motion.div
          key={d}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
        >
          <Link
            to={`/matches?district=${d}`}
            className="card group relative flex h-32 flex-col justify-between overflow-hidden p-6 hover:-translate-y-1.5 hover:shadow-lg"
          >
            <svg className="absolute inset-x-0 bottom-0 h-14 w-full opacity-[0.08]" viewBox="0 0 200 60" preserveAspectRatio="none">
              <path d="M0,40 L30,20 L60,35 L90,15 L120,32 L150,18 L180,30 L200,22 L200,60 L0,60 Z" fill="currentColor" className="text-forest" />
            </svg>
            <span className="relative font-display font-bold">{d}</span>
            <span className="relative flex h-9 w-9 items-center justify-center self-end rounded-xl bg-line text-ink transition-all group-hover:rotate-45 group-hover:bg-maroon group-hover:text-cream">
              <ArrowUpRight size={16} />
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  </section>
);
