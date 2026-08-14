import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import { api } from "../../lib/axios";
import "swiper/css";
import "swiper/css/pagination";

/**
 * Success stories carousel, powered by Swiper.
 * Data comes from GET /api/testimonials (public, approved-only) — see backend/src/controllers/testimonialController.js.
 */
export const Testimonials = () => {
  const { data: testimonials } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => (await api.get("/testimonials")).data.data.testimonials as any[],
  });

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="bg-cream py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mx-auto mb-14 max-w-xl text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-maroon/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-maroon">
            Real Families
          </span>
          <h2 className="font-display text-4xl font-extrabold">Success Stories</h2>
        </motion.div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1.1}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="pb-14"
        >
          {testimonials.map((s) => (
            <SwiperSlide key={s._id}>
              <div className="card h-full overflow-hidden">
                <div className="flex h-48 items-center justify-center bg-gradient-to-br from-maroon to-forest text-4xl text-cream">
                  💞
                </div>
                <div className="p-6">
                  <div className="font-display font-bold">{s.coupleNames}</div>
                  <div className="mb-3 text-xs font-bold text-gold">{s.district}, Himachal Pradesh</div>
                  <p className="text-sm italic leading-relaxed text-muted">{s.story}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
