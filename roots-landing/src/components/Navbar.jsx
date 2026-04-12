import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks } from "../data";
import rootsLogo from "../assets/Roots logo.png";

const RootsMark = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <path
      d="M32 8 14 40h10l8-14 8 14h10L32 8Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 24 24 38h16l-8-14Z"
      fill="currentColor"
      opacity="0.22"
    />
    <path
      d="M32 40v16"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <path
      d="M26 50c2-3 4-5 6-5s4 2 6 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
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
          ? "border-b border-[rgba(200,134,42,0.18)] bg-[rgba(250,246,238,0.88)] backdrop-blur-[20px]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#home" className="group inline-flex items-center gap-2">
          <img
            src={rootsLogo}
            alt="Roots logo"
            className="h-8 w-8 rounded-full object-cover"
          />
          <span
            className={`font-display text-[1.65rem] tracking-[0.18em] transition-colors duration-300 ${
              scrolled
                ? "text-[var(--roots-brown)]"
                : "text-[var(--roots-ivory)]"
            }`}
          >
            ROOTS
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link, index) => (
            <a
              key={link.label}
              href={link.href}
              className={`nav-link label-caps relative text-[14px] font-medium transition hover:text-[var(--roots-gold)] ${
                scrolled
                  ? "text-[var(--roots-brown)]/82"
                  : "text-[var(--roots-ivory)]/85"
              }`}
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
            className="fixed inset-0 z-[70] bg-[rgba(250,246,238,0.98)] px-6 py-6 md:hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={rootsLogo}
                  alt="Roots logo"
                  className="h-9 w-9 rounded-full object-cover"
                />
                <span className="font-display text-3xl tracking-[0.18em] text-[var(--roots-brown)]">
                  ROOTS
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[rgba(200,134,42,0.2)] p-3 text-[var(--roots-brown)]"
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
                  className="label-caps border-b border-[rgba(99,73,43,0.12)] pb-4 text-2xl text-[var(--roots-brown)]/90"
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
