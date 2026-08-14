import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Lock } from "lucide-react";
import type { Profile } from "../../types";
import { resolvePhotoUrl } from "../../lib/media";

export const ProfileGallery = ({ profile }: { profile: Profile }) => {
  const [active, setActive] = useState<string | null>(null);
  const navigate = useNavigate();
  const photos = profile.photos ?? [];
  if (photos.length === 0) return null;

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card p-6">
      <h3 className="mb-4 font-display text-lg font-extrabold">Photo Gallery</h3>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {photos.map((p, i) => {
          const photoUrl = resolvePhotoUrl(p.url);
          return (
          <motion.button
            key={p.url + i}
            whileHover={{ scale: 1.04 }}
            onClick={() => (p.blurred ? navigate("/subscription") : setActive(photoUrl ?? null))}
            className="relative aspect-square overflow-hidden rounded-xl border border-line"
          >
            <img src={photoUrl} alt="" className={`h-full w-full object-cover ${p.blurred ? "blur-md" : ""}`} />
            {p.blurred && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                <Lock size={18} className="text-cream" />
              </div>
            )}
          </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          >
            <button className="absolute right-6 top-6 text-cream"><X size={28} /></button>
            <motion.img
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              src={active} alt="" className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};
