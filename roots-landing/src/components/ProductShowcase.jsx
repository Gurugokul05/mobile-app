import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { featuredProducts } from "../data";
import { fadeUp, stagger } from "../animations";

const ProductCard = ({ product, large = false, cta = false }) => (
  <motion.article
    variants={fadeUp}
    whileHover={{ y: -6 }}
    className={`group relative overflow-hidden rounded-[1.8rem] border border-[rgba(28,20,16,0.08)] shadow-[0_18px_60px_rgba(28,20,16,0.08)] ${
      large ? "md:col-span-2 md:row-span-2" : ""
    } ${cta ? "bg-[var(--roots-brown)] text-[var(--roots-ivory)]" : "bg-white"}`}
  >
    {cta ? (
      <div className="flex h-full min-h-[20rem] flex-col justify-between p-7">
        <div>
          <div className="label-caps text-[11px] text-[var(--roots-gold)]">
            Browse the full collection
          </div>
          <div className="mt-4 max-w-xs font-display text-4xl leading-[0.94]">
            Explore All{" "}
            <em className="font-accent italic text-[var(--roots-gold-lt)]">
              Craft
            </em>
          </div>
        </div>
        <a
          href="#home"
          className="btn-roots inline-flex w-fit items-center gap-2 rounded-full bg-[var(--roots-gold)] px-5 py-3 font-semibold text-[var(--roots-black)]"
        >
          Browse All <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    ) : (
      <>
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`w-full object-cover transition duration-700 group-hover:scale-[1.04] ${large ? "h-[23rem]" : "h-52"} filter sepia-[0.12] saturate-[1.05] group-hover:sepia-0 group-hover:saturate-125`}
          />
          <div className="absolute left-4 top-4 rounded-full bg-[rgba(14,12,10,0.82)] px-3 py-1 text-[11px] font-semibold text-[var(--roots-ivory)] backdrop-blur">
            {product.trust}
          </div>
          <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[var(--roots-brown)]">
            {product.category}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(14,12,10,0.0)] opacity-0 transition duration-500 group-hover:bg-[rgba(14,12,10,0.28)] group-hover:opacity-100"></div>
        </div>

        <div className="p-5">
          <div className="font-display text-[clamp(1.45rem,2vw,2rem)] leading-tight text-[var(--roots-brown)]">
            {product.name}
          </div>
          <div className="mt-2 text-sm text-[var(--roots-muted)]">
            {product.seller}
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div className="font-display text-[18px] font-bold text-[var(--roots-gold)] price-nums">
              {product.price}
            </div>
            <button className="btn-roots inline-flex items-center gap-2 rounded-full bg-[rgba(200,134,42,0.12)] px-4 py-2 text-sm font-semibold text-[var(--roots-gold)] transition hover:bg-[var(--roots-gold)] hover:text-[var(--roots-black)]">
              <Plus className="h-4 w-4" /> Add to Cart
            </button>
          </div>
        </div>
      </>
    )}
  </motion.article>
);

const ProductShowcase = () => {
  const showcaseItems = featuredProducts.slice(0, 5);
  const browseTile = featuredProducts.find((item) => item.type === "cta");

  return (
    <section
      id="marketplace"
      className="relative overflow-hidden bg-[var(--roots-parchment)] py-24 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-3xl"
        >
          <p className="label-caps text-[11px] font-medium text-[var(--roots-gold)]">
            Curated inventory
          </p>
          <h2 className="mt-3 font-display text-[clamp(2.6rem,5vw,4.8rem)] leading-[0.96] text-[var(--roots-brown)]">
            Straight From the{" "}
            <em className="font-accent italic text-[var(--roots-terra)]">
              Craftsman&apos;s Hands
            </em>
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-8 text-[var(--roots-muted)]">
            Every product is framed as a collectible, with trust cues, seller
            attribution, and tactile visual hierarchy that makes browsing feel
            premium.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-10 hidden gap-5 md:grid md:grid-cols-4 md:auto-rows-[220px]"
        >
          <ProductCard product={showcaseItems[0]} large />
          <ProductCard product={showcaseItems[1]} />
          <ProductCard product={showcaseItems[2]} />
          <ProductCard product={showcaseItems[3]} />
          <ProductCard product={showcaseItems[4]} />
          {browseTile ? <ProductCard cta /> : null}
        </motion.div>

        <div className="mt-10 flex gap-5 overflow-x-auto pb-4 md:hidden snap-x snap-mandatory">
          {showcaseItems.map((product) => (
            <div key={product.name} className="min-w-[18rem] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
          <div className="min-w-[18rem] snap-start">
            <ProductCard cta />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
