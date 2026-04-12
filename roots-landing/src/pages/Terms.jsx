import React from "react";
import { Link } from "react-router-dom";
import CustomCursor from "../components/CustomCursor";

const supportEmail = "support.roots.app@gmail.com";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using Roots Marketplace, you agree to these Terms and to all applicable policies referenced here. If you do not agree, you should not use the platform.",
  },
  {
    title: "2. Platform Role",
    body: "Roots provides a marketplace connecting buyers and sellers. We facilitate listing, discovery, trust workflows, and transaction flows, but we may not be the direct seller of listed products.",
  },
  {
    title: "3. Accounts and Eligibility",
    body: "Users must provide accurate account information and are responsible for safeguarding account credentials. Roots may suspend or terminate accounts that violate policies or applicable law.",
  },
  {
    title: "4. Seller Obligations",
    body: "Sellers must provide accurate product details, comply with quality and verification requirements, and fulfill orders in accordance with marketplace rules and timelines.",
  },
  {
    title: "5. Orders, Payments, and Refunds",
    body: "Orders, payment flows, cancellations, and refunds are governed by published marketplace policies. Roots may review evidence and transaction details to resolve disputes and protect platform integrity.",
  },
  {
    title: "6. Prohibited Conduct",
    body: "Users may not engage in fraud, misrepresentation, abuse, unauthorized access, or misuse of platform content and services. Violations may result in immediate account restriction.",
  },
  {
    title: "7. Intellectual Property",
    body: "All platform branding, design, and proprietary systems are owned by Roots or its licensors. Users retain rights in their own content but grant Roots permission to display it for operating the marketplace.",
  },
  {
    title: "8. Limitation of Liability",
    body: "To the extent permitted by law, Roots is not liable for indirect, incidental, or consequential damages arising from platform use. Services are provided on an as-available basis.",
  },
  {
    title: "9. Changes to Terms",
    body: "Roots may update these Terms from time to time. Continued use after updates means you accept the revised Terms.",
  },
];

const Terms = () => {
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
          Terms and Conditions
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--roots-brown)]/80 sm:text-base">
          Effective date: April 13, 2026. These Terms govern your use of Roots
          Marketplace and related services.
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
              Questions about these Terms can be sent to{" "}
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

export default Terms;
