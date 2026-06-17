//+------------------------------------------------------------------+
//|                    GoldMesh EA  v2.8                             |
//|                       MQL5 / MT5                                 |
//|                                                                  |
//|  FIXES vs v2.7:                                                  |
//|   Fix 1  — Gap fill: up to 5 skipped levels opened per tick      |
//|   Fix 2  — LevelAlreadyOpen tolerance → 25% of GridStep          |
//|   Fix 3  — tradePlaced flag: at most one trade-open action/tick   |
//|   Fix 4  — Local counters/prices updated inside gap-fill loops    |
//|   Fix 6  — Trailing SL never moves backwards against profit       |
//|   Fix 7  — Separate SundayOpenHour / SundayOpenMinute inputs      |
//|   Fix 8  — g_lastBothBlockPrint split from g_lastClosePrint       |
//|   Fix 9  — CloseAllPositions wired to Delete key (OnChartEvent)   |
//|   Fix 10 — Dashboard legend explains * mirror-trigger marker      |
//|   Fix 11 — EMA_MinSlopePips changed to double input               |
//|   Fix 12 — Single-pass position scan in UpdateSideTPs / SideSL    |
//+------------------------------------------------------------------+
#property copyright "GoldMesh EA"
#property description "Grid martingale for Gold — v2.8"
#property version   "2.8"

#include <Trade\Trade.mqh>
CTrade trade;

//=== GRID INPUTS ====================================================
input int    GridStep        = 300;
input double InitialLot      = 0.01;

//=== TREND FILTER INPUTS ============================================
input int    EMA_Period       = 200;
input double EMA_BufferSteps  = 2.0;
input int    EMA_SlopeBars    = 5;
input double EMA_MinSlopePips = 30.0;   // Fix 11: was int, now double

//=== HEDGE OVERRIDE =================================================
input int    HedgeOverrideLevels = 3;

//=== PROFIT INPUTS ==================================================
input double BuyTakeProfitUSD  = 1.0;
input double SellTakeProfitUSD = 1.0;

//=== TRAILING SL INPUTS =============================================
input double SL_ActivationPct  = 70.0;
input double SL_LockInPct      = 50.0;

//=== MISC INPUTS ====================================================
input ulong  MagicNumber  = 20240105;
input int    Slippage     = 3;

//=== MARKET CLOSE INPUTS ============================================
input bool UseCloseFilter      = true;
input int  MarketCloseHour     = 22;
input int  MarketCloseMinute   = 0;
input int  SundayOpenHour      = 22;    // Fix 7: separate input for Sunday reopen
input int  SundayOpenMinute    = 0;     // Fix 7: separate input for Sunday reopen
input int  NoTradeMinutes      = 60;

//=== GLOBALS ========================================================
double   g_pip;
bool     g_buySLActive        = false;
bool     g_sellSLActive       = false;
int      g_emaHandle          = INVALID_HANDLE;
datetime g_lastClosePrint     = 0;   // Fix 8: market-close filter only
datetime g_lastBothBlockPrint = 0;   // Fix 8: split from g_lastClosePrint
datetime g_lastSellBlockPrint = 0;
datetime g_lastBuyBlockPrint  = 0;

// Fix 12: reusable position data struct for single-pass scans
struct PosData
{
   ulong  ticket;
   double volume;
   double openPrice;
   double sl;
   double tp;
};

//+------------------------------------------------------------------+
//  DASHBOARD  v2.8
//+------------------------------------------------------------------+
#define DASH_PFX "GM28_"
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
   ObjectSetInteger(0, n, OBJPROP_YSIZE,       36 * DASH_RH + 12);  // +3 rows: legend, Sun, emg
   ObjectSetInteger(0, n, OBJPROP_BGCOLOR,     C'14,18,28');
   ObjectSetInteger(0, n, OBJPROP_BORDER_TYPE, BORDER_FLAT);
   ObjectSetInteger(0, n, OBJPROP_COLOR,       C'40,52,80');
   ObjectSetInteger(0, n, OBJPROP_CORNER,      CORNER_LEFT_UPPER);
   ObjectSetInteger(0, n, OBJPROP_BACK,        false);
   ObjectSetInteger(0, n, OBJPROP_SELECTABLE,  false);
   ObjectSetInteger(0, n, OBJPROP_HIDDEN,      true);
   ChartRedraw(0);
}

void DeleteDashboard() { ObjectsDeleteAll(0, DASH_PFX); ChartRedraw(0); }

//+------------------------------------------------------------------+
void UpdateDashboard()
{
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

   // ── Header ──────────────────────────────────────────────────────
   DashLabel("hdr", lx, y, "GoldMesh EA v2.8   " + _Symbol, clrGold, 10);
   y += rh + 4;

   // ── STATUS ──────────────────────────────────────────────────────
   DashLabel("sep_a", lx, y, "  STATUS", cDim, 8);
   y += rh;

   DashLabel("lbl_time", lx, y, Pad("Server time", LW), cLbl);
   DashLabel("val_time", bx, y, TimeToString(TimeCurrent(), TIME_DATE|TIME_MINUTES), cVal);
   y += rh;

   bool cls = IsNearMarketClose();
   DashLabel("lbl_cls", lx, y, Pad("Market", LW), cLbl);
   DashLabel("val_cls", bx, y, cls ? "BLOCKED" : "Open  OK", cls ? cWarn : cGood);
   y += rh;

   // ── EMA TREND ───────────────────────────────────────────────────
   DashLabel("sep_b", lx, y, "  EMA TREND", cDim, 8);
   y += rh;

   double ask      = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid      = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double emaN[1], emaP[1];
   bool   emaOk    = (CopyBuffer(g_emaHandle,0,0,            1,emaN)==1 &&
                      CopyBuffer(g_emaHandle,0,EMA_SlopeBars,1,emaP)==1);
   double emaBuffer = EMA_BufferSteps * GridStep * g_pip;

   DashLabel("lbl_ema", lx, y, Pad("EMA("+IntegerToString(EMA_Period)+")", LW), cLbl);
   DashLabel("val_ema", bx, y,
             emaOk ? DoubleToString(emaN[0],_Digits) : "unavailable",
             emaOk ? cVal : cWarn);
   y += rh;

   if(emaOk)
   {
      double sp = (emaN[0] - emaP[0]) / g_pip;
      double dp = (bid     - emaN[0]) / g_pip;

      string dStr = (dp>=0?"+":"") + DoubleToString(dp,0) + "p " + (dp>=0?"above":"below");
      DashLabel("lbl_dist", lx, y, Pad("Dist EMA", LW), cLbl);
      DashLabel("val_dist", bx, y, dStr, dp>0 ? cSell : (dp<0 ? cBuy : cVal));
      y += rh;

      string slopeStr = (sp>=0?"+":"") + DoubleToString(sp,1) + "p/" + IntegerToString(EMA_SlopeBars) + "b";
      string trendStr;
      color  trendClr;
      if     (sp >  EMA_MinSlopePips*2) { trendStr="Strong up";   trendClr=cBad;  }
      else if(sp >  EMA_MinSlopePips  ) { trendStr="Mild up";     trendClr=cWarn; }
      else if(sp >  0                 ) { trendStr="Drift up";    trendClr=cVal;  }
      else if(sp == 0                 ) { trendStr="Flat";        trendClr=cVal;  }
      else if(sp > -EMA_MinSlopePips  ) { trendStr="Drift down";  trendClr=cVal;  }
      else if(sp > -EMA_MinSlopePips*2) { trendStr="Mild down";   trendClr=cWarn; }
      else                              { trendStr="Strong down"; trendClr=cGood; }

      DashLabel("lbl_slp",  lx, y, Pad("Slope", LW), cLbl);
      DashLabel("val_slpv", bx, y, Trunc(slopeStr, 14), cVal);
      DashLabel("val_slpt", sx, y, trendStr,             trendClr);
      y += rh;

      bool bA = (ask < emaN[0]-emaBuffer), bB = (ask < emaN[0] && sp < -EMA_MinSlopePips);
      bool sA = (bid > emaN[0]+emaBuffer), sB = (bid > emaN[0] && sp >  EMA_MinSlopePips);

      DashLabel("lbl_flt",  lx, y, Pad("Filter",  LW), cLbl);
      DashLabel("hdr_fbuy", bx, y, "BUY",              cBuy);
      DashLabel("hdr_fsel", sx, y, "SELL",             cSell);
      y += rh;

      DashLabel("lbl_flt2", lx, y, Pad("", LW), cLbl);
      DashLabel("val_bflt", bx, y,
                bA?"BLK dist":(bB?"BLK slope":"clear"),
                (bA||bB)?cBad:cGood);
      DashLabel("val_sflt", sx, y,
                sA?"BLK dist":(sB?"BLK slope":"clear"),
                (sA||sB)?cBad:cGood);
      y += rh;
   }
   else
      y += rh * 4;

   // ── GRID POSITIONS ───────────────────────────────────────────────
   DashLabel("sep_c", lx, y, "  GRID POSITIONS", cDim, 8);
   y += rh;

   DashLabel("col_lbl", lx, y, Pad("", LW), cDim);
   DashLabel("col_buy", bx, y, "BUY",       cBuy);
   DashLabel("col_sel", sx, y, "SELL",      cSell);
   y += rh;

   int    bCnt=0,  sCnt=0;
   double bLots=0, sLots=0, bWsum=0, sWsum=0, bPnl=0, sPnl=0;
   double loB=0,   hiB=0,   hiS=0,   loS=0;

   for(int i=PositionsTotal()-1; i>=0; i--)
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
   double bAvg = bLots>0 ? bWsum/bLots : 0;
   double sAvg = sLots>0 ? sWsum/sLots : 0;
   string D    = "--";

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

   // Next trigger
   string bNxt, sNxt;
   if(bCnt>0)       bNxt = Trunc(DoubleToString(loB-GridStep*g_pip,_Digits),13);
   else if(sCnt>0)  bNxt = Trunc(DoubleToString(loS-GridStep*g_pip,_Digits),13)+"*";
   else             bNxt = D;
   if(sCnt>0)       sNxt = Trunc(DoubleToString(hiS+GridStep*g_pip,_Digits),13);
   else if(bCnt>0)  sNxt = Trunc(DoubleToString(hiB+GridStep*g_pip,_Digits),13)+"*";
   else             sNxt = D;

   DashLabel("lbl_nxt",  lx,y,Pad("Next level",LW),cLbl);
   DashLabel("val_bnxt", bx,y,bNxt,cVal);
   DashLabel("val_snxt", sx,y,sNxt,cVal);
   y+=rh;

   // Fix 10: legend row explaining the * marker
   DashLabel("lbl_leg", lx, y, "  * = cross-grid mirror trigger", cDim, 8);
   y+=rh;

   DashLabel("lbl_sl",  lx,y,Pad("SL armed",LW),cLbl);
   DashLabel("val_bsl", bx,y,g_buySLActive ?"ARMED":"off",g_buySLActive ?cWarn:cDim);
   DashLabel("val_ssl", sx,y,g_sellSLActive?"ARMED":"off",g_sellSLActive?cWarn:cDim);
   y+=rh;

   bool hB=(bCnt>=HedgeOverrideLevels), hS=(sCnt>=HedgeOverrideLevels);
   DashLabel("lbl_hov",  lx,y,Pad("HedgeOvrd",LW),cLbl);
   DashLabel("val_bhov", bx,y,
             hB?"ON ("+IntegerToString(bCnt)+"/"+IntegerToString(HedgeOverrideLevels)+")":"off",
             hB?cWarn:cDim);
   DashLabel("val_shov", sx,y,
             hS?"ON ("+IntegerToString(sCnt)+"/"+IntegerToString(HedgeOverrideLevels)+")":"off",
             hS?cWarn:cDim);
   y+=rh;

   // ── SETTINGS ─────────────────────────────────────────────────────
   DashLabel("sep_d", lx,y,"  SETTINGS",cDim,8);
   y+=rh;

   DashLabel("lbl_tp",  lx,y,Pad("TP target",LW),cLbl);
   DashLabel("val_btp", bx,y,"$"+DoubleToString(BuyTakeProfitUSD,2),cVal);
   DashLabel("val_stp", sx,y,"$"+DoubleToString(SellTakeProfitUSD,2),cVal);
   y+=rh;

   DashLabel("lbl_gs",  lx,y,Pad("Grid step",LW),cLbl);
   DashLabel("val_gs",  bx,y,IntegerToString(GridStep)+" pips",cVal);
   y+=rh;

   DashLabel("lbl_buf", lx,y,Pad("EMA buffer",LW),cLbl);
   DashLabel("val_buf", bx,y,
             DoubleToString(EMA_BufferSteps,1)+"x = "+
             IntegerToString((int)(GridStep*EMA_BufferSteps))+" pips",cVal);
   y+=rh;

   DashLabel("lbl_slps", lx,y,Pad("EMA slope",LW),cLbl);
   DashLabel("val_slps", bx,y,
             IntegerToString(EMA_SlopeBars)+" bars / "+
             DoubleToString(EMA_MinSlopePips,1)+" pip min",cVal);   // Fix 11
   y+=rh;

   DashLabel("lbl_hovs", lx,y,Pad("Hedge lvl",LW),cLbl);
   DashLabel("val_hovs", bx,y,IntegerToString(HedgeOverrideLevels)+" levels",cVal);
   y+=rh;

   // Fix 7: show Sunday open time so user can verify setting
   DashLabel("lbl_sun", lx,y,Pad("Sun open",LW),cLbl);
   DashLabel("val_sun", bx,y,
             StringFormat("%02d:%02d server",SundayOpenHour,SundayOpenMinute),cVal);
   y+=rh;

   // Fix 9: emergency key hint
   DashLabel("lbl_emg", lx,y,"  [Del] = Emergency close all positions",cWarn,8);

   ChartRedraw(0);
}

//+------------------------------------------------------------------+
//  Fix 7: IsNearMarketClose — Sunday uses its own separate inputs
//+------------------------------------------------------------------+
bool IsNearMarketClose()
{
   if(!UseCloseFilter) return false;
   MqlDateTime dt; TimeToStruct(TimeCurrent(), dt);
   int m = dt.hour*60 + dt.min;
   // Saturday: market is always closed
   if(dt.day_of_week == 6) return true;
   // Sunday: blocked until the configurable reopen time
   // Fix 7: was tied to MarketOpenHour (ambiguous), now its own input
   if(dt.day_of_week == 0 && m < SundayOpenHour*60 + SundayOpenMinute) return true;
   // Friday: block trading NoTradeMinutes before scheduled close
   if(dt.day_of_week == 5 && m >= MarketCloseHour*60 + MarketCloseMinute - NoTradeMinutes) return true;
   return false;
}

//+------------------------------------------------------------------+
int OnInit()
{
   trade.SetExpertMagicNumber(MagicNumber);
   trade.SetDeviationInPoints(Slippage*10);
   g_pip = (_Digits==5||_Digits==3) ? 10.0*_Point : _Point;
   g_emaHandle = iMA(_Symbol, PERIOD_CURRENT, EMA_Period, 0, MODE_EMA, PRICE_CLOSE);
   if(g_emaHandle == INVALID_HANDLE) { Print("ERROR: EMA handle failed"); return INIT_FAILED; }

   Print("=== GoldMesh EA v2.8 | ",_Symbol,
         " | Step=",GridStep,"p | BuyTP=$",BuyTakeProfitUSD,
         " | SellTP=$",SellTakeProfitUSD," ===");
   Print("=== EMA(",EMA_Period,") buf=",EMA_BufferSteps,"x(",
         (int)(GridStep*EMA_BufferSteps),"p) slp=",EMA_SlopeBars,"b/",
         DoubleToString(EMA_MinSlopePips,1),"p ===");          // Fix 11
   Print("=== HedgeOverride>=",HedgeOverrideLevels,
         " | CloseFilter=",NoTradeMinutes,"min",
         " | SundayOpen=",StringFormat("%02d:%02d",SundayOpenHour,SundayOpenMinute)," ===");
   for(int i=1; i<=10; i++)
      Print("  L",i," -> ",DoubleToString(GetLinearLot(i),2)," lots");
   CreateDashboard();
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   DeleteDashboard();
   if(g_emaHandle != INVALID_HANDLE) IndicatorRelease(g_emaHandle);
   Print("=== GoldMesh EA v2.8 Stopped. Reason=",reason," ===");
}

//+------------------------------------------------------------------+
//  Fix 9: Wire CloseAllPositions to the Delete key
//+------------------------------------------------------------------+
void OnChartEvent(const int id, const long &lparam,
                  const double &dparam, const string &sparam)
{
   if(id == CHARTEVENT_KEYDOWN && lparam == 46)  // VK_DELETE = 46
   {
      Print("=== EMERGENCY CLOSE ALL — Delete key pressed ===");
      CloseAllPositions();
      g_buySLActive  = false;
      g_sellSLActive = false;
   }
}

//+------------------------------------------------------------------+
void OnTick()
{
   UpdateDashboard();

   int    buyCount=0, sellCount=0;
   double loB=0, hiB=0, hiS=0, loS=0;

   for(int i=PositionsTotal()-1; i>=0; i--)
   {
      ulong tk=PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetInteger(POSITION_MAGIC)!=(long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL)!=_Symbol)           continue;
      ENUM_POSITION_TYPE pt=(ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
      double op=PositionGetDouble(POSITION_PRICE_OPEN);
      if(pt==POSITION_TYPE_BUY)
      {
         buyCount++;
         if(loB==0||op<loB)loB=op; if(hiB==0||op>hiB)hiB=op;
      }
      else
      {
         sellCount++;
         if(hiS==0||op>hiS)hiS=op; if(loS==0||op<loS)loS=op;
      }
   }

   if(buyCount ==0) g_buySLActive  = false;
   if(sellCount==0) g_sellSLActive = false;

   double ask=SymbolInfoDouble(_Symbol,SYMBOL_ASK);
   double bid=SymbolInfoDouble(_Symbol,SYMBOL_BID);

   if(buyCount >0) UpdateSideTPs(POSITION_TYPE_BUY);
   if(sellCount>0) UpdateSideTPs(POSITION_TYPE_SELL);

   if(buyCount>0)
   {
      double p=GetSideProfit(POSITION_TYPE_BUY);
      if(p>=BuyTakeProfitUSD*SL_ActivationPct/100.0)
      {
         if(!g_buySLActive){Print("BUY SL armed $",DoubleToString(p,2)); g_buySLActive=true;}
         UpdateSideSL(POSITION_TYPE_BUY);   // Fix 6 inside here
      }
   }
   if(sellCount>0)
   {
      double p=GetSideProfit(POSITION_TYPE_SELL);
      if(p>=SellTakeProfitUSD*SL_ActivationPct/100.0)
      {
         if(!g_sellSLActive){Print("SELL SL armed $",DoubleToString(p,2)); g_sellSLActive=true;}
         UpdateSideSL(POSITION_TYPE_SELL);  // Fix 6 inside here
      }
   }

   bool didClose=false;
   if(buyCount>0 && GetSideProfit(POSITION_TYPE_BUY)>=BuyTakeProfitUSD)
   {
      Print("BUY TP hit — closing buys.");
      CloseSide(POSITION_TYPE_BUY); g_buySLActive=false; buyCount=0; didClose=true;
   }
   if(sellCount>0 && GetSideProfit(POSITION_TYPE_SELL)>=SellTakeProfitUSD)
   {
      Print("SELL TP hit — closing sells.");
      CloseSide(POSITION_TYPE_SELL); g_sellSLActive=false; sellCount=0; didClose=true;
   }
   if(didClose) return;

   // ── Market close filter ─────────────────────────────────────────
   if(IsNearMarketClose())
   {
      datetime now=TimeCurrent();
      if(now-g_lastClosePrint>=60)  // Fix 8: g_lastClosePrint = market-close only
      {
         MqlDateTime dt; TimeToStruct(now,dt);
         Print("CLOSE FILTER: blocked | Day=",dt.day_of_week,
               " | ",StringFormat("%02d:%02d",dt.hour,dt.min));
         g_lastClosePrint=now;
      }
      return;
   }

   // ── EMA trend filter ────────────────────────────────────────────
   double emaN[1], emaP[1];
   double emaBuffer = EMA_BufferSteps*GridStep*g_pip;
   bool   emaReady  = (CopyBuffer(g_emaHandle,0,0,            1,emaN)==1 &&
                       CopyBuffer(g_emaHandle,0,EMA_SlopeBars,1,emaP)==1);
   bool   buyBlocked=false, sellBlocked=false;

   if(emaReady)
   {
      double ema=emaN[0];
      double sp =(emaN[0]-emaP[0])/g_pip;
      // Fix 11: EMA_MinSlopePips is now double — no cast needed
      bool bA=(ask<ema-emaBuffer), bB=(ask<ema && sp<-EMA_MinSlopePips);
      bool sA=(bid>ema+emaBuffer), sB=(bid>ema && sp> EMA_MinSlopePips);
      if(bA||bB)
      {
         buyBlocked=true;
         Print("FILTER: Buy blocked  [",bA?"dist":"slope",
               "] ask=",DoubleToString(ask,_Digits),
               " ema=",DoubleToString(ema,_Digits),
               " sp=",DoubleToString(sp,1),"p");
      }
      if(sA||sB)
      {
         sellBlocked=true;
         Print("FILTER: Sell blocked [",sA?"dist":"slope",
               "] bid=",DoubleToString(bid,_Digits),
               " ema=",DoubleToString(ema,_Digits),
               " sp=",DoubleToString(sp,1),"p");
      }
   }

   // Fix 3: single flag — at most one trade-open action per tick
   bool tradePlaced=false;

   //--- 2. No positions — symmetric first entry ─────────────────────
   if(buyCount==0 && sellCount==0)
   {
      if(!buyBlocked)
      {
         double lot=GetLinearLot(1);
         Print("v2.8 | BUY L1 | lot=",DoubleToString(lot,2),
               " | sell arms@",DoubleToString(ask+GridStep*g_pip,_Digits));
         trade.Buy(lot,_Symbol,0,0,0,"GRID BUY L1");
      }
      else if(!sellBlocked)
      {
         double lot=GetLinearLot(1);
         Print("v2.8 | Buy blocked — SELL L1 | lot=",DoubleToString(lot,2),
               " | buy arms@",DoubleToString(bid-GridStep*g_pip,_Digits));
         trade.Sell(lot,_Symbol,0,0,0,"GRID SELL L1");
      }
      else
      {
         datetime now=TimeCurrent();
         if(now-g_lastBothBlockPrint>=60)  // Fix 8: dedicated timestamp
         {
            Print("FILTER: Both sides blocked — waiting.");
            g_lastBothBlockPrint=now;
         }
      }
      return;
   }

   //--- 3. Buy martingale — with gap fill (Fix 1, Fix 4) ─────────────
   if(buyCount>0 && !tradePlaced)
   {
      double trigger = loB - GridStep*g_pip;
      int maxFill=5, filled=0;
      while(ask<=trigger && filled<maxFill)
      {
         if(LevelAlreadyOpen(POSITION_TYPE_BUY, trigger)) break;
         double lot=GetLinearLot(buyCount+1);
         Print("Grid BUY L",buyCount+1,
               " | lot=",DoubleToString(lot,2),
               " | trigger=",DoubleToString(trigger,_Digits),
               filled>0?" [gap-fill]":"");
         if(!trade.Buy(lot,_Symbol,0,0,0,"GRID BUY L"+IntegerToString(buyCount+1)))
         {
            Print("BUY L",buyCount+1," FAILED err=",GetLastError());
            break;
         }
         buyCount++;            // Fix 4: keep local count current
         loB=trigger;           // Fix 4: update low-water mark
         tradePlaced=true;
         filled++;
         trigger=loB-GridStep*g_pip;  // Fix 4: recalculate for next gap level
      }
      if(tradePlaced) return;
   }

   //--- 4. First sell against buy grid ──────────────────────────────
   if(sellCount==0 && buyCount>0 && !tradePlaced)
   {
      bool   hov     = (buyCount>=HedgeOverrideLevels);
      double trigger = hiB+GridStep*g_pip;
      if(bid>=trigger)
      {
         if(!sellBlocked||hov)
         {
            if(!LevelAlreadyOpen(POSITION_TYPE_SELL,trigger))
            {
               double lot=GetLinearLot(1);
               Print("Grid SELL L1",(hov&&sellBlocked?" [hedge override]":""),
                     " | lot=",DoubleToString(lot,2),
                     " | trigger=",DoubleToString(trigger,_Digits),
                     " | buyCount=",buyCount);
               if(trade.Sell(lot,_Symbol,0,0,0,"GRID SELL L1"))
               {
                  tradePlaced=true;
                  sellCount++;    // Fix 4
                  hiS=trigger;    // Fix 4: initialise sell extremes
                  loS=trigger;
               }
            }
         }
         else
         {
            datetime now=TimeCurrent();
            if(now-g_lastSellBlockPrint>=60)
            {
               Print("FILTER: SELL L1 blocked at trigger",
                     " bid=",DoubleToString(bid,_Digits),
                     " trg=",DoubleToString(trigger,_Digits),
                     " | buyCount=",buyCount,
                     " | override at >=",HedgeOverrideLevels,
                     " (",HedgeOverrideLevels-buyCount," away)");
               g_lastSellBlockPrint=now;
            }
         }
      }
   }
   if(tradePlaced) return;  // Fix 3: prevent steps 5/6 firing same tick as step 4

   //--- 5. First buy against sell grid — mirror trigger (v2.7 feature) ─
   if(buyCount==0 && sellCount>0 && !tradePlaced)
   {
      bool   hov     = (sellCount>=HedgeOverrideLevels);
      double trigger = loS-GridStep*g_pip;
      if(ask<=trigger)
      {
         if(!buyBlocked||hov)
         {
            if(!LevelAlreadyOpen(POSITION_TYPE_BUY,trigger))
            {
               double lot=GetLinearLot(1);
               Print("Grid BUY L1 (vs sell)",(hov&&buyBlocked?" [hedge override]":""),
                     " | lot=",DoubleToString(lot,2),
                     " | trigger=",DoubleToString(trigger,_Digits),
                     " | sellCount=",sellCount);
               if(trade.Buy(lot,_Symbol,0,0,0,"GRID BUY L1"))
               {
                  tradePlaced=true;
                  buyCount++;    // Fix 4
                  loB=trigger;   // Fix 4: initialise buy extremes
                  hiB=trigger;
               }
            }
         }
         else
         {
            datetime now=TimeCurrent();
            if(now-g_lastBuyBlockPrint>=60)
            {
               Print("FILTER: BUY L1 blocked (vs sell grid)",
                     " ask=",DoubleToString(ask,_Digits),
                     " trg=",DoubleToString(trigger,_Digits),
                     " | sellCount=",sellCount,
                     " | override at >=",HedgeOverrideLevels,
                     " (",HedgeOverrideLevels-sellCount," away)");
               g_lastBuyBlockPrint=now;
            }
         }
      }
   }
   if(tradePlaced) return;  // Fix 3: prevent step 6 firing same tick as step 5

   //--- 6. Sell martingale — with gap fill (Fix 1, Fix 4) ────────────
   if(sellCount>0 && !tradePlaced)
   {
      double trigger = hiS+GridStep*g_pip;
      int maxFill=5, filled=0;
      while(bid>=trigger && filled<maxFill)
      {
         if(LevelAlreadyOpen(POSITION_TYPE_SELL,trigger)) break;
         double lot=GetLinearLot(sellCount+1);
         Print("Grid SELL L",sellCount+1,
               " | lot=",DoubleToString(lot,2),
               " | trigger=",DoubleToString(trigger,_Digits),
               filled>0?" [gap-fill]":"");
         if(!trade.Sell(lot,_Symbol,0,0,0,"GRID SELL L"+IntegerToString(sellCount+1)))
         {
            Print("SELL L",sellCount+1," FAILED err=",GetLastError());
            break;
         }
         sellCount++;           // Fix 4
         hiS=trigger;           // Fix 4: update high-water mark
         tradePlaced=true;
         filled++;
         trigger=hiS+GridStep*g_pip;  // Fix 4: recalculate for next gap level
      }
   }
}

//+------------------------------------------------------------------+
//  Fix 2: tolerance reduced from 50% → 25% of GridStep
//         Prevents adjacent-level overlap while still catching slippage
//+------------------------------------------------------------------+
bool LevelAlreadyOpen(ENUM_POSITION_TYPE side, double triggerPrice)
{
   double hs = GridStep * 0.25 * g_pip;   // Fix 2: was 0.5
   for(int i=PositionsTotal()-1; i>=0; i--)
   {
      ulong tk=PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetInteger(POSITION_MAGIC)!=(long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL)!=_Symbol)           continue;
      if((ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE)!=side) continue;
      if(MathAbs(PositionGetDouble(POSITION_PRICE_OPEN)-triggerPrice)<hs)
      {
         Print("LevelAlreadyOpen: skip near ",DoubleToString(triggerPrice,_Digits));
         return true;
      }
   }
   return false;
}

double GetLinearLot(int level)
{ return NormalizeLot(InitialLot*(level<=0?1:level)); }

//+------------------------------------------------------------------+
//  Fix 12: UpdateSideTPs — single-pass scan (collect then modify)
//+------------------------------------------------------------------+
void UpdateSideTPs(ENUM_POSITION_TYPE side)
{
   double tv=SymbolInfoDouble(_Symbol,SYMBOL_TRADE_TICK_VALUE);
   double ts=SymbolInfoDouble(_Symbol,SYMBOL_TRADE_TICK_SIZE);
   if(tv<=0||ts<=0) return;
   double tgt=(side==POSITION_TYPE_BUY)?BuyTakeProfitUSD:SellTakeProfitUSD;

   // Fix 12: single pass — collect data and tickets together
   PosData pos[];
   double lots=0, wsum=0;
   for(int i=PositionsTotal()-1; i>=0; i--)
   {
      ulong tk=PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetInteger(POSITION_MAGIC)!=(long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL)!=_Symbol)           continue;
      if((ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE)!=side) continue;
      int n=ArraySize(pos); ArrayResize(pos,n+1);
      pos[n].ticket    = tk;
      pos[n].volume    = PositionGetDouble(POSITION_VOLUME);
      pos[n].openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
      pos[n].sl        = PositionGetDouble(POSITION_SL);
      pos[n].tp        = PositionGetDouble(POSITION_TP);
      lots += pos[n].volume;
      wsum += pos[n].volume * pos[n].openPrice;
   }
   if(lots<=0) return;

   double avg  = wsum/lots;
   double dist = NormalizeDouble((tgt/(lots*tv))*ts,_Digits);
   double tp   = NormalizeDouble(side==POSITION_TYPE_BUY?avg+dist:avg-dist,_Digits);

   // Modify pass — no second position scan needed
   for(int i=0; i<ArraySize(pos); i++)
   {
      if(MathAbs(pos[i].tp-tp)>ts)
         if(!trade.PositionModify(pos[i].ticket, pos[i].sl, tp))
            Print("UpdateTP ERR ",GetLastError()," tk=",pos[i].ticket);
   }
}

//+------------------------------------------------------------------+
//  Fix 12: UpdateSideSL — single-pass scan
//  Fix 6:  SL only ever moves in the profitable direction
//+------------------------------------------------------------------+
void UpdateSideSL(ENUM_POSITION_TYPE side)
{
   double tv=SymbolInfoDouble(_Symbol,SYMBOL_TRADE_TICK_VALUE);
   double ts=SymbolInfoDouble(_Symbol,SYMBOL_TRADE_TICK_SIZE);
   if(tv<=0||ts<=0) return;
   double ask  = SymbolInfoDouble(_Symbol,SYMBOL_ASK);
   double bid  = SymbolInfoDouble(_Symbol,SYMBOL_BID);
   double lock = ((side==POSITION_TYPE_BUY)?BuyTakeProfitUSD:SellTakeProfitUSD)*SL_LockInPct/100.0;

   // Fix 12: single pass — collect
   PosData pos[];
   double lots=0, wsum=0;
   for(int i=PositionsTotal()-1; i>=0; i--)
   {
      ulong tk=PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetInteger(POSITION_MAGIC)!=(long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL)!=_Symbol)           continue;
      if((ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE)!=side) continue;
      int n=ArraySize(pos); ArrayResize(pos,n+1);
      pos[n].ticket    = tk;
      pos[n].volume    = PositionGetDouble(POSITION_VOLUME);
      pos[n].openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
      pos[n].sl        = PositionGetDouble(POSITION_SL);
      pos[n].tp        = PositionGetDouble(POSITION_TP);
      lots += pos[n].volume;
      wsum += pos[n].volume * pos[n].openPrice;
   }
   if(lots<=0) return;

   double avg  = wsum/lots;
   double dist = NormalizeDouble((lock/(lots*tv))*ts,_Digits);
   double sl   = NormalizeDouble(side==POSITION_TYPE_BUY?avg+dist:avg-dist,_Digits);
   double mb   = 2.0*ts;

   if(side==POSITION_TYPE_BUY  &&sl>=bid-mb){Print("SL SKIP BUY: sl=", DoubleToString(sl,_Digits)," >= bid");return;}
   if(side==POSITION_TYPE_SELL &&sl<=ask+mb){Print("SL SKIP SELL: sl=",DoubleToString(sl,_Digits)," <= ask");return;}

   // Modify pass
   for(int i=0; i<ArraySize(pos); i++)
   {
      // Fix 6: only move SL in the profitable direction — never backwards
      // Adding a new martingale level shifts avg and would otherwise pull SL back
      bool favorable = false;
      if(side==POSITION_TYPE_BUY  && (pos[i].sl==0 || sl>pos[i].sl)) favorable=true;
      if(side==POSITION_TYPE_SELL && (pos[i].sl==0 || sl<pos[i].sl)) favorable=true;
      if(!favorable) continue;

      if(MathAbs(pos[i].sl-sl)>ts)
         if(!trade.PositionModify(pos[i].ticket, sl, pos[i].tp))
            Print("UpdateSL ERR ",GetLastError()," tk=",pos[i].ticket);
   }
}

//+------------------------------------------------------------------+
double GetSideProfit(ENUM_POSITION_TYPE side)
{
   double t=0;
   for(int i=PositionsTotal()-1; i>=0; i--)
   {
      ulong tk=PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetInteger(POSITION_MAGIC)!=(long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL)!=_Symbol)           continue;
      if((ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE)!=side) continue;
      t+=PositionGetDouble(POSITION_PROFIT)+PositionGetDouble(POSITION_SWAP);
   }
   return t;
}

//+------------------------------------------------------------------+
void CloseSide(ENUM_POSITION_TYPE side)
{
   for(int i=PositionsTotal()-1; i>=0; i--)
   {
      ulong tk=PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetInteger(POSITION_MAGIC)!=(long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL)!=_Symbol)           continue;
      if((ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE)!=side) continue;
      if(!trade.PositionClose(tk))
         Print("CloseSide ERR ",GetLastError()," tk=",tk);
      else
         Print("Closed [",(side==POSITION_TYPE_BUY?"BUY":"SELL"),"] tk=",tk);
   }
}

//+------------------------------------------------------------------+
//  Fix 9: Now active — called from OnChartEvent on Delete key press
//+------------------------------------------------------------------+
void CloseAllPositions()
{
   for(int i=PositionsTotal()-1; i>=0; i--)
   {
      ulong tk=PositionGetTicket(i);
      if(tk==0) continue;
      if(PositionGetInteger(POSITION_MAGIC)!=(long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL)!=_Symbol)           continue;
      if(!trade.PositionClose(tk))
         Print("CloseAll ERR ",GetLastError()," tk=",tk);
      else
         Print("Emergency closed tk=",tk);
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
//+------------------------------------------------------------------+