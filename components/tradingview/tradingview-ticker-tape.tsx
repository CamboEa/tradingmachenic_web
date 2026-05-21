import type { Locale } from "@/lib/i18n";

const TV_IFRAME_BASE = "https://s.tradingview.com/embed-widget/ticker-tape/";

/** Symbols shown in the strip (TradingView `proName` format). */
const SYMBOLS: { proName: string; description: string }[] = [
 { proName: "OANDA:GBPUSD", description: "GBP/USD" },
 { proName: "OANDA:USDJPY", description: "USD/JPY" },
 { proName: "OANDA:AUDUSD", description: "AUD/USD" },
 { proName: "OANDA:USDCAD", description: "USD/CAD" },
 { proName: "OANDA:EURUSD", description: "EUR/USD" },
 { proName: "OANDA:XAUUSD", description: "Gold" },
];

function buildConfig(locale: Locale) {
 return {
 symbols: SYMBOLS,
 showSymbolLogo: true,
 colorTheme: "light",
 isTransparent: true,
 displayMode: "adaptive",
 locale: locale === "km" ? "en" : "en",
 };
}

function tickerTapeIframeSrc(locale: Locale): string {
 const config = buildConfig(locale);
 const queryLocale = config.locale;
 return `${TV_IFRAME_BASE}?locale=${queryLocale}#${encodeURIComponent(JSON.stringify(config))}`;
}

/**
 * TradingView Ticker Tape — iframe embed so the widget is isolated from React
 * mount/unmount (avoids script-injector + Strict Mode "contentWindow" console errors).
 * Docs: https://www.tradingview.com/widget-docs/widgets/tickers/ticker-tape/
 */
export function TradingViewTickerTape({ locale }: { locale: Locale }) {
 return (
 <div
 className="relative z-30 w-full border-b border-slate-200/90 bg-[#f8fafc]/95 backdrop-blur-sm supports-backdrop-filter:bg-[#f8fafc]/88"
 aria-label="Live market prices from TradingView"
 >
 <div className="mx-auto min-h-[46px] w-full max-w-[100vw] overflow-hidden px-0 py-0.5">
 <iframe
 title="Live market prices from TradingView"
 src={tickerTapeIframeSrc(locale)}
 className="block h-[46px] w-full border-0"
 referrerPolicy="no-referrer-when-downgrade"
 allow="clipboard-write"
 />
 </div>
 </div>
 );
}
