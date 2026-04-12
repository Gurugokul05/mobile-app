import React from "react";
import { motion } from "framer-motion";
import { testimonialRows } from "../data";
import { fadeUp } from "../animations";

const Card = ({ item }) => {
  const initial = String(item.author || "A")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <article className="relative min-w-[20rem] rounded-[1.4rem] border border-[rgba(28,20,16,0.08)] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="absolute -left-1 -top-4 font-display text-7xl leading-none text-[var(--roots-gold)]">
        &ldquo;
      </div>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--roots-gold)] font-semibold text-[var(--roots-black)]">
          {initial}
        </div>
        <div>
          <div className="font-medium text-[var(--roots-brown)]">
            {item.author}
          </div>
          <div className="mt-1 inline-flex rounded-full bg-[var(--roots-parchment)] px-3 py-1 text-[11px] font-semibold text-[var(--roots-muted)]">
            {item.role}
          </div>
        </div>
      </div>
      <p className="mt-5 font-accent text-[18px] italic leading-8 text-[var(--roots-brown)]/88">
        {item.quote}
      </p>
    </article>
  );
};

const MarqueeRow = ({ items, reverse = false }) => (
  <div className="marquee overflow-hidden py-2">
    <div
      className="marquee-track gap-5 px-2"
      style={{ animationDirection: reverse ? "reverse" : "normal" }}
    >
      {[...items, ...items].map((item, index) => (
        <Card key={`${item.author}-${index}`} item={item} />
      ))}
    </div>
  </div>
);

const Testimonials = () => {
  return (
    <section className="bg-[var(--roots-ivory)] py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-3xl"
        >
          <p className="label-caps text-[11px] font-medium text-[var(--roots-terra)]">
            Social proof
          </p>
          <h2 className="mt-3 font-display text-[clamp(2.7rem,5vw,4.8rem)] leading-[0.94] text-[var(--roots-brown)]">
            Trusted Across{" "}
            <em className="font-accent italic text-[var(--roots-terra)]">
              India
            </em>
          </h2>
        </motion.div>

        <div className="mt-10 space-y-5">
          <MarqueeRow items={testimonialRows[0]} />
          <MarqueeRow items={testimonialRows[1]} reverse />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
