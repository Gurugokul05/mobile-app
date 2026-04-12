import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks } from "../data";

const WaxSeal = () => (
  <svg viewBox="0 0 40 40" className="h-8 w-8 text-[var(--roots-gold)]">
    <circle
      cx="20"
      cy="20"
      r="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M20 9c-3.8 4.3-7.8 8-7.8 12.1A7.8 7.8 0 0 0 20 29c4.3 0 7.8-3.5 7.8-7.8C27.8 17 23.7 13.2 20 9Z"
      fill="currentColor"
      opacity="0.18"
    />
    <path
      d="M20 12.2c-2.2 2.4-4.5 4.6-4.5 7.5A4.5 4.5 0 0 0 20 24.2a4.5 4.5 0 0 0 4.5-4.5c0-2.9-2.3-5.1-4.5-7.5Z"
      fill="currentColor"
    />
  </svg>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkVariants = {
    hidden: { opacity: 0, y: 14 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.08 * i, duration: 0.45 },
    }),
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-[60] transition-all duration-300 ${
        scrolled
          ? "border-b border-[rgba(200,134,42,0.18)] bg-[rgba(14,12,10,0.85)] backdrop-blur-[20px]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#home" className="group inline-flex items-center gap-2">
          <span className="font-display text-[1.65rem] tracking-[0.18em] text-[var(--roots-ivory)]">
            ROTS
          </span>
          <WaxSeal />
          <span className="font-display text-[1.65rem] tracking-[0.18em] text-[var(--roots-ivory)]">
            S
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link, index) => (
            <a
              key={link.label}
              href={link.href}
              className="nav-link label-caps relative text-[14px] font-medium text-[var(--roots-ivory)]/85 transition hover:text-[var(--roots-gold)]"
              style={{ letterSpacing: "0.15em" }}
            >
              <span>{link.label}</span>
              <span className="absolute inset-x-0 -bottom-2 h-px origin-left scale-x-0 bg-[var(--roots-gold)] transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}

          <a
            href="#marketplace"
            className="btn-roots inline-flex items-center rounded-full bg-[var(--roots-gold)] px-6 py-3 text-sm font-semibold text-[var(--roots-black)] shadow-[0_0_0_rgba(0,0,0,0)] transition hover:shadow-[0_0_24px_rgba(200,134,42,0.4)] hover:scale-[1.04]"
          >
            Explore →
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
          className="inline-flex items-center justify-center rounded-full border border-[rgba(245,237,216,0.18)] bg-[rgba(255,255,255,0.05)] p-3 text-[var(--roots-ivory)] md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-[rgba(14,12,10,0.98)] px-6 py-6 md:hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-3xl tracking-[0.18em] text-[var(--roots-ivory)]">
                ROOTS
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[rgba(228,185,106,0.2)] p-3 text-[var(--roots-ivory)]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <motion.div
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: {
                  transition: { staggerChildren: 0.05, staggerDirection: -1 },
                },
                show: {
                  transition: { staggerChildren: 0.08, delayChildren: 0.12 },
                },
              }}
              className="mt-16 flex flex-col gap-4"
            >
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  variants={linkVariants}
                  custom={index}
                  onClick={() => setOpen(false)}
                  className="label-caps border-b border-[rgba(245,237,216,0.08)] pb-4 text-2xl text-[var(--roots-ivory)]/90"
                  style={{ letterSpacing: "0.16em" }}
                >
                  {link.label}
                </motion.a>
              ))}

              <motion.a
                href="#marketplace"
                variants={linkVariants}
                custom={navLinks.length}
                onClick={() => setOpen(false)}
                className="btn-roots mt-4 inline-flex items-center justify-center rounded-full bg-[var(--roots-gold)] px-6 py-4 text-base font-semibold text-[var(--roots-black)]"
              >
                Explore →
              </motion.a>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
