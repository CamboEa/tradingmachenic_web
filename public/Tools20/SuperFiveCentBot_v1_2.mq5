// SuperFiveCentBot v1.2 (MQL5 / MT5)
#property copyright "SuperFiveCentBot"
#property description "SuperFiveCentBot — v1.2"
#property version   "1.2"

#include <Trade\Trade.mqh>
CTrade trade;

//=== GRID INPUTS ====================================================
input int    GridStep        = 300;
input bool   UseAdaptiveGrid = true;
input ENUM_TIMEFRAMES GridVolatilityTF = PERIOD_M15;
input int    GridATR_Period  = 14;
input double GridATR_Multiplier = 1.0;
input int    GridStepMinPips = 100;
input int    GridStepMaxPips = 800;
input double InitialLot      = 0.01;
input double LotMultiplier   = 1.5;    // Geometric multiplier per level (1.0 = flat, 2.0 = classic martingale)

//=== TREND FILTER INPUTS ============================================
input ENUM_TIMEFRAMES TrendTF = PERIOD_M5; // Trend filter timeframe (recommended: M5/M15 for M1 trading)
input int    EMA_Period       = 200;
input double EMA_BufferSteps  = 2.0;
input int    EMA_SlopeBars    = 5;
input int    EMA_MinSlopePips = 30;
input bool   UseTrendDirectionForL1 = true; // Make first entry (L1) trend-following (uses EMA + slope)

//=== ENTRY LIMITERS (M1 SAFETY) =====================================
input int    CooldownSeconds   = 30;  // Block NEW entries for N seconds after an entry
input bool   OneEntryPerBar    = true;// Allow at most 1 NEW entry per chart bar

//=== HEDGE OVERRIDE =================================================
input int    HedgeOverrideLevels = 3;  // Ignore trend filter when opposing grid >= N levels

//=== PROFIT INPUTS ==================================================
input double BuyTakeProfitUSD  = 0.5;
input double SellTakeProfitUSD = 0.5;

//=== TRAILING SL INPUTS =============================================
input double SL_ActivationPct  = 70.0;
input double SL_LockInPct      = 50.0;

//=== MISC INPUTS ====================================================
input bool   ShowDashboard = true;     // Show on-chart dashboard (toggle live with 'D')
input ulong  MagicNumber   = 20240105;
input int    Slippage      = 3;
input int    DashboardUpdateMs = 500;  // Throttle dashboard updates (ms)

//=== MARKET CLOSE INPUTS ============================================
input bool UseCloseFilter      = true;
input int  MarketCloseHour     = 22;
input int  MarketCloseMinute   = 0;
input int  MarketOpenHour      = 22;
input int  MarketOpenMinute    = 0;
input int  NoTradeMinutes      = 60;

//=== FRIDAY SHUTDOWN (CLOSE + PAUSE) ================================
input bool UseFridayShutdown   = true;   // Close all positions Friday at set time, pause until Monday
input int  FridayCloseHour     = 15;
input int  FridayCloseMinute   = 0;

//=== PROFIT STOP (CLOSE + PAUSE) ====================================
input bool   UseProfitStop      = true;    // Stop trading once profit target reached
input double ProfitStopUSD      = 350.0;   // Equity gain since EA start

//=== DAILY PROFIT DISPLAY ===========================================
input double DailyProfitTargetUSD = 350.0; // Dashboard display only

//=== XAUUSD NEWS (MT5 ECONOMIC CALENDAR) =============================
input bool   UseNewsFilter      = true;
input int    NewsMinutesBefore  = 30;
input int    NewsMinutesAfter   = 30;
input ENUM_CALENDAR_EVENT_IMPORTANCE NewsMinImportance = CALENDAR_IMPORTANCE_MODERATE; // block this level and higher
input int    NewsRefreshSeconds = 300;

//=== GLOBALS ========================================================
double   g_pip;
bool     g_buySLActive        = false;
bool     g_sellSLActive       = false;
int      g_emaHandle          = INVALID_HANDLE;
int      g_gridATRHandle      = INVALID_HANDLE;
datetime g_lastGridVolBarTime = 0;
int      g_effGridPips        = 300;
double   g_gridGapPrice       = 0.0;
double   g_gridATRValue       = 0.0;
bool     g_gridATROK          = false;
datetime g_lastClosePrint     = 0;
datetime g_lastFridayPrint    = 0;
datetime g_lastProfitPrint    = 0;
datetime g_lastTradeErrPrint  = 0;
datetime g_lastFilterBuyPrint = 0;
datetime g_lastFilterSellPrint= 0;
bool     g_showDashboard      = true;   // runtime state — seeded from ShowDashboard input
double   g_startEquity        = 0.0;
bool     g_profitStopLatched  = false;
uint     g_lastDashTick       = 0;
datetime g_lastEmaBarTime     = 0;
bool     g_emaCacheOk         = false;
double   g_emaNow             = 0.0;
double   g_emaPast            = 0.0;
double   g_emaSlopePips       = 0.0;
double   g_dayStartEquity     = 0.0;
int      g_dayKey             = 0;
datetime g_lastEntryBarTime   = 0;
datetime g_lastEntryTime      = 0;
double   g_maxFloatingLossAll = 0.0;   // most negative floating P/L seen (USD) since EA started (while attached)

MqlCalendarValue g_newsValues[];
datetime         g_lastNewsRefresh = 0;

#define DASH_PFX "SFCB_"
#define DASH_PX  10
#define DASH_PY  28
#define DASH_RH  16
#define DASH_W   450
#define DASH_C1    6
#define DASH_C2  185
#define DASH_C3  325

string Pad(string s, int w)
{
   while(StringLen(s) < w) s += " ";
   return s;
}
string Trunc(string s, int n)
{
   if(StringLen(s) <= n) return s;
   return StringSubstr(s, 0, n-1) + "~";
}

string DayName(int dow)
{
   switch(dow)
   {
      case 1:  return "Monday";
      case 2:  return "Tuesday";
      case 3:  return "Wednesday";
      case 4:  return "Thursday";
      case 5:  return "Friday";
      case 6:  return "Saturday";
      case 0:  return "Sunday";
      default: return "";
   }
}

void RefreshDayStartEquity()
{
   MqlDateTime dt; TimeToStruct(TimeCurrent(), dt);
   int key = dt.year * 10000 + dt.mon * 100 + dt.day;
   if(g_dayKey == 0 || g_dayKey != key)
   {
      g_dayKey = key;
      double eq = AccountInfoDouble(ACCOUNT_EQUITY);
      g_dayStartEquity = eq;

      // New day: reset profit-stop baseline + latch
      g_startEquity = eq;
      g_profitStopLatched = false;
   }
}

double GetFloatingPnlUsd()
{
   double pnl = 0.0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong tk = PositionGetTicket(i);
      if(tk == 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != (long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol) continue;
      pnl += PositionGetDouble(POSITION_PROFIT) + PositionGetDouble(POSITION_SWAP);
   }
   return pnl;
}

void RefreshEmaCache()
{
   if(g_emaHandle == INVALID_HANDLE) { g_emaCacheOk = false; return; }

   datetime barTime = iTime(_Symbol, TrendTF, 0);
   if(barTime == 0) { g_emaCacheOk = false; return; }
   if(g_lastEmaBarTime == barTime && g_emaCacheOk) return;

   double emaN[1], emaP[1];
   bool ok = (CopyBuffer(g_emaHandle, 0, 0,            1, emaN) == 1 &&
              CopyBuffer(g_emaHandle, 0, EMA_SlopeBars, 1, emaP) == 1);

   if(!ok) { g_emaCacheOk = false; return; }

   g_lastEmaBarTime = barTime;
   g_emaNow         = emaN[0];
   g_emaPast        = emaP[0];
   g_emaSlopePips   = (g_emaNow - g_emaPast) / g_pip;
   g_emaCacheOk     = true;
}

void RefreshGridVolatilityCache()
{
   if(g_gridATRHandle == INVALID_HANDLE)
   {
      g_effGridPips   = GridStep;
      g_gridATROK     = false;
      g_gridATRValue  = 0.0;
      g_gridGapPrice  = (double)g_effGridPips * g_pip;
      return;
   }

   double atr[1];
   if(CopyBuffer(g_gridATRHandle, 0, 0, 1, atr) != 1)
   {
      g_gridATROK    = false;
      g_gridATRValue = 0.0;
      g_effGridPips  = GridStep;
      g_gridGapPrice = (double)g_effGridPips * g_pip;
      return;
   }

   g_gridATRValue = atr[0];
   g_gridATROK    = true;

   if(!UseAdaptiveGrid)
   {
      g_effGridPips = GridStep;
      g_gridGapPrice = (double)g_effGridPips * g_pip;
      return;
   }

   datetime bt = iTime(_Symbol, GridVolatilityTF, 0);
   if(bt == 0)
   {
      g_gridGapPrice = (double)g_effGridPips * g_pip;
      return;
   }

   if(bt != g_lastGridVolBarTime)
   {
      g_lastGridVolBarTime = bt;
      int pips = (int)MathRound((atr[0] * GridATR_Multiplier) / g_pip);
      if(pips < GridStepMinPips) pips = GridStepMinPips;
      if(pips > GridStepMaxPips) pips = GridStepMaxPips;
      g_effGridPips = pips;
   }
   g_gridGapPrice = (double)g_effGridPips * g_pip;
}

int GetGridStepPips()
{
   RefreshGridVolatilityCache();
   return g_effGridPips;
}

double GetGridGapPrice()
{
   RefreshGridVolatilityCache();
   return g_gridGapPrice;
}

void RefreshNewsCache()
{
   if(!UseNewsFilter)
   {
      ArrayResize(g_newsValues, 0);
      return;
   }

   datetime nowSrv = TimeTradeServer();
   if(g_lastNewsRefresh > 0 && (nowSrv - g_lastNewsRefresh) < NewsRefreshSeconds)
      return;

   g_lastNewsRefresh = nowSrv;

   int aft = NewsMinutesAfter * 60;
   int bef = NewsMinutesBefore * 60;
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

bool IsNewsBlackout(string &detail)
{
   detail = "";
   if(!UseNewsFilter) return false;

   RefreshNewsCache();

   datetime nowSrv = TimeTradeServer();
   int beforeSec = NewsMinutesBefore * 60;
   int afterSec  = NewsMinutesAfter * 60;
   int minImp    = (int)NewsMinImportance;

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
         detail = TimeToString(t, TIME_DATE|TIME_MINUTES) + " " + Trunc(ev.name, 28);
         return true;
      }
   }
   return false;
}

string NextUsdNewsSummary()
{
   if(!UseNewsFilter || ArraySize(g_newsValues) == 0)
      return "";

   datetime nowSrv = TimeTradeServer();
   int      minImp = (int)NewsMinImportance;
   datetime bestT  = 0;
   string   bestStr = "";

   for(int i = 0; i < ArraySize(g_newsValues); i++)
   {
      MqlCalendarEvent ev;
      if(!CalendarEventById(g_newsValues[i].event_id, ev))
         continue;
      if((int)ev.importance < minImp)
         continue;

      datetime t = g_newsValues[i].time;
      if(t < nowSrv)
         continue;

      if(bestT == 0 || t < bestT)
      {
         bestT = t;
         string impTag = ((int)ev.importance >= (int)CALENDAR_IMPORTANCE_HIGH) ? "HIGH"
                         : (((int)ev.importance >= (int)CALENDAR_IMPORTANCE_MODERATE) ? "MOD" : "LOW");
         int mins = (int)((t - nowSrv + 30) / 60);
         if(mins < 0)
            mins = 0;
         bestStr = TimeToString(t, TIME_DATE|TIME_MINUTES) + " [" + impTag + "] " + Trunc(ev.name, 20) + "  +" + IntegerToString(mins) + "m";
      }
   }

   return bestStr;
}

bool CanEnterNewTradeCore(string &why)
{
   why = "";

   if(CooldownSeconds > 0)
   {
      datetime now = TimeCurrent();
      if(g_lastEntryTime > 0 && (now - g_lastEntryTime) < CooldownSeconds) { why = "cooldown"; return false; }
   }

   if(OneEntryPerBar)
   {
      datetime bt = iTime(_Symbol, PERIOD_CURRENT, 0);
      if(bt > 0 && g_lastEntryBarTime == bt) { why = "1/bar"; return false; }
   }

   return true;
}

bool CanEnterNewTrade(string &why)
{
   why = "";

   string nd = "";
   if(IsNewsBlackout(nd)) { why = "news"; return false; }

   return CanEnterNewTradeCore(why);
}

void MarkEntry()
{
   g_lastEntryTime = TimeCurrent();
   datetime bt = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(bt > 0) g_lastEntryBarTime = bt;
}

//+------------------------------------------------------------------+
void DashLabel(string id, int x, int y, string txt, color clr, int sz=9)
{
   string n = DASH_PFX + id;
   if(ObjectFind(0, n) < 0)
   {
      ObjectCreate(0, n, OBJ_LABEL, 0, 0, 0);
      ObjectSetInteger(0, n, OBJPROP_CORNER,     CORNER_LEFT_UPPER);
      ObjectSetInteger(0, n, OBJPROP_ANCHOR,     ANCHOR_LEFT_UPPER);
      ObjectSetString( 0, n, OBJPROP_FONT,       "Consolas");
      ObjectSetInteger(0, n, OBJPROP_BACK,       false);
      ObjectSetInteger(0, n, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, n, OBJPROP_HIDDEN,     true);
   }
   ObjectSetInteger(0, n, OBJPROP_XDISTANCE, x);
   ObjectSetInteger(0, n, OBJPROP_YDISTANCE, y);
   ObjectSetString( 0, n, OBJPROP_TEXT,      txt);
   ObjectSetInteger(0, n, OBJPROP_COLOR,     clr);
   ObjectSetInteger(0, n, OBJPROP_FONTSIZE,  sz);
}

//+------------------------------------------------------------------+
void CreateDashboard()
{
   string n = DASH_PFX + "BG";
   if(ObjectFind(0, n) < 0)
      ObjectCreate(0, n, OBJ_RECTANGLE_LABEL, 0, 0, 0);
   ObjectSetInteger(0, n, OBJPROP_XDISTANCE,   DASH_PX - 6);
   ObjectSetInteger(0, n, OBJPROP_YDISTANCE,   DASH_PY - 6);
   ObjectSetInteger(0, n, OBJPROP_XSIZE,       DASH_W);
   ObjectSetInteger(0, n, OBJPROP_YSIZE,       37 * DASH_RH + 12);
   ObjectSetInteger(0, n, OBJPROP_BGCOLOR,     C'14,18,28');
   ObjectSetInteger(0, n, OBJPROP_BORDER_TYPE, BORDER_FLAT);
   ObjectSetInteger(0, n, OBJPROP_COLOR,       C'40,52,80');
   ObjectSetInteger(0, n, OBJPROP_CORNER,      CORNER_LEFT_UPPER);
   ObjectSetInteger(0, n, OBJPROP_BACK,        false);
   ObjectSetInteger(0, n, OBJPROP_SELECTABLE,  false);
   ObjectSetInteger(0, n, OBJPROP_HIDDEN,      true);
   ChartRedraw(0);
}

void DeleteDashboard()
{
   ObjectsDeleteAll(0, DASH_PFX);
   ObjectsDeleteAll(0, "GM27_");
   ChartRedraw(0);
}

//+------------------------------------------------------------------+
void UpdateDashboard()
{
   RefreshDayStartEquity();
   RefreshEmaCache();
   RefreshGridVolatilityCache();
   if(UseNewsFilter)
      RefreshNewsCache();

   int lx = DASH_PX + DASH_C1;
   int bx = DASH_PX + DASH_C2;
   int sx = DASH_PX + DASH_C3;
   int y  = DASH_PY;
   int rh = DASH_RH;
   int LW = 15;

   color cLbl  = C'120,132,160';
   color cVal  = C'210,215,230';
   color cBuy  = C'70,205,115';
   color cSell = C'220,85,85';
   color cGood = C'70,205,115';
   color cBad  = C'220,85,85';
   color cWarn = C'255,155,35';
   color cDim  = C'50,62,88';

   DashLabel("hdr", lx, y, "SuperFiveCentBot v1.2   " + _Symbol, clrGold, 10);
   y += rh + 4;

   DashLabel("sep_a", lx, y, "  STATUS", cDim, 8);
   y += rh;

   DashLabel("lbl_time", lx, y, Pad("Server time",  LW), cLbl);
   MqlDateTime sdt; TimeToStruct(TimeCurrent(), sdt);
   string timeStr = DayName(sdt.day_of_week) + " " + TimeToString(TimeCurrent(), TIME_DATE|TIME_MINUTES);
   DashLabel("val_time", bx, y, timeStr, cVal);
   y += rh;

   string newsDet = "";
   bool inNews = UseNewsFilter && IsNewsBlackout(newsDet);

   string gateWhy = "";
   bool gateOk = (!inNews) && CanEnterNewTradeCore(gateWhy);
   if(!gateOk && inNews)
      gateWhy = "news";

   DashLabel("lbl_gate", lx, y, Pad("Entry gate",   LW), cLbl);
   DashLabel("val_gate", bx, y, gateOk ? "OK" : ("BLOCKED (" + gateWhy + ")"), gateOk ? cGood : cWarn);
   y += rh;

   DashLabel("lbl_news", lx, y, Pad("News blk",    LW), cLbl);
   DashLabel("val_news", bx, y,
             !UseNewsFilter ? "off"
                           : (inNews ? Trunc("YES " + newsDet, 42) : "no"),
             !UseNewsFilter ? cDim : (inNews ? cWarn : cGood));
   y += rh;

   string newsWin = !UseNewsFilter ? "off"
                   : ("+/-" + IntegerToString(NewsMinutesBefore) + "/" + IntegerToString(NewsMinutesAfter) + "m "
                      + "minImp=" + IntegerToString((int)NewsMinImportance));
   DashLabel("lbl_nw", lx, y, Pad("News filt",   LW), cLbl);
   DashLabel("val_nw", bx, y, newsWin, UseNewsFilter ? cVal : cDim);
   y += rh;

   string nextUsd = NextUsdNewsSummary();
   string nextNews = !UseNewsFilter ? "off"
                     : (nextUsd != "" ? nextUsd
                        : (ArraySize(g_newsValues) == 0 ? "no calendar data" : "none upcoming"));
   DashLabel("lbl_nxtn", lx, y, Pad("Next USD",    LW), cLbl);
   DashLabel("val_nxtn", bx, y, Trunc(nextNews, 42), UseNewsFilter ? cVal : cDim);
   y += rh;

   double dayPnl = AccountInfoDouble(ACCOUNT_EQUITY) - g_dayStartEquity;
   string dayPnlStr = (dayPnl >= 0 ? "+" : "") + DoubleToString(dayPnl, 2) + "$";
   DashLabel("lbl_daypnl", lx, y, Pad("Today P/L",   LW), cLbl);
   DashLabel("val_daypnl", bx, y, dayPnlStr, dayPnl >= 0 ? cGood : cBad);
   y += rh;

   double floatPnl = GetFloatingPnlUsd();
   if(floatPnl < g_maxFloatingLossAll)
      g_maxFloatingLossAll = floatPnl;
   string floatStr = (floatPnl >= 0 ? "+" : "") + DoubleToString(floatPnl, 2) + "$";
   DashLabel("lbl_fltpnl", lx, y, Pad("Float P/L",   LW), cLbl);
   DashLabel("val_fltpnl", bx, y, floatStr, floatPnl >= 0 ? cGood : cBad);
   y += rh;

   string maxLossAllStr = DoubleToString(g_maxFloatingLossAll, 2) + "$";
   DashLabel("lbl_mfl", lx, y, Pad("Max float loss", LW), cLbl);
   DashLabel("val_mfl", bx, y, maxLossAllStr, g_maxFloatingLossAll < 0.0 ? cBad : cDim);
   y += rh;

   DashLabel("lbl_daytgt", lx, y, Pad("Day target",  LW), cLbl);
   DashLabel("val_daytgt", bx, y, "$" + DoubleToString(DailyProfitTargetUSD, 2), cVal);
   y += rh;

   string blockReason = "";
   bool cls = IsProfitStopActive(blockReason) || IsFridayShutdownActive(blockReason) || IsNearMarketClose();
   DashLabel("lbl_cls", lx, y, Pad("Market",       LW), cLbl);
   DashLabel("val_cls", bx, y, cls ? ("BLOCKED (" + blockReason + ")") : "Open  OK", cls ? cWarn : cGood);
   y += rh;

   DashLabel("sep_b", lx, y, "  EMA TREND", cDim, 8);
   y += rh;

   double ask       = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid       = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double emaBuffer = EMA_BufferSteps * g_gridGapPrice;

   string tfName = EnumToString(TrendTF);
   DashLabel("lbl_ema", lx, y, Pad("EMA("+IntegerToString(EMA_Period)+")", LW), cLbl);
   DashLabel("val_ema", bx, y, g_emaCacheOk ? (DoubleToString(g_emaNow,_Digits) + " " + tfName) : "unavailable", g_emaCacheOk ? cVal : cWarn);
   y += rh;

   if(g_emaCacheOk)
   {
      double sp       = g_emaSlopePips;
      double dp       = (bid - g_emaNow) / g_pip;
      double minS     = (double)EMA_MinSlopePips;

      string dStr = (dp>=0?"+":"") + DoubleToString(dp,0) + "p " + (dp>=0?"above":"below");
      DashLabel("lbl_dist", lx, y, Pad("Dist EMA", LW), cLbl);
      DashLabel("val_dist", bx, y, dStr, dp>0 ? cSell : (dp<0 ? cBuy : cVal));
      y += rh;

      string slopeStr = (sp>=0?"+":"") + DoubleToString(sp,1) + "p/" + IntegerToString(EMA_SlopeBars) + "b";
      string trendStr;
      color  trendClr;
      if     (sp >  minS*2) { trendStr="Strong up";   trendClr=cBad;  }
      else if(sp >  minS  ) { trendStr="Mild up";     trendClr=cWarn; }
      else if(sp >  0     ) { trendStr="Drift up";    trendClr=cVal;  }
      else if(sp == 0     ) { trendStr="Flat";        trendClr=cVal;  }
      else if(sp > -minS  ) { trendStr="Drift down";  trendClr=cVal;  }
      else if(sp > -minS*2) { trendStr="Mild down";   trendClr=cWarn; }
      else                  { trendStr="Strong down"; trendClr=cGood; }

      DashLabel("lbl_slp",  lx, y, Pad("Slope", LW), cLbl);
      DashLabel("val_slpv", bx, y, Trunc(slopeStr,14), cVal);
      DashLabel("val_slpt", sx, y, trendStr,            trendClr);
      y += rh;

      bool bA = (ask < g_emaNow-emaBuffer), bB = (ask < g_emaNow && sp < -minS);
      bool sA = (bid > g_emaNow+emaBuffer), sB = (bid > g_emaNow && sp >  minS);

      DashLabel("lbl_flt",  lx, y, Pad("Filter",  LW), cLbl);
      DashLabel("hdr_fbuy", bx, y, "BUY",              cBuy);
      DashLabel("hdr_fsel", sx, y, "SELL",             cSell);
      y += rh;

      DashLabel("lbl_flt2", lx, y, Pad("", LW), cLbl);
      DashLabel("val_bflt", bx, y, bA?"BLK dist":(bB?"BLK slope":"clear"), (bA||bB)?cBad:cGood);
      DashLabel("val_sflt", sx, y, sA?"BLK dist":(sB?"BLK slope":"clear"), (sA||sB)?cBad:cGood);
      y += rh;
   }
   else
   {
      y += rh * 4;
   }

   DashLabel("sep_c", lx, y, "  GRID POSITIONS", cDim, 8);
   y += rh;

   DashLabel("col_lbl", lx, y, Pad("", LW),  cDim);
   DashLabel("col_buy", bx, y, "BUY",        cBuy);
   DashLabel("col_sel", sx, y, "SELL",       cSell);
   y += rh;

   int    bCnt=0, sCnt=0;
   double bLots=0,sLots=0,bWsum=0,sWsum=0,bPnl=0,sPnl=0;
   double loB=0,hiB=0,hiS=0,loS=0;

   for(int i=PositionsTotal()-1;i>=0;i--)
   {
      ulong tk=PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetInteger(POSITION_MAGIC)!=(long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL)!=_Symbol)           continue;
      ENUM_POSITION_TYPE pt=(ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
      double op=PositionGetDouble(POSITION_PRICE_OPEN);
      double lt=PositionGetDouble(POSITION_VOLUME);
      double pn=PositionGetDouble(POSITION_PROFIT)+PositionGetDouble(POSITION_SWAP);
      if(pt==POSITION_TYPE_BUY)
      {
         bCnt++; bLots+=lt; bWsum+=lt*op; bPnl+=pn;
         if(loB==0||op<loB)loB=op; if(hiB==0||op>hiB)hiB=op;
      }
      else
      {
         sCnt++; sLots+=lt; sWsum+=lt*op; sPnl+=pn;
         if(hiS==0||op>hiS)hiS=op; if(loS==0||op<loS)loS=op;
      }
   }
   double bAvg=bLots>0?bWsum/bLots:0;
   double sAvg=sLots>0?sWsum/sLots:0;
   string D="--";

   DashLabel("lbl_pos",  lx,y,Pad("Positions",LW),cLbl);
   DashLabel("val_bpos", bx,y,bCnt>0?(string)bCnt:D, bCnt>0?cBuy:cDim);
   DashLabel("val_spos", sx,y,sCnt>0?(string)sCnt:D, sCnt>0?cSell:cDim);
   y+=rh;

   DashLabel("lbl_lots",  lx,y,Pad("Lots",LW),cLbl);
   DashLabel("val_blots", bx,y,bCnt>0?DoubleToString(bLots,2):D,cVal);
   DashLabel("val_slots", sx,y,sCnt>0?DoubleToString(sLots,2):D,cVal);
   y+=rh;

   DashLabel("lbl_avg",  lx,y,Pad("Avg entry",LW),cLbl);
   DashLabel("val_bavg", bx,y,bCnt>0?Trunc(DoubleToString(bAvg,_Digits),13):D,cVal);
   DashLabel("val_savg", sx,y,sCnt>0?Trunc(DoubleToString(sAvg,_Digits),13):D,cVal);
   y+=rh;

   string bPS=bCnt>0?(bPnl>=0?"+":"")+DoubleToString(bPnl,2)+"$":D;
   string sPS=sCnt>0?(sPnl>=0?"+":"")+DoubleToString(sPnl,2)+"$":D;
   DashLabel("lbl_pnl",  lx,y,Pad("P / L",LW),cLbl);
   DashLabel("val_bpnl", bx,y,bPS,bCnt>0?(bPnl>=0?cGood:cBad):cDim);
   DashLabel("val_spnl", sx,y,sPS,sCnt>0?(sPnl>=0?cGood:cBad):cDim);
   y+=rh;

   string bNxt,sNxt;
   double gg = g_gridGapPrice;
   if(bCnt>0)      bNxt=Trunc(DoubleToString(loB-gg,_Digits),13);
   else if(sCnt>0) bNxt=Trunc(DoubleToString(loS-gg,_Digits),13)+"*";
   else            bNxt=D;

   if(sCnt>0)      sNxt=Trunc(DoubleToString(hiS+gg,_Digits),13);
   else if(bCnt>0) sNxt=Trunc(DoubleToString(hiB+gg,_Digits),13)+"*";
   else            sNxt=D;

   DashLabel("lbl_nxt",  lx,y,Pad("Next level",LW),cLbl);
   DashLabel("val_bnxt", bx,y,bNxt,cVal);
   DashLabel("val_snxt", sx,y,sNxt,cVal);
   y+=rh;

   DashLabel("lbl_sl",  lx,y,Pad("SL armed",LW),cLbl);
   DashLabel("val_bsl", bx,y,g_buySLActive ?"ARMED":"off",g_buySLActive ?cWarn:cDim);
   DashLabel("val_ssl", sx,y,g_sellSLActive?"ARMED":"off",g_sellSLActive?cWarn:cDim);
   y+=rh;

   bool hB=(bCnt>=HedgeOverrideLevels), hS=(sCnt>=HedgeOverrideLevels);
   DashLabel("lbl_hov",  lx,y,Pad("HedgeOvrd",LW),cLbl);
   DashLabel("val_bhov", bx,y, hB?"ON ("+IntegerToString(bCnt)+"/"+IntegerToString(HedgeOverrideLevels)+")":"off", hB?cWarn:cDim);
   DashLabel("val_shov", sx,y, hS?"ON ("+IntegerToString(sCnt)+"/"+IntegerToString(HedgeOverrideLevels)+")":"off", hS?cWarn:cDim);
   y+=rh;

   DashLabel("sep_d", lx,y,"  SETTINGS",cDim,8);
   y+=rh;

   DashLabel("lbl_tp",  lx,y,Pad("TP target",LW),cLbl);
   DashLabel("val_btp", bx,y,"$"+DoubleToString(BuyTakeProfitUSD,2),cVal);
   DashLabel("val_stp", sx,y,"$"+DoubleToString(SellTakeProfitUSD,2),cVal);
   y+=rh;

   string atrTxt = !g_gridATROK ? "n/a"
                   : (DoubleToString(g_gridATRValue, _Digits) + " (~"
                      + IntegerToString((int)MathRound(g_gridATRValue / g_pip)) + " pip) "
                      + EnumToString(GridVolatilityTF));
   DashLabel("lbl_atrv", lx,y,Pad("ATR vol",LW),cLbl);
   DashLabel("val_atrv", bx,y, Trunc(atrTxt, 42), g_gridATROK ? cVal : cWarn);
   y+=rh;

   int effP = g_effGridPips;
   string gapTxt = IntegerToString(effP) + " pip "
                   + (UseAdaptiveGrid ? "(ATR)" : "(fixed)")
                   + "  base=" + IntegerToString(GridStep)
                   + " [" + IntegerToString(GridStepMinPips) + "-" + IntegerToString(GridStepMaxPips) + "]";
   DashLabel("lbl_ggap", lx,y,Pad("Grid gap",LW),cLbl);
   DashLabel("val_ggap", bx,y, Trunc(gapTxt, 42), cVal);
   y+=rh;

   DashLabel("lbl_buf", lx,y,Pad("EMA buffer",LW),cLbl);
   DashLabel("val_buf", bx,y, DoubleToString(EMA_BufferSteps,1)+"x = "+ IntegerToString((int)MathRound((double)effP * EMA_BufferSteps))+" pips", cVal);
   y+=rh;

   DashLabel("lbl_slps", lx,y,Pad("EMA slope",LW),cLbl);
   DashLabel("val_slps", bx,y, IntegerToString(EMA_SlopeBars)+" bars / "+ IntegerToString(EMA_MinSlopePips)+" pip min", cVal);
   y+=rh;

   DashLabel("lbl_hovs", lx,y,Pad("Hedge lvl",LW),cLbl);
   DashLabel("val_hovs", bx,y,IntegerToString(HedgeOverrideLevels)+" levels",cVal);
}

//+------------------------------------------------------------------+
bool IsNearMarketClose()
{
   if(!UseCloseFilter) return false;
   MqlDateTime dt; TimeToStruct(TimeCurrent(),dt);
   int m=dt.hour*60+dt.min;
   if(dt.day_of_week==6) return true;
   if(dt.day_of_week==0 && m<MarketOpenHour*60+MarketOpenMinute) return true;
   if(dt.day_of_week==5 && m>=MarketCloseHour*60+MarketCloseMinute-NoTradeMinutes) return true;
   return false;
}

bool IsFridayShutdownActive(string &reason)
{
   reason = "n/a";
   if(!UseFridayShutdown) return false;

   MqlDateTime dt; TimeToStruct(TimeCurrent(), dt);
   int m = dt.hour * 60 + dt.min;
   int friCloseM = FridayCloseHour * 60 + FridayCloseMinute;

   if(dt.day_of_week == 5 && m >= friCloseM) { reason = "Fri close"; return true; }
   if(dt.day_of_week == 6)                  { reason = "Saturday";  return true; }
   if(dt.day_of_week == 0)                  { reason = "Sunday";    return true; }

   reason = "n/a";
   return false;
}

bool IsProfitStopActive(string &reason)
{
   reason = "n/a";
   if(!UseProfitStop) return false;

   if(g_startEquity <= 0.0) g_startEquity = AccountInfoDouble(ACCOUNT_EQUITY);
   double gain = AccountInfoDouble(ACCOUNT_EQUITY) - g_startEquity;

   if(g_profitStopLatched || gain >= ProfitStopUSD)
   {
      g_profitStopLatched = true;
      reason = "profit stop";
      return true;
   }

   return false;
}

//+------------------------------------------------------------------+
int OnInit()
{
   trade.SetExpertMagicNumber(MagicNumber);
   trade.SetDeviationInPoints(Slippage*10);
   g_pip=(_Digits==5||_Digits==3)?10.0*_Point:_Point;
   g_emaHandle=iMA(_Symbol,TrendTF,EMA_Period,0,MODE_EMA,PRICE_CLOSE);
   if(g_emaHandle==INVALID_HANDLE){Print("ERROR: EMA handle failed");return INIT_FAILED;}

   g_effGridPips = GridStep;
   g_gridATRHandle = iATR(_Symbol, GridVolatilityTF, GridATR_Period);
   if(g_gridATRHandle == INVALID_HANDLE)
      Print("WARN: Grid ATR handle failed; grid gap forced to fixed GridStep=", GridStep);

   g_showDashboard = ShowDashboard;
   g_startEquity   = AccountInfoDouble(ACCOUNT_EQUITY);
   g_profitStopLatched = false;
   RefreshDayStartEquity();
   RefreshGridVolatilityCache();

   Print("=== SuperFiveCentBot v1.2 | ",_Symbol,
         " | Grid fixed=",GridStep,"p | BuyTP=$",BuyTakeProfitUSD," | SellTP=$",SellTakeProfitUSD," ===");
   Print("=== Adaptive grid: ",UseAdaptiveGrid?"ON":"OFF",
         " | ATR(",GridATR_Period,") ",EnumToString(GridVolatilityTF)," x ",DoubleToString(GridATR_Multiplier,2),
         " | clamp ",GridStepMinPips,"-",GridStepMaxPips," | eff=",GetGridStepPips(),"p ===");
   Print("=== EMA(",EMA_Period,") TF=",EnumToString(TrendTF),
         " buf=",EMA_BufferSteps,"x(",(int)MathRound((double)GetGridStepPips()*EMA_BufferSteps),"p) slp=",EMA_SlopeBars,"b/",EMA_MinSlopePips,"p ===");
   Print("=== EntryLimit: cooldown=",CooldownSeconds,"s | 1/bar=",OneEntryPerBar?"ON":"OFF"," ===");
   Print("=== NewsFilter (XAUUSD/USD): ",UseNewsFilter?"ON":"OFF",
         " | +/-min=",NewsMinutesBefore,"/",NewsMinutesAfter,
         " | minImp=",IntegerToString((int)NewsMinImportance),
         " | refresh=",NewsRefreshSeconds,"s ===");

   if(g_showDashboard) CreateDashboard();
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   DeleteDashboard();
   if(g_emaHandle!=INVALID_HANDLE) IndicatorRelease(g_emaHandle);
   if(g_gridATRHandle!=INVALID_HANDLE) IndicatorRelease(g_gridATRHandle);
   Print("=== SuperFiveCentBot v1.2 Stopped. Reason=",reason," ===");
}

void OnChartEvent(const int id, const long &lparam, const double &dparam, const string &sparam)
{
   if(id != CHARTEVENT_KEYDOWN) return;
   if(lparam != 'D' && lparam != 'd') return;

   g_showDashboard = !g_showDashboard;

   if(g_showDashboard)
   {
      CreateDashboard();
      UpdateDashboard();
      Print("Dashboard: ON");
   }
   else
   {
      DeleteDashboard();
      Print("Dashboard: OFF");
   }
}

//+------------------------------------------------------------------+
void OnTick()
{
   if(g_showDashboard)
   {
      uint nowMs = GetTickCount();
      if(DashboardUpdateMs <= 0 || (nowMs - g_lastDashTick) >= (uint)DashboardUpdateMs)
      {
         UpdateDashboard();
         ChartRedraw(0);
         g_lastDashTick = nowMs;
      }
   }

   string psReason = "";
   if(IsProfitStopActive(psReason))
   {
      CloseAllPositions();
      datetime now = TimeCurrent();
      if(now - g_lastProfitPrint >= 60)
      {
         double gain = AccountInfoDouble(ACCOUNT_EQUITY) - g_startEquity;
         Print("PROFIT STOP: active | gain=$", DoubleToString(gain, 2),
               " / target=$", DoubleToString(ProfitStopUSD, 2));
         g_lastProfitPrint = now;
      }
      return;
   }

   string friReason = "";
   if(IsFridayShutdownActive(friReason))
   {
      CloseAllPositions();
      datetime now = TimeCurrent();
      if(now - g_lastFridayPrint >= 60)
      {
         MqlDateTime dt; TimeToStruct(now, dt);
         Print("FRIDAY SHUTDOWN: active (", friReason, ") | ", StringFormat("%02d:%02d", dt.hour, dt.min));
         g_lastFridayPrint = now;
      }
      return;
   }

   int    buyCount=0,  sellCount=0;
   double loB=0,hiB=0,hiS=0,loS=0;
   double buyLots=0, sellLots=0, buyWsum=0, sellWsum=0;
   double buyPnl=0, sellPnl=0;

   for(int i=PositionsTotal()-1;i>=0;i--)
   {
      ulong tk=PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetInteger(POSITION_MAGIC)!=(long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL)!=_Symbol)           continue;
      ENUM_POSITION_TYPE pt=(ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
      double op=PositionGetDouble(POSITION_PRICE_OPEN);
      double lt=PositionGetDouble(POSITION_VOLUME);
      double pn=PositionGetDouble(POSITION_PROFIT)+PositionGetDouble(POSITION_SWAP);
      if(pt==POSITION_TYPE_BUY)
      {
         buyCount++;
         buyLots += lt; buyWsum += lt * op; buyPnl += pn;
         if(loB==0||op<loB)loB=op; if(hiB==0||op>hiB)hiB=op;
      }
      else
      {
         sellCount++;
         sellLots += lt; sellWsum += lt * op; sellPnl += pn;
         if(hiS==0||op>hiS)hiS=op; if(loS==0||op<loS)loS=op;
      }
   }
   double buyAvg  = (buyLots  > 0.0) ? (buyWsum  / buyLots)  : 0.0;
   double sellAvg = (sellLots > 0.0) ? (sellWsum / sellLots) : 0.0;

   if(buyCount ==0) g_buySLActive =false;
   if(sellCount==0) g_sellSLActive=false;

   double ask=SymbolInfoDouble(_Symbol,SYMBOL_ASK);
   double bid=SymbolInfoDouble(_Symbol,SYMBOL_BID);

   RefreshEmaCache();
   RefreshGridVolatilityCache();
   double gridGap = g_gridGapPrice;

   if(buyCount >0) UpdateSideTPs(POSITION_TYPE_BUY, buyLots, buyAvg);
   if(sellCount>0) UpdateSideTPs(POSITION_TYPE_SELL, sellLots, sellAvg);

   if(buyCount>0)
   {
      double p=buyPnl;
      if(p>=BuyTakeProfitUSD*SL_ActivationPct/100.0)
      { if(!g_buySLActive){Print("BUY SL armed $",DoubleToString(p,2));g_buySLActive=true;} UpdateSideSL(POSITION_TYPE_BUY, buyLots, buyAvg); }
   }
   if(sellCount>0)
   {
      double p=sellPnl;
      if(p>=SellTakeProfitUSD*SL_ActivationPct/100.0)
      { if(!g_sellSLActive){Print("SELL SL armed $",DoubleToString(p,2));g_sellSLActive=true;} UpdateSideSL(POSITION_TYPE_SELL, sellLots, sellAvg); }
   }

   bool didClose=false;
   if(buyCount>0 && buyPnl>=BuyTakeProfitUSD)
   {
      Print("BUY TP hit — closing buys.");
      CloseSide(POSITION_TYPE_BUY); g_buySLActive=false; buyCount=0; didClose=true;
   }
   if(sellCount>0 && sellPnl>=SellTakeProfitUSD)
   {
      Print("SELL TP hit — closing sells.");
      CloseSide(POSITION_TYPE_SELL); g_sellSLActive=false; sellCount=0; didClose=true;
   }
   if(didClose) return;

   if(IsNearMarketClose())
   {
      datetime now=TimeCurrent();
      if(now-g_lastClosePrint>=60)
      {
         MqlDateTime dt; TimeToStruct(now,dt);
         Print("CLOSE FILTER: blocked | Day=",dt.day_of_week, " | ",StringFormat("%02d:%02d",dt.hour,dt.min));
         g_lastClosePrint=now;
      }
      return;
   }

   double emaBuffer=EMA_BufferSteps*gridGap;
   bool   buyBlocked=false, sellBlocked=false;

   if(g_emaCacheOk)
   {
      double ema=g_emaNow;
      double sp =g_emaSlopePips;
      bool bA=(ask<ema-emaBuffer), bB=(ask<ema&&sp<-(double)EMA_MinSlopePips);
      bool sA=(bid>ema+emaBuffer), sB=(bid>ema&&sp> (double)EMA_MinSlopePips);
      datetime nowFt = TimeCurrent();
      if(bA||bB)
      {
         buyBlocked = true;
         if(nowFt - g_lastFilterBuyPrint >= 60)
         {
            Print("FILTER: Buy blocked  [",bA?"dist":"slope","] ask=",DoubleToString(ask,_Digits)," ema=",DoubleToString(ema,_Digits)," sp=",DoubleToString(sp,1),"p");
            g_lastFilterBuyPrint = nowFt;
         }
      }
      if(sA||sB)
      {
         sellBlocked=true;
         if(nowFt - g_lastFilterSellPrint >= 60)
         {
            Print("FILTER: Sell blocked [",sA?"dist":"slope","] bid=",DoubleToString(bid,_Digits)," ema=",DoubleToString(ema,_Digits)," sp=",DoubleToString(sp,1),"p");
            g_lastFilterSellPrint = nowFt;
         }
      }
   }

   string entryWhy = "";
   bool allowEntry = CanEnterNewTrade(entryWhy);

   if(buyCount==0 && sellCount==0)
   {
      if(!allowEntry)
      {
         datetime now=TimeCurrent();
         if(now-g_lastClosePrint>=60){Print("ENTRY BLOCKED: ",entryWhy);g_lastClosePrint=now;}
         return;
      }

      bool wantBuy = !buyBlocked;
      bool wantSell = !sellBlocked;

      if(UseTrendDirectionForL1 && g_emaCacheOk)
      {
         double sp = g_emaSlopePips;
         double ema = g_emaNow;
         wantBuy  = wantBuy  && (sp > 0.0) && (ask >= ema);
         wantSell = wantSell && (sp < 0.0) && (bid <= ema);
      }

      if(wantBuy)
      {
         double lot=GetGridLot(1);
         Print("v1.2 | BUY L1 | lot=",lot," | sell arms@",DoubleToString(ask+gridGap,_Digits));
         if(trade.Buy(lot,_Symbol,0,0,0,"GRID BUY L1")) MarkEntry();
      }
      else if(wantSell)
      {
         double lot=GetGridLot(1);
         Print("v1.2 | SELL L1 | lot=",lot," | buy arms@",DoubleToString(bid-gridGap,_Digits));
         if(trade.Sell(lot,_Symbol,0,0,0,"GRID SELL L1")) MarkEntry();
      }
      else
      {
         datetime now=TimeCurrent();
         if(now-g_lastClosePrint>=60){Print("FILTER: Both sides blocked — waiting.");g_lastClosePrint=now;}
      }
      return;
   }

   if(buyCount>0)
   {
      double trigger=loB-gridGap;
      if(ask<=trigger && !LevelAlreadyOpen(POSITION_TYPE_BUY,trigger))
      {
         if(!allowEntry) return;
         double lot=GetGridLot(buyCount+1);
         Print("Grid BUY L",buyCount+1," | lot=",lot," | trigger=",DoubleToString(trigger,_Digits));
         if(trade.Buy(lot,_Symbol,0,0,0,"GRID BUY L"+IntegerToString(buyCount+1))) MarkEntry();
         return;
      }
   }

   if(sellCount==0 && buyCount>0)
   {
      bool hov=(buyCount>=HedgeOverrideLevels);
      double trigger=hiB+gridGap;
      if(bid>=trigger)
      {
         if((!sellBlocked||hov) && !LevelAlreadyOpen(POSITION_TYPE_SELL,trigger))
         {
            if(!allowEntry) return;
            double lot=GetGridLot(1);
            Print("Grid SELL L1",(hov&&sellBlocked?" [hedge override]":""),
                  " | lot=",lot," | trigger=",DoubleToString(trigger,_Digits), " | buyCount=",buyCount);
            if(trade.Sell(lot,_Symbol,0,0,0,"GRID SELL L1")) MarkEntry();
            return;
         }
      }
   }

   if(buyCount==0 && sellCount>0)
   {
      bool hov=(sellCount>=HedgeOverrideLevels);
      double trigger=loS-gridGap;
      if(ask<=trigger)
      {
         if((!buyBlocked||hov) && !LevelAlreadyOpen(POSITION_TYPE_BUY,trigger))
         {
            if(!allowEntry) return;
            double lot=GetGridLot(1);
            Print("Grid BUY L1 (vs sell)",(hov&&buyBlocked?" [hedge override]":""),
                  " | lot=",lot," | trigger=",DoubleToString(trigger,_Digits), " | sellCount=",sellCount);
            if(trade.Buy(lot,_Symbol,0,0,0,"GRID BUY L1")) MarkEntry();
            return;
         }
      }
   }

   if(sellCount>0)
   {
      double trigger=hiS+gridGap;
      if(bid>=trigger && !LevelAlreadyOpen(POSITION_TYPE_SELL,trigger))
      {
         if(!allowEntry) return;
         double lot=GetGridLot(sellCount+1);
         Print("Grid SELL L",sellCount+1," | lot=",lot," | trigger=",DoubleToString(trigger,_Digits));
         if(trade.Sell(lot,_Symbol,0,0,0,"GRID SELL L"+IntegerToString(sellCount+1))) MarkEntry();
         return;
      }
   }
}

//+------------------------------------------------------------------+
bool LevelAlreadyOpen(ENUM_POSITION_TYPE side,double triggerPrice)
{
   double hs=g_gridGapPrice*0.5;
   for(int i=PositionsTotal()-1;i>=0;i--)
   {
      ulong tk=PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetInteger(POSITION_MAGIC)!=(long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL)!=_Symbol)           continue;
      if((ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE)!=side) continue;
      if(MathAbs(PositionGetDouble(POSITION_PRICE_OPEN)-triggerPrice)<hs)
      { return true; }
   }
   return false;
}

double GetGridLot(int level)
{
   int L = (level <= 0) ? 1 : level;
   return NormalizeLot(InitialLot * MathPow(LotMultiplier, L - 1));
}

//+------------------------------------------------------------------+
void UpdateSideTPs(ENUM_POSITION_TYPE side, double lots, double avg)
{
   double tv=SymbolInfoDouble(_Symbol,SYMBOL_TRADE_TICK_VALUE);
   double ts=SymbolInfoDouble(_Symbol,SYMBOL_TRADE_TICK_SIZE);
   double tgt=(side==POSITION_TYPE_BUY)?BuyTakeProfitUSD:SellTakeProfitUSD;
   if(tv<=0||ts<=0) return;
   if(lots<=0) return;
   double dist=NormalizeDouble((tgt/(lots*tv))*ts,_Digits);
   double tp=NormalizeDouble(side==POSITION_TYPE_BUY?avg+dist:avg-dist,_Digits);
   for(int i=PositionsTotal()-1;i>=0;i--)
   {
      ulong tk=PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetInteger(POSITION_MAGIC)!=(long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL)!=_Symbol)           continue;
      if((ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE)!=side) continue;
      double cTP=PositionGetDouble(POSITION_TP),cSL=PositionGetDouble(POSITION_SL);
      if(MathAbs(cTP-tp)>ts)
         if(!trade.PositionModify(tk,cSL,tp))
         {
            datetime now=TimeCurrent();
            if(now-g_lastTradeErrPrint>=60){Print("UpdateTP ERR ",GetLastError()," tk=",tk);g_lastTradeErrPrint=now;}
         }
   }
}

//+------------------------------------------------------------------+
void UpdateSideSL(ENUM_POSITION_TYPE side, double lots, double avg)
{
   double tv=SymbolInfoDouble(_Symbol,SYMBOL_TRADE_TICK_VALUE);
   double ts=SymbolInfoDouble(_Symbol,SYMBOL_TRADE_TICK_SIZE);
   double ask=SymbolInfoDouble(_Symbol,SYMBOL_ASK);
   double bid=SymbolInfoDouble(_Symbol,SYMBOL_BID);
   double lock=((side==POSITION_TYPE_BUY)?BuyTakeProfitUSD:SellTakeProfitUSD)*SL_LockInPct/100.0;
   if(tv<=0||ts<=0) return;
   if(lots<=0) return;
   double dist=NormalizeDouble((lock/(lots*tv))*ts,_Digits);
   double sl=NormalizeDouble(side==POSITION_TYPE_BUY?avg+dist:avg-dist,_Digits);
   double mb=2.0*ts;
   if(side==POSITION_TYPE_BUY  &&sl>=bid-mb) return;
   if(side==POSITION_TYPE_SELL &&sl<=ask+mb) return;
   for(int i=PositionsTotal()-1;i>=0;i--)
   {
      ulong tk=PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetInteger(POSITION_MAGIC)!=(long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL)!=_Symbol)           continue;
      if((ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE)!=side) continue;
      double cSL=PositionGetDouble(POSITION_SL),cTP=PositionGetDouble(POSITION_TP);
      if(MathAbs(cSL-sl)>ts)
         if(!trade.PositionModify(tk,sl,cTP))
         {
            datetime now=TimeCurrent();
            if(now-g_lastTradeErrPrint>=60){Print("UpdateSL ERR ",GetLastError()," tk=",tk);g_lastTradeErrPrint=now;}
         }
   }
}

//+------------------------------------------------------------------+
void CloseSide(ENUM_POSITION_TYPE side)
{
   for(int i=PositionsTotal()-1;i>=0;i--)
   {
      ulong tk=PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetInteger(POSITION_MAGIC)!=(long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL)!=_Symbol)           continue;
      if((ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE)!=side) continue;
      if(!trade.PositionClose(tk))
      {
         datetime now=TimeCurrent();
         if(now-g_lastTradeErrPrint>=60){Print("CloseSide ERR ",GetLastError()," tk=",tk);g_lastTradeErrPrint=now;}
      }
      else
         Print("Closed [",(side==POSITION_TYPE_BUY?"BUY":"SELL"),"] tk=",tk);
   }
}

//+------------------------------------------------------------------+
void CloseAllPositions()
{
   static uint lastAttemptMs = 0;
   uint nowMs = GetTickCount();
   if(nowMs - lastAttemptMs < 2000) return;
   lastAttemptMs = nowMs;

   for(int i=PositionsTotal()-1;i>=0;i--)
   {
      ulong tk=PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetInteger(POSITION_MAGIC)!=(long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL)!=_Symbol)           continue;
      if(!trade.PositionClose(tk))
      {
         datetime now=TimeCurrent();
         if(now-g_lastTradeErrPrint>=60){Print("CloseAll ERR ",GetLastError()," tk=",tk);g_lastTradeErrPrint=now;}
      }
   }
}

//+------------------------------------------------------------------+
double NormalizeLot(double lots)
{
   double mn=SymbolInfoDouble(_Symbol,SYMBOL_VOLUME_MIN);
   double mx=SymbolInfoDouble(_Symbol,SYMBOL_VOLUME_MAX);
   double st=SymbolInfoDouble(_Symbol,SYMBOL_VOLUME_STEP);
   lots=MathFloor(lots/st)*st;
   lots=MathMax(lots,mn);
   lots=MathMin(lots,mx);
   return NormalizeDouble(lots,2);
}
