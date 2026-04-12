import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, stagger } from "../animations";

const words = ["India's", "Craft", "Deserves", "a", "Better", "Stage."];

const CTABanner = () => {
  const [joinOpen, setJoinOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

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
              onClick={(event) => {
                event.preventDefault();
                setJoinOpen(true);
                setSubmitted(false);
              }}
            >
              Join
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

      <AnimatePresence>
        {joinOpen ? (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(14,12,10,0.78)] px-4 py-8 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setJoinOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-xl rounded-[2rem] border border-[rgba(245,237,216,0.16)] bg-[var(--roots-parchment)] p-6 text-[var(--roots-brown)] shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="label-caps text-[11px] font-medium text-[var(--roots-gold)]">
                    Join ROOTS
                  </p>
                  <h3 className="mt-2 font-display text-3xl leading-tight">
                    Early Access Form
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setJoinOpen(false)}
                  className="rounded-full border border-[rgba(28,20,16,0.12)] px-3 py-1 text-sm font-semibold text-[var(--roots-brown)] transition hover:border-[var(--roots-gold)] hover:text-[var(--roots-gold)]"
                >
                  Close
                </button>
              </div>

              {submitted ? (
                <div className="mt-6 rounded-2xl border border-[rgba(200,134,42,0.18)] bg-white p-5">
                  <p className="font-display text-2xl text-[var(--roots-brown)]">
                    Thank you.
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--roots-muted)]">
                    Early access will be granted soon.
                  </p>
                </div>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <label className="block">
                    <span className="label-caps text-[11px] font-medium text-[var(--roots-brown)]/70">
                      Name
                    </span>
                    <input
                      name="name"
                      type="text"
                      required
                      className="mt-2 w-full rounded-2xl border border-[rgba(28,20,16,0.12)] bg-white px-4 py-3 text-base text-[var(--roots-brown)] outline-none transition focus:border-[var(--roots-gold)]"
                      placeholder="Your name"
                    />
                  </label>

                  <label className="block">
                    <span className="label-caps text-[11px] font-medium text-[var(--roots-brown)]/70">
                      Email
                    </span>
                    <input
                      name="email"
                      type="email"
                      required
                      className="mt-2 w-full rounded-2xl border border-[rgba(28,20,16,0.12)] bg-white px-4 py-3 text-base text-[var(--roots-brown)] outline-none transition focus:border-[var(--roots-gold)]"
                      placeholder="you@example.com"
                    />
                  </label>

                  <label className="block">
                    <span className="label-caps text-[11px] font-medium text-[var(--roots-brown)]/70">
                      Phone{" "}
                      <span className="normal-case text-[var(--roots-muted)]">
                        (optional)
                      </span>
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      className="mt-2 w-full rounded-2xl border border-[rgba(28,20,16,0.12)] bg-white px-4 py-3 text-base text-[var(--roots-brown)] outline-none transition focus:border-[var(--roots-gold)]"
                      placeholder="+91 98765 43210"
                    />
                  </label>

                  <div className="rounded-2xl border border-[rgba(200,134,42,0.18)] bg-[rgba(200,134,42,0.08)] p-4 text-sm leading-7 text-[var(--roots-brown)]">
                    Early access will be granted soon.
                  </div>

                  <button
                    type="submit"
                    className="btn-roots inline-flex w-full items-center justify-center rounded-full bg-[var(--roots-gold)] px-6 py-4 text-base font-semibold text-[var(--roots-black)]"
                  >
                    Request Early Access
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
};

export default CTABanner;
