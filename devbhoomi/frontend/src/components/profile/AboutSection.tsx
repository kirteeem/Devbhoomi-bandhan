import { motion } from "framer-motion";

export const AboutSection = ({ aboutMe }: { aboutMe?: string }) => {
  if (!aboutMe) return null;
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card p-6">
      <h3 className="mb-3 font-display text-lg font-extrabold">About Me</h3>
      <p className="text-sm leading-relaxed text-muted">{aboutMe}</p>
    </motion.section>
  );
};
