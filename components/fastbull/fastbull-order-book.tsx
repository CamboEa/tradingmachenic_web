"use client";

import { useEffect, useRef, useState } from "react";

const FASTBULL_BASE = "https://www.fastbull.com/list-position";

/**
 * Crop to `.orders-chart-main` only (chart + legend) — `?orderType=1|2` at 1280px.
 * Excludes Order Book header, tabs, symbol picker, and instructions.
 */
const CHART = {
  frameWidth: 820,
  frameHeight: 530,
  cropTop: 371,
  cropLeft: 440,
  iframeWidth: 1400,
} as const;

/** 1 = fill panel width (zoomed in on chart). */
const ZOOM = 1;

function panelUrl(orderType: 1 | 2) {
  return `${FASTBULL_BASE}?orderType=${orderType}`;
}

function FastBullOrderPanel({
  orderType,
  label,
}: {
  orderType: 1 | 2;
  label: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(CHART.frameWidth);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () => setWidth(el.clientWidth);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = (width / CHART.frameWidth) * ZOOM;
  const displayHeight = CHART.frameHeight * scale;

  return (
    <div className="flex min-w-0 flex-col">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-gold">
        {label}
      </p>
      <div ref={wrapRef} className="w-full min-w-0">
        <div
          className="relative w-full overflow-hidden rounded-2xl border border-bridge/80 bg-surface shadow-sm"
          style={{ height: displayHeight }}
        >
          <div
            className="absolute left-1/2 top-0"
            style={{
              width: CHART.frameWidth,
              height: CHART.frameHeight,
              transform: `translateX(-50%) scale(${scale})`,
              transformOrigin: "top center",
            }}
          >
            <iframe
              title={label}
              src={panelUrl(orderType)}
              className="absolute border-0 bg-surface"
              style={{
                top: -CHART.cropTop,
                left: -CHART.cropLeft,
                width: CHART.iframeWidth,
                height: CHART.cropTop + CHART.frameHeight,
              }}
              referrerPolicy="no-referrer-when-downgrade"
              loading="lazy"
              allow="clipboard-write"
              scrolling="no"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FastBullOrderBook() {
  return (
    <div className="grid w-full gap-6 lg:grid-cols-2">
      <FastBullOrderPanel orderType={1} label="Open Orders" />
      <FastBullOrderPanel orderType={2} label="Open Positions" />
    </div>
  );
}

export const fastBullOrderBookUrl = FASTBULL_BASE;
