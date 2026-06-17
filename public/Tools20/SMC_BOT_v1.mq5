#property strict
#property version   "1.00"

#include <Trade/Trade.mqh>

/*
   SMC_BOT smcV1

   Mechanical implementation of:
   - HTF market structure bias (HH/HL vs LH/LL) using swing points
   - BOS/CHoCH validity by BODY CLOSE beyond swing
   - LTF entry sequence: liquidity sweep (inducement) -> displacement with MSS/CHoCH + FVG -> retrace to POI (OB/FVG) optionally filtered by OTE
   - Risk-based sizing (percent of equity)
   - Optional chart objects (bias label, liquidity sweep, MSS/BOS, FVG, OB, POI)
*/

// -----------------------------
// Inputs
// -----------------------------
input string             InpSymbol                 = "XAUUSDm";   // broker symbol name; empty = chart symbol
input ulong              InpMagic                  = 2026050901;
input uint               InpDeviationPts           = 30;

input ENUM_TIMEFRAMES    InpHTF                    = PERIOD_H1;   // bias timeframe
input ENUM_TIMEFRAMES    InpLTF                    = PERIOD_M5;   // entry timeframe

input int                InpSwingLeft              = 3;           // swing detection window (left)
input int                InpSwingRight             = 3;           // swing detection window (right)
input int                InpMaxScanBars            = 400;         // how far to scan for swings / patterns

input double             InpRiskPctEquity          = 1.0;         // 1-2% recommended
input double             InpMinRR                  = 1.5;         // minimum RR (TP optional)
input bool               InpUseTakeProfit          = true;

input bool               InpUseOTEFilter           = false;       // true = only entries inside OTE fib band
input double             InpOTE_Min                = 0.618;
input double             InpOTE_Max                = 0.786;

input int                InpSL_BufferPoints        = 20;          // beyond sweep wick (points)

input bool               InpStrictHTFBias           = false;       // true = HH+HL / LH+LL only; false = swing lows/highs alone
input bool               InpRequireOBOrFVG        = false;       // false = allow fallback POI from displacement candle

input int                InpPOITouchBufferPoints    = 5;           // widen POI touch (points)

input int                InpDispScanBars           = 30;          // search displacement after sweep
input int                InpMaxFvgZones           = 16;          // collect FVGs after sweep (LTF bars scanned)
input int                InpMaxObZones            = 12;          // collect OB candles older than displacement bar
input int                InpFvgScanBars           = 72;          // scan bar indices 1..N for FVG patterns (series)
input int                InpObScanOlderBars       = 40;          // max bars older than displacement for OB list
input bool               InpDebugLog               = false;       // Expert log why setup resets / orders fail

input bool               InpOneTradeAtATime        = true;        // per symbol+magic
input bool               InpOnlyOneDirection       = true;        // disallow hedged long+short

input bool               InpDrawSMCObjects         = true;        // rectangles/lines for FVG, OB, POI, MSS, sweep
input color              InpColBiasLabel           = clrYellow;
input color              InpColSweepPool           = clrDeepSkyBlue;
input color              InpColSweepWick           = clrOrange;
input color              InpColMSS                 = clrMagenta;
input color              InpColFVG                 = clrDodgerBlue;
input color              InpColOB                  = clrForestGreen;
input color              InpColPOI                 = clrGold;

// -----------------------------
// Types / state
// -----------------------------
enum SMC_BIAS
{
   BIAS_NONE = 0,
   BIAS_BULL = 1,
   BIAS_BEAR = -1
};

struct SwingPoint
{
   datetime t;
   double   price;
   int      bar_index; // in the rates array (0 = current forming bar)
   bool     valid;
};

struct FvgZone
{
   bool     valid;
   bool     bull;      // true = bullish FVG (gap below price), false = bearish FVG
   datetime t;         // displacement bar time
   double   top;       // price top of gap
   double   bot;       // price bottom of gap
};

struct ObZone
{
   bool     valid;
   bool     bull;      // true = bullish OB (last down candle before up displacement)
   datetime t;         // OB candle time
   double   high;
   double   low;
};

struct SetupState
{
   bool     active;
   bool     bull;          // setup direction
   datetime created_at;

   SwingPoint sweep_swing; // swing that got swept
   double     sweep_wick;  // extreme wick price

   SwingPoint mss_swing;   // swing broken by body close to validate MSS/CHoCH
   datetime   displacement_t;

   FvgZone    fvg_zones[];
   ObZone     ob_zones[];

   double     impulse_from; // for OTE (leg low)
   double     impulse_to;   // for OTE (leg high)

   bool       disp_fallback_poi;
   double     disp_zone_low;
   double     disp_zone_high;
};

// -----------------------------
// Globals
// -----------------------------
CTrade g_trade;
datetime g_last_ltf_bar_time = 0;

SetupState g_setup;

string g_trade_symbol = "";

SMC_BIAS g_display_bias = BIAS_NONE;

#define SMC_OBJ_PREFIX "SMCv1_"

void DebugPrint(const string msg)
{
   if(!InpDebugLog)
      return;
   Print("[SMCv1] ", msg);
}

// -----------------------------
// Utilities
// -----------------------------
string ResolveTradableSymbol()
{
   string primary = InpSymbol;
   if(StringLen(primary) <= 0)
      primary = _Symbol;

   if(SymbolSelect(primary, true))
      return primary;

   if(primary == "XAUUSD")
   {
      if(SymbolSelect("XAUUSDm", true))
      {
         Print("[SMCv1] using XAUUSDm (XAUUSD not found)");
         return "XAUUSDm";
      }
   }
   else if(primary == "XAUUSDm")
   {
      if(SymbolSelect("XAUUSD", true))
      {
         Print("[SMCv1] using XAUUSD (XAUUSDm not found)");
         return "XAUUSD";
      }
   }

   return primary;
}

string WorkSymbol()
{
   if(StringLen(g_trade_symbol) > 0)
      return g_trade_symbol;
   return ResolveTradableSymbol();
}

int DigitsFor(const string sym)
{
   return (int)SymbolInfoInteger(sym, SYMBOL_DIGITS);
}

double PointFor(const string sym)
{
   return SymbolInfoDouble(sym, SYMBOL_POINT);
}

double NormalizePrice(const string sym, const double p)
{
   return NormalizeDouble(p, DigitsFor(sym));
}

bool IsNewBar(const string sym, const ENUM_TIMEFRAMES tf, datetime &last_bar_time)
{
   datetime t = iTime(sym, tf, 0);
   if(t == 0)
      return false;
   if(t != last_bar_time)
   {
      last_bar_time = t;
      return true;
   }
   return false;
}

bool HasOpenPosition(const string sym, const ulong magic, ENUM_POSITION_TYPE &ptype_out)
{
   ptype_out = POSITION_TYPE_BUY;
   for(int i = PositionsTotal() - 1; i >= 0; --i)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0)
         continue;
      if(!PositionSelectByTicket(ticket))
         continue;
      string psym = PositionGetString(POSITION_SYMBOL);
      if(psym != sym)
         continue;
      ulong pmagic = (ulong)PositionGetInteger(POSITION_MAGIC);
      if(pmagic != magic)
         continue;
      ptype_out = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
      return true;
   }
   return false;
}

double LotsFromRisk(const string sym, const double risk_pct, const double sl_dist_price)
{
   if(sl_dist_price <= 0.0)
      return 0.0;

   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double risk_money = equity * (MathMax(0.0, risk_pct) / 100.0);
   if(risk_money <= 0.0)
      return 0.0;

   double tick_size = SymbolInfoDouble(sym, SYMBOL_TRADE_TICK_SIZE);
   if(tick_size <= 0.0)
      tick_size = SymbolInfoDouble(sym, SYMBOL_POINT);
   double tick_value = SymbolInfoDouble(sym, SYMBOL_TRADE_TICK_VALUE_LOSS);
   if(tick_value <= 0.0)
      tick_value = SymbolInfoDouble(sym, SYMBOL_TRADE_TICK_VALUE);
   if(tick_size <= 0.0 || tick_value <= 0.0)
      return 0.0;

   double ticks = MathAbs(sl_dist_price) / tick_size;
   if(ticks <= 0.0)
      return 0.0;

   double loss_1lot = ticks * tick_value;
   if(loss_1lot <= 0.0)
      return 0.0;

   double raw = risk_money / loss_1lot;

   double vmin = SymbolInfoDouble(sym, SYMBOL_VOLUME_MIN);
   double vmax = SymbolInfoDouble(sym, SYMBOL_VOLUME_MAX);
   double vstep = SymbolInfoDouble(sym, SYMBOL_VOLUME_STEP);
   if(vstep <= 0.0)
      vstep = 0.01;

   double lots = MathFloor(raw / vstep + 1e-12) * vstep;
   if(lots < vmin)
   {
      if(InpDebugLog)
         DebugPrint(StringFormat("volume below broker minimum (raw=%.4f vmin=%.4f sl_dist=%.5f)",
                                 raw, vmin, sl_dist_price));
      lots = 0.0;
   }
   if(lots > vmax)
      lots = vmax;

   return lots;
}

// -----------------------------
// Swing detection
// -----------------------------
bool IsSwingHigh(const MqlRates &rates[], const int i, const int left, const int right)
{
   double p = rates[i].high;
   for(int k = 1; k <= left; ++k)
      if(rates[i + k].high >= p)
         return false;
   for(int k = 1; k <= right; ++k)
      if(rates[i - k].high > p)
         return false;
   return true;
}

bool IsSwingLow(const MqlRates &rates[], const int i, const int left, const int right)
{
   double p = rates[i].low;
   for(int k = 1; k <= left; ++k)
      if(rates[i + k].low <= p)
         return false;
   for(int k = 1; k <= right; ++k)
      if(rates[i - k].low < p)
         return false;
   return true;
}

SwingPoint FindMostRecentSwing(const MqlRates &rates[],
                               const bool want_high,
                               const int left,
                               const int right,
                               const int max_scan)
{
   SwingPoint sp;
   sp.valid = false;
   sp.t = 0;
   sp.price = 0.0;
   sp.bar_index = -1;

   int n = ArraySize(rates);
   if(n <= (left + right + 10))
      return sp;

   int start = right + 1;            // must have right bars to confirm
   int end = MathMin(n - left - 2, max_scan); // i+left must exist

   for(int i = start; i <= end; ++i)
   {
      if(want_high)
      {
         if(IsSwingHigh(rates, i, left, right))
         {
            sp.valid = true;
            sp.t = rates[i].time;
            sp.price = rates[i].high;
            sp.bar_index = i;
            return sp; // most recent (smallest i) because series array
         }
      }
      else
      {
         if(IsSwingLow(rates, i, left, right))
         {
            sp.valid = true;
            sp.t = rates[i].time;
            sp.price = rates[i].low;
            sp.bar_index = i;
            return sp;
         }
      }
   }
   return sp;
}

// Find the most recent 2 swing highs/lows (for HH/HL vs LH/LL bias)
int CollectSwings(const MqlRates &rates[],
                  const bool want_high,
                  const int left,
                  const int right,
                  const int max_scan,
                  SwingPoint &out1,
                  SwingPoint &out2)
{
   out1.valid = false;
   out2.valid = false;

   int found = 0;
   int n = ArraySize(rates);
   if(n <= (left + right + 10))
      return 0;

   int start = right + 1;
   int end = MathMin(n - left - 2, max_scan);

   for(int i = start; i <= end; ++i)
   {
      bool ok = (want_high ? IsSwingHigh(rates, i, left, right) : IsSwingLow(rates, i, left, right));
      if(!ok)
         continue;
      SwingPoint sp;
      sp.valid = true;
      sp.t = rates[i].time;
      sp.price = (want_high ? rates[i].high : rates[i].low);
      sp.bar_index = i;

      if(found == 0)
         out1 = sp;
      else if(found == 1)
         out2 = sp;
      else
         break;

      found++;
   }

   return found;
}

SMC_BIAS ComputeHTFBias(const string sym, const ENUM_TIMEFRAMES tf)
{
   MqlRates rates[];
   ArraySetAsSeries(rates, true);
   int want = MathMax(200, InpSwingLeft + InpSwingRight + 50);
   int got = CopyRates(sym, tf, 0, want, rates);
   if(got <= 0)
      return BIAS_NONE;

   SwingPoint h1, h2, l1, l2;
   int fh = CollectSwings(rates, true, InpSwingLeft, InpSwingRight, MathMin(InpMaxScanBars, got - 1), h1, h2);
   int fl = CollectSwings(rates, false, InpSwingLeft, InpSwingRight, MathMin(InpMaxScanBars, got - 1), l1, l2);

   if(fh < 2 || fl < 2)
      return BIAS_NONE;

   bool hh = (h1.price > h2.price);
   bool hl = (l1.price > l2.price);
   bool lh = (h1.price < h2.price);
   bool ll = (l1.price < l2.price);

   if(InpStrictHTFBias)
   {
      if(hh && hl)
         return BIAS_BULL;
      if(lh && ll)
         return BIAS_BEAR;
      return BIAS_NONE;
   }

   // Relaxed: clearer directional cue from swings without requiring full trending structure
   if(l1.price > l2.price && h1.price >= h2.price)
      return BIAS_BULL;
   if(l1.price < l2.price && h1.price <= h2.price)
      return BIAS_BEAR;
   if(l1.price > l2.price)
      return BIAS_BULL;
   if(l1.price < l2.price)
      return BIAS_BEAR;

   return BIAS_NONE;
}

// -----------------------------
// BOS / CHoCH by body close
// -----------------------------
bool BodyClosesBeyond(const MqlRates &bar, const double level, const bool above)
{
   double close = bar.close;
   if(above)
      return (close > level);
   return (close < level);
}

// -----------------------------
// Act 1: Liquidity sweep (inducement)
// -----------------------------
bool DetectLiquiditySweep(const MqlRates &ltf_rates[],
                          const bool bull_bias,
                          SwingPoint &swept_swing,
                          double &wick_extreme)
{
   // Use the last confirmed swing on LTF (more actionable than HTF swings)
   // For bullish setup: sweep SSL (a recent swing low) then close back above it.
   // For bearish setup: sweep BSL (a recent swing high) then close back below it.
   MqlRates last_closed = ltf_rates[1];

   if(bull_bias)
   {
      SwingPoint sl = FindMostRecentSwing(ltf_rates, false, InpSwingLeft, InpSwingRight, InpMaxScanBars);
      if(!sl.valid)
         return false;
      if(last_closed.low < sl.price && last_closed.close > sl.price)
      {
         swept_swing = sl;
         wick_extreme = last_closed.low;
         return true;
      }
      return false;
   }
   else
   {
      SwingPoint sh = FindMostRecentSwing(ltf_rates, true, InpSwingLeft, InpSwingRight, InpMaxScanBars);
      if(!sh.valid)
         return false;
      if(last_closed.high > sh.price && last_closed.close < sh.price)
      {
         swept_swing = sh;
         wick_extreme = last_closed.high;
         return true;
      }
      return false;
   }
}

// -----------------------------
// Act 2: Displacement + MSS/CHoCH + FVG
// -----------------------------
bool DetectFVG(const MqlRates &rates[], const int disp_index, const bool bull, FvgZone &out)
{
   out.valid = false;
   out.bull = bull;
   out.t = 0;
   out.top = 0.0;
   out.bot = 0.0;

   // Use 3-candle FVG definition:
   // Bullish: low of candle (i) > high of candle (i+2) => gap between them.
   // Bearish: high of candle (i) < low of candle (i+2) => gap between them.
   // With series array: i is more recent than i+2.
   int n = ArraySize(rates);
   if(disp_index + 2 >= n)
      return false;

   MqlRates c0 = rates[disp_index];
   MqlRates c2 = rates[disp_index + 2];

   if(bull)
   {
      if(c0.low > c2.high)
      {
         out.valid = true;
         out.t = c0.time;
         out.bot = c2.high;
         out.top = c0.low;
         return true;
      }
      return false;
   }
   else
   {
      if(c0.high < c2.low)
      {
         out.valid = true;
         out.t = c0.time;
         out.top = c2.low;
         out.bot = c0.high;
         return true;
      }
      return false;
   }
}

bool DetectDisplacementAndMSS(const MqlRates &ltf_rates[],
                             const bool bull_setup,
                             const datetime sweep_bar_time,
                             const SwingPoint &sweep_swing,
                             SwingPoint &mss_swing,
                             int &disp_index,
                             double &impulse_from,
                             double &impulse_to)
{
   // Look for a decisive body close that breaks the opposite swing:
   // Bullish: after a sweep low, close above the most recent swing high => MSS/CHoCH.
   // Bearish: after a sweep high, close below the most recent swing low.
   //
   // Only counts displacement on candles at or after the sweep bar time.

   mss_swing.valid = false;
   disp_index = -1;
   impulse_from = 0.0;
   impulse_to = 0.0;

   int n = ArraySize(ltf_rates);
   if(n < 50)
      return false;

   // Find reference swing to break (opposite side)
   SwingPoint ref = FindMostRecentSwing(ltf_rates, bull_setup, InpSwingLeft, InpSwingRight, InpMaxScanBars);
   if(!ref.valid)
      return false;

   int scan = MathMax(3, MathMin(InpDispScanBars, n - 5));

   // Scan most recent closed candles (excluding forming bar 0); smallest i is newest closed bar
   for(int i = 1; i <= scan; ++i)
   {
      MqlRates bar = ltf_rates[i];
      if(bar.time < sweep_bar_time)
         continue;

      if(bull_setup)
      {
         if(BodyClosesBeyond(bar, ref.price, true))
         {
            mss_swing = ref;
            disp_index = i;
            impulse_from = MathMin(sweep_swing.price, bar.low);
            impulse_to = bar.high;
            return true;
         }
      }
      else
      {
         if(BodyClosesBeyond(bar, ref.price, false))
         {
            mss_swing = ref;
            disp_index = i;
            impulse_from = bar.low;
            impulse_to = MathMax(sweep_swing.price, bar.high);
            return true;
         }
      }
   }

   return false;
}

void CollectFvgZonesAfterSweep(const MqlRates &rates[],
                               const datetime sweep_bar_time,
                               const bool bull_setup,
                               FvgZone &out_zones[])
{
   ArrayResize(out_zones, 0);
   int n = ArraySize(rates);
   int scan = MathMax(3, MathMin(InpFvgScanBars, n - 3));
   const int cap = MathMax(1, InpMaxFvgZones);

   for(int i = 1; i <= scan; ++i)
   {
      if(rates[i].time < sweep_bar_time)
         continue;
      FvgZone z;
      if(!DetectFVG(rates, i, bull_setup, z) || !z.valid)
         continue;

      int sz = ArraySize(out_zones);
      if(sz >= cap)
         break;

      bool dup = false;
      for(int j = 0; j < sz; ++j)
      {
         if(out_zones[j].t == z.t)
         {
            dup = true;
            break;
         }
      }
      if(dup)
         continue;

      ArrayResize(out_zones, sz + 1);
      out_zones[sz] = z;
   }
}

void CollectObZonesOlderThanDisp(const MqlRates &rates[],
                                 const int disp_index,
                                 const bool bull_setup,
                                 ObZone &out_zones[])
{
   ArrayResize(out_zones, 0);
   int n = ArraySize(rates);
   if(disp_index < 0 || disp_index + 1 >= n)
      return;

   const int cap = MathMax(1, InpMaxObZones);
   int span = MathMax(1, InpObScanOlderBars);
   int end_i = MathMin(n - 1, disp_index + span);

   for(int i = disp_index + 1; i <= end_i; ++i)
   {
      bool bearish_relax = (rates[i].close <= rates[i].open);
      bool bullish_relax = (rates[i].close >= rates[i].open);

      bool ok = false;
      ObZone ob;
      ob.valid = false;
      ob.bull = bull_setup;
      ob.t = rates[i].time;
      ob.high = rates[i].high;
      ob.low = rates[i].low;

      if(bull_setup && bearish_relax)
         ok = true;
      else if(!bull_setup && bullish_relax)
         ok = true;

      if(!ok)
         continue;

      ob.valid = true;
      int sz = ArraySize(out_zones);
      if(sz >= cap)
         break;

      bool dup = false;
      for(int j = 0; j < sz; ++j)
      {
         if(out_zones[j].t == ob.t)
         {
            dup = true;
            break;
         }
      }
      if(dup)
         continue;

      ArrayResize(out_zones, sz + 1);
      out_zones[sz] = ob;
   }
}

// -----------------------------
// Act 3: Retracement entry into POI (OB/FVG) with optional OTE filter
// -----------------------------
bool InOTEZone(const bool bull, const double from_price, const double to_price, const double entry_price)
{
   if(!InpUseOTEFilter)
      return true;

   if(from_price == 0.0 || to_price == 0.0 || from_price == to_price)
      return false;

   double hi = MathMax(from_price, to_price);
   double lo = MathMin(from_price, to_price);
   double range = hi - lo;
   if(range <= 0.0)
      return false;

   // OTE for bullish impulse: retrace from high to fib levels.
   // OTE for bearish impulse: retrace from low upward to fib levels.
   if(bull)
   {
      double high = hi;
      double lvl_min = high - range * InpOTE_Max;
      double lvl_max = high - range * InpOTE_Min;
      return (entry_price >= lvl_min && entry_price <= lvl_max);
   }
   else
   {
      double low = lo;
      double lvl_min = low + range * InpOTE_Min;
      double lvl_max = low + range * InpOTE_Max;
      return (entry_price >= lvl_min && entry_price <= lvl_max);
   }
}

bool PriceTouchesZone(const string sym,
                      const double bid,
                      const double ask,
                      const bool bull,
                      double zlow,
                      double zhigh)
{
   double buf = (double)InpPOITouchBufferPoints * PointFor(sym);
   zlow -= buf;
   zhigh += buf;
   double p = (bull ? ask : bid);
   return (p >= zlow && p <= zhigh);
}

bool FindTouchedPoiZone(const string sym,
                        const double bid,
                        const double ask,
                        const SetupState &st,
                        double &zlow_out,
                        double &zhigh_out)
{
   zlow_out = 0.0;
   zhigh_out = 0.0;

   int k = 0;
   for(k = 0; k < ArraySize(st.ob_zones); ++k)
   {
      if(!st.ob_zones[k].valid)
         continue;
      double lo = MathMin(st.ob_zones[k].low, st.ob_zones[k].high);
      double hi = MathMax(st.ob_zones[k].low, st.ob_zones[k].high);
      if(PriceTouchesZone(sym, bid, ask, st.bull, lo, hi))
      {
         zlow_out = lo;
         zhigh_out = hi;
         return true;
      }
   }

   for(k = 0; k < ArraySize(st.fvg_zones); ++k)
   {
      if(!st.fvg_zones[k].valid)
         continue;
      double lo = MathMin(st.fvg_zones[k].bot, st.fvg_zones[k].top);
      double hi = MathMax(st.fvg_zones[k].bot, st.fvg_zones[k].top);
      if(PriceTouchesZone(sym, bid, ask, st.bull, lo, hi))
      {
         zlow_out = lo;
         zhigh_out = hi;
         return true;
      }
   }

   if(st.disp_fallback_poi && !InpRequireOBOrFVG)
   {
      double lo = MathMin(st.disp_zone_low, st.disp_zone_high);
      double hi = MathMax(st.disp_zone_low, st.disp_zone_high);
      if(PriceTouchesZone(sym, bid, ask, st.bull, lo, hi))
      {
         zlow_out = lo;
         zhigh_out = hi;
         return true;
      }
   }

   return false;
}

bool BuildEntryFromSetup(const string sym, const SetupState &st,
                         const double poi_low,
                         const double poi_high,
                         double &entry_price_out, double &sl_out, double &tp_out, double &lots_out,
                         ENUM_ORDER_TYPE &order_type_out)
{
   entry_price_out = 0.0;
   sl_out = 0.0;
   tp_out = 0.0;
   lots_out = 0.0;

   double bid = SymbolInfoDouble(sym, SYMBOL_BID);
   double ask = SymbolInfoDouble(sym, SYMBOL_ASK);
   double pt = PointFor(sym);

   bool bull = st.bull;

   double zlow = MathMin(poi_low, poi_high);
   double zhigh = MathMax(poi_low, poi_high);
   if(zlow >= zhigh)
      return false;

   // "Risk entry" at 50% of POI zone
   double entry = (zlow + zhigh) * 0.5;

   if(!InOTEZone(bull, st.impulse_from, st.impulse_to, entry))
      return false;

   // SL beyond sweep wick + buffer
   double buffer = (double)InpSL_BufferPoints * pt;
   if(bull)
      sl_out = st.sweep_wick - buffer;
   else
      sl_out = st.sweep_wick + buffer;

   sl_out = NormalizePrice(sym, sl_out);

   // Entry is market when price touches POI zone (executed in OnTick)
   entry_price_out = entry;

   // TP at next liquidity zone is complex; we approximate by RR off SL distance
   double p_exec = (bull ? ask : bid);
   double sl_dist = MathAbs(p_exec - sl_out);
   if(sl_dist <= 0.0)
      return false;

   lots_out = LotsFromRisk(sym, InpRiskPctEquity, sl_dist);
   if(lots_out <= 0.0)
      return false;

   if(InpUseTakeProfit && InpMinRR > 0.0)
   {
      double tp_dist = sl_dist * InpMinRR;
      if(bull)
         tp_out = NormalizePrice(sym, p_exec + tp_dist);
      else
         tp_out = NormalizePrice(sym, p_exec - tp_dist);
   }

   order_type_out = (bull ? ORDER_TYPE_BUY : ORDER_TYPE_SELL);
   return true;
}

void ClearSetup()
{
   g_setup.active = false;
   g_setup.created_at = 0;
   g_setup.bull = true;
   g_setup.sweep_swing.valid = false;
   g_setup.sweep_wick = 0.0;
   g_setup.mss_swing.valid = false;
   g_setup.displacement_t = 0;
   ArrayResize(g_setup.fvg_zones, 0);
   ArrayResize(g_setup.ob_zones, 0);
   g_setup.impulse_from = 0.0;
   g_setup.impulse_to = 0.0;
   g_setup.disp_fallback_poi = false;
   g_setup.disp_zone_low = 0.0;
   g_setup.disp_zone_high = 0.0;
}

// -----------------------------
// Chart visuals (FVG, OB, POI, MSS/BOS, liquidity sweep)
// -----------------------------
void SMC_ObjectsDeleteAll(const long cid)
{
   const int n = ObjectsTotal(cid, -1, -1);
   for(int i = n - 1; i >= 0; --i)
   {
      string nm = ObjectName(cid, i, -1, -1);
      if(StringLen(nm) <= 0)
         continue;
      if(StringFind(nm, SMC_OBJ_PREFIX) == 0)
         ObjectDelete(cid, nm);
   }
}

void SMC_CreateHLine(const long cid,
                     const string name,
                     const double price,
                     const color clr,
                     const string caption)
{
   ObjectDelete(cid, name);
   if(!ObjectCreate(cid, name, OBJ_HLINE, 0, 0, price))
      return;
   ObjectSetInteger(cid, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(cid, name, OBJPROP_STYLE, STYLE_DASH);
   ObjectSetInteger(cid, name, OBJPROP_WIDTH, 1);
   ObjectSetInteger(cid, name, OBJPROP_BACK, false);
   ObjectSetInteger(cid, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(cid, name, OBJPROP_HIDDEN, false);

   string cap = name + "_cap";
   ObjectDelete(cid, cap);
   datetime tt = TimeCurrent();
   if(ObjectCreate(cid, cap, OBJ_TEXT, 0, tt, price))
   {
      ObjectSetString(cid, cap, OBJPROP_TEXT, caption);
      ObjectSetInteger(cid, cap, OBJPROP_COLOR, clr);
      ObjectSetInteger(cid, cap, OBJPROP_FONTSIZE, 8);
      ObjectSetInteger(cid, cap, OBJPROP_ANCHOR, ANCHOR_LEFT);
      ObjectSetInteger(cid, cap, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(cid, cap, OBJPROP_HIDDEN, false);
   }
}

void SMC_CreateRectangle(const long cid,
                         const string name,
                         const datetime t1,
                         const double p1,
                         const datetime t2,
                         const double p2,
                         const color clr,
                         const string caption)
{
   ObjectDelete(cid, name);
   datetime ta = t1;
   datetime tb = t2;
   double pa = p1;
   double pb = p2;
   if(ta > tb)
   {
      datetime tx = ta;
      ta = tb;
      tb = tx;
   }
   if(pa > pb)
   {
      double px = pa;
      pa = pb;
      pb = px;
   }
   if(!ObjectCreate(cid, name, OBJ_RECTANGLE, 0, ta, pa, tb, pb))
      return;
   ObjectSetInteger(cid, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(cid, name, OBJPROP_STYLE, STYLE_SOLID);
   ObjectSetInteger(cid, name, OBJPROP_WIDTH, 1);
   ObjectSetInteger(cid, name, OBJPROP_FILL, true);
   ObjectSetInteger(cid, name, OBJPROP_BACK, true);
   ObjectSetInteger(cid, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(cid, name, OBJPROP_HIDDEN, false);

   string cap = name + "_cap";
   ObjectDelete(cid, cap);
   if(StringLen(caption) > 0 && ObjectCreate(cid, cap, OBJ_TEXT, 0, tb, pb))
   {
      ObjectSetString(cid, cap, OBJPROP_TEXT, caption);
      ObjectSetInteger(cid, cap, OBJPROP_COLOR, clr);
      ObjectSetInteger(cid, cap, OBJPROP_FONTSIZE, 8);
      ObjectSetInteger(cid, cap, OBJPROP_ANCHOR, ANCHOR_RIGHT_UPPER);
      ObjectSetInteger(cid, cap, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(cid, cap, OBJPROP_HIDDEN, false);
   }
}

void SMC_UpdateChartObjects(const long cid, const string sym, const bool new_ltf_bar)
{
   if(!InpDrawSMCObjects)
   {
      SMC_ObjectsDeleteAll(cid);
      ChartRedraw(cid);
      return;
   }

   const bool tick_draw = (g_setup.active && g_setup.displacement_t != 0);
   if(!new_ltf_bar && !tick_draw)
      return;

   SMC_ObjectsDeleteAll(cid);

   string bias_txt = "HTF bias: NONE";
   if(g_display_bias == BIAS_BULL)
      bias_txt = "HTF bias: BULL";
   else if(g_display_bias == BIAS_BEAR)
      bias_txt = "HTF bias: BEAR";

   string lbl = SMC_OBJ_PREFIX + "bias";
   ObjectDelete(cid, lbl);
   if(ObjectCreate(cid, lbl, OBJ_LABEL, 0, 0, 0))
   {
      ObjectSetInteger(cid, lbl, OBJPROP_CORNER, CORNER_LEFT_UPPER);
      ObjectSetInteger(cid, lbl, OBJPROP_XDISTANCE, 8);
      ObjectSetInteger(cid, lbl, OBJPROP_YDISTANCE, 18);
      ObjectSetInteger(cid, lbl, OBJPROP_COLOR, InpColBiasLabel);
      ObjectSetInteger(cid, lbl, OBJPROP_FONTSIZE, 10);
      ObjectSetString(cid, lbl, OBJPROP_TEXT, bias_txt);
      ObjectSetInteger(cid, lbl, OBJPROP_SELECTABLE, false);
   }

   if(!g_setup.active)
   {
      ChartRedraw(cid);
      return;
   }

   if(g_setup.sweep_swing.valid)
   {
      string cap = g_setup.bull ? "SSL (sell-side liq.)" : "BSL (buy-side liq.)";
      SMC_CreateHLine(cid, SMC_OBJ_PREFIX + "hl_sw", g_setup.sweep_swing.price, InpColSweepPool,
                      cap + " pool level");
   }

   SMC_CreateHLine(cid, SMC_OBJ_PREFIX + "hl_wk", g_setup.sweep_wick, InpColSweepWick,
                   "Sweep wick (SL reference)");

   if(g_setup.displacement_t == 0)
   {
      ChartRedraw(cid);
      return;
   }

   if(g_setup.mss_swing.valid)
      SMC_CreateHLine(cid, SMC_OBJ_PREFIX + "hl_mss", g_setup.mss_swing.price, InpColMSS,
                      "MSS / BOS (body beyond swing)");

   const int tf_sec = (int)PeriodSeconds(InpLTF);
   const datetime t_horizon = (datetime)((long)TimeCurrent() + (long)tf_sec * 25L);

   const int ix_disp = iBarShift(sym, InpLTF, g_setup.displacement_t, true);

   for(int fi = 0; fi < ArraySize(g_setup.fvg_zones); ++fi)
   {
      int ix = iBarShift(sym, InpLTF, g_setup.fvg_zones[fi].t, true);
      if(ix < 0 || ix + 2 >= Bars(sym, InpLTF))
         continue;
      datetime t_old = iTime(sym, InpLTF, ix + 2);
      datetime t_new = iTime(sym, InpLTF, ix);
      datetime ta = t_old;
      datetime tb = t_new;
      if(ta > tb)
      {
         datetime tx = ta;
         ta = tb;
         tb = tx;
      }
      string nm_f = SMC_OBJ_PREFIX + "zg_fvg_" + IntegerToString(fi);
      SMC_CreateRectangle(cid, nm_f, ta, g_setup.fvg_zones[fi].bot, t_horizon, g_setup.fvg_zones[fi].top,
                          InpColFVG, "FVG " + IntegerToString(fi + 1));
   }

   for(int oi = 0; oi < ArraySize(g_setup.ob_zones); ++oi)
   {
      datetime ob_l = g_setup.ob_zones[oi].t;
      datetime ob_r = (datetime)((long)ob_l + (long)tf_sec * 2L);
      string nm_o = SMC_OBJ_PREFIX + "zg_ob_" + IntegerToString(oi);
      SMC_CreateRectangle(cid, nm_o, ob_l, g_setup.ob_zones[oi].low, ob_r, g_setup.ob_zones[oi].high,
                          InpColOB, "OB " + IntegerToString(oi + 1));
   }

   if(g_setup.disp_fallback_poi && !InpRequireOBOrFVG && ix_disp >= 0 &&
      ArraySize(g_setup.fvg_zones) == 0 && ArraySize(g_setup.ob_zones) == 0)
   {
      datetime t_l = iTime(sym, InpLTF, ix_disp);
      SMC_CreateRectangle(cid, SMC_OBJ_PREFIX + "zg_poi_fb", t_l, g_setup.disp_zone_low, t_horizon,
                          g_setup.disp_zone_high, InpColPOI, "POI (disp candle)");
   }

   ChartRedraw(cid);
}

// -----------------------------
// Trading
// -----------------------------
bool PlaceMarket(const string sym, const bool bull, const double lots, const double sl, const double tp)
{
   g_trade.SetExpertMagicNumber(InpMagic);
   g_trade.SetDeviationInPoints((int)InpDeviationPts);

   bool ok = false;
   if(bull)
      ok = g_trade.Buy(lots, sym, 0.0, sl, tp, "SMC");
   else
      ok = g_trade.Sell(lots, sym, 0.0, sl, tp, "SMC");

   if(!ok && InpDebugLog)
      DebugPrint(StringFormat("OrderSend failed ret=%d last=%d",
                              (int)g_trade.ResultRetcode(),
                              GetLastError()));
   return ok;
}

// -----------------------------
// Main loop
// -----------------------------
int OnInit()
{
   ClearSetup();
   g_trade_symbol = ResolveTradableSymbol();
   if(!SymbolSelect(g_trade_symbol, true))
      Print("[SMCv1] cannot select symbol ", g_trade_symbol, " set InpSymbol to your broker name");
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   SMC_ObjectsDeleteAll(ChartID());
   g_trade_symbol = "";
}

void OnTick()
{
   const string sym = WorkSymbol();
   if(!SymbolSelect(sym, true))
      return;

   MqlRates ltf[];
   ArraySetAsSeries(ltf, true);
   int got_ltf = CopyRates(sym, InpLTF, 0, MathMax(250, InpMaxScanBars + 50), ltf);
   if(got_ltf <= (InpSwingLeft + InpSwingRight + 20))
      return;

   ENUM_POSITION_TYPE ptype = POSITION_TYPE_BUY;
   bool has_open = HasOpenPosition(sym, InpMagic, ptype);
   bool block_new_trade = (InpOneTradeAtATime && has_open);

   bool new_ltf_bar = IsNewBar(sym, InpLTF, g_last_ltf_bar_time);
   if(new_ltf_bar)
   {
      g_display_bias = ComputeHTFBias(sym, InpHTF);
      if(g_display_bias == BIAS_NONE)
      {
         static datetime s_bias_none_log = 0;
         datetime ht = iTime(sym, InpHTF, 0);
         if(InpDebugLog && ht != s_bias_none_log)
         {
            s_bias_none_log = ht;
            DebugPrint("HTF bias NONE (try InpStrictHTFBias=false or wider swings)");
         }
         ClearSetup();
      }
      else
      {
         bool bull_bias = (g_display_bias == BIAS_BULL);

         if(!g_setup.active)
         {
            SwingPoint swept;
            double wick_ext = 0.0;
            if(DetectLiquiditySweep(ltf, bull_bias, swept, wick_ext))
            {
               g_setup.active = true;
               g_setup.bull = bull_bias;
               g_setup.created_at = ltf[1].time;
               g_setup.sweep_swing = swept;
               g_setup.sweep_wick = wick_ext;
            }
         }
         else
         {
            if(g_setup.bull != bull_bias)
               ClearSetup();
         }

         if(g_setup.active && g_setup.displacement_t == 0)
         {
            SwingPoint mss;
            int disp_i = -1;
            double imp_from = 0.0;
            double imp_to = 0.0;

            if(DetectDisplacementAndMSS(ltf, g_setup.bull, g_setup.created_at, g_setup.sweep_swing,
                                        mss, disp_i, imp_from, imp_to))
            {
               FvgZone fz[];
               ObZone oz[];
               CollectFvgZonesAfterSweep(ltf, g_setup.created_at, g_setup.bull, fz);
               CollectObZonesOlderThanDisp(ltf, disp_i, g_setup.bull, oz);

               if(InpRequireOBOrFVG && ArraySize(fz) == 0 && ArraySize(oz) == 0)
               {
                  // MSS alone is not enough when OB/FVG required
               }
               else
               {
                  g_setup.mss_swing = mss;
                  g_setup.displacement_t = ltf[disp_i].time;
                  ArrayResize(g_setup.fvg_zones, ArraySize(fz));
                  for(int zi = 0; zi < ArraySize(fz); ++zi)
                     g_setup.fvg_zones[zi] = fz[zi];
                  ArrayResize(g_setup.ob_zones, ArraySize(oz));
                  for(int oj = 0; oj < ArraySize(oz); ++oj)
                     g_setup.ob_zones[oj] = oz[oj];
                  g_setup.impulse_from = imp_from;
                  g_setup.impulse_to = imp_to;
                  g_setup.disp_fallback_poi = (ArraySize(fz) == 0 && ArraySize(oz) == 0 && !InpRequireOBOrFVG);
                  g_setup.disp_zone_low = ltf[disp_i].low;
                  g_setup.disp_zone_high = ltf[disp_i].high;
               }
            }
         }

         if(g_setup.active && g_setup.displacement_t == 0)
         {
            int bars_since = (int)iBarShift(sym, InpLTF, g_setup.created_at, true);
            int lim = MathMax(25, InpDispScanBars + 5);
            if(bars_since > lim && bars_since > 0)
               ClearSetup();
         }
      }
   }

   if(!block_new_trade && g_setup.active && g_setup.displacement_t != 0)
   {
      double bid = SymbolInfoDouble(sym, SYMBOL_BID);
      double ask = SymbolInfoDouble(sym, SYMBOL_ASK);

      if(g_setup.bull && bid < g_setup.sweep_wick)
      {
         ClearSetup();
      }
      else if(!g_setup.bull && ask > g_setup.sweep_wick)
      {
         ClearSetup();
      }
      else
      {
         double touch_lo = 0.0;
         double touch_hi = 0.0;
         if(FindTouchedPoiZone(sym, bid, ask, g_setup, touch_lo, touch_hi))
         {
            double entry = 0.0;
            double sl = 0.0;
            double tp = 0.0;
            double lots = 0.0;
            ENUM_ORDER_TYPE ot = ORDER_TYPE_BUY;
            if(BuildEntryFromSetup(sym, g_setup, touch_lo, touch_hi, entry, sl, tp, lots, ot))
            {
               bool skip = false;
               if(InpOnlyOneDirection && HasOpenPosition(sym, InpMagic, ptype))
                  skip = true;
               if(!skip)
               {
                  bool ok = PlaceMarket(sym, g_setup.bull, lots, sl, tp);
                  if(ok)
                     ClearSetup();
               }
            }
            else if(InpDebugLog)
            {
               DebugPrint("BuildEntryFromSetup blocked (OTE zone, SL distance, or volume)");
            }
         }
      }
   }

   SMC_UpdateChartObjects(ChartID(), sym, new_ltf_bar);
}

