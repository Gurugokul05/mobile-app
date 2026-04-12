import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Layers3, IndianRupee, Users } from "lucide-react";
import { stats } from "../data";

const iconMap = [BadgeCheck, Layers3, Users, IndianRupee];

const CountUp = ({ value, active }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return undefined;

    const start = performance.now();
    const duration = 950;
    let frameId = 0;

    const step = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [active, value]);

  return display;
};

const StatsBar = () => {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          setActive(true);
        }
      },
      { threshold: [0.6] },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="border-y border-[rgba(200,134,42,0.3)] bg-[var(--roots-brown)] py-16 text-[var(--roots-ivory)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-0 overflow-hidden rounded-[1.5rem] border border-[rgba(200,134,42,0.18)] md:grid-cols-4 md:divide-x md:divide-[rgba(200,134,42,0.18)]">
          {stats.map((item, index) => {
            const Icon = iconMap[index] || BadgeCheck;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={active ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="flex flex-col items-center justify-center gap-3 bg-white/2 px-5 py-8 text-center md:px-7"
              >
                <Icon className="h-5 w-5 text-[var(--roots-gold)]" />
                <div className="font-display text-[clamp(2.4rem,5vw,3.7rem)] font-bold leading-none text-[var(--roots-gold)] price-nums text-gold-glow">
                  {item.prefix || ""}
                  <CountUp value={item.value} active={active} />
                  {item.suffix || ""}
                </div>
                <div className="label-caps text-[12px] font-medium text-[var(--roots-ivory)]/65">
                  {item.label}
                </div>
                {item.detail ? (
                  <div className="font-accent text-[14px] italic text-[var(--roots-ivory)]/75">
                    {item.detail}
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
