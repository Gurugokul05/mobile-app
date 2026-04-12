import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import { rolePanels } from "../data";
import { fadeUp, stagger } from "../animations";

const tabs = ["Buyer", "Seller", "Admin"];

const StatPill = ({ label, value }) => (
  <div className="rounded-2xl border border-[rgba(200,134,42,0.12)] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(28,20,16,0.06)]">
    <div className="label-caps text-[10px] font-semibold text-[var(--roots-muted)]">
      {label}
    </div>
    <div className="mt-1 font-display text-lg text-[var(--roots-brown)]">
      {value}
    </div>
  </div>
);

const MockPanel = ({ active }) => {
  if (active === "Buyer") {
    return (
      <div className="rounded-[1.8rem] bg-[linear-gradient(180deg,#fff, #f9f1df)] p-6 shadow-[0_24px_70px_rgba(28,20,16,0.1)]">
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div>
            <div className="font-display text-xl text-[var(--roots-brown)]">
              Today&apos;s Order
            </div>
            <div className="text-sm text-[var(--roots-muted)]">
              Pashmina Shawl
            </div>
          </div>
          <div className="rounded-full bg-[#E8F3E8] px-3 py-1 text-[11px] font-semibold text-[#177245]">
            Paid
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {[
            ["Order ID", "ORD-2025-01A9"],
            ["ETA", "Arrives in 3 days"],
            ["Seller", "Kashmir Loom House"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-2xl bg-white/75 px-4 py-3"
            >
              <span className="label-caps text-[10px] text-[var(--roots-muted)]">
                {label}
              </span>
              <span className="font-medium text-[var(--roots-brown)]">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (active === "Seller") {
    return (
      <div className="rounded-[1.8rem] bg-[linear-gradient(180deg,#fff, #f7ede0)] p-6 shadow-[0_24px_70px_rgba(28,20,16,0.1)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-xl text-[var(--roots-brown)]">
              Trust Score
            </div>
            <div className="text-sm text-[var(--roots-muted)]">
              Up 8 points this month
            </div>
          </div>
          <div className="rounded-full border border-[rgba(139,46,22,0.12)] px-3 py-1 text-[11px] font-semibold text-[var(--roots-terra)]">
            94 / 100
          </div>
        </div>
        <div className="mt-5 h-4 overflow-hidden rounded-full bg-black/5">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "94%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.1 }}
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--roots-gold),var(--roots-gold-lt))]"
          />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {["12 Orders", "4 Reviews", "₹18.2k Revenue"].map((item) => (
            <StatPill key={item} label="Snapshot" value={item} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.8rem] bg-[linear-gradient(180deg,#fff,#f4e8d1)] p-6 shadow-[0_24px_70px_rgba(28,20,16,0.1)]">
      <div className="flex items-center justify-between border-b border-black/5 pb-4">
        <div>
          <div className="font-display text-xl text-[var(--roots-brown)]">
            Verification Queue
          </div>
          <div className="text-sm text-[var(--roots-muted)]">
            Manual review in progress
          </div>
        </div>
        <div className="rounded-full bg-[#FCE9DD] px-3 py-1 text-[11px] font-semibold text-[var(--roots-terra)]">
          4 Pending
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-3xl border border-black/5 bg-white">
        {[
          ["Seller A", "Proof uploaded"],
          ["Seller B", "Awaiting screenshot"],
          ["Seller C", "Approve / Reject"],
        ].map((row, index) => (
          <div
            key={row[0]}
            className={`flex items-center justify-between px-4 py-3 ${index !== 2 ? "border-b border-black/5" : ""}`}
          >
            <div>
              <div className="font-medium text-[var(--roots-brown)]">
                {row[0]}
              </div>
              <div className="text-sm text-[var(--roots-muted)]">{row[1]}</div>
            </div>
            <div className="flex gap-2">
              <button className="rounded-full bg-[#E8F3E8] px-3 py-1 text-[11px] font-semibold text-[#177245]">
                Approve
              </button>
              <button className="rounded-full bg-[#FCE4E1] px-3 py-1 text-[11px] font-semibold text-[#A12D1F]">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const [active, setActive] = useState("Buyer");
  const panel = rolePanels[active];

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[var(--roots-parchment)] py-24 sm:py-28"
    >
      <div className="absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(14,12,10,0.08),transparent)] clip-path-[polygon(0_0,100%_0,100%_100%,0_65%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-3xl"
        >
          <p className="label-caps font-medium text-[11px] text-[var(--roots-gold)]">
            ✦ THE ECOSYSTEM
          </p>
          <h2 className="mt-3 font-display text-[clamp(2.7rem,5vw,4.8rem)] leading-[0.96] text-[var(--roots-brown)]">
            Three Roles. One{" "}
            <em className="font-accent italic text-[var(--roots-terra)]">
              Platform
            </em>
            .
          </h2>
          <div className="mt-5 h-px w-24 bg-[var(--roots-gold)]" />
        </motion.div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="flex flex-wrap gap-3 lg:flex-col">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActive(tab)}
                className={`btn-roots label-caps rounded-full px-6 py-4 text-left text-[14px] font-semibold transition ${
                  active === tab
                    ? "bg-[var(--roots-brown)] text-[var(--roots-gold)] shadow-[0_18px_40px_rgba(28,20,16,0.12)]"
                    : "border border-[rgba(28,20,16,0.08)] bg-white text-[var(--roots-muted)] hover:text-[var(--roots-brown)]"
                }`}
                style={{ letterSpacing: "0.15em" }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(28,20,16,0.08)] bg-white p-4 shadow-[0_28px_80px_rgba(28,20,16,0.08)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]"
              >
                <div className="relative rounded-[1.8rem] bg-[linear-gradient(180deg,#fff,#f8f0df)] p-6 lg:p-8">
                  <div className="pointer-events-none absolute right-4 top-0 font-display text-[clamp(7rem,16vw,8.4rem)] font-black leading-none text-[var(--roots-gold)]/15">
                    {panel.number}
                  </div>
                  <div className="relative z-10">
                    <div className="font-display text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.95] text-[var(--roots-brown)]">
                      {panel.title}
                    </div>
                    <p className="mt-4 max-w-xl text-[16px] leading-8 text-[var(--roots-muted)]">
                      {panel.summary}
                    </p>
                    <div className="mt-6 space-y-3">
                      {panel.bullets.map((bullet) => (
                        <div
                          key={bullet}
                          className="flex items-start gap-3 text-[var(--roots-brown)]"
                        >
                          <span className="mt-2 text-[var(--roots-gold)]">
                            ✦
                          </span>
                          <span className="text-[15px] leading-7 text-[var(--roots-brown)]/85">
                            {bullet}
                          </span>
                        </div>
                      ))}
                    </div>
                    <a
                      href="#marketplace"
                      className="btn-roots mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--roots-gold)] px-6 py-3.5 font-semibold text-[var(--roots-black)]"
                    >
                      {panel.cta} <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <MockPanel active={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
