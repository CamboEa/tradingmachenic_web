const TV_BASE = "https://s.tradingview.com/embed-widget/forex-heat-map/";

function buildSrc(): string {
  const config = {
    width: "100%",
    height: "100%",
    currencies: ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD"],
    isTransparent: true,
    colorTheme: "light",
    locale: "en",
    backgroundColor: "rgba(255,255,255,0)",
  };
  return `${TV_BASE}?locale=en#${encodeURIComponent(JSON.stringify(config))}`;
}

const src = buildSrc();

export function TradingViewForexHeatmap() {
  return (
    <iframe
      title="Forex currency strength heat map"
      src={src}
      className="block h-[500px] w-full border-0"
      referrerPolicy="no-referrer-when-downgrade"
      allow="clipboard-write"
    />
  );
}
