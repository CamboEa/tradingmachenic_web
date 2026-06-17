//+------------------------------------------------------------------+
//| PropFirm_2K_v1.1.mq5                                             |
//| Prop-firm $2k rules + XAUUSD-tuned H4 trend / M30 pullback       |
//| v1.1: ADX filter, stricter reclaim, news/session, BE at 1R       |
//+------------------------------------------------------------------+
#property copyright "CamboEA-SuperBot"
#property version   "1.10"
#property description "2K prop XAUUSD: H4/M30 pullback, ADX, news/session, BE@1R, daily trade cap"

#include <Trade\Trade.mqh>

CTrade trade;

//=== Prop firm limits ==============================================
input double InpAccountBaseline    = 2000.0;
input double InpMaxDailyLossUSD    = 100.0;
input double InpMaxTotalLossUSD    = 200.0;

//=== Risk / sizing =================================================
input double InpFixedLots          = 0.01;
input double InpRiskPercentCap     = 1.0;
input double InpRewardMultiple     = 2.0;

//=== Symbol / execution ============================================
input string InpTradeSymbol        = "XAUUSD";   // XAUUSD / XAUUSDm auto-fallback
input ulong  InpMagicNumber        = 90260211;
input int    InpSlippagePoints     = 30;
input int    InpMaxSpreadPoints    = 500;

//=== Strategy (H4 trend + M30 pullback) ============================
input int    InpH4FastEMA          = 20;
input int    InpH4SlowEMA          = 50;
input int    InpM30PullbackEMA     = 20;
input int    InpM30SwingBars       = 7;
input int    InpATRPeriodM30       = 14;
input double InpSL_ATR_Buffer      = 0.30;
input double InpMinSL_ATR          = 1.2;
input double InpMaxSL_ATR          = 2.5;      // Skip if SL wider than this (ATR x)
input double InpPullbackDepthATR   = 0.15;     // Bar-2 must pierce EMA by this x ATR
input bool   InpRequireReclaimCandle = true;   // Long: bullish bar; short: bearish bar
input bool   InpRequireH4Structure = true;     // Long: swing above H4 slow EMA, etc.
input bool   InpOnePositionOnly    = true;
input int    InpMinBarsWarmup      = 120;

//=== Trend strength (H4 ADX) =======================================
input bool   InpUseADXFilter       = true;
input int    InpADXPeriodH4        = 14;
input double InpADXMinLevel        = 22.0;

//=== Session (London -> NY, server time) ===========================
input bool   InpUseSessionFilter   = true;
input int    InpSessionStartHour   = 8;
input int    InpSessionEndHour     = 17;

//=== News (USD calendar) ===========================================
input bool   InpUseNewsFilter      = true;
input int    InpNewsMinutesBefore  = 30;
input int    InpNewsMinutesAfter   = 30;
input ENUM_CALENDAR_EVENT_IMPORTANCE InpNewsMinImportance = CALENDAR_IMPORTANCE_MODERATE;
input int    InpNewsRefreshSeconds = 300;

//=== Trade frequency / management ==================================
input int    InpMaxTradesPerDay    = 2;
input bool   InpStopAfterDailySL   = true;     // No new entries after 1 losing close today
input bool   InpUseBreakEven       = true;
input double InpBreakEvenAtR      = 1.0;
input double InpBreakEvenLockR    = 0.05;    // Lock +0.05R past entry after BE trigger

//=== Globals =========================================================
string   g_sym;
double   g_point;
double   g_volMin, g_volMax, g_volStep;
double   g_tickSize, g_tickValue;
double   g_minStopDistance;
double   g_normLots;

int      g_h4Fast = INVALID_HANDLE;
int      g_h4Slow = INVALID_HANDLE;
int      g_h4Adx  = INVALID_HANDLE;
int      g_m30Pull = INVALID_HANDLE;
int      g_m30Atr = INVALID_HANDLE;

datetime g_lastM30BarTime = 0;

double   g_baselineEquity   = 0.0;
int      g_dayKey             = 0;
double   g_dayStartEquity     = 0.0;
int      g_tradesToday        = 0;
bool     g_dailyStopLatched   = false;
bool     g_totalStopLatched   = false;
bool     g_dailySlStopLatched = false;

ulong    g_beTicket           = 0;
double   g_beInitialRisk      = 0.0;
bool     g_beApplied          = false;

MqlCalendarValue g_newsValues[];
datetime         g_lastNewsRefresh = 0;
string           g_lastNewsDetail  = "";

double   g_bufH4Fast[];
double   g_bufH4Slow[];
double   g_bufH4Close[];
double   g_bufH4Adx[];
double   g_bufM30Ema[];
double   g_bufM30Close[];
double   g_bufM30Open[];
double   g_bufM30Low[];
double   g_bufM30High[];
double   g_bufAtr[];
double   g_bufSwing[];

#define PF211_GV_BASELINE   "PF211_BASELINE"
#define PF211_GV_DAYKEY     "PF211_DAYKEY"
#define PF211_GV_DAYEQ      "PF211_DAYEQ"
#define PF211_GV_DAILY_LAT  "PF211_DAILY_LAT"
#define PF211_GV_TOTAL_LAT  "PF211_TOTAL_LAT"
#define PF211_GV_TRADES     "PF211_TRADES"
#define PF211_GV_SLSTOP     "PF211_SLSTOP"

//+------------------------------------------------------------------+
struct SignalSnapshot
{
   int    h4Bias;
   bool   adxOk;
   double adx;
   bool   pullLong;
   bool   pullShort;
   double atr;
   double h4SlowEma;
   bool   valid;
};

//+------------------------------------------------------------------+
string ResolveTradableSymbol(const string primary)
{
   string sym = primary;
   if(StringLen(sym) <= 0)
      sym = _Symbol;

   if(SymbolSelect(sym, true))
      return sym;

   if(sym == "XAUUSD" && SymbolSelect("XAUUSDm", true))
   {
      Print("PropFirm_2K_v1.1: using XAUUSDm (XAUUSD not found)");
      return "XAUUSDm";
   }
   if(sym == "XAUUSDm" && SymbolSelect("XAUUSD", true))
   {
      Print("PropFirm_2K_v1.1: using XAUUSD (XAUUSDm not found)");
      return "XAUUSD";
   }

   return sym;
}

//+------------------------------------------------------------------+
void InitSeriesBuffers()
{
   const int swingBars = MathMax(2, InpM30SwingBars);

   ArrayResize(g_bufH4Fast, 1);
   ArrayResize(g_bufH4Slow, 1);
   ArrayResize(g_bufH4Close, 1);
   ArrayResize(g_bufH4Adx, 1);
   ArrayResize(g_bufM30Ema, 3);
   ArrayResize(g_bufM30Close, 3);
   ArrayResize(g_bufM30Open, 3);
   ArrayResize(g_bufM30Low, 3);
   ArrayResize(g_bufM30High, 3);
   ArrayResize(g_bufAtr, 1);
   ArrayResize(g_bufSwing, swingBars);

   ArraySetAsSeries(g_bufH4Fast, true);
   ArraySetAsSeries(g_bufH4Slow, true);
   ArraySetAsSeries(g_bufH4Close, true);
   ArraySetAsSeries(g_bufH4Adx, true);
   ArraySetAsSeries(g_bufM30Ema, true);
   ArraySetAsSeries(g_bufM30Close, true);
   ArraySetAsSeries(g_bufM30Open, true);
   ArraySetAsSeries(g_bufM30Low, true);
   ArraySetAsSeries(g_bufM30High, true);
   ArraySetAsSeries(g_bufAtr, true);
   ArraySetAsSeries(g_bufSwing, true);
}

//+------------------------------------------------------------------+
void CacheSymbolConstraints()
{
   int stopsLevel = (int)SymbolInfoInteger(g_sym, SYMBOL_TRADE_STOPS_LEVEL);
   int freezeLevel = (int)SymbolInfoInteger(g_sym, SYMBOL_TRADE_FREEZE_LEVEL);
   g_minStopDistance = (double)MathMax(stopsLevel, freezeLevel) * g_point;
}

//+------------------------------------------------------------------+
int OnInit()
{
   g_sym = ResolveTradableSymbol(InpTradeSymbol);
   if(!SymbolSelect(g_sym, true))
   {
      Print("PropFirm_2K_v1.1: symbol not available: ", g_sym);
      return INIT_FAILED;
   }

   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetDeviationInPoints(InpSlippagePoints);

   g_point     = SymbolInfoDouble(g_sym, SYMBOL_POINT);
   g_volMin    = SymbolInfoDouble(g_sym, SYMBOL_VOLUME_MIN);
   g_volMax    = SymbolInfoDouble(g_sym, SYMBOL_VOLUME_MAX);
   g_volStep   = SymbolInfoDouble(g_sym, SYMBOL_VOLUME_STEP);
   g_tickSize  = SymbolInfoDouble(g_sym, SYMBOL_TRADE_TICK_SIZE);
   g_tickValue = SymbolInfoDouble(g_sym, SYMBOL_TRADE_TICK_VALUE);

   if(g_point <= 0 || g_volStep <= 0 || g_tickSize <= 0 || g_tickValue <= 0)
   {
      Print("PropFirm_2K_v1.1: invalid symbol parameters");
      return INIT_FAILED;
   }

   CacheSymbolConstraints();
   InitSeriesBuffers();

   g_h4Fast  = iMA(g_sym, PERIOD_H4, InpH4FastEMA, 0, MODE_EMA, PRICE_CLOSE);
   g_h4Slow  = iMA(g_sym, PERIOD_H4, InpH4SlowEMA, 0, MODE_EMA, PRICE_CLOSE);
   g_h4Adx   = iADX(g_sym, PERIOD_H4, InpADXPeriodH4);
   g_m30Pull = iMA(g_sym, PERIOD_M30, InpM30PullbackEMA, 0, MODE_EMA, PRICE_CLOSE);
   g_m30Atr  = iATR(g_sym, PERIOD_M30, InpATRPeriodM30);

   if(g_h4Fast == INVALID_HANDLE || g_h4Slow == INVALID_HANDLE ||
      g_h4Adx == INVALID_HANDLE || g_m30Pull == INVALID_HANDLE || g_m30Atr == INVALID_HANDLE)
   {
      Print("PropFirm_2K_v1.1: indicator create failed");
      return INIT_FAILED;
   }

   g_normLots = NormalizeVolume(InpFixedLots);

   LoadPersistedState();
   RefreshDayBaseline();
   UpdateChartComment();

   EventSetTimer(1);

   Print("PropFirm_2K_v1.1 | ", g_sym,
         " | H4 EMA ", InpH4FastEMA, "/", InpH4SlowEMA,
         " | M30 pullback | ADX>", DoubleToString(InpADXMinLevel, 1),
         " | session ", InpUseSessionFilter ? "ON" : "OFF",
         " | news ", InpUseNewsFilter ? "ON" : "OFF");

   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   if(g_h4Fast != INVALID_HANDLE)  IndicatorRelease(g_h4Fast);
   if(g_h4Slow != INVALID_HANDLE)  IndicatorRelease(g_h4Slow);
   if(g_h4Adx != INVALID_HANDLE)   IndicatorRelease(g_h4Adx);
   if(g_m30Pull != INVALID_HANDLE) IndicatorRelease(g_m30Pull);
   if(g_m30Atr != INVALID_HANDLE)  IndicatorRelease(g_m30Atr);
   Comment("");
}

//+------------------------------------------------------------------+
void OnTimer()
{
   UpdateChartComment();
}

//+------------------------------------------------------------------+
void PersistState()
{
   GlobalVariableSet(PF211_GV_BASELINE, g_baselineEquity);
   GlobalVariableSet(PF211_GV_DAYKEY, (double)g_dayKey);
   GlobalVariableSet(PF211_GV_DAYEQ, g_dayStartEquity);
   GlobalVariableSet(PF211_GV_DAILY_LAT, g_dailyStopLatched ? 1.0 : 0.0);
   GlobalVariableSet(PF211_GV_TOTAL_LAT, g_totalStopLatched ? 1.0 : 0.0);
   GlobalVariableSet(PF211_GV_TRADES, (double)g_tradesToday);
   GlobalVariableSet(PF211_GV_SLSTOP, g_dailySlStopLatched ? 1.0 : 0.0);
}

//+------------------------------------------------------------------+
void LoadPersistedState()
{
   double eq = AccountInfoDouble(ACCOUNT_EQUITY);

   if(GlobalVariableCheck(PF211_GV_BASELINE))
      g_baselineEquity = GlobalVariableGet(PF211_GV_BASELINE);
   else
      g_baselineEquity = (InpAccountBaseline > 0.0) ? InpAccountBaseline : eq;

   if(GlobalVariableCheck(PF211_GV_DAYKEY))
      g_dayKey = (int)GlobalVariableGet(PF211_GV_DAYKEY);
   if(GlobalVariableCheck(PF211_GV_DAYEQ))
      g_dayStartEquity = GlobalVariableGet(PF211_GV_DAYEQ);
   if(GlobalVariableCheck(PF211_GV_DAILY_LAT))
      g_dailyStopLatched = (GlobalVariableGet(PF211_GV_DAILY_LAT) > 0.5);
   if(GlobalVariableCheck(PF211_GV_TOTAL_LAT))
      g_totalStopLatched = (GlobalVariableGet(PF211_GV_TOTAL_LAT) > 0.5);
   if(GlobalVariableCheck(PF211_GV_TRADES))
      g_tradesToday = (int)GlobalVariableGet(PF211_GV_TRADES);
   if(GlobalVariableCheck(PF211_GV_SLSTOP))
      g_dailySlStopLatched = (GlobalVariableGet(PF211_GV_SLSTOP) > 0.5);

   if(g_dayStartEquity <= 0.0)
      g_dayStartEquity = eq;
}

//+------------------------------------------------------------------+
void RefreshDayBaseline()
{
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   int key = dt.year * 10000 + dt.mon * 100 + dt.day;

   if(g_dayKey != key)
   {
      g_dayKey = key;
      g_dayStartEquity = AccountInfoDouble(ACCOUNT_EQUITY);
      g_dailyStopLatched = false;
      g_dailySlStopLatched = false;
      g_tradesToday = 0;
      PersistState();
      UpdateChartComment();
   }
}

//+------------------------------------------------------------------+
double NormalizeVolume(double vol)
{
   vol = MathFloor(vol / g_volStep) * g_volStep;
   vol = MathMax(vol, g_volMin);
   vol = MathMin(vol, g_volMax);
   return NormalizeDouble(vol, 2);
}

//+------------------------------------------------------------------+
double MoneyRiskAtSL(const ENUM_ORDER_TYPE orderType, const double entry, const double sl, const double lots)
{
   if(lots <= 0.0 || MathAbs(entry - sl) <= 0.0)
      return 0.0;

   double profit = 0.0;
   if(OrderCalcProfit(orderType, g_sym, lots, entry, sl, profit))
      return MathAbs(profit);

   double slDist = MathAbs(entry - sl);
   double lossPerLot = (slDist / g_tickSize) * g_tickValue;
   return lossPerLot * lots;
}

//+------------------------------------------------------------------+
bool RiskWithinCap(const ENUM_ORDER_TYPE orderType, const double entry, const double sl, const double lots)
{
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double cap = equity * InpRiskPercentCap / 100.0;
   double risk = MoneyRiskAtSL(orderType, entry, sl, lots);
   if(risk > cap + 0.01)
   {
      Print("PropFirm_2K_v1.1: skip — risk $", DoubleToString(risk, 2),
            " > ", DoubleToString(InpRiskPercentCap, 1), "% cap ($", DoubleToString(cap, 2), ")");
      return false;
   }
   return true;
}

//+------------------------------------------------------------------+
double DailyLossUSD(const double equity)
{
   return MathMax(0.0, g_dayStartEquity - equity);
}

//+------------------------------------------------------------------+
double TotalLossUSD(const double equity)
{
   return MathMax(0.0, g_baselineEquity - equity);
}

//+------------------------------------------------------------------+
bool IsDailyDrawdownHit(const double equity)
{
   if(g_dailyStopLatched)
      return true;
   if(InpMaxDailyLossUSD <= 0.0)
      return false;

   if(DailyLossUSD(equity) >= InpMaxDailyLossUSD - 0.01)
   {
      g_dailyStopLatched = true;
      PersistState();
      Print("PropFirm_2K_v1.1: DAILY drawdown limit hit ($", DoubleToString(InpMaxDailyLossUSD, 2), ")");
      return true;
   }
   return false;
}

//+------------------------------------------------------------------+
bool IsTotalDrawdownHit(const double equity)
{
   if(g_totalStopLatched)
      return true;
   if(InpMaxTotalLossUSD <= 0.0)
      return false;

   if(TotalLossUSD(equity) >= InpMaxTotalLossUSD - 0.01)
   {
      g_totalStopLatched = true;
      PersistState();
      Print("PropFirm_2K_v1.1: TOTAL drawdown limit hit ($", DoubleToString(InpMaxTotalLossUSD, 2), ")");
      return true;
   }
   return false;
}

//+------------------------------------------------------------------+
bool InSession()
{
   if(!InpUseSessionFilter)
      return true;

   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   return (dt.hour >= InpSessionStartHour && dt.hour < InpSessionEndHour);
}

//+------------------------------------------------------------------+
void RefreshNewsCache()
{
   if(!InpUseNewsFilter)
   {
      ArrayResize(g_newsValues, 0);
      return;
   }

   datetime nowSrv = TimeTradeServer();
   if(g_lastNewsRefresh > 0 && (nowSrv - g_lastNewsRefresh) < InpNewsRefreshSeconds)
      return;

   g_lastNewsRefresh = nowSrv;

   int aft = InpNewsMinutesAfter * 60;
   int bef = InpNewsMinutesBefore * 60;
   datetime from = nowSrv - aft - 3600;
   datetime to   = nowSrv + bef + 86400;

   MqlCalendarValue vals[];
   ArrayResize(vals, 0);
   int n = CalendarValueHistory(vals, from, to, "", "USD");
   if(n < 0)
   {
      ArrayResize(g_newsValues, 0);
      return;
   }

   ArrayResize(g_newsValues, ArraySize(vals));
   ArrayCopy(g_newsValues, vals);
}

//+------------------------------------------------------------------+
bool IsNewsBlackout(string &detail)
{
   detail = "";
   if(!InpUseNewsFilter)
      return false;

   RefreshNewsCache();

   datetime nowSrv = TimeTradeServer();
   int beforeSec = InpNewsMinutesBefore * 60;
   int afterSec  = InpNewsMinutesAfter * 60;
   int minImp    = (int)InpNewsMinImportance;

   for(int i = 0; i < ArraySize(g_newsValues); i++)
   {
      MqlCalendarEvent ev;
      if(!CalendarEventById(g_newsValues[i].event_id, ev))
         continue;
      if((int)ev.importance < minImp)
         continue;

      datetime t = g_newsValues[i].time;
      if(nowSrv >= t - beforeSec && nowSrv <= t + afterSec)
      {
         detail = TimeToString(t, TIME_DATE|TIME_MINUTES) + " " + ev.name;
         return true;
      }
   }
   return false;
}

//+------------------------------------------------------------------+
bool EntryFiltersAllowTrading(const double equity)
{
   if(IsTotalDrawdownHit(equity))
      return false;
   if(IsDailyDrawdownHit(equity))
      return false;
   if(!InSession())
      return false;

   string newsDet = "";
   if(IsNewsBlackout(newsDet))
   {
      g_lastNewsDetail = newsDet;
      return false;
   }
   g_lastNewsDetail = "";

   if(InpStopAfterDailySL && g_dailySlStopLatched)
      return false;

   if(InpMaxTradesPerDay > 0 && g_tradesToday >= InpMaxTradesPerDay)
      return false;

   return true;
}

//+------------------------------------------------------------------+
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

//+------------------------------------------------------------------+
bool LoadSignalSnapshot(SignalSnapshot &sig)
{
   sig.valid = false;
   sig.h4Bias = 0;
   sig.adxOk = true;
   sig.adx = 0.0;
   sig.pullLong = false;
   sig.pullShort = false;
   sig.atr = 0.0;
   sig.h4SlowEma = 0.0;

   if(CopyBuffer(g_h4Fast, 0, 1, 1, g_bufH4Fast) != 1) return false;
   if(CopyBuffer(g_h4Slow, 0, 1, 1, g_bufH4Slow) != 1) return false;
   if(CopyClose(g_sym, PERIOD_H4, 1, 1, g_bufH4Close) != 1) return false;

   const double emaF = g_bufH4Fast[0];
   const double emaS = g_bufH4Slow[0];
   const double cls  = g_bufH4Close[0];
   sig.h4SlowEma = emaS;

   if(emaF > emaS && cls > emaS)
      sig.h4Bias = 1;
   else if(emaF < emaS && cls < emaS)
      sig.h4Bias = -1;

   if(InpUseADXFilter)
   {
      if(CopyBuffer(g_h4Adx, 0, 1, 1, g_bufH4Adx) != 1)
         return false;
      sig.adx = g_bufH4Adx[0];
      sig.adxOk = (sig.adx >= InpADXMinLevel);
   }

   if(CopyBuffer(g_m30Pull, 0, 1, 3, g_bufM30Ema) != 3) return false;
   if(CopyClose(g_sym, PERIOD_M30, 1, 3, g_bufM30Close) != 3) return false;
   if(CopyOpen(g_sym, PERIOD_M30, 1, 3, g_bufM30Open) != 3) return false;
   if(CopyLow(g_sym, PERIOD_M30, 1, 3, g_bufM30Low) != 3) return false;
   if(CopyHigh(g_sym, PERIOD_M30, 1, 3, g_bufM30High) != 3) return false;
   if(CopyBuffer(g_m30Atr, 0, 1, 1, g_bufAtr) != 1) return false;

   const double e1 = g_bufM30Ema[0], e2 = g_bufM30Ema[1], e3 = g_bufM30Ema[2];
   const double c1 = g_bufM30Close[0], c2 = g_bufM30Close[1], c3 = g_bufM30Close[2];
   const double o1 = g_bufM30Open[0];
   const double l2 = g_bufM30Low[1], h2 = g_bufM30High[1];
   sig.atr = g_bufAtr[0];

   if(sig.atr <= 0.0)
      return false;

   const double depth = sig.atr * InpPullbackDepthATR;

   bool baseLong  = (c2 < e2 && c1 > e1 && c3 > e3);
   bool baseShort = (c2 > e2 && c1 < e1 && c3 < e3);

   if(baseLong)
   {
      if((e2 - l2) < depth)
         baseLong = false;
      if(InpRequireReclaimCandle && c1 <= o1)
         baseLong = false;
   }

   if(baseShort)
   {
      if((h2 - e2) < depth)
         baseShort = false;
      if(InpRequireReclaimCandle && c1 >= o1)
         baseShort = false;
   }

   sig.pullLong  = baseLong;
   sig.pullShort = baseShort;
   sig.valid = true;
   return true;
}

//+------------------------------------------------------------------+
double SwingExtremeM30(const bool wantLow, const int start_shift, const int bars)
{
   if(bars <= 0)
      return 0.0;

   if(ArraySize(g_bufSwing) < bars)
      ArrayResize(g_bufSwing, bars);

   int copied = wantLow
      ? CopyLow(g_sym, PERIOD_M30, start_shift, bars, g_bufSwing)
      : CopyHigh(g_sym, PERIOD_M30, start_shift, bars, g_bufSwing);

   if(copied < bars)
      return 0.0;

   double extreme = g_bufSwing[0];
   for(int i = 1; i < bars; i++)
   {
      if(wantLow)
      {
         if(g_bufSwing[i] < extreme) extreme = g_bufSwing[i];
      }
      else if(g_bufSwing[i] > extreme)
      {
         extreme = g_bufSwing[i];
      }
   }
   return extreme;
}

//+------------------------------------------------------------------+
bool PassesH4Structure(const int direction, const double swingExtreme, const double h4SlowEma)
{
   if(!InpRequireH4Structure || swingExtreme <= 0.0 || h4SlowEma <= 0.0)
      return true;

   if(direction > 0)
      return (swingExtreme > h4SlowEma);
   return (swingExtreme < h4SlowEma);
}

//+------------------------------------------------------------------+
bool StopsTooClose(const ENUM_ORDER_TYPE type, const double price, const double sl, const double tp)
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

//+------------------------------------------------------------------+
bool SlWithinMaxAtr(const double slDist, const double atr)
{
   if(InpMaxSL_ATR <= 0.0 || atr <= 0.0)
      return true;
   return (slDist <= atr * InpMaxSL_ATR + g_point);
}

//+------------------------------------------------------------------+
void UpdateChartComment()
{
   double eq = AccountInfoDouble(ACCOUNT_EQUITY);
   double dLoss = DailyLossUSD(eq);
   double tLoss = TotalLossUSD(eq);
   string status = "OK";
   if(g_totalStopLatched) status = "TOTAL DD STOP";
   else if(g_dailyStopLatched) status = "DAILY DD STOP";
   else if(g_dailySlStopLatched) status = "1 SL TODAY";
   else if(InpMaxTradesPerDay > 0 && g_tradesToday >= InpMaxTradesPerDay) status = "MAX TRADES";

   string newsLine = (StringLen(g_lastNewsDetail) > 0)
      ? ("News block: " + g_lastNewsDetail + "\n")
      : "";

   Comment("PropFirm_2K_v1.1 | ", g_sym, "\n",
           "Status: ", status, "\n",
           newsLine,
           "Equity: $", DoubleToString(eq, 2),
           " | Baseline: $", DoubleToString(g_baselineEquity, 2), "\n",
           "Daily loss: $", DoubleToString(dLoss, 2), " / $", DoubleToString(InpMaxDailyLossUSD, 2),
           " | Total loss: $", DoubleToString(tLoss, 2), " / $", DoubleToString(InpMaxTotalLossUSD, 2), "\n",
           "Trades today: ", IntegerToString(g_tradesToday),
           " / ", IntegerToString(InpMaxTradesPerDay),
           " | RR 1:", DoubleToString(InpRewardMultiple, 1),
           " | Lots: ", DoubleToString(g_normLots, 2));
}

//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest &request,
                        const MqlTradeResult &result)
{
   if(trans.type != TRADE_TRANSACTION_DEAL_ADD)
      return;

   if(!HistoryDealSelect(trans.deal))
      return;

   if(HistoryDealGetString(trans.deal, DEAL_SYMBOL) != g_sym)
      return;
   if((ulong)HistoryDealGetInteger(trans.deal, DEAL_MAGIC) != InpMagicNumber)
      return;

   const long entry = HistoryDealGetInteger(trans.deal, DEAL_ENTRY);
   if(entry != DEAL_ENTRY_OUT && entry != DEAL_ENTRY_OUT_BY)
      return;

   const double profit = HistoryDealGetDouble(trans.deal, DEAL_PROFIT)
                       + HistoryDealGetDouble(trans.deal, DEAL_SWAP)
                       + HistoryDealGetDouble(trans.deal, DEAL_COMMISSION);

   if(profit < -0.01 && InpStopAfterDailySL)
   {
      g_dailySlStopLatched = true;
      PersistState();
      Print("PropFirm_2K_v1.1: losing close — no more entries today");
   }

   g_beTicket = 0;
   g_beApplied = false;
   g_beInitialRisk = 0.0;
}

//+------------------------------------------------------------------+
bool FindOurPosition(ulong &ticket, ENUM_POSITION_TYPE &ptype,
                     double &entry, double &sl, double &tp)
{
   ticket = 0;
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

      ticket = tk;
      ptype = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
      entry = PositionGetDouble(POSITION_PRICE_OPEN);
      sl = PositionGetDouble(POSITION_SL);
      tp = PositionGetDouble(POSITION_TP);
      return true;
   }
   return false;
}

//+------------------------------------------------------------------+
bool ClampSLBuy(const double bid, double &sl)
{
   if(g_minStopDistance <= 0.0)
      return (sl > 0.0 && sl < bid);

   double maxSl = bid - g_minStopDistance;
   if(sl >= maxSl)
      sl = NormalizeDouble(maxSl - g_point, (int)SymbolInfoInteger(g_sym, SYMBOL_DIGITS));
   return (sl > 0.0 && sl < bid);
}

//+------------------------------------------------------------------+
bool ClampSLSell(const double ask, double &sl)
{
   if(g_minStopDistance <= 0.0)
      return (sl > ask);

   double minSl = ask + g_minStopDistance;
   if(sl <= minSl)
      sl = NormalizeDouble(minSl + g_point, (int)SymbolInfoInteger(g_sym, SYMBOL_DIGITS));
   return (sl > ask);
}

//+------------------------------------------------------------------+
void ManageBreakEven()
{
   if(!InpUseBreakEven)
      return;

   ulong ticket = 0;
   ENUM_POSITION_TYPE ptype;
   double entry = 0.0, sl = 0.0, tp = 0.0;

   if(!FindOurPosition(ticket, ptype, entry, sl, tp))
   {
      g_beTicket = 0;
      g_beApplied = false;
      g_beInitialRisk = 0.0;
      return;
   }

   const double bid = SymbolInfoDouble(g_sym, SYMBOL_BID);
   const double ask = SymbolInfoDouble(g_sym, SYMBOL_ASK);
   if(bid <= 0.0 || ask <= 0.0)
      return;

   if(ticket != g_beTicket)
   {
      g_beTicket = ticket;
      g_beApplied = false;
      g_beInitialRisk = MathAbs(entry - sl);
      if(g_beInitialRisk <= g_point * 0.5)
         g_beInitialRisk = g_point;
   }

   if(g_beApplied || g_beInitialRisk <= 0.0)
      return;

   const double triggerR = MathMax(0.5, InpBreakEvenAtR);
   const double lockR = MathMax(0.0, InpBreakEvenLockR);

   if(ptype == POSITION_TYPE_BUY)
   {
      const double profitR = (bid - entry) / g_beInitialRisk;
      if(profitR < triggerR)
         return;

      double newSL = entry + lockR * g_beInitialRisk;
      newSL = MathMax(newSL, sl);
      if(!ClampSLBuy(bid, newSL))
         return;
      if(newSL <= sl + g_point * 0.5)
         return;

      if(!PositionSelectByTicket(ticket))
         return;
      if(trade.PositionModify(ticket, newSL, tp))
         g_beApplied = true;
   }
   else
   {
      const double profitR = (entry - ask) / g_beInitialRisk;
      if(profitR < triggerR)
         return;

      double newSL = entry - lockR * g_beInitialRisk;
      newSL = MathMin(newSL, sl);
      if(!ClampSLSell(ask, newSL))
         return;
      if(sl > 0.0 && newSL >= sl - g_point * 0.5)
         return;

      if(!PositionSelectByTicket(ticket))
         return;
      if(trade.PositionModify(ticket, newSL, tp))
         g_beApplied = true;
   }
}

//+------------------------------------------------------------------+
bool TryEnter(const int direction, const SignalSnapshot &sig)
{
   if(!sig.adxOk)
      return false;

   if(direction > 0)
   {
      if(sig.h4Bias != 1 || !sig.pullLong)
         return false;

      const int bars = MathMax(2, InpM30SwingBars);
      const double swingLo = SwingExtremeM30(true, 1, bars);
      if(swingLo <= 0.0)
         return false;
      if(!PassesH4Structure(1, swingLo, sig.h4SlowEma))
         return false;

      const double ask = SymbolInfoDouble(g_sym, SYMBOL_ASK);
      double sl = swingLo - sig.atr * InpSL_ATR_Buffer;
      const double slDistMin = sig.atr * InpMinSL_ATR;
      if((ask - sl) < slDistMin)
         sl = ask - slDistMin;

      const double slDist = ask - sl;
      if(slDist <= 0.0)
         return false;
      if(!SlWithinMaxAtr(slDist, sig.atr))
      {
         Print("PropFirm_2K_v1.1: skip long — SL too wide (>", DoubleToString(InpMaxSL_ATR, 1), " ATR)");
         return false;
      }

      const double rr = MathMax(1.0, InpRewardMultiple);
      const double tp = ask + slDist * rr;

      if(StopsTooClose(ORDER_TYPE_BUY, ask, sl, tp))
         return false;
      if(!RiskWithinCap(ORDER_TYPE_BUY, ask, sl, g_normLots))
         return false;

      if(!trade.Buy(g_normLots, g_sym, ask, sl, tp, "PF211 long"))
      {
         Print("PropFirm_2K_v1.1: Buy failed — ", trade.ResultRetcodeDescription());
         return false;
      }

      g_tradesToday++;
      PersistState();
      g_beTicket = 0;
      g_beApplied = false;
      return true;
   }

   if(direction < 0)
   {
      if(sig.h4Bias != -1 || !sig.pullShort)
         return false;

      const int bars = MathMax(2, InpM30SwingBars);
      const double swingHi = SwingExtremeM30(false, 1, bars);
      if(swingHi <= 0.0)
         return false;
      if(!PassesH4Structure(-1, swingHi, sig.h4SlowEma))
         return false;

      const double bid = SymbolInfoDouble(g_sym, SYMBOL_BID);
      double sl = swingHi + sig.atr * InpSL_ATR_Buffer;
      const double slDistMin = sig.atr * InpMinSL_ATR;
      if((sl - bid) < slDistMin)
         sl = bid + slDistMin;

      const double slDist = sl - bid;
      if(slDist <= 0.0)
         return false;
      if(!SlWithinMaxAtr(slDist, sig.atr))
      {
         Print("PropFirm_2K_v1.1: skip short — SL too wide (>", DoubleToString(InpMaxSL_ATR, 1), " ATR)");
         return false;
      }

      const double rr = MathMax(1.0, InpRewardMultiple);
      const double tp = bid - slDist * rr;

      if(StopsTooClose(ORDER_TYPE_SELL, bid, sl, tp))
         return false;
      if(!RiskWithinCap(ORDER_TYPE_SELL, bid, sl, g_normLots))
         return false;

      if(!trade.Sell(g_normLots, g_sym, bid, sl, tp, "PF211 short"))
      {
         Print("PropFirm_2K_v1.1: Sell failed — ", trade.ResultRetcodeDescription());
         return false;
      }

      g_tradesToday++;
      PersistState();
      g_beTicket = 0;
      g_beApplied = false;
      return true;
   }

   return false;
}

//+------------------------------------------------------------------+
void EvaluateSignalsOnNewBar()
{
   SignalSnapshot sig;
   if(!LoadSignalSnapshot(sig))
      return;

   if(sig.h4Bias == 1)
      TryEnter(1, sig);
   else if(sig.h4Bias == -1)
      TryEnter(-1, sig);
}

//+------------------------------------------------------------------+
void OnTick()
{
   RefreshDayBaseline();

   const double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   IsDailyDrawdownHit(equity);
   IsTotalDrawdownHit(equity);

   ManageBreakEven();

   if(!EntryFiltersAllowTrading(equity))
      return;

   if(SymbolInfoInteger(g_sym, SYMBOL_SPREAD) > InpMaxSpreadPoints)
      return;

   datetime tClosed = iTime(g_sym, PERIOD_M30, 1);
   if(tClosed == 0 || tClosed == g_lastM30BarTime)
      return;

   g_lastM30BarTime = tClosed;
   UpdateChartComment();

   if(Bars(g_sym, PERIOD_M30) < InpMinBarsWarmup)
      return;

   if(InpOnePositionOnly && CountOurPositions() > 0)
      return;

   EvaluateSignalsOnNewBar();
}

//+------------------------------------------------------------------+
