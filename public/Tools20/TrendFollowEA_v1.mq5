//+------------------------------------------------------------------+
//|                                              TrendFollowEA/v1.mq5 |
//|   Trend following: trade only with HTF EMA trend + ADX strength. |
//|   Entry on pullback to fast EMA + reclaim candle. ATR SL/TP/trail.|
//+------------------------------------------------------------------+
#property copyright "Bunkheang"
#property version   "1.00"
#property strict

#include <Trade/Trade.mqh>

//==================================================================
//  INPUTS
//==================================================================
input group "=== Trend (higher timeframe) ==="
input ENUM_TIMEFRAMES InpTrendTF      = PERIOD_H1;  // Trend direction timeframe
input int             InpFastEMA      = 20;         // Fast EMA on trend TF
input int             InpSlowEMA      = 50;         // Slow EMA on trend TF
input bool            InpUseADX       = true;       // Require ADX strength
input int             InpADXPeriod    = 14;
input double          InpADXMin       = 20.0;       // Min ADX to trade

input group "=== Entry (chart timeframe) ==="
input int             InpEntryEMA     = 20;         // Pullback EMA on chart TF
input int             InpSwingBars    = 5;          // Bars for swing SL (from bar 1)
input bool            InpRequireReclaim = true;     // Bullish/bearish close past EMA

input group "=== Stops & targets ==="
input int             InpATRPeriod    = 14;
input double          InpSL_ATR_Mult  = 1.5;        // SL = max(swing, ATR x this)
input double          InpTP_R_Mult    = 2.0;        // Take profit = SL distance x R
input bool            InpUseBreakEven = true;
input double          InpBE_AtR       = 1.0;        // Move SL to BE after +R
input bool            InpUseTrail     = true;
input double          InpTrail_AtR    = 1.5;        // Start ATR trail after +R
input double          InpTrail_ATR    = 1.0;        // Trail distance (ATR x)

input group "=== Position ==="
input double          InpLots         = 0.01;
input bool            InpUseRiskPct   = false;
input double          InpRiskPct      = 1.0;        // % equity risk if UseRiskPct
input bool            InpOneTradeOnly = true;

input group "=== Filters ==="
input int             InpMaxSpreadPts = 0;            // 0 = ignore
input int             InpMinBarsWarmup = 100;

input group "=== Misc ==="
input long            InpMagic        = 880880;
input string          InpComment      = "TrendFollow";
input int             InpSlippage     = 20;

//==================================================================
//  GLOBALS
//==================================================================
CTrade trade;
int    g_hTrendFast = INVALID_HANDLE;
int    g_hTrendSlow = INVALID_HANDLE;
int    g_hADX       = INVALID_HANDLE;
int    g_hEntryEMA  = INVALID_HANDLE;
int    g_hATR       = INVALID_HANDLE;

datetime g_lastBarTime = 0;
ulong    g_trackTicket = 0;
double   g_riskDist    = 0.0;
double   g_priceExtreme = 0.0;
bool     g_beDone      = false;
bool     g_trailOn     = false;

//==================================================================
//  INIT / DEINIT
//==================================================================
int OnInit()
{
   if(InpFastEMA <= 0 || InpSlowEMA <= 0 || InpEntryEMA <= 0 || InpLots <= 0)
      return INIT_PARAMETERS_INCORRECT;

   trade.SetExpertMagicNumber(InpMagic);
   trade.SetDeviationInPoints(InpSlippage);
   trade.SetTypeFillingBySymbol(_Symbol);

   g_hTrendFast = iMA(_Symbol, InpTrendTF, InpFastEMA, 0, MODE_EMA, PRICE_CLOSE);
   g_hTrendSlow = iMA(_Symbol, InpTrendTF, InpSlowEMA, 0, MODE_EMA, PRICE_CLOSE);
   g_hEntryEMA  = iMA(_Symbol, _Period, InpEntryEMA, 0, MODE_EMA, PRICE_CLOSE);
   g_hATR       = iATR(_Symbol, _Period, InpATRPeriod);

   if(InpUseADX)
      g_hADX = iADX(_Symbol, InpTrendTF, InpADXPeriod);

   if(g_hTrendFast == INVALID_HANDLE || g_hTrendSlow == INVALID_HANDLE ||
      g_hEntryEMA == INVALID_HANDLE || g_hATR == INVALID_HANDLE)
   {
      Print("Indicator init failed.");
      return INIT_FAILED;
   }
   if(InpUseADX && g_hADX == INVALID_HANDLE)
      return INIT_FAILED;

   PrintFormat("TrendFollow %s | trend %s EMA %d/%d | entry EMA %d | TP %.1fR",
               _Symbol, EnumToString(InpTrendTF), InpFastEMA, InpSlowEMA, InpEntryEMA, InpTP_R_Mult);
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   if(g_hTrendFast != INVALID_HANDLE) IndicatorRelease(g_hTrendFast);
   if(g_hTrendSlow != INVALID_HANDLE) IndicatorRelease(g_hTrendSlow);
   if(g_hADX       != INVALID_HANDLE) IndicatorRelease(g_hADX);
   if(g_hEntryEMA  != INVALID_HANDLE) IndicatorRelease(g_hEntryEMA);
   if(g_hATR       != INVALID_HANDLE) IndicatorRelease(g_hATR);
}

//==================================================================
//  MAIN
//==================================================================
void OnTick()
{
   if(!MQLInfoInteger(MQL_TRADE_ALLOWED)) return;
   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED)) return;
   if(Bars(_Symbol, _Period) < InpMinBarsWarmup) return;

   ManageOpenPosition();

   datetime barTime = iTime(_Symbol, _Period, 0);
   if(barTime == g_lastBarTime) return;
   g_lastBarTime = barTime;

   if(InpOneTradeOnly && HasOurPosition())
      return;

   if(InpMaxSpreadPts > 0)
   {
      long sp = SymbolInfoInteger(_Symbol, SYMBOL_SPREAD);
      if(sp > InpMaxSpreadPts) return;
   }

   int trend = TrendDirection();
   if(trend == 0) return;

   if(trend > 0 && TryBuyEntry())
      return;
   if(trend < 0 && TrySellEntry())
      return;
}

//==================================================================
//  TREND
//==================================================================
int TrendDirection()
{
   double fast[], slow[];
   ArraySetAsSeries(fast, true);
   ArraySetAsSeries(slow, true);
   if(CopyBuffer(g_hTrendFast, 0, 1, 1, fast) < 1) return 0;
   if(CopyBuffer(g_hTrendSlow, 0, 1, 1, slow) < 1) return 0;

   if(InpUseADX)
   {
      double adx[];
      ArraySetAsSeries(adx, true);
      if(CopyBuffer(g_hADX, 0, 1, 1, adx) < 1) return 0;
      if(adx[0] < InpADXMin) return 0;
   }

   if(fast[0] > slow[0]) return  1;
   if(fast[0] < slow[0]) return -1;
   return 0;
}

//==================================================================
//  ENTRY
//==================================================================
bool TryBuyEntry()
{
   double ema[];
   double open[], close[], low[];
   ArraySetAsSeries(ema, true);
   ArraySetAsSeries(open, true);
   ArraySetAsSeries(close, true);
   ArraySetAsSeries(low, true);

   if(CopyBuffer(g_hEntryEMA, 0, 1, 3, ema) < 3) return false;
   if(CopyOpen(_Symbol, _Period, 1, 3, open) < 3) return false;
   if(CopyClose(_Symbol, _Period, 1, 3, close) < 3) return false;
   if(CopyLow(_Symbol, _Period, 1, 3, low) < 3) return false;

   // Bar 2 dipped to/below EMA, bar 1 reclaimed above (pullback in uptrend)
   bool pullback = (low[1] <= ema[1] || low[2] <= ema[2]);
   bool reclaim  = (close[1] > ema[1]);
   if(InpRequireReclaim)
      reclaim = reclaim && (close[1] > open[1]);

   if(!pullback || !reclaim) return false;

   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double sl  = CalcBuySL();
   double tp  = CalcTP(ask, sl, true);
   if(sl <= 0 || sl >= ask) return false;

   double lot = CalcLotSize(ask - sl);
   if(lot <= 0) return false;

   if(trade.Buy(lot, _Symbol, ask, sl, tp, InpComment))
   {
      g_trackTicket  = trade.ResultOrder();
      g_riskDist     = ask - sl;
      g_priceExtreme = ask;
      g_beDone       = false;
      g_trailOn      = false;
      PrintFormat("BUY trend entry %.2f SL %.5f TP %.5f", lot, sl, tp);
      return true;
   }
   return false;
}

bool TrySellEntry()
{
   double ema[];
   double open[], close[], high[];
   ArraySetAsSeries(ema, true);
   ArraySetAsSeries(open, true);
   ArraySetAsSeries(close, true);
   ArraySetAsSeries(high, true);

   if(CopyBuffer(g_hEntryEMA, 0, 1, 3, ema) < 3) return false;
   if(CopyOpen(_Symbol, _Period, 1, 3, open) < 3) return false;
   if(CopyClose(_Symbol, _Period, 1, 3, close) < 3) return false;
   if(CopyHigh(_Symbol, _Period, 1, 3, high) < 3) return false;

   bool pullback = (high[1] >= ema[1] || high[2] >= ema[2]);
   bool reclaim  = (close[1] < ema[1]);
   if(InpRequireReclaim)
      reclaim = reclaim && (close[1] < open[1]);

   if(!pullback || !reclaim) return false;

   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double sl  = CalcSellSL();
   double tp  = CalcTP(bid, sl, false);
   if(sl <= 0 || sl <= bid) return false;

   double lot = CalcLotSize(sl - bid);
   if(lot <= 0) return false;

   if(trade.Sell(lot, _Symbol, bid, sl, tp, InpComment))
   {
      g_trackTicket  = trade.ResultOrder();
      g_riskDist     = sl - bid;
      g_priceExtreme = bid;
      g_beDone       = false;
      g_trailOn      = false;
      PrintFormat("SELL trend entry %.2f SL %.5f TP %.5f", lot, sl, tp);
      return true;
   }
   return false;
}

//==================================================================
//  STOPS
//==================================================================
double ATRValue()
{
   double atr[];
   ArraySetAsSeries(atr, true);
   if(CopyBuffer(g_hATR, 0, 1, 1, atr) < 1) return 0.0;
   return atr[0];
}

double SwingLow(int bars)
{
   double lows[];
   ArraySetAsSeries(lows, true);
   if(CopyLow(_Symbol, _Period, 1, bars, lows) < bars) return 0.0;
   double v = lows[0];
   for(int i = 1; i < bars; i++)
      if(lows[i] < v) v = lows[i];
   return v;
}

double SwingHigh(int bars)
{
   double highs[];
   ArraySetAsSeries(highs, true);
   if(CopyHigh(_Symbol, _Period, 1, bars, highs) < bars) return 0.0;
   double v = highs[0];
   for(int i = 1; i < bars; i++)
      if(highs[i] > v) v = highs[i];
   return v;
}

double CalcBuySL()
{
   double atr = ATRValue();
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double swing = SwingLow(InpSwingBars);
   double slAtr = bid - atr * InpSL_ATR_Mult;
   double sl    = MathMin(swing, slAtr);
   long   stops = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
   double minD  = (stops + 2) * _Point;
   if(bid - sl < minD) sl = bid - minD;
   return NormalizeDouble(sl, _Digits);
}

double CalcSellSL()
{
   double atr = ATRValue();
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double swing = SwingHigh(InpSwingBars);
   double slAtr = ask + atr * InpSL_ATR_Mult;
   double sl    = MathMax(swing, slAtr);
   long   stops = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
   double minD  = (stops + 2) * _Point;
   if(sl - ask < minD) sl = ask + minD;
   return NormalizeDouble(sl, _Digits);
}

double CalcTP(double entry, double sl, bool isBuy)
{
   double risk = MathAbs(entry - sl);
   if(risk <= 0) return 0.0;
   double tp = isBuy ? entry + risk * InpTP_R_Mult : entry - risk * InpTP_R_Mult;
   return NormalizeDouble(tp, _Digits);
}

//==================================================================
//  MANAGE OPEN TRADE
//==================================================================
void ManageOpenPosition()
{
   ulong tk = FindOurTicket();
   if(tk == 0)
   {
      g_trackTicket = 0;
      g_riskDist    = 0.0;
      g_beDone      = false;
      g_trailOn     = false;
      return;
   }

   if(!PositionSelectByTicket(tk)) return;

   long   pt  = PositionGetInteger(POSITION_TYPE);
   double op  = PositionGetDouble(POSITION_PRICE_OPEN);
   double sl  = PositionGetDouble(POSITION_SL);
   double tp  = PositionGetDouble(POSITION_TP);
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);

   if(g_riskDist <= 0)
      g_riskDist = MathAbs(op - sl);

   if(pt == POSITION_TYPE_BUY)
   {
      if(bid > g_priceExtreme) g_priceExtreme = bid;
      double profitR = (bid - op) / g_riskDist;

      if(InpUseBreakEven && !g_beDone && profitR >= InpBE_AtR)
      {
         double be = NormalizeDouble(op, _Digits);
         if(sl < be)
         {
            if(trade.PositionModify(tk, be, tp))
               g_beDone = true;
         }
      }

      if(InpUseTrail && profitR >= InpTrail_AtR)
      {
         g_trailOn = true;
         double atr = ATRValue();
         double trailSL = NormalizeDouble(g_priceExtreme - atr * InpTrail_ATR, _Digits);
         if(trailSL > sl && trailSL < bid)
            trade.PositionModify(tk, trailSL, tp);
      }
   }
   else
   {
      if(ask < g_priceExtreme || g_priceExtreme == 0) g_priceExtreme = ask;
      double profitR = (op - ask) / g_riskDist;

      if(InpUseBreakEven && !g_beDone && profitR >= InpBE_AtR)
      {
         double be = NormalizeDouble(op, _Digits);
         if(sl > be || sl == 0)
         {
            if(trade.PositionModify(tk, be, tp))
               g_beDone = true;
         }
      }

      if(InpUseTrail && profitR >= InpTrail_AtR)
      {
         g_trailOn = true;
         double atr = ATRValue();
         double trailSL = NormalizeDouble(g_priceExtreme + atr * InpTrail_ATR, _Digits);
         if((trailSL < sl || sl == 0) && trailSL > ask)
            trade.PositionModify(tk, trailSL, tp);
      }
   }
}

//==================================================================
//  UTILS
//==================================================================
bool HasOurPosition()
{
   return (FindOurTicket() != 0);
}

ulong FindOurTicket()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong tk = PositionGetTicket(i);
      if(tk == 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagic) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol)  continue;
      return tk;
   }
   return 0;
}

double CalcLotSize(double slDistPrice)
{
   if(slDistPrice <= 0) return 0.0;

   double lot = InpLots;
   if(InpUseRiskPct)
   {
      double eq  = AccountInfoDouble(ACCOUNT_EQUITY);
      double tv  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
      double ts  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
      if(tv <= 0 || ts <= 0) return 0.0;
      double riskMoney = eq * InpRiskPct / 100.0;
      double ticks     = slDistPrice / ts;
      lot = riskMoney / (ticks * tv);
   }
   return NormalizeLot(lot);
}

double NormalizeLot(double lot)
{
   double minLot = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double maxLot = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   double vStep  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   if(vStep <= 0) vStep = 0.01;
   lot = MathRound(lot / vStep) * vStep;
   if(lot < minLot) lot = minLot;
   if(lot > maxLot) lot = maxLot;
   return NormalizeDouble(lot, 2);
}
//+------------------------------------------------------------------+
