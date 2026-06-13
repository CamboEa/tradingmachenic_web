const TV_BASE = "https://s.tradingview.com/embed-widget/symbol-overview/";

const SYMBOLS = [
  ["Gold (XAU/USD)", "TVC:GOLD|1D"],
  ["EUR / USD", "FX:EURUSD|1D"],
  ["GBP / USD", "FX:GBPUSD|1D"],
] as const;

function buildSrc(): string {
  const config = {
    symbols: SYMBOLS,
    chartOnly: false,
    width: "100%",
    height: "100%",
    locale: "en",
    colorTheme: "light",
    autosize: true,
    showVolume: false,
    showMA: false,
    hideDateRanges: false,
    hideMarketStatus: false,
    hideSymbolLogo: false,
    scalePosition: "right",
    scaleMode: "Normal",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "10",
    noTimeScale: false,
    valuesTracking: "1",
    changeMode: "price-and-percent",
    chartType: "area",
    lineWidth: 2,
    lineColor: "rgba(212,175,55,1)",
    topColor: "rgba(212,175,55,0.12)",
    bottomColor: "rgba(212,175,55,0)",
    backgroundColor: "rgba(255,255,255,0)",
    gridLineColor: "rgba(0,0,0,0.05)",
    isTransparent: true,
    dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
  };
  return `${TV_BASE}?locale=en#${encodeURIComponent(JSON.stringify(config))}`;
}

const src = buildSrc();

export function TradingViewSymbolOverview() {
  return (
    <iframe
      title="Live price charts — Gold, EUR/USD, GBP/USD"
      src={src}
      className="block h-[clamp(420px,58vh,680px)] w-full border-0"
      referrerPolicy="no-referrer-when-downgrade"
      allow="clipboard-write"
    />
  );
}
