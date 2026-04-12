import React from "react";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { footerColumns } from "../data";

const supportEmail = "support.roots.app@gmail.com";

const renderFooterLink = (item) => {
  if (item === "Privacy Policy") {
    return (
      <Link
        to="/privacy-policy"
        className="inline-flex transition duration-200 hover:translate-x-1 hover:text-[var(--roots-ivory)]"
      >
        {item}
      </Link>
    );
  }

  if (item === "Contact") {
    return (
      <a
        href={`mailto:${supportEmail}`}
        className="inline-flex transition duration-200 hover:translate-x-1 hover:text-[var(--roots-ivory)]"
      >
        {item}
      </a>
    );
  }

  return (
    <a
      href="#home"
      className="inline-flex transition duration-200 hover:translate-x-1 hover:text-[var(--roots-ivory)]"
    >
      {item}
    </a>
  );
};

const FooterGroup = ({ title, items }) => (
  <div>
    <div className="label-caps text-[11px] font-medium text-[var(--roots-gold)]">
      {title}
    </div>
    <ul className="mt-5 space-y-3 text-sm text-[var(--roots-ivory)]/72">
      {items.map((item) => (
        <li key={item}>{renderFooterLink(item)}</li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  return (
    <footer
      id="footer"
      className="relative overflow-hidden bg-[var(--roots-black)] text-[var(--roots-ivory)]"
    >
      <div className="absolute inset-x-0 top-0 -translate-y-full">
        <svg
          viewBox="0 0 1200 70"
          className="h-[70px] w-full fill-[var(--roots-black)]"
        >
          <path d="M0 40 C120 0 240 0 360 34 C500 74 600 72 760 32 C900 -4 1020 -4 1200 36 L1200 70 L0 70 Z" />
        </svg>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-3">
          <div className="font-display text-[2rem] tracking-[0.18em] text-[var(--roots-gold)]">
            ROOTS
          </div>
          <p className="mt-3 font-accent text-[1.25rem] italic text-[var(--roots-ivory)]/80">
            Rooted in craft. Built for trust.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--roots-ivory)]/66">
            A premium Indian marketplace for artisan sellers, conscious buyers,
            and the governance layer that keeps everything honest.
          </p>
          <div className="mt-5 rounded-2xl border border-[rgba(200,134,42,0.16)] bg-white/[0.04] p-4 text-sm leading-7 text-[var(--roots-ivory)]/82">
            <div className="label-caps text-[11px] font-medium text-[var(--roots-gold)]">
              Support
            </div>
            <p className="mt-2">
              Questions, privacy requests, or order help? Write to{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="font-semibold text-[var(--roots-gold-lt)] underline decoration-[rgba(228,185,106,0.35)] underline-offset-4 transition hover:text-[var(--roots-gold)]"
              >
                {supportEmail}
              </a>
              .
            </p>
          </div>
          <div className="mt-6 flex items-center gap-3 text-[var(--roots-ivory)]/78">
            {[
              [Instagram, "Instagram"],
              [Twitter, "Twitter"],
              [Linkedin, "LinkedIn"],
            ].map(([Icon, label]) => (
              <a
                key={label}
                href="https://example.com"
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="btn-roots grid h-10 w-10 place-items-center rounded-full border border-[rgba(200,134,42,0.18)] bg-white/[0.03] transition hover:scale-110 hover:border-[var(--roots-gold)] hover:text-[var(--roots-gold)]"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="mt-5 text-xs text-[var(--roots-ivory)]/55">
            Made with ❤️ for Indian Artisans
          </p>
        </div>

        <div className="lg:col-span-3 lg:col-start-5">
          <FooterGroup title="Marketplace" items={footerColumns.marketplace} />
        </div>
        <div className="lg:col-span-3">
          <FooterGroup title="Seller" items={footerColumns.seller} />
        </div>
        <div className="lg:col-span-3">
          <FooterGroup title="Company" items={footerColumns.company} />
        </div>
      </div>

      <div className="border-t border-[rgba(200,134,42,0.16)] px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-[var(--roots-ivory)]/60 md:flex-row md:items-center md:justify-between">
          <span>© 2026 ROOTS Marketplace</span>
          <span className="flex gap-4">
            <Link
              to="/privacy-policy"
              className="transition hover:text-[var(--roots-ivory)]"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="transition hover:text-[var(--roots-ivory)]"
            >
              Terms
            </Link>
            <a
              href={`mailto:${supportEmail}`}
              className="transition hover:text-[var(--roots-ivory)]"
            >
              Contact
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
