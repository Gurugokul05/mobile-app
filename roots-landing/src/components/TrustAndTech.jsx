import React from "react";
import { motion } from "framer-motion";
import { featureTiles, techBadges } from "../data";
import {
  CreditCard,
  LockKeyhole,
  PackageCheck,
  ShieldAlert,
} from "lucide-react";
import { fadeUp, stagger } from "../animations";

const iconMap = {
  "lock-keyhole": LockKeyhole,
  "credit-card": CreditCard,
  "package-check": PackageCheck,
  "shield-alert": ShieldAlert,
};

const TrustAndTech = () => {
  const repeatedBadges = [...techBadges, ...techBadges];

  return (
    <section className="relative overflow-hidden bg-[var(--roots-black)] py-24 text-[var(--roots-ivory)] sm:py-28">
      <div className="absolute inset-0 overflow-hidden">
        {[
          "left-[-5rem] top-[-2rem]",
          "right-[-4rem] top-[4rem]",
          "left-[14%] bottom-[2rem]",
          "right-[18%] bottom-[-6rem]",
          "left-[50%] top-[20%]",
        ].map((pos, index) => (
          <div
            key={pos}
            className={`absolute h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle,rgba(200,134,42,0.1)_0%,rgba(200,134,42,0.03)_34%,transparent_72%)] blur-3xl ${pos}`}
            style={{
              animation: `float-texture ${12 + index * 5}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-[32rem] text-center"
        >
          <p className="label-caps text-[11px] font-medium text-[var(--roots-gold)]">
            Built for trust
          </p>
          <h2 className="mt-3 font-display text-[clamp(2.7rem,5vw,4.7rem)] leading-[0.94]">
            Built for Trust.{" "}
            <em className="font-accent italic text-[var(--roots-gold-lt)]">
              Powered by Tech.
            </em>
          </h2>
        </motion.div>

        <div className="marquee mt-10 border-y border-[rgba(200,134,42,0.28)] py-4">
          <div className="marquee-track gap-8 px-4">
            {repeatedBadges.map((badge, index) => (
              <span
                key={`${badge}-${index}`}
                className="label-caps whitespace-nowrap text-[12px] font-medium tracking-[0.24em] text-[var(--roots-gold)]/90"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          {featureTiles.map((tile, index) => {
            const Icon = iconMap[tile.icon];
            return (
              <motion.article
                key={tile.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="rounded-[1.4rem] border border-[rgba(200,134,42,0.15)] bg-white/[0.03] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.16)] transition hover:border-[rgba(200,134,42,0.5)] hover:shadow-[0_0_40px_rgba(200,134,42,0.1)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(200,134,42,0.15)] bg-[rgba(200,134,42,0.1)] text-[var(--roots-gold)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-[1.65rem] text-[var(--roots-ivory)]">
                  {tile.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--roots-ivory)]/70">
                  {tile.text}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustAndTech;
