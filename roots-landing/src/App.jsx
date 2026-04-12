import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import HowItWorks from "./components/HowItWorks";
import ProductShowcase from "./components/ProductShowcase";
import SellerSpotlight from "./components/SellerSpotlight";
import TrustAndTech from "./components/TrustAndTech";
import Testimonials from "./components/Testimonials";
import CTABanner from "./components/CTABanner";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.2,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 top-0 z-[10000] h-[2px] w-full origin-left bg-gold"
      style={{ scaleX }}
    />
  );
};

const App = () => {
  const [curtainDone, setCurtainDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-[var(--roots-parchment)] text-[var(--roots-brown)]">
      <CustomCursor />
      <ScrollProgress />

      {mounted && !curtainDone ? (
        <motion.div
          aria-hidden="true"
          initial={{ y: 0 }}
          animate={{ y: "-105%" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => setCurtainDone(true)}
          className="fixed inset-0 z-[10001] bg-gold"
        />
      ) : null}

      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <HowItWorks />
        <ProductShowcase />
        <SellerSpotlight />
        <TrustAndTech />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
};

export default App;
