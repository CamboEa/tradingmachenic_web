const TV_BASE = "https://s.tradingview.com/embed-widget/forex-heat-map/";

/** Matches app/globals.css --surface */
const HEATMAP_BG = "#1f2f35";

function buildSrc(): string {
  const config = {
    width: "100%",
    height: "100%",
    currencies: ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD"],
    colorTheme: "dark",
    isTransparent: false,
    locale: "en",
    backgroundColor: HEATMAP_BG,
  };
  return `${TV_BASE}?locale=en#${encodeURIComponent(JSON.stringify(config))}`;
}

const src = buildSrc();

export function TradingViewForexHeatmap() {
  return (
    <iframe
      title="Forex currency strength heat map"
      src={src}
      className="block h-[clamp(420px,58vh,680px)] w-full border-0 bg-surface"
      referrerPolicy="no-referrer-when-downgrade"
      allow="clipboard-write"
    />
  );
}
