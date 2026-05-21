"use client";

import {
 useEffect,
 useLayoutEffect,
 useRef,
 useState,
 type CSSProperties,
 type ReactNode,
} from "react";

type RevealEffect = "up" | "left" | "right" | "scale" | "fade";

const effectModifier: Record<RevealEffect, string> = {
 up: "",
 left: "reveal--left",
 right: "reveal--right",
 scale: "reveal--scale",
 fade: "reveal--fade",
};

type RevealProps = {
 children: ReactNode;
 className?: string;
 delayMs?: number;
 variant?: "scroll" | "mount";
 effect?: RevealEffect;
};

export function Reveal({
 children,
 className = "",
 delayMs = 0,
 variant = "scroll",
 effect = "up",
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

 const modifier = effectModifier[effect];

 return (
 <div
 ref={ref}
 className={`reveal ${modifier} ${visible ? "reveal-visible" : ""} ${className}`.trim().replace(/\s+/g, " ")}
 style={style}
 >
 {children}
 </div>
 );
}
