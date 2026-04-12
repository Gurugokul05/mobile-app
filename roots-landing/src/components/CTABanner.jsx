import React from "react";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "../animations";

const words = ["India's", "Craft", "Deserves", "a", "Better", "Stage."];

const CTABanner = () => {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#1C1410_0%,#8B2E16_44%,#C8862A_160%)] py-32 text-[var(--roots-ivory)]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_35%,rgba(255,255,255,0.08)_100%)] opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(228,185,106,0.24)_0%,transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(139,46,22,0.5)_0%,transparent_42%)]" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_18px)] opacity-25" />

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.p
            variants={fadeUp}
            className="label-caps text-[11px] font-medium text-[var(--roots-gold-lt)]"
          >
            ✦ JOIN THE MOVEMENT
          </motion.p>

          <motion.h2 className="mt-4 font-display text-[clamp(3rem,7vw,5.6rem)] leading-[0.94] text-[var(--roots-ivory)]">
            {words.map((word, index) => (
              <motion.span
                key={word}
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="mr-5 inline-block"
              >
                {word === "Stage." ? (
                  <span className="relative inline-block text-[var(--roots-gold-lt)]">
                    <span className="absolute inset-0 -z-10 scale-110 rounded-full bg-[radial-gradient(circle,rgba(200,134,42,0.36),transparent_65%)] blur-2xl animate-pulse" />
                    <em className="font-accent italic text-[1.04em] text-[var(--roots-gold-lt)]">
                      {word}
                    </em>
                  </span>
                ) : word === "Craft" ? (
                  <em className="font-accent italic text-[var(--roots-gold-lt)]">
                    {word}
                  </em>
                ) : (
                  word
                )}
              </motion.span>
            ))}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-[16px] leading-8 text-[var(--roots-ivory)]/80"
          >
            Join ROOTS today as a buyer, seller, or partner. We are building the
            stage Indian craft deserves - with trust at the center and a premium
            experience everywhere else.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
          >
            <a
              href="#marketplace"
              className="btn-roots inline-flex items-center justify-center rounded-full bg-[var(--roots-gold)] px-7 py-4 text-base font-semibold text-[var(--roots-black)]"
            >
              Start Shopping
            </a>
            <a
              href="#seller-spotlight"
              className="btn-roots inline-flex items-center justify-center rounded-full border border-[rgba(245,237,216,0.4)] px-7 py-4 text-base font-semibold text-[var(--roots-ivory)]"
            >
              Join as Seller
            </a>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-6 font-accent text-[14px] italic text-[var(--roots-ivory)]/68"
          >
            Join 6+ verified sellers and hundreds of buyers on ROOTS
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
