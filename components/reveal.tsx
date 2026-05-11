"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Extra delay after the element enters the viewport (milliseconds). */
  delayMs?: number;
  /**
   * `mount` runs once when the component mounts (for above-the-fold content).
   * `scroll` waits until the element intersects the viewport.
   */
  variant?: "scroll" | "mount";
};

export function Reveal({
  children,
  className = "",
  delayMs = 0,
  variant = "scroll",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    if (variant !== "mount") return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [variant]);

  useEffect(() => {
    if (variant !== "scroll") return;
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [variant]);

  const style: CSSProperties | undefined =
    visible && delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined;

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
