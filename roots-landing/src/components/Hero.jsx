import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, MoveDown } from "lucide-react";
import { heroCards } from "../data";
import { fadeUp, fadeIn, stagger } from "../animations";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-[100svh] overflow-hidden bg-[var(--roots-parchment)] pt-28 sm:pt-32"
    >
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(200,134,42,0.06)_1px,transparent_1px)] bg-[length:40px_40px] opacity-80" />
      <div className="absolute right-[-8rem] top-[-2rem] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(200,134,42,0.62)_0%,rgba(228,185,106,0.22)_35%,transparent_72%)] blur-[120px] float-texture" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,12,10,0.03)_0%,transparent_24%,transparent_76%,rgba(14,12,10,0.03)_100%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:pb-28">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative z-10 flex min-h-[calc(100svh-9rem)] flex-col justify-center"
        >
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-3"
          >
            <span className="label-caps text-[11px] font-medium text-[var(--roots-gold)]">
              ✦ THE ARTISAN MARKETPLACE
            </span>
            <span className="h-px w-20 origin-left bg-[var(--roots-gold)]" />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="max-w-4xl font-display text-[clamp(3rem,7vw,5.9rem)] leading-[0.92] tracking-[-0.055em] text-[var(--roots-brown)]"
          >
            Where India&apos;s <br />
            Finest{" "}
            <em className="font-accent text-[1.02em] italic text-[var(--roots-terra)]">
              Crafts
            </em>{" "}
            <br />
            Find Their Home.
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="mt-7 h-px w-24 origin-left bg-[var(--roots-gold)]"
          />

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-xl text-[18px] font-light leading-8 text-[var(--roots-muted)]"
          >
            ROOTS connects artisan sellers with conscious buyers across India -
            with trust, transparency, and technology.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-col gap-4 sm:flex-row"
          >
            <a
              href="#marketplace"
              className="btn-roots inline-flex items-center justify-center gap-2 rounded-full bg-[var(--roots-gold)] px-7 py-4 text-base font-semibold text-[var(--roots-black)] shadow-[0_20px_50px_rgba(200,134,42,0.2)]"
            >
              Shop the Marketplace <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#seller-spotlight"
              className="btn-roots inline-flex items-center justify-center gap-2 rounded-full border border-[var(--roots-gold)] bg-transparent px-7 py-4 text-base font-semibold text-[var(--roots-gold)]"
            >
              Sell With Us →
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-wrap items-center gap-3 font-accent text-[13px] italic text-[var(--roots-muted)]"
          >
            <span>6+ Sellers</span>
            <span>·</span>
            <span>18+ Products</span>
            <span>·</span>
            <span>₹0 Hidden Fees</span>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex items-center gap-3 text-sm text-[var(--roots-muted)]"
          >
            <Sparkles className="h-4 w-4 text-[var(--roots-gold)]" />
            <span className="label-caps text-[11px] tracking-[0.22em]">
              Verified sellers, direct payments, admin oversight
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative flex items-center justify-center lg:justify-end"
        >
          <div className="absolute left-0 top-10 z-20 rounded-full border border-white/80 bg-white/92 px-4 py-2 text-sm font-semibold text-[var(--roots-brown)] shadow-[0_16px_50px_rgba(28,20,16,0.14)] backdrop-blur">
            🛡️ Verified Sellers Only
          </div>

          <div className="relative h-[42rem] w-full max-w-[34rem]">
            {heroCards.map((card, index) => {
              const offsets = [
                { top: 0, left: 0, rotate: -5 },
                { top: 80, left: 30, rotate: 4 },
                { top: 180, left: -10, rotate: -3 },
              ];
              const offset = offsets[index] || offsets[0];

              return (
                <motion.article
                  key={card.name}
                  variants={index === 0 ? fadeUp : fadeUp}
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  style={{
                    top: offset.top,
                    left: offset.left,
                    rotate: offset.rotate,
                  }}
                  className="absolute w-[88%] overflow-hidden rounded-[1.6rem] border border-white/80 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
                >
                  <img
                    src={card.image}
                    alt={card.name}
                    loading="lazy"
                    decoding="async"
                    className="h-44 w-full object-cover filter sepia-[0.15] saturate-[1.08] transition duration-500 hover:sepia-0 hover:saturate-125"
                  />
                  <div className="p-4">
                    <div className="font-display text-lg font-semibold text-[var(--roots-brown)]">
                      {card.name}
                    </div>
                    <div className="mt-1 text-[12px] text-[var(--roots-muted)]">
                      {card.seller}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="font-display text-[18px] font-bold text-[var(--roots-gold)] price-nums">
                        {card.price}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F3E8] px-3 py-1 text-[11px] font-semibold text-[#176B38]">
                        <span className="h-2 w-2 rounded-full bg-[#1FA55B]" />
                        {card.trust}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-6 flex justify-center">
        <motion.div
          animate={{ y: [0, 6, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,134,42,0.18)] bg-white/65 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[var(--roots-muted)] shadow-[0_10px_40px_rgba(28,20,16,0.08)] backdrop-blur"
        >
          <MoveDown className="h-3.5 w-3.5 text-[var(--roots-gold)]" />
          Scroll
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
