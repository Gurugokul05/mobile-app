import React from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

const SellerSpotlight = () => {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <section
      id="seller-spotlight"
      className="relative overflow-hidden bg-[var(--roots-brown)] py-24 text-[var(--roots-ivory)] sm:py-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(200,134,42,0.1),transparent_30%),linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.02)_100%)]" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -38 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[34rem]"
        >
          <div className="absolute left-0 top-0 h-full w-full overflow-hidden rounded-none bg-black/20 lg:clip-path-[polygon(0_0,90%_0,100%_50%,90%_100%,0_100%)]">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
              alt="Artisan at work in a craft studio"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover filter sepia-[0.08] saturate-[1.04]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(28,20,16,0)_0%,rgba(28,20,16,0.12)_45%,rgba(28,20,16,0.88)_100%)]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="absolute bottom-6 left-6 z-10 w-[18rem] rounded-[1.4rem] border border-[rgba(200,134,42,0.2)] bg-white p-4 text-[var(--roots-brown)] shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--roots-gold)] text-[var(--roots-black)] font-display text-xl font-bold">
                K
              </div>
              <div>
                <div className="font-display text-lg">Kashmir Atelier</div>
                <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-[#E8F3E8] px-3 py-1 text-[11px] font-semibold text-[#177245]">
                  <span className="h-2 w-2 rounded-full bg-[#1FA55B]" />{" "}
                  Verified Seller
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, x: 38 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-center"
        >
          <p className="label-caps text-[11px] font-medium text-[var(--roots-gold)]">
            ✦ SELLER COMMUNITY
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-[clamp(2.7rem,5vw,4.9rem)] leading-[0.94] text-[var(--roots-ivory)]">
            Real People.{" "}
            <em className="font-accent italic text-[var(--roots-gold-lt)]">
              Real Craft.
            </em>
          </h2>
          <p className="mt-5 max-w-2xl text-[16px] leading-8 text-[var(--roots-ivory)]/78">
            Sellers on ROOTS are guided through verification, trust scoring, and
            direct payment workflows that favor accountability. The experience
            is calm, not cluttered - and it keeps the craft at the center.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Sellers verified by our admin team",
              "Live trust score based on orders + reviews",
              "Direct digital payments, no middlemen",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 text-[var(--roots-ivory)]/88"
              >
                <span className="mt-2 text-[var(--roots-gold)]">✦</span>
                <span className="text-[15px] leading-7">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.6rem] border border-[rgba(200,134,42,0.25)] bg-[rgba(200,134,42,0.08)] p-5">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="label-caps text-[11px] text-[var(--roots-gold)]">
                Avg Trust Score
              </span>
              <span className="font-display text-2xl text-[var(--roots-ivory)]">
                94%
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={inView ? { width: "94%" } : { width: 0 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--roots-gold),var(--roots-gold-lt))]"
              />
            </div>
          </div>

          <a
            href="#footer"
            className="btn-roots mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--roots-gold)] px-6 py-3.5 font-semibold text-[var(--roots-black)]"
          >
            Become a Seller <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default SellerSpotlight;
