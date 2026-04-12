import React, { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const hoverSelector =
  'a, button, [role="button"], input, textarea, select, .cursor-hover';

const CustomCursor = () => {
  const coarsePointer = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(pointer: coarse)").matches;
  }, []);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 200, damping: 20, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 200, damping: 20, mass: 0.2 });
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (coarsePointer) return undefined;

    const handleMove = (event) => {
      setVisible(true);
      x.set(event.clientX);
      y.set(event.clientY);
    };

    const handleOver = (event) => {
      const target = event.target?.closest?.(hoverSelector);
      setHovered(Boolean(target));
    };

    const handleLeave = () => setHovered(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseover", handleOver);
    window.addEventListener("mouseout", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
      window.removeEventListener("mouseout", handleLeave);
    };
  }, [coarsePointer, x, y]);

  if (coarsePointer) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[10000] mix-blend-difference"
      style={{ x: springX, y: springY }}
      animate={{
        width: hovered ? 40 : 10,
        height: hovered ? 40 : 10,
        opacity: visible ? 1 : 0,
        marginLeft: hovered ? -20 : -5,
        marginTop: hovered ? -20 : -5,
        borderWidth: hovered ? 1 : 0,
        borderColor: "rgba(200, 134, 42, 0.95)",
        backgroundColor: hovered ? "rgba(200, 134, 42, 0.08)" : "#C8862A",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    />
  );
};

export default CustomCursor;
