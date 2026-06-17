//+------------------------------------------------------------------+
//| TrendPullback_XAU_v2.mq5                                         |
//| Prop-tuned H4 trend + M30 pullback (ADX, session, news, BE@1R)   |
//| $2k Phase 1: $100 daily DD | $200 max DD | $160 pass target      |
//+------------------------------------------------------------------+
#property copyright "CamboEA-SuperBot"
#property version   "2.02"
#property description "TrendPullback XAU v2 — prop filters + BE@1R + 2.5R TP"

#include <Trade\Trade.mqh>

CTrade trade;

//=== Inputs ========================================================
input string InpTradeSymbol      = "XAUUSDm"; // Trading symbol (broker suffix)

input int    InpH4FastEMA        = 20;       // H4 fast EMA period
input int    InpH4SlowEMA        = 50;       // H4 slow EMA period

input int    InpM30PullbackEMA   = 20;       // M30 pullback / trigger MA
input int    InpM30SwingBars     = 7;        // M30 bars for swing SL (from bar 1)

input int    InpATRPeriodM30     = 14;       // M30 ATR (buffer + fallback SL)
input double InpSL_ATR_Buffer    = 0.30;    // Extra SL beyond swing = ATR * this
input double InpMinSL_ATR        = 1.2;     // Min SL distance (ATR multiples)
input double InpMaxSL_ATR        = 2.5;     // Strict mode: max SL width (ATR x)
input double InpMaxSL_ATR_Relaxed = 3.0;    // Relaxed / force mode: max SL (ATR x)
input double InpPullbackDepthATR = 0.08;    // Strict: bar-2 pierce EMA (ATR x)
input bool   InpRequireReclaimCandle = true; // Strict: bullish/bearish reclaim bar
input bool   InpRequireH4Structure    = true; // Strict: swing vs H4 slow EMA

input double InpRewardMultiple   = 2.5;     // Take-profit (R multiples of SL)

input bool   InpUseBreakEven     = true;    // Move SL to BE after +R
input double InpBreakEvenAtR     = 1.0;     // Trigger break-even at this R
input double InpBreakEvenLockR   = 0.05;    // Lock +this R past entry after BE

input bool   InpUseTrailAfterBE  = true;    // ATR trail after BE trigger R
input double InpTrailActivateR   = 2.0;     // Start trailing after +R (after BE armed)
input double InpTrailLockR       = 0.5;     // Trail SL locks at least +this R
input double InpTrailBehindATR   = 0.35;    // Trail SL behind extreme (M30 ATR x)

input double InpFixedLots        = 0.01;    // Used when InpUseRiskPercent = false
input bool   InpUseRiskPercent   = true;    // Size lots from equity % risk
input double InpRiskPercent      = 0.75;    // Equity % risk per trade (~$15 on $2k)

input ulong  MagicNumber         = 90245132;
input int    SlippagePoints      = 30;       // Deviation in points (broker-dependent)

input int    InpMaxSpreadPoints  = 500;     // Skip entries if spread above this (points)
input bool   InpOnePositionOnly  = true;    // Max one net position per symbol
input int    InpMinBarsWarmup    = 120;     // Min M30 bars history before trading

//=== Trend strength (H4 ADX) =======================================
input bool   InpUseADXFilter     = true;
input int    InpADXPeriodH4      = 14;
input double InpADXMinLevel      = 18.0;
input double InpADXMinRelaxed    = 15.0;    // Relaxed / force tier ADX floor

//=== Session (London -> NY, server time) ===========================
input bool   InpUseSessionFilter = true;
input int    InpSessionStartHour = 8;
input int    InpSessionEndHour   = 17;

//=== News (USD calendar) ===========================================
input bool   InpUseNewsFilter    = true;
input bool   InpDisableNewsInTester = true; // Backtest: skip news block (calendar often over-blocks)
input int    InpNewsMinutesBefore = 30;
input int    InpNewsMinutesAfter  = 30;
input ENUM_CALENDAR_EVENT_IMPORTANCE InpNewsMinImportance = CALENDAR_IMPORTANCE_MODERATE;
input int    InpNewsRefreshSeconds = 300;

//=== Trade frequency (1 shot / day) ================================
input int    InpMaxTradesPerDay       = 1;    // Max new entries per day
input bool   InpStopAfterDailySL      = true; // No entries after 1 losing close today
input bool   InpStopAfterDailyWin     = true; // No entries after 1 winning close today
input bool   InpRequireMinOneTradePerDay = true; // Guarantee 1 entry/day via relaxed + force tiers
input int    InpRelaxedEntryHour  = 10;   // After this: allow relaxed pullback (server hour)
input int    InpForceTradeHour        = 12;   // After this: force trend entry if still flat
input int    InpForceTradeMinute      = 0;    // Server minute for force tier

//=== Prop firm — $2k Phase 1 (equity-based) ========================
input bool   InpUsePropLimits       = true;   // Enforce challenge drawdown / profit rules
input double InpAccountBaseline     = 2000.0; // Challenge start equity ($)
input double InpMaxDailyLossUSD     = 100.0;  // Max daily drawdown ($)
input double InpMaxTotalLossUSD     = 200.0;  // Max overall drawdown ($)
input double InpPhase1ProfitUSD     = 160.0;  // Phase 1 pass profit ($ from baseline)
input bool   InpStopNewTradesOnPass = true;   // Block entries after Phase 1 target hit
input bool   InpShowDashboard       = true;   // Chart dashboard (prop + status)
input int    InpDashboardSeconds    = 2;      // Dashboard refresh interval (sec)

//=== Globals =======================================================
string g_sym;
double g_volMin = 0;
double g_volMax = 0;
double g_volStep = 0;
double g_tickSize = 0;
double g_tickValue = 0;
double g_point = 0;
int    g_digits = 0;
int    g_stopsLevel = 0;
int    g_freezeLevel = 0;
double g_minStopDist = 0.0;

int g_h4Fast = INVALID_HANDLE;
int g_h4Slow = INVALID_HANDLE;
int g_h4Adx  = INVALID_HANDLE;
int g_m30Pull = INVALID_HANDLE;
int g_m30Atr = INVALID_HANDLE;

datetime g_lastM30BarTime = 0;

ulong    g_trackedTicket    = 0;
double   g_initialRiskDist  = 0.0;
double   g_priceExtreme     = 0.0;
bool     g_trailingActive   = false;

ulong    g_beTicket         = 0;
double   g_beInitialRisk    = 0.0;
bool     g_beApplied        = false;

int      g_tradesToday      = 0;
bool     g_dailySlStopLatched = false;
bool     g_dailyWinStopLatched = false;
bool     g_forceAttemptedToday = false;
string   g_lastNewsDetail   = "";
MqlCalendarValue g_newsValues[];
datetime g_lastNewsRefresh  = 0;

double   g_baselineEquity       = 0.0;
int      g_dayKey               = 0;
double   g_dayStartEquity       = 0.0;
bool     g_dailyStopLatched     = false;
bool     g_totalStopLatched     = false;
bool     g_challengePassedLatched = false;
bool     g_blockNewEntries      = false;
bool     g_posCacheReady          = false;
int      g_ourPosCount            = 0;
ulong    g_ourPosTicket           = 0;
ENUM_POSITION_TYPE g_ourPosType   = POSITION_TYPE_BUY;
double   g_ourPosEntry            = 0.0;
double   g_ourPosSl               = 0.0;
double   g_ourPosTp               = 0.0;
double   g_ourPosPnl              = 0.0;

double   g_buf1[];
double   g_bufM30Ema[];
double   g_bufM30Close[];
double   g_bufM30Open[];
double   g_bufH4Close[];
double   g_bufSwing[];

double   g_bufH4Adx[];
double   g_bufM30Low[];
double   g_bufM30High[];
double   g_bufAtr[];

#define TPB2_GV_BASELINE   "TPB2_XAU_BASELINE"
#define TPB2_GV_DAYKEY     "TPB2_XAU_DAYKEY"
#define TPB2_GV_DAYEQ      "TPB2_XAU_DAYEQ"
#define TPB2_GV_DAILY_LAT  "TPB2_XAU_DAILY_LAT"
#define TPB2_GV_TOTAL_LAT  "TPB2_XAU_TOTAL_LAT"
#define TPB2_GV_PASSED_LAT "TPB2_XAU_PASSED_LAT"
#define TPB2_GV_TRADES     "TPB2_XAU_TRADES"
#define TPB2_GV_SLSTOP     "TPB2_XAU_SLSTOP"
#define TPB2_GV_WINSTOP    "TPB2_XAU_WINSTOP"
#define TPB2_GV_FORCEDONE  "TPB2_XAU_FORCEDONE"

#define DASH_PFX "TPB2_DASH_"
#define DASH_PX  12
#define DASH_PY  24
#define DASH_RH  16
#define DASH_W   440
#define DASH_C1  8
#define DASH_C2  188
#define DASH_C3  328

#define ENTRY_STRICT   0
#define ENTRY_RELAXED  1
#define ENTRY_FORCE    2

struct SignalSnapshot
{
   int    h4Bias;
   int    h4WeakBias;
   bool   adxOk;
   double adx;
   bool   pullLong;
   bool   pullShort;
   bool   softLong;
   bool   softShort;
   bool   m30AboveEma;
   bool   m30BelowEma;
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
      Print("TrendPullback v2: using XAUUSDm");
      return "XAUUSDm";
   }
   if(sym == "XAUUSDm" && SymbolSelect("XAUUSD", true))
   {
      Print("TrendPullback v2: using XAUUSD");
      return "XAUUSD";
   }
   return sym;
}

//+------------------------------------------------------------------+
bool NewsFilterActive()
{
   if(MQLInfoInteger(MQL_TESTER) && InpDisableNewsInTester)
      return false;
   return InpUseNewsFilter;
}

//+------------------------------------------------------------------+
bool IsPastServerTime(const int hour, const int minute)
{
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   if(dt.hour > hour)
      return true;
   if(dt.hour == hour && dt.min >= minute)
      return true;
   return false;
}

//+------------------------------------------------------------------+
bool AdxOkForEntryMode(const SignalSnapshot &sig, const int entryMode)
{
   if(!InpUseADXFilter)
      return true;
   if(entryMode >= ENTRY_FORCE)
      return (sig.adx >= InpADXMinRelaxed - 2.0);
   if(entryMode == ENTRY_RELAXED)
      return (sig.adx >= InpADXMinRelaxed);
   return sig.adxOk;
}

//+------------------------------------------------------------------+
double MaxSlAtrForMode(const int entryMode)
{
   if(entryMode >= ENTRY_RELAXED)
      return InpMaxSL_ATR_Relaxed;
   return InpMaxSL_ATR;
}

//+------------------------------------------------------------------+
string DashPad(const string s, const int w)
{
   string out = s;
   while(StringLen(out) < w)
      out += " ";
   return out;
}

//+------------------------------------------------------------------+
string DashTrunc(const string s, const int n)
{
   if(StringLen(s) <= n)
      return s;
   return StringSubstr(s, 0, n - 1) + "~";
}

//+------------------------------------------------------------------+
string DashDayName(const int dow)
{
   switch(dow)
   {
      case 1:  return "Mon";
      case 2:  return "Tue";
      case 3:  return "Wed";
      case 4:  return "Thu";
      case 5:  return "Fri";
      case 6:  return "Sat";
      case 0:  return "Sun";
      default: return "";
   }
}

//+------------------------------------------------------------------+
string DashProgressBar(const double current, const double maxVal, const int width)
{
   if(maxVal <= 0.0)
      return "";
   double pct = MathMin(1.0, MathMax(0.0, current / maxVal));
   int filled = (int)MathRound(pct * (double)width);
   string bar = "[";
   for(int i = 0; i < width; i++)
      bar += (i < filled) ? "=" : "-";
   bar += "] " + DoubleToString(pct * 100.0, 0) + "%";
   return bar;
}

//+------------------------------------------------------------------+
void DashLabel(const string id, const int x, const int y, const string txt,
               const color clr, const int sz = 9)
{
   const string n = DASH_PFX + id;
   if(ObjectFind(0, n) < 0)
   {
      ObjectCreate(0, n, OBJ_LABEL, 0, 0, 0);
      ObjectSetInteger(0, n, OBJPROP_CORNER, CORNER_LEFT_UPPER);
      ObjectSetInteger(0, n, OBJPROP_ANCHOR, ANCHOR_LEFT_UPPER);
      ObjectSetString(0, n, OBJPROP_FONT, "Consolas");
      ObjectSetInteger(0, n, OBJPROP_BACK, false);
      ObjectSetInteger(0, n, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, n, OBJPROP_HIDDEN, true);
   }
   ObjectSetInteger(0, n, OBJPROP_XDISTANCE, x);
   ObjectSetInteger(0, n, OBJPROP_YDISTANCE, y);
   if(ObjectGetString(0, n, OBJPROP_TEXT) != txt)
      ObjectSetString(0, n, OBJPROP_TEXT, txt);
   if((color)ObjectGetInteger(0, n, OBJPROP_COLOR) != clr)
      ObjectSetInteger(0, n, OBJPROP_COLOR, clr);
   if((int)ObjectGetInteger(0, n, OBJPROP_FONTSIZE) != sz)
      ObjectSetInteger(0, n, OBJPROP_FONTSIZE, sz);
}

//+------------------------------------------------------------------+
void DashCreateBackground()
{
   const string n = DASH_PFX + "BG";
   if(ObjectFind(0, n) < 0)
      ObjectCreate(0, n, OBJ_RECTANGLE_LABEL, 0, 0, 0);
   ObjectSetInteger(0, n, OBJPROP_XDISTANCE, DASH_PX - 8);
   ObjectSetInteger(0, n, OBJPROP_YDISTANCE, DASH_PY - 8);
   ObjectSetInteger(0, n, OBJPROP_XSIZE, DASH_W);
   ObjectSetInteger(0, n, OBJPROP_YSIZE, 32 * DASH_RH + 16);
   ObjectSetInteger(0, n, OBJPROP_BGCOLOR, C'12,16,26');
   ObjectSetInteger(0, n, OBJPROP_BORDER_TYPE, BORDER_FLAT);
   ObjectSetInteger(0, n, OBJPROP_COLOR, C'55,140,220');
   ObjectSetInteger(0, n, OBJPROP_CORNER, CORNER_LEFT_UPPER);
   ObjectSetInteger(0, n, OBJPROP_BACK, false);
   ObjectSetInteger(0, n, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, n, OBJPROP_HIDDEN, true);
}

//+------------------------------------------------------------------+
void DashDeleteAll()
{
   ObjectsDeleteAll(0, DASH_PFX);
   Comment("");
   ChartRedraw(0);
}

//+------------------------------------------------------------------+
void InitIndicatorBuffers()
{
   ArrayResize(g_buf1, 4);
   ArrayResize(g_bufM30Ema, 4);
   ArrayResize(g_bufM30Close, 4);
   ArrayResize(g_bufM30Open, 4);
   ArrayResize(g_bufH4Close, 2);
   ArrayResize(g_bufH4Adx, 2);
   ArrayResize(g_bufM30Low, 4);
   ArrayResize(g_bufM30High, 4);
   ArrayResize(g_bufAtr, 2);
   ArrayResize(g_bufSwing, MathMax(8, InpM30SwingBars + 2));
   ArraySetAsSeries(g_buf1, true);
   ArraySetAsSeries(g_bufM30Ema, true);
   ArraySetAsSeries(g_bufM30Close, true);
   ArraySetAsSeries(g_bufM30Open, true);
   ArraySetAsSeries(g_bufH4Close, true);
   ArraySetAsSeries(g_bufH4Adx, true);
   ArraySetAsSeries(g_bufM30Low, true);
   ArraySetAsSeries(g_bufM30High, true);
   ArraySetAsSeries(g_bufAtr, true);
   ArraySetAsSeries(g_bufSwing, true);
}

//+------------------------------------------------------------------+
void InvalidatePosCache()
{
   g_posCacheReady = false;
}

//+------------------------------------------------------------------+
void RefreshPosCache()
{
   if(g_posCacheReady)
      return;

   g_posCacheReady = true;
   g_ourPosCount = 0;
   g_ourPosTicket = 0;
   g_ourPosPnl = 0.0;
   const long magic = (long)MagicNumber;

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong tk = PositionGetTicket(i);
      if(tk == 0)
         continue;
      if(!PositionSelectByTicket(tk))
         continue;
      if(PositionGetInteger(POSITION_MAGIC) != magic)
         continue;
      if(PositionGetString(POSITION_SYMBOL) != g_sym)
         continue;

      g_ourPosCount++;
      g_ourPosPnl += PositionGetDouble(POSITION_PROFIT)
                   + PositionGetDouble(POSITION_SWAP)
                   + PositionGetDouble(POSITION_COMMISSION);

      if(g_ourPosTicket == 0)
      {
         g_ourPosTicket = tk;
         g_ourPosType = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
         g_ourPosEntry = PositionGetDouble(POSITION_PRICE_OPEN);
         g_ourPosSl = PositionGetDouble(POSITION_SL);
         g_ourPosTp = PositionGetDouble(POSITION_TP);
      }
   }
}

//+------------------------------------------------------------------+
double GetOurFloatingPnlUsd()
{
   RefreshPosCache();
   return g_ourPosPnl;
}

//+------------------------------------------------------------------+
void GetChallengeStatus(string &status, color &statusClr)
{
   status = "RUNNING";
   statusClr = C'70,205,115';
   if(g_challengePassedLatched)
   {
      status = "CHALLENGE PASSED";
      statusClr = clrGold;
      return;
   }
   if(g_totalStopLatched)
   {
      status = "MAX DD STOP";
      statusClr = C'220,85,85';
      return;
   }
   if(g_dailyStopLatched)
   {
      status = "DAILY DD STOP";
      statusClr = C'255,155,35';
      return;
   }
   if(g_dailySlStopLatched)
   {
      status = "1 LOSS TODAY";
      statusClr = C'255,155,35';
      return;
   }
   if(g_dailyWinStopLatched)
   {
      status = "1 WIN TODAY";
      statusClr = clrGold;
      return;
   }
   if(InpMaxTradesPerDay > 0 && g_tradesToday >= InpMaxTradesPerDay)
   {
      status = "MAX TRADES";
      statusClr = C'255,155,35';
   }
}

//+------------------------------------------------------------------+
int OnInit()
{
   g_sym = ResolveTradableSymbol(InpTradeSymbol);
   if(!SymbolSelect(g_sym, true))
   {
      Print("TrendPullback v2: symbol not available: ", g_sym);
      return INIT_FAILED;
   }

   trade.SetExpertMagicNumber(MagicNumber);
   trade.SetDeviationInPoints(SlippagePoints);

   g_point = SymbolInfoDouble(g_sym, SYMBOL_POINT);
   g_volMin = SymbolInfoDouble(g_sym, SYMBOL_VOLUME_MIN);
   g_volMax = SymbolInfoDouble(g_sym, SYMBOL_VOLUME_MAX);
   g_volStep = SymbolInfoDouble(g_sym, SYMBOL_VOLUME_STEP);
   g_tickSize = SymbolInfoDouble(g_sym, SYMBOL_TRADE_TICK_SIZE);
   g_tickValue = SymbolInfoDouble(g_sym, SYMBOL_TRADE_TICK_VALUE);

   if(g_volStep <= 0 || g_tickSize <= 0 || g_tickValue <= 0 || g_point <= 0)
   {
      Print("TrendPullback: invalid symbol trade parameters");
      return INIT_FAILED;
   }

   g_digits = (int)SymbolInfoInteger(g_sym, SYMBOL_DIGITS);
   g_stopsLevel = (int)SymbolInfoInteger(g_sym, SYMBOL_TRADE_STOPS_LEVEL);
   g_freezeLevel = (int)SymbolInfoInteger(g_sym, SYMBOL_TRADE_FREEZE_LEVEL);
   g_minStopDist = (double)MathMax(g_stopsLevel, g_freezeLevel) * g_point;

   g_h4Fast = iMA(g_sym, PERIOD_H4, InpH4FastEMA, 0, MODE_EMA, PRICE_CLOSE);
   g_h4Slow = iMA(g_sym, PERIOD_H4, InpH4SlowEMA, 0, MODE_EMA, PRICE_CLOSE);
   g_h4Adx  = iADX(g_sym, PERIOD_H4, InpADXPeriodH4);
   g_m30Pull = iMA(g_sym, PERIOD_M30, InpM30PullbackEMA, 0, MODE_EMA, PRICE_CLOSE);
   g_m30Atr = iATR(g_sym, PERIOD_M30, InpATRPeriodM30);

   if(g_h4Fast == INVALID_HANDLE || g_h4Slow == INVALID_HANDLE ||
      g_h4Adx == INVALID_HANDLE ||
      g_m30Pull == INVALID_HANDLE || g_m30Atr == INVALID_HANDLE)
   {
      Print("TrendPullback v2: indicator create failed");
      return INIT_FAILED;
   }

   InitIndicatorBuffers();

   LoadPropPersistedState();
   RefreshDayBaseline();
   PersistPropState();

   Print("TrendPullback_XAU_v2 started | ", g_sym,
         " | RR 1:", DoubleToString(InpRewardMultiple, 1),
         " | risk ", InpUseRiskPercent ? DoubleToString(InpRiskPercent, 2) + "%" : "fixed lots");

   if(InpUsePropLimits)
   {
      Print("Prop Phase 1 | baseline $", DoubleToString(g_baselineEquity, 2),
            " | daily DD max $", DoubleToString(InpMaxDailyLossUSD, 2),
            " | total DD max $", DoubleToString(InpMaxTotalLossUSD, 2),
            " | profit target $", DoubleToString(InpPhase1ProfitUSD, 2));
   }

   if(InpShowDashboard)
   {
      DashCreateBackground();
      const int dashSec = MathMax(1, InpDashboardSeconds);
      EventSetTimer(dashSec);
      UpdateDashboard();
   }

   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   if(InpShowDashboard)
      DashDeleteAll();
   if(g_h4Fast != INVALID_HANDLE) IndicatorRelease(g_h4Fast);
   if(g_h4Slow != INVALID_HANDLE) IndicatorRelease(g_h4Slow);
   if(g_h4Adx != INVALID_HANDLE)  IndicatorRelease(g_h4Adx);
   if(g_m30Pull != INVALID_HANDLE) IndicatorRelease(g_m30Pull);
   if(g_m30Atr != INVALID_HANDLE) IndicatorRelease(g_m30Atr);
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
   if((ulong)HistoryDealGetInteger(trans.deal, DEAL_MAGIC) != MagicNumber)
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
      PersistPropState();
      Print("TrendPullback v2: losing close — no more entries today");
   }
   else if(profit > 0.01 && InpStopAfterDailyWin)
   {
      g_dailyWinStopLatched = true;
      PersistPropState();
      Print("TrendPullback v2: winning close — done for today");
   }

   g_beTicket = 0;
   g_beApplied = false;
   g_beInitialRisk = 0.0;
   ResetTrailState();
}

//+------------------------------------------------------------------+
void OnTimer()
{
   if(InpShowDashboard)
      UpdateDashboard();

   if(!InpRequireMinOneTradePerDay)
      return;
   if(!IsPastServerTime(InpRelaxedEntryHour, 0))
      return;

   InvalidatePosCache();
   RefreshPosCache();
   if(g_tradesToday == 0 && g_ourPosCount == 0 && CanOpenNewTrade())
      EvaluateDailyEntries();
}

//+------------------------------------------------------------------+
void PersistPropState()
{
   GlobalVariableSet(TPB2_GV_BASELINE, g_baselineEquity);
   GlobalVariableSet(TPB2_GV_DAYKEY, (double)g_dayKey);
   GlobalVariableSet(TPB2_GV_DAYEQ, g_dayStartEquity);
   GlobalVariableSet(TPB2_GV_DAILY_LAT, g_dailyStopLatched ? 1.0 : 0.0);
   GlobalVariableSet(TPB2_GV_TOTAL_LAT, g_totalStopLatched ? 1.0 : 0.0);
   GlobalVariableSet(TPB2_GV_PASSED_LAT, g_challengePassedLatched ? 1.0 : 0.0);
   GlobalVariableSet(TPB2_GV_TRADES, (double)g_tradesToday);
   GlobalVariableSet(TPB2_GV_SLSTOP, g_dailySlStopLatched ? 1.0 : 0.0);
   GlobalVariableSet(TPB2_GV_WINSTOP, g_dailyWinStopLatched ? 1.0 : 0.0);
   GlobalVariableSet(TPB2_GV_FORCEDONE, g_forceAttemptedToday ? 1.0 : 0.0);
}

//+------------------------------------------------------------------+
void LoadPropPersistedState()
{
   double eq = AccountInfoDouble(ACCOUNT_EQUITY);

   if(GlobalVariableCheck(TPB2_GV_BASELINE))
      g_baselineEquity = GlobalVariableGet(TPB2_GV_BASELINE);
   else if(InpUsePropLimits)
      g_baselineEquity = (InpAccountBaseline > 0.0) ? InpAccountBaseline : eq;
   else
      g_baselineEquity = eq;

   if(GlobalVariableCheck(TPB2_GV_DAYKEY))
      g_dayKey = (int)GlobalVariableGet(TPB2_GV_DAYKEY);
   if(GlobalVariableCheck(TPB2_GV_DAYEQ))
      g_dayStartEquity = GlobalVariableGet(TPB2_GV_DAYEQ);
   if(GlobalVariableCheck(TPB2_GV_DAILY_LAT))
      g_dailyStopLatched = (GlobalVariableGet(TPB2_GV_DAILY_LAT) > 0.5);
   if(GlobalVariableCheck(TPB2_GV_TOTAL_LAT))
      g_totalStopLatched = (GlobalVariableGet(TPB2_GV_TOTAL_LAT) > 0.5);
   if(GlobalVariableCheck(TPB2_GV_PASSED_LAT))
      g_challengePassedLatched = (GlobalVariableGet(TPB2_GV_PASSED_LAT) > 0.5);
   if(GlobalVariableCheck(TPB2_GV_TRADES))
      g_tradesToday = (int)GlobalVariableGet(TPB2_GV_TRADES);
   if(GlobalVariableCheck(TPB2_GV_SLSTOP))
      g_dailySlStopLatched = (GlobalVariableGet(TPB2_GV_SLSTOP) > 0.5);
   if(GlobalVariableCheck(TPB2_GV_WINSTOP))
      g_dailyWinStopLatched = (GlobalVariableGet(TPB2_GV_WINSTOP) > 0.5);
   if(GlobalVariableCheck(TPB2_GV_FORCEDONE))
      g_forceAttemptedToday = (GlobalVariableGet(TPB2_GV_FORCEDONE) > 0.5);

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
      g_dailyWinStopLatched = false;
      g_forceAttemptedToday = false;
      g_tradesToday = 0;
      PersistPropState();
      if(InpUsePropLimits)
         Print("TrendPullback v2: new day — daily limits reset | equity $",
               DoubleToString(g_dayStartEquity, 2));
   }
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
double ProfitFromBaselineUSD(const double equity)
{
   return equity - g_baselineEquity;
}

//+------------------------------------------------------------------+
bool IsDailyDrawdownHit(const double equity)
{
   if(!InpUsePropLimits || g_dailyStopLatched)
      return g_dailyStopLatched;
   if(InpMaxDailyLossUSD <= 0.0)
      return false;

   if(DailyLossUSD(equity) >= InpMaxDailyLossUSD - 0.01)
   {
      g_dailyStopLatched = true;
      PersistPropState();
      Print("TrendPullback v2: DAILY drawdown limit hit ($",
            DoubleToString(InpMaxDailyLossUSD, 2), ") — no new entries today");
      return true;
   }
   return false;
}

//+------------------------------------------------------------------+
bool IsTotalDrawdownHit(const double equity)
{
   if(!InpUsePropLimits || g_totalStopLatched)
      return g_totalStopLatched;
   if(InpMaxTotalLossUSD <= 0.0)
      return false;

   if(TotalLossUSD(equity) >= InpMaxTotalLossUSD - 0.01)
   {
      g_totalStopLatched = true;
      PersistPropState();
      Print("TrendPullback v2: MAX drawdown limit hit ($",
            DoubleToString(InpMaxTotalLossUSD, 2), ") — no new entries");
      return true;
   }
   return false;
}

//+------------------------------------------------------------------+
void CheckPhase1ProfitTarget(const double equity)
{
   if(!InpUsePropLimits || g_challengePassedLatched)
      return;
   if(InpPhase1ProfitUSD <= 0.0)
      return;

   const double profit = ProfitFromBaselineUSD(equity);
   if(profit < InpPhase1ProfitUSD - 0.01)
      return;

   g_challengePassedLatched = true;
   PersistPropState();
   if(InpShowDashboard)
      UpdateDashboard();

   Print("========================================");
   Print("TrendPullback v2: *** CHALLENGE PASSED ***");
   Print("Phase 1 profit target reached: $", DoubleToString(profit, 2),
         " (target $", DoubleToString(InpPhase1ProfitUSD, 2), ")");
   if(InpStopNewTradesOnPass)
      Print("New trades are blocked. Existing positions still trail per EA rules.");
   Print("========================================");
   Alert("TrendPullback v2: CHALLENGE PASSED — Phase 1 target $",
         DoubleToString(InpPhase1ProfitUSD, 2), " hit!");
}

//+------------------------------------------------------------------+
void UpdateEntryBlockFlag(const double equity)
{
   g_blockNewEntries = false;
   if(!InpUsePropLimits)
      return;
   if(g_challengePassedLatched && InpStopNewTradesOnPass)
   {
      g_blockNewEntries = true;
      return;
   }
   if(IsTotalDrawdownHit(equity))
   {
      g_blockNewEntries = true;
      return;
   }
   if(IsDailyDrawdownHit(equity))
      g_blockNewEntries = true;
}

//+------------------------------------------------------------------+
bool PropAllowsNewEntries()
{
   if(!InpUsePropLimits)
      return true;
   return !g_blockNewEntries;
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
   if(!NewsFilterActive())
   {
      ArrayResize(g_newsValues, 0);
      return;
   }
   datetime nowSrv = TimeTradeServer();
   if(g_lastNewsRefresh > 0 && (nowSrv - g_lastNewsRefresh) < InpNewsRefreshSeconds)
      return;
   g_lastNewsRefresh = nowSrv;

   const int aft = InpNewsMinutesAfter * 60;
   const int bef = InpNewsMinutesBefore * 60;
   datetime from = nowSrv - aft - 3600;
   datetime to   = nowSrv + bef + 86400;

   MqlCalendarValue vals[];
   ArrayResize(vals, 0);
   const int n = CalendarValueHistory(vals, from, to, "", "USD");
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
   if(!NewsFilterActive())
      return false;
   RefreshNewsCache();

   datetime nowSrv = TimeTradeServer();
   const int beforeSec = InpNewsMinutesBefore * 60;
   const int afterSec  = InpNewsMinutesAfter * 60;
   const int minImp    = (int)InpNewsMinImportance;

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
         detail = TimeToString(t, TIME_DATE | TIME_MINUTES) + " " + ev.name;
         return true;
      }
   }
   return false;
}

//+------------------------------------------------------------------+
bool StrategyFiltersAllowTrading()
{
   if(g_dailySlStopLatched && InpStopAfterDailySL)
      return false;
   if(g_dailyWinStopLatched && InpStopAfterDailyWin)
      return false;
   if(InpMaxTradesPerDay > 0 && g_tradesToday >= InpMaxTradesPerDay)
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
   return true;
}

//+------------------------------------------------------------------+
bool CanOpenNewTrade()
{
   if(!PropAllowsNewEntries())
      return false;
   return StrategyFiltersAllowTrading();
}

//+------------------------------------------------------------------+
void UpdateDashboard()
{
   if(!InpShowDashboard)
      return;

   const int lx = DASH_PX + DASH_C1;
   const int bx = DASH_PX + DASH_C2;
   const int sx = DASH_PX + DASH_C3;
   int y = DASH_PY;
   const int rh = DASH_RH;
   const int LW = 16;

   const color cLbl  = C'120,132,160';
   const color cVal  = C'210,215,230';
   const color cGood = C'70,205,115';
   const color cBad  = C'220,85,85';
   const color cWarn = C'255,155,35';
   const color cDim  = C'50,62,88';
   const color cBuy  = C'70,205,115';
   const color cSell = C'220,85,85';
   const color cGold = C'255,200,60';

   const double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   const double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   const double floatPnl = GetOurFloatingPnlUsd();
   const double dayPnl = equity - g_dayStartEquity;

   DashLabel("hdr", lx, y, "TrendPullback XAU v2.02   " + g_sym, cGold, 10);
   y += rh + 2;
   DashLabel("sub", lx, y, "Strict -> relaxed 10h -> force 12h | 1 trade/day", cDim, 8);
   y += rh + 4;

   if(InpUsePropLimits)
   {
      string status = "";
      color statusClr = cVal;
      GetChallengeStatus(status, statusClr);

      const double profit = ProfitFromBaselineUSD(equity);
      const double profitLeft = MathMax(0.0, InpPhase1ProfitUSD - profit);
      const double dLoss = DailyLossUSD(equity);
      const double tLoss = TotalLossUSD(equity);
      const double profitShow = MathMax(0.0, profit);

      DashLabel("sep_prop", lx, y, "  CHALLENGE — PHASE 1", cDim, 8);
      y += rh;

      DashLabel("lbl_stat", lx, y, DashPad("Status", LW), cLbl);
      DashLabel("val_stat", bx, y, status, statusClr, 9);
      y += rh;

      DashLabel("lbl_eq", lx, y, DashPad("Equity", LW), cLbl);
      DashLabel("val_eq", bx, y, "$" + DoubleToString(equity, 2), cVal);
      DashLabel("val_base", sx, y, "base $" + DoubleToString(g_baselineEquity, 2), cDim, 8);
      y += rh;

      DashLabel("lbl_p1", lx, y, DashPad("Phase 1 P/L", LW), cLbl);
      DashLabel("val_p1", bx, y,
                "$" + DoubleToString(profit, 2) + " / $" + DoubleToString(InpPhase1ProfitUSD, 2),
                profit >= InpPhase1ProfitUSD - 0.01 ? cGold : (profit >= 0 ? cGood : cBad));
      DashLabel("val_p1l", sx, y, "left $" + DoubleToString(profitLeft, 2), cDim, 8);
      y += rh;

      DashLabel("bar_p1", lx, y, DashProgressBar(profitShow, InpPhase1ProfitUSD, 18), cGood, 8);
      y += rh;

      DashLabel("lbl_dd_d", lx, y, DashPad("Daily DD", LW), cLbl);
      DashLabel("val_dd_d", bx, y,
                "$" + DoubleToString(dLoss, 2) + " / $" + DoubleToString(InpMaxDailyLossUSD, 2),
                dLoss >= InpMaxDailyLossUSD * 0.85 ? cBad : (dLoss >= InpMaxDailyLossUSD * 0.5 ? cWarn : cVal));
      y += rh;

      DashLabel("bar_dd_d", lx, y, DashProgressBar(dLoss, InpMaxDailyLossUSD, 18),
                dLoss >= InpMaxDailyLossUSD * 0.85 ? cBad : cWarn, 8);
      y += rh;

      DashLabel("lbl_dd_t", lx, y, DashPad("Max DD", LW), cLbl);
      DashLabel("val_dd_t", bx, y,
                "$" + DoubleToString(tLoss, 2) + " / $" + DoubleToString(InpMaxTotalLossUSD, 2),
                tLoss >= InpMaxTotalLossUSD * 0.85 ? cBad : (tLoss >= InpMaxTotalLossUSD * 0.5 ? cWarn : cVal));
      y += rh;

      DashLabel("bar_dd_t", lx, y, DashProgressBar(tLoss, InpMaxTotalLossUSD, 18),
                tLoss >= InpMaxTotalLossUSD * 0.85 ? cBad : cWarn, 8);
      y += rh + 2;
   }

   DashLabel("sep_acct", lx, y, "  ACCOUNT", cDim, 8);
   y += rh;

   MqlDateTime sdt;
   TimeToStruct(TimeCurrent(), sdt);
   string timeStr = DashDayName(sdt.day_of_week) + "  "
                    + TimeToString(TimeCurrent(), TIME_DATE | TIME_MINUTES);

   DashLabel("lbl_time", lx, y, DashPad("Server time", LW), cLbl);
   DashLabel("val_time", bx, y, timeStr, cVal);
   y += rh;

   DashLabel("lbl_bal", lx, y, DashPad("Balance", LW), cLbl);
   DashLabel("val_bal", bx, y, "$" + DoubleToString(balance, 2), cVal);
   y += rh;

   DashLabel("lbl_day", lx, y, DashPad("Today P/L", LW), cLbl);
   DashLabel("val_day", bx, y, (dayPnl >= 0 ? "+" : "") + "$" + DoubleToString(dayPnl, 2),
             dayPnl >= 0 ? cGood : cBad);
   y += rh;

   DashLabel("lbl_flt", lx, y, DashPad("Float P/L", LW), cLbl);
   DashLabel("val_flt", bx, y, (floatPnl >= 0 ? "+" : "") + "$" + DoubleToString(floatPnl, 2),
             floatPnl >= 0 ? cGood : cBad);
   y += rh + 2;

   DashLabel("sep_mkt", lx, y, "  FILTERS & SIGNALS", cDim, 8);
   y += rh;

   SignalSnapshot sig;
   LoadSignalSnapshot(sig);

   string h4Str = "FLAT";
   color h4Clr = cDim;
   if(sig.valid && sig.h4Bias > 0)
   {
      h4Str = "BULL (H4)";
      h4Clr = cBuy;
   }
   else if(sig.valid && sig.h4Bias < 0)
   {
      h4Str = "BEAR (H4)";
      h4Clr = cSell;
   }

   DashLabel("lbl_h4", lx, y, DashPad("H4 trend", LW), cLbl);
   DashLabel("val_h4", bx, y, h4Str, h4Clr);
   y += rh;

   DashLabel("lbl_adx", lx, y, DashPad("H4 ADX", LW), cLbl);
   if(!InpUseADXFilter)
      DashLabel("val_adx", bx, y, "OFF", cDim);
   else if(!sig.valid)
      DashLabel("val_adx", bx, y, "—", cDim);
   else
      DashLabel("val_adx", bx, y, DoubleToString(sig.adx, 1) + " / " + DoubleToString(InpADXMinLevel, 0),
                sig.adxOk ? cGood : cBad);
   y += rh;

   DashLabel("lbl_sess", lx, y, DashPad("Session", LW), cLbl);
   DashLabel("val_sess", bx, y, InSession() ? "OPEN" : "CLOSED",
             InSession() ? cGood : cWarn);
   y += rh;

   DashLabel("lbl_trd", lx, y, DashPad("Trades today", LW), cLbl);
   DashLabel("val_trd", bx, y, IntegerToString(g_tradesToday) + " / " + IntegerToString(InpMaxTradesPerDay), cVal);
   string dayStat = "OK";
   color dayClr = cVal;
   if(g_dailyWinStopLatched)
   {
      dayStat = "Won — done";
      dayClr = clrGold;
   }
   else if(g_dailySlStopLatched)
   {
      dayStat = "Lost — done";
      dayClr = cBad;
   }
   else if(g_tradesToday == 0 && InpRequireMinOneTradePerDay)
      dayStat = "Awaiting trade";
   DashLabel("val_dayst", sx, y, dayStat, dayClr, 8);
   y += rh;

   const long spreadPts = SymbolInfoInteger(g_sym, SYMBOL_SPREAD);
   DashLabel("lbl_spr", lx, y, DashPad("Spread", LW), cLbl);
   DashLabel("val_spr", bx, y, IntegerToString(spreadPts) + " pts",
             spreadPts > InpMaxSpreadPoints ? cBad : cVal);
   y += rh;

   RefreshPosCache();
   bool entriesOk = CanOpenNewTrade();
   string entStr = entriesOk ? "ALLOWED" : "BLOCKED";
   color entClr = entriesOk ? cGood : cBad;
   if(StringLen(g_lastNewsDetail) > 0)
      entStr = "NEWS BLOCK";

   DashLabel("lbl_ent", lx, y, DashPad("New entries", LW), cLbl);
   DashLabel("val_ent", bx, y, entStr, entClr);
   y += rh + 2;

   DashLabel("sep_pos", lx, y, "  OPEN POSITION", cDim, 8);
   y += rh;

   if(g_ourPosTicket != 0)
   {
      const ulong ticket = g_ourPosTicket;
      const ENUM_POSITION_TYPE ptype = g_ourPosType;
      const double entry = g_ourPosEntry;
      const double sl = g_ourPosSl;
      const double posPnl = g_ourPosPnl;
      string side = (ptype == POSITION_TYPE_BUY) ? "LONG" : "SHORT";
      color sideClr = (ptype == POSITION_TYPE_BUY) ? cBuy : cSell;

      DashLabel("lbl_side", lx, y, DashPad("Side", LW), cLbl);
      DashLabel("val_side", bx, y, side + "  #" + IntegerToString((long)ticket), sideClr);
      y += rh;

      DashLabel("lbl_en", lx, y, DashPad("Entry / SL", LW), cLbl);
      DashLabel("val_en", bx, y,
                DoubleToString(entry, g_digits) + " / " + DoubleToString(sl, g_digits), cVal);
      y += rh;

      DashLabel("lbl_pp", lx, y, DashPad("Position P/L", LW), cLbl);
      DashLabel("val_pp", bx, y, (posPnl >= 0 ? "+" : "") + "$" + DoubleToString(posPnl, 2),
                posPnl >= 0 ? cGood : cBad);
      y += rh;

      string trailStr = g_beApplied ? "BE set" : ("BE @" + DoubleToString(InpBreakEvenAtR, 1) + "R");
      if(InpUseTrailAfterBE && g_trailingActive)
         trailStr = "TRAIL active";
      else if(InpUseTrailAfterBE && g_beApplied)
         trailStr = "BE | trail @" + DoubleToString(InpTrailActivateR, 1) + "R";

      DashLabel("lbl_tr", lx, y, DashPad("Manage SL", LW), cLbl);
      DashLabel("val_tr", bx, y, trailStr, g_trailingActive ? cWarn : (g_beApplied ? cGood : cDim));
   }
   else
   {
      DashLabel("lbl_nop", lx, y, DashPad("Status", LW), cLbl);
      DashLabel("val_nop", bx, y, "No open position", cDim);
      y += rh;
      DashLabel("lbl_sig", lx, y, DashPad("M30 setup", LW), cLbl);
      string setup = "—";
      color sigClr = cDim;
      if(sig.valid && sig.adxOk && sig.h4Bias == 1 && sig.pullLong)
      {
         setup = "LONG ready";
         sigClr = cBuy;
      }
      else if(sig.valid && sig.adxOk && sig.h4Bias == -1 && sig.pullShort)
      {
         setup = "SHORT ready";
         sigClr = cSell;
      }
      else if(sig.valid && !sig.adxOk)
      {
         setup = "ADX too low";
         sigClr = cWarn;
      }
      DashLabel("val_sig", bx, y, setup, sigClr);
   }

   ChartRedraw(0);
}

//+------------------------------------------------------------------+
void EvaluatePropLimits()
{
   RefreshDayBaseline();

   const double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   if(InpUsePropLimits)
   {
      IsTotalDrawdownHit(equity);
      IsDailyDrawdownHit(equity);
      CheckPhase1ProfitTarget(equity);
   }
   UpdateEntryBlockFlag(equity);
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
double SwingExtremeM30(const bool wantLow, const int start_shift, const int bars)
{
   if(bars <= 0)
      return 0.0;
   if(ArraySize(g_bufSwing) < bars)
      ArrayResize(g_bufSwing, bars);

   const int copied = wantLow
      ? CopyLow(g_sym, PERIOD_M30, start_shift, bars, g_bufSwing)
      : CopyHigh(g_sym, PERIOD_M30, start_shift, bars, g_bufSwing);
   if(copied < bars)
      return 0.0;

   double extreme = g_bufSwing[0];
   for(int i = 1; i < bars; i++)
   {
      if(wantLow)
      {
         if(g_bufSwing[i] < extreme)
            extreme = g_bufSwing[i];
      }
      else if(g_bufSwing[i] > extreme)
         extreme = g_bufSwing[i];
   }
   return extreme;
}

//+------------------------------------------------------------------+
bool Copy1(const int handle, double &outVal, const int shift)
{
   if(CopyBuffer(handle, 0, shift, 1, g_buf1) != 1)
      return false;
   outVal = g_buf1[0];
   return true;
}

//+------------------------------------------------------------------+
bool LoadSignalSnapshot(SignalSnapshot &sig)
{
   sig.valid = false;
   sig.h4Bias = 0;
   sig.h4WeakBias = 0;
   sig.adxOk = true;
   sig.adx = 0.0;
   sig.pullLong = false;
   sig.pullShort = false;
   sig.softLong = false;
   sig.softShort = false;
   sig.m30AboveEma = false;
   sig.m30BelowEma = false;
   sig.atr = 0.0;
   sig.h4SlowEma = 0.0;

   if(CopyBuffer(g_h4Fast, 0, 1, 1, g_buf1) != 1)
      return false;
   const double emaF = g_buf1[0];
   if(CopyBuffer(g_h4Slow, 0, 1, 1, g_buf1) != 1)
      return false;
   const double emaS = g_buf1[0];
   if(CopyClose(g_sym, PERIOD_H4, 1, 1, g_bufH4Close) != 1)
      return false;
   const double cls = g_bufH4Close[0];
   sig.h4SlowEma = emaS;

   if(emaF > emaS && cls > emaS)
      sig.h4Bias = 1;
   else if(emaF < emaS && cls < emaS)
      sig.h4Bias = -1;

   if(emaF > emaS)
      sig.h4WeakBias = 1;
   else if(emaF < emaS)
      sig.h4WeakBias = -1;

   if(InpUseADXFilter)
   {
      if(CopyBuffer(g_h4Adx, 0, 1, 1, g_bufH4Adx) != 1)
         return false;
      sig.adx = g_bufH4Adx[0];
      sig.adxOk = (sig.adx >= InpADXMinLevel);
   }

   if(CopyBuffer(g_m30Pull, 0, 1, 3, g_bufM30Ema) != 3)
      return false;
   if(CopyClose(g_sym, PERIOD_M30, 1, 3, g_bufM30Close) != 3)
      return false;
   if(CopyOpen(g_sym, PERIOD_M30, 1, 3, g_bufM30Open) != 3)
      return false;
   if(CopyLow(g_sym, PERIOD_M30, 1, 3, g_bufM30Low) != 3)
      return false;
   if(CopyHigh(g_sym, PERIOD_M30, 1, 3, g_bufM30High) != 3)
      return false;
   if(CopyBuffer(g_m30Atr, 0, 1, 1, g_bufAtr) != 1)
      return false;

   const double e1 = g_bufM30Ema[0], e2 = g_bufM30Ema[1], e3 = g_bufM30Ema[2];
   const double c1 = g_bufM30Close[0], c2 = g_bufM30Close[1], c3 = g_bufM30Close[2];
   const double o1 = g_bufM30Open[0];
   const double l2 = g_bufM30Low[1], h2 = g_bufM30High[1];
   sig.atr = g_bufAtr[0];
   if(sig.atr <= 0.0)
      return false;

   const double depth = sig.atr * InpPullbackDepthATR;
   const bool baseLong  = (c2 < e2 && c1 > e1 && c3 > e3);
   const bool baseShort = (c2 > e2 && c1 < e1 && c3 < e3);
   sig.softLong = baseLong;
   sig.softShort = baseShort;

   bool strictLong = baseLong;
   bool strictShort = baseShort;

   if(strictLong)
   {
      if((e2 - l2) < depth)
         strictLong = false;
      if(InpRequireReclaimCandle && c1 <= o1)
         strictLong = false;
   }
   if(strictShort)
   {
      if((h2 - e2) < depth)
         strictShort = false;
      if(InpRequireReclaimCandle && c1 >= o1)
         strictShort = false;
   }

   sig.pullLong = strictLong;
   sig.pullShort = strictShort;
   sig.m30AboveEma = (c1 > e1);
   sig.m30BelowEma = (c1 < e1);
   sig.valid = true;
   return true;
}

//+------------------------------------------------------------------+
bool PassesH4Structure(const int direction, const double swingExtreme, const double h4SlowEma,
                       const int entryMode = ENTRY_STRICT)
{
   if(entryMode >= ENTRY_RELAXED)
      return true;
   if(!InpRequireH4Structure || swingExtreme <= 0.0 || h4SlowEma <= 0.0)
      return true;
   if(direction > 0)
      return (swingExtreme > h4SlowEma);
   return (swingExtreme < h4SlowEma);
}

//+------------------------------------------------------------------+
int DirectionForMode(const SignalSnapshot &sig, const int entryMode)
{
   if(entryMode >= ENTRY_FORCE)
      return sig.h4WeakBias;
   return sig.h4Bias;
}

//+------------------------------------------------------------------+
bool SignalOkForMode(const SignalSnapshot &sig, const int direction, const int entryMode)
{
   if(direction == 0)
      return false;
   if(!AdxOkForEntryMode(sig, entryMode))
      return false;

   if(entryMode == ENTRY_STRICT)
      return (direction > 0) ? sig.pullLong : sig.pullShort;
   if(entryMode == ENTRY_RELAXED)
      return (direction > 0) ? sig.softLong : sig.softShort;

   if(direction > 0)
      return sig.m30AboveEma;
   return sig.m30BelowEma;
}

//+------------------------------------------------------------------+
bool SlWithinMaxAtr(const double slDist, const double atr, const int entryMode)
{
   const double cap = MaxSlAtrForMode(entryMode);
   if(cap <= 0.0 || atr <= 0.0)
      return true;
   return (slDist <= cap * atr + g_point);
}

//+------------------------------------------------------------------+
int CountOurPositions()
{
   RefreshPosCache();
   return g_ourPosCount;
}

//+------------------------------------------------------------------+
bool FindOurPosition(ulong &ticket, ENUM_POSITION_TYPE &ptype,
                     double &entry, double &sl, double &tp)
{
   RefreshPosCache();
   if(g_ourPosTicket == 0)
   {
      ticket = 0;
      return false;
   }
   ticket = g_ourPosTicket;
   ptype = g_ourPosType;
   entry = g_ourPosEntry;
   sl = g_ourPosSl;
   tp = g_ourPosTp;
   return true;
}

//+------------------------------------------------------------------+
void ResetTrailState()
{
   g_trackedTicket = 0;
   g_initialRiskDist = 0.0;
   g_priceExtreme = 0.0;
   g_trailingActive = false;
}

//+------------------------------------------------------------------+
bool ClampSLBuy(const double bid, double &sl)
{
   const double minDist = (double)g_stopsLevel * g_point + g_point * 2.0;
   if(sl >= bid - minDist)
      sl = NormalizeDouble(bid - minDist, g_digits);
   return (sl > 0.0 && sl < bid);
}

//+------------------------------------------------------------------+
bool ClampSLSell(const double ask, double &sl)
{
   const double minDist = (double)g_stopsLevel * g_point + g_point * 2.0;
   if(sl <= ask + minDist)
      sl = NormalizeDouble(ask + minDist, g_digits);
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
      if((bid - entry) / g_beInitialRisk < triggerR)
         return;
      double newSL = entry + lockR * g_beInitialRisk;
      newSL = MathMax(newSL, sl);
      if(!ClampSLBuy(bid, newSL) || newSL <= sl + g_point * 0.5)
         return;
      if(PositionSelectByTicket(ticket) && trade.PositionModify(ticket, newSL, tp))
         g_beApplied = true;
   }
   else
   {
      if((entry - ask) / g_beInitialRisk < triggerR)
         return;
      double newSL = entry - lockR * g_beInitialRisk;
      if(sl > 0.0)
         newSL = MathMin(newSL, sl);
      if(!ClampSLSell(ask, newSL))
         return;
      if(sl > 0.0 && newSL >= sl - g_point * 0.5)
         return;
      if(PositionSelectByTicket(ticket) && trade.PositionModify(ticket, newSL, tp))
         g_beApplied = true;
   }
}

//+------------------------------------------------------------------+
void ManageTrailing()
{
   if(!InpUseTrailAfterBE)
      return;

   ulong ticket = 0;
   ENUM_POSITION_TYPE ptype;
   double entry = 0.0, sl = 0.0, tp = 0.0;
   if(!FindOurPosition(ticket, ptype, entry, sl, tp))
   {
      ResetTrailState();
      return;
   }

   const double bid = SymbolInfoDouble(g_sym, SYMBOL_BID);
   const double ask = SymbolInfoDouble(g_sym, SYMBOL_ASK);
   if(bid <= 0.0 || ask <= 0.0)
      return;

   if(ticket != g_trackedTicket)
   {
      g_trackedTicket = ticket;
      g_initialRiskDist = MathAbs(entry - sl);
      if(g_initialRiskDist <= g_point * 0.5)
         g_initialRiskDist = g_point;
      g_trailingActive = false;
      g_priceExtreme = (ptype == POSITION_TYPE_BUY) ? bid : ask;
   }

   double atr = 0.0;
   if(!Copy1(g_m30Atr, atr, 0) || atr <= 0.0)
      return;

   const double trailGap = atr * InpTrailBehindATR;

   if(ptype == POSITION_TYPE_BUY)
   {
      if(bid > g_priceExtreme)
         g_priceExtreme = bid;
      const double profitR = (bid - entry) / g_initialRiskDist;
      if(!g_trailingActive)
      {
         if(profitR < InpTrailActivateR)
            return;
         g_trailingActive = true;
      }

      const double maxBuySL = bid - (double)g_stopsLevel * g_point - g_point * 2.0;
      const double lockSL = entry + InpTrailLockR * g_initialRiskDist;
      double candidate = MathMax(lockSL, g_priceExtreme - trailGap);
      candidate = MathMin(candidate, maxBuySL);
      double newSL = MathMax(sl, candidate);
      if(!ClampSLBuy(bid, newSL) || newSL <= sl + g_point * 0.5)
         return;
      if(PositionSelectByTicket(ticket))
         trade.PositionModify(ticket, newSL, tp);
   }
   else
   {
      if(ask < g_priceExtreme)
         g_priceExtreme = ask;
      const double profitR = (entry - ask) / g_initialRiskDist;
      if(!g_trailingActive)
      {
         if(profitR < InpTrailActivateR)
            return;
         g_trailingActive = true;
      }

      const double minSellSL = ask + (double)g_stopsLevel * g_point + g_point * 2.0;
      const double lockSL = entry - InpTrailLockR * g_initialRiskDist;
      double candidate = MathMax(lockSL, g_priceExtreme + trailGap);
      candidate = MathMax(candidate, minSellSL);
      double newSL = MathMin(sl, candidate);
      if(!ClampSLSell(ask, newSL) || newSL >= sl - g_point * 0.5)
         return;
      if(PositionSelectByTicket(ticket))
         trade.PositionModify(ticket, newSL, tp);
   }
}

//+------------------------------------------------------------------+
double LotsFromRisk(const double riskPct, const double entryPrice, const double slPrice)
{
   const double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   const double riskMoney = equity * riskPct / 100.0;
   const double slDist = MathAbs(entryPrice - slPrice);
   if(slDist <= 0)
      return NormalizeVolume(InpFixedLots);

   const double lossPerLot = (slDist / g_tickSize) * g_tickValue;
   if(lossPerLot <= 0)
      return NormalizeVolume(InpFixedLots);

   return NormalizeVolume(riskMoney / lossPerLot);
}

//+------------------------------------------------------------------+
double LotsForEntry(const double entryPrice, const double slPrice)
{
   if(InpUseRiskPercent)
      return LotsFromRisk(InpRiskPercent, entryPrice, slPrice);
   return NormalizeVolume(InpFixedLots);
}

//+------------------------------------------------------------------+
bool StopsTooClose(const ENUM_ORDER_TYPE type, const double price, const double sl, const double tp)
{
   if(g_minStopDist <= 0)
      return false;
   const double minPts = g_minStopDist;
   if(type == ORDER_TYPE_BUY)
   {
      if(sl > 0 && (price - sl) < minPts)
         return true;
      if(tp > 0 && (tp - price) < minPts)
         return true;
   }
   else
   {
      if(sl > 0 && (sl - price) < minPts)
         return true;
      if(tp > 0 && (price - tp) < minPts)
         return true;
   }
   return false;
}

//+------------------------------------------------------------------+
bool TryEnter(const int direction, const SignalSnapshot &sig, const int entryMode = ENTRY_STRICT)
{
   if(!SignalOkForMode(sig, direction, entryMode))
      return false;

   const int bars = MathMax(2, InpM30SwingBars);
   const double rr = MathMax(1.0, InpRewardMultiple);

   if(direction > 0)
   {
      const double swingLo = SwingExtremeM30(true, 1, bars);
      if(swingLo <= 0.0 || !PassesH4Structure(1, swingLo, sig.h4SlowEma, entryMode))
         return false;

      const double ask = SymbolInfoDouble(g_sym, SYMBOL_ASK);
      double sl = swingLo - sig.atr * InpSL_ATR_Buffer;
      const double slDistMin = sig.atr * InpMinSL_ATR;
      if((ask - sl) < slDistMin)
         sl = ask - slDistMin;

      const double slDist = ask - sl;
      if(slDist <= 0.0)
         return false;
      if(!SlWithinMaxAtr(slDist, sig.atr, entryMode))
         return false;

      const double tp = ask + slDist * rr;
      if(StopsTooClose(ORDER_TYPE_BUY, ask, sl, tp))
         return false;

      const double lots = LotsForEntry(ask, sl);
      string cmt = "TPB2 long";
      if(entryMode == ENTRY_RELAXED)
         cmt = "TPB2 long relaxed";
      else if(entryMode == ENTRY_FORCE)
         cmt = "TPB2 long force";
      if(!trade.Buy(lots, g_sym, ask, sl, tp, cmt))
      {
         Print("TrendPullback v2: Buy failed — ", trade.ResultRetcodeDescription());
         return false;
      }
   }
   else if(direction < 0)
   {
      const double swingHi = SwingExtremeM30(false, 1, bars);
      if(swingHi <= 0.0 || !PassesH4Structure(-1, swingHi, sig.h4SlowEma, entryMode))
         return false;

      const double bid = SymbolInfoDouble(g_sym, SYMBOL_BID);
      double sl = swingHi + sig.atr * InpSL_ATR_Buffer;
      const double slDistMin = sig.atr * InpMinSL_ATR;
      if((sl - bid) < slDistMin)
         sl = bid + slDistMin;

      const double slDist = sl - bid;
      if(slDist <= 0.0)
         return false;
      if(!SlWithinMaxAtr(slDist, sig.atr, entryMode))
         return false;

      const double tp = bid - slDist * rr;
      if(StopsTooClose(ORDER_TYPE_SELL, bid, sl, tp))
         return false;

      const double lots = LotsForEntry(bid, sl);
      string cmt = "TPB2 short";
      if(entryMode == ENTRY_RELAXED)
         cmt = "TPB2 short relaxed";
      else if(entryMode == ENTRY_FORCE)
         cmt = "TPB2 short force";
      if(!trade.Sell(lots, g_sym, bid, sl, tp, cmt))
      {
         Print("TrendPullback v2: Sell failed — ", trade.ResultRetcodeDescription());
         return false;
      }
   }
   else
      return false;

   if(entryMode == ENTRY_FORCE)
      Print("TrendPullback v2: force-tier daily entry filled");
   else if(entryMode == ENTRY_RELAXED)
      Print("TrendPullback v2: relaxed-tier daily entry filled");

   g_tradesToday++;
   PersistPropState();
   g_beTicket = 0;
   g_beApplied = false;
   g_beInitialRisk = 0.0;
   ResetTrailState();
   return true;
}

//+------------------------------------------------------------------+
bool AttemptEntryForMode(const SignalSnapshot &sig, const int entryMode)
{
   const int dir = DirectionForMode(sig, entryMode);
   if(dir == 1)
      return TryEnter(1, sig, entryMode);
   if(dir == -1)
      return TryEnter(-1, sig, entryMode);
   return false;
}

//+------------------------------------------------------------------+
void EvaluateDailyEntries()
{
   if(g_tradesToday > 0 || g_ourPosCount > 0)
      return;
   if(!CanOpenNewTrade())
      return;

   SignalSnapshot sig;
   if(!LoadSignalSnapshot(sig))
      return;

   if(AttemptEntryForMode(sig, ENTRY_STRICT))
      return;

   if(!InpRequireMinOneTradePerDay)
      return;

   if(IsPastServerTime(InpRelaxedEntryHour, 0))
   {
      if(AttemptEntryForMode(sig, ENTRY_RELAXED))
         return;
   }

   if(IsPastServerTime(InpForceTradeHour, InpForceTradeMinute))
      AttemptEntryForMode(sig, ENTRY_FORCE);
}

//+------------------------------------------------------------------+
void EvaluateSignalsOnNewBar()
{
   EvaluateDailyEntries();
}

//+------------------------------------------------------------------+
void TryForceDailyTrade()
{
   EvaluateDailyEntries();
}

//+------------------------------------------------------------------+
void OnTick()
{
   InvalidatePosCache();
   EvaluatePropLimits();

   RefreshPosCache();
   if(g_ourPosTicket != 0)
   {
      ManageBreakEven();
      ManageTrailing();
   }

   datetime tClosed = iTime(g_sym, PERIOD_M30, 1);
   if(tClosed == 0 || tClosed == g_lastM30BarTime)
      return;

   const long spreadPts = SymbolInfoInteger(g_sym, SYMBOL_SPREAD);
   if(spreadPts > InpMaxSpreadPoints)
      return;
   if(Bars(g_sym, PERIOD_M30) < InpMinBarsWarmup)
      return;

   g_lastM30BarTime = tClosed;

   if(!CanOpenNewTrade())
      return;

   if(InpOnePositionOnly && g_ourPosCount > 0)
      return;

   EvaluateDailyEntries();
}

//+------------------------------------------------------------------+
