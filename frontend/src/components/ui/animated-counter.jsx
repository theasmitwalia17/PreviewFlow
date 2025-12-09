"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

export function AnimatedCounter({ value, className }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, {
    damping: 20,
    stiffness: 100,
  });

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toLocaleString();
      }
    });
    return () => unsubscribe();
  }, [springValue]);

  return <span ref={ref} className={className}>{value}</span>;
}