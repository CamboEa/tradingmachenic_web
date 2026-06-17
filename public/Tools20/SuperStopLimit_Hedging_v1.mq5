//+------------------------------------------------------------------+
//|                                              SuperStopLimit       |
//|                         Hedging.mq5 — ping-pong hedge cycle       |
//|                                                                  |
//|   Start: BuyStop + SellStop 25 pips from price, lot 0.05 each.   |
//|   Buy fills -> opposite SellStop at 2x lot. Sell fills -> Buy   |
//|   at 2x lot. TP = $0.50 on ALL open legs combined (basket only).  |
//+------------------------------------------------------------------+
#property copyright "Bunkheang"
#property version   "1.01"
#property strict

#include <Trade/Trade.mqh>

//==================================================================
//  INPUTS
//==================================================================
input group "=== Hedge cycle ==="
input double InpInitLot           = 0.05;   // First buy stop & sell stop lot
input double InpLotMultiplier     = 2.0;    // Each triggered leg: next stop = 2x lot
input double InpDistancePips      = 25;     // Pending stop distance from market (pips)
input double InpTakeProfitUSD     = 0.50;   // Close cycle when BUY+SELL combined P/L >= this
input double InpPipSizeOverride   = 0.0;    // Force pip size (0 = auto)

input group "=== Safety ==="
input double InpMaxBasketLossUSD  = 0.0;    // Force close if basket <= -this (0 = off)
input int    InpMaxHedgeLegs       = 12;    // Max alternations before forced reset (0 = off)

input group "=== Misc ==="
input long   InpMagic             = 770078;
input string InpComment           = "SSL-Hedge";
input int    InpSlippagePoints    = 20;

//==================================================================
//  GLOBALS
//==================================================================
CTrade trade;
int    g_legCount = 0;   // how many stops have triggered this cycle

//==================================================================
//  INIT / DEINIT
//==================================================================
int OnInit()
{
   if(InpInitLot <= 0 || InpDistancePips <= 0 || InpTakeProfitUSD <= 0 || InpLotMultiplier < 1.0)
   {
      Print("Invalid inputs.");
      return INIT_PARAMETERS_INCORRECT;
   }

   trade.SetExpertMagicNumber(InpMagic);
   trade.SetDeviationInPoints(InpSlippagePoints);
   trade.SetTypeFillingBySymbol(_Symbol);

   double pip = PipSize();
   PrintFormat("Hedging %s | init lot %.2f | dist %.0f pips | COMBINED basket TP $%.2f | mult %.1fx",
               _Symbol, InpInitLot, InpDistancePips, InpTakeProfitUSD, InpLotMultiplier);
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason) {}

//==================================================================
//  MAIN
//==================================================================
void OnTick()
{
   if(!MQLInfoInteger(MQL_TRADE_ALLOWED)) return;
   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED)) return;

   if(InpMaxBasketLossUSD > 0 && BasketProfit() <= -InpMaxBasketLossUSD)
   {
      PrintFormat("Max loss $%.2f — reset.", BasketProfit());
      CloseAllAndRestart();
      return;
   }

   if(InpMaxHedgeLegs > 0 && g_legCount >= InpMaxHedgeLegs && CountPositions() > 0)
   {
      PrintFormat("Max legs %d — reset.", InpMaxHedgeLegs);
      CloseAllAndRestart();
      return;
   }

   ClearPerPositionTP();   // no per-leg TP — only combined basket counts

   double basket = BasketProfit();
   if(basket >= InpTakeProfitUSD)
   {
      PrintFormat("Combined TP: all sides $%.2f >= $%.2f — reset.", basket, InpTakeProfitUSD);
      CloseAllAndRestart();
      return;
   }

   if(CountPositions() == 0 && CountPendings() == 0)
      ArmInitialHedge();
}

void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest     &request,
                        const MqlTradeResult      &result)
{
   if(trans.type != TRADE_TRANSACTION_DEAL_ADD) return;

   ulong deal = trans.deal;
   if(deal == 0 || !HistoryDealSelect(deal)) return;
   if(HistoryDealGetString(deal, DEAL_SYMBOL) != _Symbol) return;
   if(HistoryDealGetInteger(deal, DEAL_MAGIC) != InpMagic) return;
   if(HistoryDealGetInteger(deal, DEAL_ENTRY) != DEAL_ENTRY_IN) return;

   long dtype = HistoryDealGetInteger(deal, DEAL_TYPE);
   double lot = HistoryDealGetDouble(deal, DEAL_VOLUME);
   if(lot <= 0) return;

   g_legCount++;

   if(dtype == DEAL_TYPE_BUY)
   {
      PrintFormat("Leg %d: BUY filled %.2f — place SELL stop 2x", g_legCount, lot);
      DeleteAllPendings();
      PlaceSellStopNext(lot * InpLotMultiplier);
      ClearPerPositionTP();
   }
   else if(dtype == DEAL_TYPE_SELL)
   {
      PrintFormat("Leg %d: SELL filled %.2f — place BUY stop 2x", g_legCount, lot);
      DeleteAllPendings();
      PlaceBuyStopNext(lot * InpLotMultiplier);
      ClearPerPositionTP();
   }
}

//==================================================================
//  ARM / PLACE STOPS
//==================================================================
void ArmInitialHedge()
{
   g_legCount = 0;
   double dist = StopDistance();
   double ask  = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid  = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double lot  = NormalizeLot(InpInitLot);

   double bp = NormalizeDouble(ask + dist, _Digits);
   double sp = NormalizeDouble(bid - dist, _Digits);

   PrintFormat("Init hedge: BUY stop %.2f @ %.5f | SELL stop %.2f @ %.5f", lot, bp, lot, sp);

   if(!trade.BuyStop(lot, bp, _Symbol, 0, 0, ORDER_TIME_GTC, 0, InpComment))
      PrintFormat("Init BuyStop failed err %d", GetLastError());
   if(!trade.SellStop(lot, sp, _Symbol, 0, 0, ORDER_TIME_GTC, 0, InpComment))
      PrintFormat("Init SellStop failed err %d", GetLastError());
}

void PlaceBuyStopNext(double lot)
{
   lot = NormalizeLot(lot);
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bp  = NormalizeDouble(ask + StopDistance(), _Digits);

   PrintFormat("Next BUY stop %.2f @ %.5f (%.0f pips above)", lot, bp, InpDistancePips);
   if(!trade.BuyStop(lot, bp, _Symbol, 0, 0, ORDER_TIME_GTC, 0, InpComment))
      PrintFormat("BuyStop failed err %d", GetLastError());
}

void PlaceSellStopNext(double lot)
{
   lot = NormalizeLot(lot);
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double sp  = NormalizeDouble(bid - StopDistance(), _Digits);

   PrintFormat("Next SELL stop %.2f @ %.5f (%.0f pips below)", lot, sp, InpDistancePips);
   if(!trade.SellStop(lot, sp, _Symbol, 0, 0, ORDER_TIME_GTC, 0, InpComment))
      PrintFormat("SellStop failed err %d", GetLastError());
}

double StopDistance()
{
   long   stopsLv = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
   double minDist = (stopsLv + 2) * _Point;
   double dist    = InpDistancePips * PipSize();
   return MathMax(dist, minDist);
}

//==================================================================
//  COMBINED BASKET TP ONLY (buy + sell profit added together)
//==================================================================
void ClearPerPositionTP()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong tk = PositionGetTicket(i);
      if(tk == 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagic) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol)  continue;

      double cTP = PositionGetDouble(POSITION_TP);
      double cSL = PositionGetDouble(POSITION_SL);
      if(cTP == 0.0 && cSL == 0.0) continue;

      trade.PositionModify(tk, cSL, 0.0);
   }
}

double BasketProfit()
{
   double p = 0.0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong tk = PositionGetTicket(i);
      if(tk == 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagic) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol)  continue;
      p += PositionGetDouble(POSITION_PROFIT) + PositionGetDouble(POSITION_SWAP);
   }
   return p;
}

int CountPositions()
{
   int c = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong tk = PositionGetTicket(i);
      if(tk == 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagic) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol)  continue;
      c++;
   }
   return c;
}

int CountPendings()
{
   int c = 0;
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      ulong tk = OrderGetTicket(i);
      if(tk == 0) continue;
      if(OrderGetInteger(ORDER_MAGIC) != InpMagic) continue;
      if(OrderGetString(ORDER_SYMBOL) != _Symbol)  continue;
      c++;
   }
   return c;
}

void CloseAllAndRestart()
{
   for(int a = 0; a < 5; a++)
   {
      bool any = false;
      for(int i = PositionsTotal() - 1; i >= 0; i--)
      {
         ulong tk = PositionGetTicket(i);
         if(tk == 0) continue;
         if(PositionGetInteger(POSITION_MAGIC) != InpMagic) continue;
         if(PositionGetString(POSITION_SYMBOL) != _Symbol)  continue;
         any = true;
         trade.PositionClose(tk);
      }
      if(!any) break;
   }
   DeleteAllPendings();
   g_legCount = 0;
}

void DeleteAllPendings()
{
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      ulong tk = OrderGetTicket(i);
      if(tk == 0) continue;
      if(OrderGetInteger(ORDER_MAGIC) != InpMagic) continue;
      if(OrderGetString(ORDER_SYMBOL) != _Symbol)  continue;
      trade.OrderDelete(tk);
   }
}

double PipSize()
{
   if(InpPipSizeOverride > 0) return InpPipSizeOverride;
   double pip = _Point;
   if(_Digits == 3 || _Digits == 5) pip = _Point * 10.0;
   return pip;
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
