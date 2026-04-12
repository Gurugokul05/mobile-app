import React from "react";
import { Link } from "react-router-dom";
import CustomCursor from "../components/CustomCursor";

const supportEmail = "support.roots.app@gmail.com";

const sections = [
  {
    title: "1. Information We Collect",
    body: "We collect account details you provide directly, such as your name, email address, phone number, and profile information. We also collect marketplace activity data including product browsing, orders, and seller interactions.",
  },
  {
    title: "2. How We Use Information",
    body: "Roots uses your information to operate the marketplace, process transactions, prevent fraud, improve trust and safety systems, and provide support. We may also use aggregated analytics to improve product performance and buyer-seller experience.",
  },
  {
    title: "3. Seller Verification Data",
    body: "To maintain trust, Roots may collect verification materials from sellers, including identity and business evidence. This data is used only for compliance, safety review, and platform integrity.",
  },
  {
    title: "4. Payment and Security",
    body: "Payment-related details are processed through approved payment flows. We implement technical and organizational safeguards to protect account and transaction data, but no internet transmission can be guaranteed as fully secure.",
  },
  {
    title: "5. Data Sharing",
    body: "We do not sell personal information. We may share limited data with trusted service providers, legal authorities when required by law, and platform partners strictly to operate the marketplace and enforce policies.",
  },
  {
    title: "6. Cookies and Analytics",
    body: "Roots may use cookies and similar technologies to remember preferences, improve performance, and measure engagement. You can control cookies through your browser settings.",
  },
  {
    title: "7. Your Choices",
    body: "You may request account updates, correction of inaccurate information, or account deletion subject to legal and operational requirements. You may also opt out of non-essential communications.",
  },
  {
    title: "8. Contact",
    body: `For privacy-related questions, email ${supportEmail} or use the official help channels listed on the site.`,
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[var(--roots-parchment)] text-[var(--roots-brown)]">
      <CustomCursor />
      <header className="border-b border-[rgba(99,73,43,0.18)] bg-[var(--roots-black)] text-[var(--roots-ivory)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="font-display text-xl tracking-[0.14em] text-[var(--roots-gold)]"
          >
            ROOTS
          </Link>
          <Link
            to="/"
            className="rounded-full border border-[rgba(245,237,216,0.28)] px-4 py-2 text-sm transition hover:border-[var(--roots-gold)] hover:text-[var(--roots-gold)]"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="label-caps text-xs tracking-[0.2em] text-[var(--roots-gold)]">
          Legal
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--roots-brown)]/80 sm:text-base">
          Effective date: April 13, 2026. This Privacy Policy explains how Roots
          Marketplace collects, uses, and protects your information when you use
          our platform.
        </p>

        <div className="mt-10 space-y-6">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-[rgba(99,73,43,0.14)] bg-white/70 p-6 shadow-[0_10px_30px_rgba(26,19,10,0.06)]"
            >
              <h2 className="font-display text-2xl leading-tight text-[var(--roots-brown)]">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--roots-brown)]/80 sm:text-base">
                {section.body}
              </p>
            </section>
          ))}

          <section className="rounded-2xl border border-[rgba(99,73,43,0.14)] bg-[var(--roots-black)] p-6 text-[var(--roots-ivory)] shadow-[0_10px_30px_rgba(26,19,10,0.06)]">
            <h2 className="font-display text-2xl leading-tight text-[var(--roots-gold)]">
              Support Contact
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--roots-ivory)]/82 sm:text-base">
              For privacy, account, or order support, email{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="font-semibold text-[var(--roots-gold-lt)] underline decoration-[rgba(228,185,106,0.35)] underline-offset-4 transition hover:text-[var(--roots-gold)]"
              >
                {supportEmail}
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
