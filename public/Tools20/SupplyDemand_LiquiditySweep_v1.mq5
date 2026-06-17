//+------------------------------------------------------------------+
//| LiquiditySweep_EA_v1.mq5                                         |
//| Trades only on liquidity sweep + reclaim (wick through, close back)|
//| Fixed SL in points, RR 1:4 (default SL 10 pts, TP 40 pts)        |
//+------------------------------------------------------------------+
#property copyright "Suppy Demand"
#property version   "1.00"
#property description "Liquidity sweep entries: SSL/BSL grab + close reclaim"
#property description "SL = fixed points, TP = SL x reward multiple (default 1:4)"
#property strict

#include <Trade\Trade.mqh>

CTrade trade;

//+------------------------------------------------------------------+
input group "═══════ LIQUIDITY ═══════"
enum ENUM_LIQ_MODE
  {
   LIQ_MODE_SWING     = 0,   // Pivot swing high / low
   LIQ_MODE_PRIOR_BAR = 1,   // Prior N-bar extreme (TradingView style)
   LIQ_MODE_SESSION   = 2,   // Session high / low when session ends
   LIQ_MODE_ALL       = 3    // Any of the above
  };
input ENUM_LIQ_MODE InpLiqMode         = LIQ_MODE_SWING;
input int           InpSwingLeft       = 3;        // Swing pivot left bars
input int           InpSwingRight      = 3;        // Swing pivot right bars
input int           InpPriorBarLookback = 5;      // Prior-bar liquidity lookback
input int           InpMaxScanBars     = 300;     // Bars loaded for swing scan

input group "═══════ SWEEP RULES ═══════"
enum ENUM_SWEEP_CONFIRM { SWEEP_WICK_RECLAIM = 0, SWEEP_CLOSE_THROUGH = 1 };
input ENUM_SWEEP_CONFIRM InpSweepConfirm = SWEEP_WICK_RECLAIM;
input bool           InpRequireRejectionCandle = true; // Bull/bear close vs open
input int            InpCooldownBars     = 5;          // Min bars between entries

input group "═══════ RISK (FIXED) ═══════"
input int            InpSLPoints       = 10;       // Stop loss distance (points)
input double         InpRewardMultiple = 4.0;      // TP = SL x this (1:4 = 4.0)

input group "═══════ SESSION LIQUIDITY ═══════"
input bool           InpUseAsiaSession  = true;
input int            InpAsiaStartHour   = 0;        // Server time
input int            InpAsiaEndHour     = 7;
input bool           InpUseLondonSession = true;
input int            InpLondonStartHour = 8;
input int            InpLondonEndHour   = 12;
input bool           InpUseNySession    = true;
input int            InpNyStartHour     = 13;
input int            InpNyEndHour       = 21;

input group "═══════ EXECUTION ═══════"
input string         InpTradeSymbol    = "";
input ulong          InpMagicNumber    = 26052502;
input double         InpFixedLots      = 0.01;
input int            InpSlippagePoints = 30;
input int            InpMaxSpreadPoints = 400;
input bool           InpOnePositionOnly = true;
input int            InpMinBarsWarmup  = 50;

input group "═══════ FILTERS ═══════"
input bool           InpUseSessionFilter = false;
input int            InpTradeStartHour = 8;
input int            InpTradeEndHour   = 20;

//+------------------------------------------------------------------+
struct LiqLevel
  {
   double   price;
   bool     is_high;      // true = buy-side liq (swept above), false = sell-side (swept below)
   datetime formed_time;
   string   tag;
  };

struct LiqSignal
  {
   bool   valid;
   bool   is_buy;
   double liq_price;
   string tag;
  };

struct SessionTrack
  {
   bool     active;
   double   hi;
   double   lo;
   datetime start_time;
   string   name;
  };

//+------------------------------------------------------------------+
string   g_sym;
double   g_point;
int      g_digits;
double   g_volMin, g_volMax, g_volStep;
double   g_minStopDistance;
double   g_normLots;
double   g_slDist;
double   g_tpDist;

datetime g_lastBarTime     = 0;
datetime g_lastSignalBar   = 0;

LiqLevel g_liq_levels[];
SessionTrack g_asia;
SessionTrack g_london;
SessionTrack g_ny;

const int LIQ_MAX_LEVELS = 40;

//+------------------------------------------------------------------+
bool IsSwingHigh(const MqlRates &rates[], const int i, const int left, const int right)
  {
   double h = rates[i].high;
   for(int k = 1; k <= left; k++)
      if(rates[i + k].high >= h) return false;
   for(int k = 1; k <= right; k++)
      if(rates[i - k].high > h) return false;
   return true;
  }

bool IsSwingLow(const MqlRates &rates[], const int i, const int left, const int right)
  {
   double l = rates[i].low;
   for(int k = 1; k <= left; k++)
      if(rates[i + k].low <= l) return false;
   for(int k = 1; k <= right; k++)
      if(rates[i - k].low < l) return false;
   return true;
  }

bool FindRecentSwing(const MqlRates &rates[], const bool want_high,
                     const int left, const int right, const int min_shift,
                     double &price_out, datetime &time_out)
  {
   price_out = 0.0;
   time_out  = 0;
   int n = ArraySize(rates);
   int start = MathMax(right + 1, min_shift);
   int end   = MathMin(n - left - 2, InpMaxScanBars);
   for(int i = start; i <= end; i++)
     {
      if(want_high && IsSwingHigh(rates, i, left, right))
        {
         price_out = rates[i].high;
         time_out  = rates[i].time;
         return true;
        }
      if(!want_high && IsSwingLow(rates, i, left, right))
        {
         price_out = rates[i].low;
         time_out  = rates[i].time;
         return true;
        }
     }
   return false;
  }

double PriorBarExtreme(const MqlRates &rates[], const bool want_high,
                       const int from_shift, const int lookback)
  {
   double ext = want_high ? -DBL_MAX : DBL_MAX;
   bool found = false;
   for(int i = from_shift; i < from_shift + lookback && i < ArraySize(rates); i++)
     {
      if(want_high)
        {
         if(rates[i].high > ext) { ext = rates[i].high; found = true; }
        }
      else
        {
         if(rates[i].low < ext) { ext = rates[i].low; found = true; }
        }
     }
   return found ? ext : 0.0;
  }

void TrimLiqLevels()
  {
   while(ArraySize(g_liq_levels) > LIQ_MAX_LEVELS)
      ArrayRemove(g_liq_levels, 0, 1);
  }

void PushLiqLevel(const double price, const bool is_high, const datetime formed,
                  const string tag)
  {
   if(price <= 0.0)
      return;
   for(int i = 0; i < ArraySize(g_liq_levels); i++)
     {
      if(MathAbs(g_liq_levels[i].price - price) <= g_point * 2.0 &&
         g_liq_levels[i].is_high == is_high)
         return;
     }
   int n = ArraySize(g_liq_levels);
   ArrayResize(g_liq_levels, n + 1);
   g_liq_levels[n].price       = price;
   g_liq_levels[n].is_high     = is_high;
   g_liq_levels[n].formed_time = formed;
   g_liq_levels[n].tag         = tag;
   TrimLiqLevels();
  }

void RemoveSweptLevel(const int idx)
  {
   if(idx < 0 || idx >= ArraySize(g_liq_levels))
      return;
   ArrayRemove(g_liq_levels, idx, 1);
  }

bool InHourRange(const int hour, const int start_h, const int end_h)
  {
   if(start_h == end_h)
      return false;
   if(start_h < end_h)
      return (hour >= start_h && hour < end_h);
   return (hour >= start_h || hour < end_h);
  }

void SessionStep(SessionTrack &sess, const bool enabled,
                 const int start_h, const int end_h,
                 const MqlRates &bar0)
  {
   if(!enabled)
     {
      if(sess.active)
        {
         if(sess.hi > 0.0)
            PushLiqLevel(sess.hi, true, bar0.time, sess.name + " High");
         if(sess.lo > 0.0)
            PushLiqLevel(sess.lo, false, bar0.time, sess.name + " Low");
        }
      sess.active = false;
      sess.hi = 0.0;
      sess.lo = 0.0;
      return;
     }

   MqlDateTime dt;
   TimeToStruct(bar0.time, dt);
   bool in_sess = InHourRange(dt.hour, start_h, end_h);

   if(in_sess)
     {
      if(!sess.active)
        {
         sess.active = true;
         sess.start_time = bar0.time;
         sess.hi = bar0.high;
         sess.lo = bar0.low;
        }
      else
        {
         if(bar0.high > sess.hi) sess.hi = bar0.high;
         if(bar0.low < sess.lo)  sess.lo = bar0.low;
        }
     }
   else if(sess.active)
     {
      if(sess.hi > 0.0)
         PushLiqLevel(sess.hi, true, bar0.time, sess.name + " High");
      if(sess.lo > 0.0)
         PushLiqLevel(sess.lo, false, bar0.time, sess.name + " Low");
      sess.active = false;
      sess.hi = 0.0;
      sess.lo = 0.0;
     }
  }

void UpdateSessionLiquidity()
  {
   MqlRates bar[];
   ArraySetAsSeries(bar, true);
   if(CopyRates(g_sym, (ENUM_TIMEFRAMES)Period(), 0, 1, bar) != 1)
      return;
   SessionStep(g_asia,   InpUseAsiaSession,   InpAsiaStartHour,   InpAsiaEndHour,   bar[0]);
   SessionStep(g_london, InpUseLondonSession, InpLondonStartHour, InpLondonEndHour, bar[0]);
   SessionStep(g_ny,     InpUseNySession,     InpNyStartHour,     InpNyEndHour,     bar[0]);
  }

// SSL sweep (sell-side liq below) -> bullish reclaim -> BUY
bool SweptSSL(const MqlRates &bar, const double liq_low)
  {
   if(liq_low <= 0.0)
      return false;
   if(InpSweepConfirm == SWEEP_WICK_RECLAIM)
      return (bar.low < liq_low && bar.close > liq_low);
   return (bar.close < liq_low);
  }

// BSL sweep (buy-side liq above) -> bearish reclaim -> SELL
bool SweptBSL(const MqlRates &bar, const double liq_high)
  {
   if(liq_high <= 0.0)
      return false;
   if(InpSweepConfirm == SWEEP_WICK_RECLAIM)
      return (bar.high > liq_high && bar.close < liq_high);
   return (bar.close > liq_high);
  }

bool PassesRejectionCandle(const MqlRates &bar, const bool want_buy)
  {
   if(!InpRequireRejectionCandle)
      return true;
   return want_buy ? (bar.close > bar.open) : (bar.close < bar.open);
  }

bool TrySweepOnLevel(const MqlRates &sig_bar, const double level, const bool is_high,
                     LiqSignal &sig)
  {
   if(level <= 0.0)
      return false;

   if(!is_high)
     {
      if(!SweptSSL(sig_bar, level))
         return false;
      if(!PassesRejectionCandle(sig_bar, true))
         return false;
      sig.valid     = true;
      sig.is_buy    = true;
      sig.liq_price = level;
      return true;
     }

   if(!SweptBSL(sig_bar, level))
      return false;
   if(!PassesRejectionCandle(sig_bar, false))
      return false;
   sig.valid     = true;
   sig.is_buy    = false;
   sig.liq_price = level;
   return true;
  }

bool ScanStoredLevels(const MqlRates &sig_bar, LiqSignal &sig)
  {
   for(int i = ArraySize(g_liq_levels) - 1; i >= 0; i--)
     {
      if(sig_bar.time <= g_liq_levels[i].formed_time)
         continue;
      sig.valid = false;
      sig.tag   = g_liq_levels[i].tag;
      if(TrySweepOnLevel(sig_bar, g_liq_levels[i].price, g_liq_levels[i].is_high, sig))
         return true;
     }
   return false;
  }

bool ScanSwingLiquidity(const MqlRates &rates[], const MqlRates &sig_bar, LiqSignal &sig)
  {
   double ssl = 0.0, bsl = 0.0;
   datetime t_ssl = 0, t_bsl = 0;
   bool has_ssl = FindRecentSwing(rates, false, InpSwingLeft, InpSwingRight, 2, ssl, t_ssl);
   bool has_bsl = FindRecentSwing(rates, true,  InpSwingLeft, InpSwingRight, 2, bsl, t_bsl);

   if(has_ssl && sig_bar.time > t_ssl)
     {
      sig.valid = false;
      sig.tag   = "Swing SSL";
      if(TrySweepOnLevel(sig_bar, ssl, false, sig))
         return true;
     }
   if(has_bsl && sig_bar.time > t_bsl)
     {
      sig.valid = false;
      sig.tag   = "Swing BSL";
      if(TrySweepOnLevel(sig_bar, bsl, true, sig))
         return true;
     }
   return false;
  }

bool ScanPriorBarLiquidity(const MqlRates &rates[], const MqlRates &sig_bar, LiqSignal &sig)
  {
   int lb = MathMax(2, InpPriorBarLookback);
   double prior_low  = PriorBarExtreme(rates, false, 2, lb);
   double prior_high = PriorBarExtreme(rates, true,  2, lb);

   if(prior_low > 0.0)
     {
      sig.valid = false;
      sig.tag   = "Prior" + IntegerToString(lb) + " Low";
      if(TrySweepOnLevel(sig_bar, prior_low, false, sig))
         return true;
     }
   if(prior_high > 0.0)
     {
      sig.valid = false;
      sig.tag   = "Prior" + IntegerToString(lb) + " High";
      if(TrySweepOnLevel(sig_bar, prior_high, true, sig))
         return true;
     }
   return false;
  }

bool CanSignalCooldown()
  {
   if(InpCooldownBars <= 0 || g_lastSignalBar <= 0)
      return true;
   int barsSince = iBarShift(g_sym, (ENUM_TIMEFRAMES)Period(), g_lastSignalBar, true);
   if(barsSince < 0)
      return true;
   return (barsSince > InpCooldownBars);
  }

bool EvaluateLiquiditySignal(LiqSignal &sig)
  {
   sig.valid = false;
   if(!CanSignalCooldown())
      return false;

   MqlRates rates[];
   ArraySetAsSeries(rates, true);
   int got = CopyRates(g_sym, (ENUM_TIMEFRAMES)Period(), 0, MathMax(80, InpMaxScanBars), rates);
   if(got < InpMinBarsWarmup)
      return false;

   MqlRates sig_bar = rates[1];
   if(sig_bar.time <= 0)
      return false;

   if(InpLiqMode == LIQ_MODE_SWING || InpLiqMode == LIQ_MODE_ALL)
     {
      if(ScanSwingLiquidity(rates, sig_bar, sig))
         return true;
     }
   if(InpLiqMode == LIQ_MODE_PRIOR_BAR || InpLiqMode == LIQ_MODE_ALL)
     {
      if(ScanPriorBarLiquidity(rates, sig_bar, sig))
         return true;
     }
   if(InpLiqMode == LIQ_MODE_SESSION || InpLiqMode == LIQ_MODE_ALL)
     {
      if(ScanStoredLevels(sig_bar, sig))
         return true;
     }
   return false;
  }

//+------------------------------------------------------------------+
void CacheSymbolConstraints()
  {
   int stops  = (int)SymbolInfoInteger(g_sym, SYMBOL_TRADE_STOPS_LEVEL);
   int freeze = (int)SymbolInfoInteger(g_sym, SYMBOL_TRADE_FREEZE_LEVEL);
   g_minStopDistance = (double)MathMax(stops, freeze) * g_point;
  }

double NormalizeVolume(double vol)
  {
   vol = MathFloor(vol / g_volStep) * g_volStep;
   vol = MathMax(vol, g_volMin);
   vol = MathMin(vol, g_volMax);
   return NormalizeDouble(vol, 2);
  }

double NormalizePrice(const double price)
  {
   return NormalizeDouble(price, g_digits);
  }

bool StopsTooClose(const ENUM_ORDER_TYPE type, const double price,
                  const double sl, const double tp)
  {
   if(g_minStopDistance <= 0.0)
      return false;
   if(type == ORDER_TYPE_BUY)
     {
      if(sl > 0 && (price - sl) < g_minStopDistance) return true;
      if(tp > 0 && (tp - price) < g_minStopDistance) return true;
     }
   else
     {
      if(sl > 0 && (sl - price) < g_minStopDistance) return true;
      if(tp > 0 && (price - tp) < g_minStopDistance) return true;
     }
   return false;
  }

bool InTradeSession()
  {
   if(!InpUseSessionFilter)
      return true;
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   return InHourRange(dt.hour, InpTradeStartHour, InpTradeEndHour);
  }

int CountOurPositions()
  {
   int n = 0;
   const long magic = (long)InpMagicNumber;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      ulong tk = PositionGetTicket(i);
      if(tk == 0 || !PositionSelectByTicket(tk))
         continue;
      if(PositionGetInteger(POSITION_MAGIC) != magic)
         continue;
      if(PositionGetString(POSITION_SYMBOL) != g_sym)
         continue;
      n++;
     }
   return n;
  }

bool TryEnter(const LiqSignal &sig)
  {
   if(!sig.valid)
      return false;

   if(sig.is_buy)
     {
      double ask = SymbolInfoDouble(g_sym, SYMBOL_ASK);
      double sl  = NormalizePrice(ask - g_slDist);
      double tp  = NormalizePrice(ask + g_tpDist);
      if(StopsTooClose(ORDER_TYPE_BUY, ask, sl, tp))
        {
         Print("LiqSweep_EA: BUY stops too close for broker min distance");
         return false;
        }
      string cmt = "LiqSweep BUY " + sig.tag;
      if(!trade.Buy(g_normLots, g_sym, ask, sl, tp, cmt))
        {
         Print("LiqSweep_EA: Buy failed — ", trade.ResultRetcodeDescription());
         return false;
        }
     }
   else
     {
      double bid = SymbolInfoDouble(g_sym, SYMBOL_BID);
      double sl  = NormalizePrice(bid + g_slDist);
      double tp  = NormalizePrice(bid - g_tpDist);
      if(StopsTooClose(ORDER_TYPE_SELL, bid, sl, tp))
        {
         Print("LiqSweep_EA: SELL stops too close for broker min distance");
         return false;
        }
      string cmt = "LiqSweep SELL " + sig.tag;
      if(!trade.Sell(g_normLots, g_sym, bid, sl, tp, cmt))
        {
         Print("LiqSweep_EA: Sell failed — ", trade.ResultRetcodeDescription());
         return false;
        }
     }

   g_lastSignalBar = iTime(g_sym, (ENUM_TIMEFRAMES)Period(), 1);
   Print("LiqSweep_EA: ", (sig.is_buy ? "BUY" : "SELL"), " | ", sig.tag,
         " | liq=", DoubleToString(sig.liq_price, g_digits),
         " | SL=", InpSLPoints, " pts | TP=", (int)(InpSLPoints * InpRewardMultiple), " pts");
   return true;
  }

void UpdateChartComment()
  {
   Comment("LiquiditySweep_EA_v1 | ", g_sym, " | ", EnumToString((ENUM_TIMEFRAMES)Period()), "\n",
           "Mode: ", EnumToString(InpLiqMode),
           " | Stored levels: ", IntegerToString(ArraySize(g_liq_levels)), "\n",
           "SL: ", InpSLPoints, " pts | TP: ", (int)(InpSLPoints * InpRewardMultiple),
           " pts (1:", DoubleToString(InpRewardMultiple, 0), ")\n",
           "Sweep: ", (InpSweepConfirm == SWEEP_WICK_RECLAIM ? "Wick+Reclaim" : "Close through"));
  }

//+------------------------------------------------------------------+
int OnInit()
  {
   g_sym = (StringLen(InpTradeSymbol) > 0) ? InpTradeSymbol : _Symbol;
   if(!SymbolSelect(g_sym, true))
     {
      Print("LiqSweep_EA: symbol not available");
      return INIT_FAILED;
     }

   if(InpSLPoints < 1)
     {
      Print("LiqSweep_EA: InpSLPoints must be >= 1");
      return INIT_PARAMETERS_INCORRECT;
     }
   if(InpRewardMultiple < 1.0)
     {
      Print("LiqSweep_EA: InpRewardMultiple must be >= 1");
      return INIT_PARAMETERS_INCORRECT;
     }

   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetDeviationInPoints(InpSlippagePoints);

   g_point  = SymbolInfoDouble(g_sym, SYMBOL_POINT);
   g_digits = (int)SymbolInfoInteger(g_sym, SYMBOL_DIGITS);
   g_volMin  = SymbolInfoDouble(g_sym, SYMBOL_VOLUME_MIN);
   g_volMax  = SymbolInfoDouble(g_sym, SYMBOL_VOLUME_MAX);
   g_volStep = SymbolInfoDouble(g_sym, SYMBOL_VOLUME_STEP);

   if(g_point <= 0.0 || g_volStep <= 0.0)
      return INIT_FAILED;

   CacheSymbolConstraints();
   g_normLots = NormalizeVolume(InpFixedLots);
   g_slDist   = (double)InpSLPoints * g_point;
   g_tpDist   = g_slDist * InpRewardMultiple;

   if(g_slDist < g_minStopDistance)
     {
      Print("LiqSweep_EA: WARNING — SL ", InpSLPoints, " pts (", DoubleToString(g_slDist, g_digits),
            ") is below broker min stop ", DoubleToString(g_minStopDistance, g_digits),
            ". Entries may be rejected.");
     }

   g_asia.name   = "Asia";
   g_london.name = "London";
   g_ny.name     = "NY";
   g_asia.active = g_london.active = g_ny.active = false;

   ArrayResize(g_liq_levels, 0);
   UpdateChartComment();

   Print("LiqSweep_EA_v1 | ", g_sym,
         " | SL=", InpSLPoints, " pts | RR 1:", DoubleToString(InpRewardMultiple, 0));
   return INIT_SUCCEEDED;
  }

void OnDeinit(const int reason)
  {
   Comment("");
  }

void OnTick()
  {
   UpdateSessionLiquidity();

   ENUM_TIMEFRAMES tf = (ENUM_TIMEFRAMES)Period();
   datetime tClosed = iTime(g_sym, tf, 1);
   if(tClosed == 0 || tClosed == g_lastBarTime)
      return;
   g_lastBarTime = tClosed;
   UpdateChartComment();

   if(!InTradeSession())
      return;
   if(SymbolInfoInteger(g_sym, SYMBOL_SPREAD) > InpMaxSpreadPoints)
      return;
   if(Bars(g_sym, tf) < InpMinBarsWarmup)
      return;
   if(InpOnePositionOnly && CountOurPositions() > 0)
      return;

   LiqSignal signal;
   if(!EvaluateLiquiditySignal(signal))
      return;

   if(TryEnter(signal))
     {
      // Drop consumed session liquidity levels after entry
      MqlRates sig[];
      ArraySetAsSeries(sig, true);
      if(CopyRates(g_sym, tf, 1, 1, sig) == 1)
        {
         for(int i = ArraySize(g_liq_levels) - 1; i >= 0; i--)
           {
            if(sig[0].time <= g_liq_levels[i].formed_time)
               continue;
            bool swept = g_liq_levels[i].is_high
                         ? SweptBSL(sig[0], g_liq_levels[i].price)
                         : SweptSSL(sig[0], g_liq_levels[i].price);
            if(swept)
               RemoveSweptLevel(i);
           }
        }
     }
  }
//+------------------------------------------------------------------+
