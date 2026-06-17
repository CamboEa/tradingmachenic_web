//+------------------------------------------------------------------+
//|                                            GridStraddlePro.mq5    |
//|   Bidirectional pending-stop grid straddle with basket TP        |
//|                                                                  |
//|   Lays BUY STOPs above price and SELL STOPs below, with stepped  |
//|   lot sizes growing with distance (pyramiding). The whole basket |
//|   L2+ arms a side lock-SL at breakeven+profit (not raw grid line).  |
//|   Cycle resets only on $ TP or profitable lock; max-loss cap.      |
//+------------------------------------------------------------------+
#property copyright "Bunkheang"
#property version   "1.10"
#property strict

#include <Trade/Trade.mqh>

//==================================================================
//  INPUTS
//==================================================================
input group "=== Grid layout ==="
input int    InpLevelsPerSide   = 10;     // Pending orders per side (buy stops & sell stops)
input double InpGridStepPips    = 100;    // Spacing between levels, in PIPS
input double InpPipSizeOverride = 0.0;    // Force pip size in price (0 = auto-detect from symbol)

input group "=== Lot multiplier (martingale per level) ==="
input double InpBaseLot         = 0.01;   // Level 1 lot
input double InpLotMultiplier   = 1.5;    // Each deeper level: lot x multiplier (1.0 = flat)

input group "=== Take profit & lock (money — fixes martingale exits) ==="
input double InpSideTakeProfitUSD = 5.0;  // Close cycle when active side P/L >= this. 0 = off
input double InpLockProfitUSD     = 2.0;  // After L2: lock this much $ on side (breakeven SL). 0 = breakeven
input int    InpMinLevelsForLock  = 2;    // Start lock-SL after this many levels filled (2 = L2)

input group "=== Risk cap ==="
input double InpMaxBasketLossUSD  = 30.0; // Force close all if basket P/L <= -this. 0 = off

input group "=== Level trail (arms lock-SL when depth reached) ==="
input bool   InpUseLevelTrailSL   = true; // Use breakeven lock once MinLevelsForLock reached

input group "=== Basket extras ==="
input double InpTakeProfitMoney   = 0.0;  // Close ALL when total basket P/L >= this. 0 = off
input bool   InpUseTrailing       = false;
input double InpTrailStart         = 3.0;
input double InpTrailGiveback      = 1.5;

input group "=== Filters ==="
input bool   InpOneSideOnly       = true; // Delete opposite pendings once one side opens
input int    InpMaxSpreadPoints   = 0;    // Skip arming if spread > this (points). 0 = ignore

input group "=== Optional trend filter (the MAs on the chart) ==="
input bool   InpUseTrendFilter    = true; // Only arm the side aligned with EMA trend
input int    InpFastEMA          = 20;    // Fast EMA period
input int    InpSlowEMA          = 50;    // Slow EMA period

input group "=== Misc ==="
input long   InpMagic            = 770077; // Magic number (unique per chart/instance)
input string InpComment          = "GridStraddlePro";

//==================================================================
//  GLOBALS
//==================================================================
CTrade   trade;
double   g_peak    = 0.0;     // peak basket profit in current cycle (for money trailing)
int      g_hFast   = INVALID_HANDLE;
int      g_hSlow   = INVALID_HANDLE;

// Exact pending/fill prices per level (index 0 = level 1, index 1 = level 2, ...)
bool     g_gridReady  = false;
double   g_gridStep   = 0.0;
double   g_anchorAsk  = 0.0;   // frozen at arm — pendings never follow live price
double   g_anchorBid  = 0.0;
double   g_buyPrices[];
double   g_sellPrices[];
bool     g_levelSlArmed  = false;  // level trail SL active this cycle
int      g_prevPosCount  = 0;

//==================================================================
//  INIT / DEINIT
//==================================================================
int OnInit()
{
   if(InpLevelsPerSide <= 0 || InpBaseLot <= 0 || InpGridStepPips <= 0 || InpLotMultiplier <= 0)
   {
      Print("Invalid inputs. Check levels / base lot / multiplier / grid step.");
      return(INIT_PARAMETERS_INCORRECT);
   }

   trade.SetExpertMagicNumber(InpMagic);
   trade.SetDeviationInPoints(20);
   trade.SetTypeFillingBySymbol(_Symbol);

   if(InpUseTrendFilter)
   {
      g_hFast = iMA(_Symbol, _Period, InpFastEMA, 0, MODE_EMA, PRICE_CLOSE);
      g_hSlow = iMA(_Symbol, _Period, InpSlowEMA, 0, MODE_EMA, PRICE_CLOSE);
      if(g_hFast == INVALID_HANDLE || g_hSlow == INVALID_HANDLE)
      {
         Print("Failed to create EMA handles.");
         return(INIT_FAILED);
      }
   }

   double pip       = PipSize();
   double stepPrice = InpGridStepPips * pip;
   PrintFormat("GridStraddlePro on %s | 1 pip = %.5f | step = %.0f pips = %.3f price ($%.2f between levels)",
               _Symbol, pip, InpGridStepPips, stepPrice, stepPrice);
   PrintFormat("Lot: base=%.2f x mult=%.2f | side TP $%.2f | lock $%.2f after L%d",
               InpBaseLot, InpLotMultiplier, InpSideTakeProfitUSD, InpLockProfitUSD, InpMinLevelsForLock);
   PrintFormat("One side only=%s | trend filter=%s | max loss $%.2f",
               InpOneSideOnly ? "ON" : "OFF", InpUseTrendFilter ? "ON" : "OFF", InpMaxBasketLossUSD);
   for(int i = 0; i < MathMin(InpLevelsPerSide, 10); i++)
      PrintFormat("  L%d -> %.2f lots", i + 1, LevelLot(i));
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   if(g_hFast != INVALID_HANDLE) IndicatorRelease(g_hFast);
   if(g_hSlow != INVALID_HANDLE) IndicatorRelease(g_hSlow);
}

//==================================================================
//  MAIN TICK
//==================================================================
void OnTick()
{
   if(!MQLInfoInteger(MQL_TRADE_ALLOWED)) return;
   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED)) return;

   ManageBasket();
   CheckLevelSlClosed();   // broker SL on either side -> full restart

   // Arm a fresh grid whenever completely flat (no positions, no pendings).
   //    This is what makes the cycle perpetual: close at TP -> re-arm -> repeat.
   if(CountPositions() == 0 && CountPendings() == 0)
   {
      if(InpMaxSpreadPoints > 0)
      {
         long spread = SymbolInfoInteger(_Symbol, SYMBOL_SPREAD);
         if(spread > InpMaxSpreadPoints) return;
      }
      ArmGrid();
   }
}

//==================================================================
//  BASKET MANAGEMENT  (level SL trail + optional money TP)
//==================================================================
void ManageBasket()
{
   if(CountPositions() == 0)
   {
      g_peak = 0.0;
      return;
   }

   if(InpOneSideOnly)
   {
      double bl, ba, bp, sl, sa, sp;
      int bc = 0, sc = 0;
      bool haveBuy  = GetSideStats(POSITION_TYPE_BUY,  bl, ba, bp, bc);
      bool haveSell = GetSideStats(POSITION_TYPE_SELL, sl, sa, sp, sc);
      if(haveBuy && !haveSell)
         DeleteOppositePendings(POSITION_TYPE_BUY);
      else if(haveSell && !haveBuy)
         DeleteOppositePendings(POSITION_TYPE_SELL);
   }

   double basket = BasketProfit();

   if(InpMaxBasketLossUSD > 0 && basket <= -InpMaxBasketLossUSD)
   {
      PrintFormat("MAX LOSS: basket %.2f <= -%.2f. Closing all.", basket, InpMaxBasketLossUSD);
      CloseAllAndReset();
      return;
   }

   if(TrySideMoneyTakeProfit())
      return;

   if(InpTakeProfitMoney > 0 && basket >= InpTakeProfitMoney)
   {
      PrintFormat("Basket TP: %.2f >= %.2f. Closing all.", basket, InpTakeProfitMoney);
      CloseAllAndReset();
      return;
   }

   if(InpUseTrailing && basket >= InpTrailStart)
   {
      if(basket > g_peak) g_peak = basket;
      if(g_peak - basket >= InpTrailGiveback)
      {
         PrintFormat("TRAIL exit: peak %.2f, now %.2f. Closing all.", g_peak, basket);
         CloseAllAndReset();
         return;
      }
   }

   if(InpUseLevelTrailSL)
   {
      if(!g_gridReady)
         RebuildGridAnchorFromPositions();
      if(ManageSideLockSL())
         return;
   }
}

//==================================================================
//  GRID LEVEL TRACKING (for depth / lock arming)
//==================================================================
double StoredLevelPrice(long posType, int levelIndex)
{
   if(levelIndex < 0) return 0.0;
   if(posType == POSITION_TYPE_BUY)
   {
      if(levelIndex >= ArraySize(g_buyPrices)) return 0.0;
      return g_buyPrices[levelIndex];
   }
   if(levelIndex >= ArraySize(g_sellPrices)) return 0.0;
   return g_sellPrices[levelIndex];
}

double LevelMatchTolerance()
{
   if(g_gridStep > 0) return g_gridStep * 0.4;
   return 10.0 * _Point;
}

int OpenPriceToLevel(long posType, double openPrice)
{
   int    n   = (posType == POSITION_TYPE_BUY) ? ArraySize(g_buyPrices) : ArraySize(g_sellPrices);
   double tol = LevelMatchTolerance();
   int    best = -1;
   double bestDiff = tol + 1.0;

   for(int i = 0; i < n; i++)
   {
      double gp = StoredLevelPrice(posType, i);
      double d  = MathAbs(openPrice - gp);
      if(d <= tol && d < bestDiff)
      {
         bestDiff = d;
         best = i;
      }
   }
   return best;
}

int DeepestFilledLevel(long posType)
{
   int maxLvl = -1;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong tk = PositionGetTicket(i);
      if(tk == 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagic) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol)  continue;
      if(PositionGetInteger(POSITION_TYPE) != posType)  continue;

      int lvl = OpenPriceToLevel(posType, PositionGetDouble(POSITION_PRICE_OPEN));
      if(lvl > maxLvl) maxLvl = lvl;
   }
   return maxLvl;
}

void CollectSideOpenPrices(long posType, double &outPrices[])
{
   ArrayResize(outPrices, 0);
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong tk = PositionGetTicket(i);
      if(tk == 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagic) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol)  continue;
      if(PositionGetInteger(POSITION_TYPE) != posType)  continue;

      double op = PositionGetDouble(POSITION_PRICE_OPEN);
      bool dup = false;
      for(int j = 0; j < ArraySize(outPrices); j++)
      {
         if(MathAbs(outPrices[j] - op) < _Point)
         {
            dup = true;
            break;
         }
      }
      if(!dup)
      {
         int n = ArraySize(outPrices);
         ArrayResize(outPrices, n + 1);
         outPrices[n] = op;
      }
   }
}

void RebuildGridAnchorFromPositions()
{
   g_gridStep = InpGridStepPips * PipSize();

   double sells[], buys[];
   CollectSideOpenPrices(POSITION_TYPE_SELL, sells);
   CollectSideOpenPrices(POSITION_TYPE_BUY,  buys);

   int nSell = ArraySize(sells);
   int nBuy  = ArraySize(buys);
   if(nSell > 1) ArraySort(sells);   // ascending: lowest = deepest sell
   if(nBuy  > 1) ArraySort(buys);    // ascending: lowest = level 1 buy

   ArrayResize(g_sellPrices, nSell);
   for(int i = 0; i < nSell; i++)
      g_sellPrices[i] = NormalizeDouble(sells[nSell - 1 - i], _Digits); // L1 = highest

   ArrayResize(g_buyPrices, nBuy);
   for(int i = 0; i < nBuy; i++)
      g_buyPrices[i] = NormalizeDouble(buys[i], _Digits);                 // L1 = lowest

   g_gridReady = (nSell > 0 || nBuy > 0);
}

//==================================================================
//  SIDE STATS & MONEY EXITS
//==================================================================
bool GetSideStats(long posType, double &lots, double &avg, double &pnl, int &count)
{
   lots = 0.0; avg = 0.0; pnl = 0.0; count = 0;
   double wsum = 0.0;

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong tk = PositionGetTicket(i);
      if(tk == 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagic) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol)  continue;
      if(PositionGetInteger(POSITION_TYPE) != posType)  continue;

      double lt = PositionGetDouble(POSITION_VOLUME);
      double op = PositionGetDouble(POSITION_PRICE_OPEN);
      lots += lt;
      wsum += lt * op;
      pnl  += PositionGetDouble(POSITION_PROFIT) + PositionGetDouble(POSITION_SWAP);
      count++;
   }
   if(lots > 0) avg = wsum / lots;
   return (count > 0);
}

int SideFilledLevels(long posType)
{
   int maxLvl = DeepestFilledLevel(posType);
   if(maxLvl >= 0)
      return maxLvl + 1;

   int c = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong tk = PositionGetTicket(i);
      if(tk == 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagic) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol)  continue;
      if(PositionGetInteger(POSITION_TYPE) == posType)
         c++;
   }
   return c;
}

bool TrySideMoneyTakeProfit()
{
   double bl, ba, bp, sl, sa, sp;
   int bc, sc;
   bool haveBuy  = GetSideStats(POSITION_TYPE_BUY,  bl, ba, bp, bc);
   bool haveSell = GetSideStats(POSITION_TYPE_SELL, sl, sa, sp, sc);

   if(InpSideTakeProfitUSD <= 0) return false;

   if(haveBuy && bp >= InpSideTakeProfitUSD)
   {
      PrintFormat("BUY side TP $%.2f >= $%.2f. Cycle reset.", bp, InpSideTakeProfitUSD);
      CloseAllAndReset();
      return true;
   }
   if(haveSell && sp >= InpSideTakeProfitUSD)
   {
      PrintFormat("SELL side TP $%.2f >= $%.2f. Cycle reset.", sp, InpSideTakeProfitUSD);
      CloseAllAndReset();
      return true;
   }
   return false;
}

double LockStopPrice(long posType, double lots, double avg)
{
   if(avg <= 0 || lots <= 0) return 0.0;

   double tv = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   double ts = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   if(tv <= 0 || ts <= 0) return 0.0;

   double lockUsd = MathMax(InpLockProfitUSD, 0.0);
   double dist    = NormalizeDouble((lockUsd / (lots * tv)) * ts, _Digits);

   if(posType == POSITION_TYPE_BUY)
      return NormalizeDouble(avg + dist, _Digits);
   return NormalizeDouble(avg - dist, _Digits);
}

void ApplyBrokerLockSL(long posType, double slPrice)
{
   if(slPrice <= 0) return;

   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double ts  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   if(ts <= 0) ts = _Point;
   double mb  = 2.0 * ts;

   if(posType == POSITION_TYPE_BUY  && slPrice >= bid - mb) return;
   if(posType == POSITION_TYPE_SELL && slPrice <= ask + mb) return;

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong tk = PositionGetTicket(i);
      if(tk == 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagic) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol)  continue;
      if(PositionGetInteger(POSITION_TYPE) != posType)  continue;

      double curSL = PositionGetDouble(POSITION_SL);
      double curTP = PositionGetDouble(POSITION_TP);
      if(MathAbs(curSL - slPrice) < ts) continue;
      trade.PositionModify(tk, slPrice, curTP);
   }
}

bool TrySideLockExit(long posType, double slPrice, double sidePnl)
{
   if(slPrice <= 0) return false;

   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   bool   hit = false;

   if(posType == POSITION_TYPE_SELL && ask >= slPrice)
      hit = true;
   if(posType == POSITION_TYPE_BUY  && bid <= slPrice)
      hit = true;

   if(!hit) return false;

   if(sidePnl < 0)
      return false;

   PrintFormat("%s lock exit @ %.5f | side P/L $%.2f. Cycle reset.",
               (posType == POSITION_TYPE_BUY ? "BUY" : "SELL"), slPrice, sidePnl);
   CloseAllAndReset();
   return true;
}

bool ManageSideLockSL()
{
   if(!g_gridReady) return false;

   int minLvls = MathMax(InpMinLevelsForLock, 2);
   int sellLvls = SideFilledLevels(POSITION_TYPE_SELL);
   int buyLvls  = SideFilledLevels(POSITION_TYPE_BUY);

   if(sellLvls >= minLvls || buyLvls >= minLvls)
      g_levelSlArmed = true;

   double lots, avg, pnl;
   int cnt;

   if(sellLvls >= minLvls && GetSideStats(POSITION_TYPE_SELL, lots, avg, pnl, cnt))
   {
      double sl = LockStopPrice(POSITION_TYPE_SELL, lots, avg);
      ApplyBrokerLockSL(POSITION_TYPE_SELL, sl);
      if(TrySideLockExit(POSITION_TYPE_SELL, sl, pnl))
         return true;
   }

   if(buyLvls >= minLvls && GetSideStats(POSITION_TYPE_BUY, lots, avg, pnl, cnt))
   {
      double sl = LockStopPrice(POSITION_TYPE_BUY, lots, avg);
      ApplyBrokerLockSL(POSITION_TYPE_BUY, sl);
      if(TrySideLockExit(POSITION_TYPE_BUY, sl, pnl))
         return true;
   }

   return false;
}

void DeleteOppositePendings(long activePosType)
{
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      ulong tk = OrderGetTicket(i);
      if(tk == 0) continue;
      if(OrderGetInteger(ORDER_MAGIC) != InpMagic) continue;
      if(OrderGetString(ORDER_SYMBOL) != _Symbol)  continue;

      ENUM_ORDER_TYPE ot = (ENUM_ORDER_TYPE)OrderGetInteger(ORDER_TYPE);
      bool isBuyPending  = (ot == ORDER_TYPE_BUY_STOP  || ot == ORDER_TYPE_BUY_STOP_LIMIT);
      bool isSellPending = (ot == ORDER_TYPE_SELL_STOP || ot == ORDER_TYPE_SELL_STOP_LIMIT);

      if(activePosType == POSITION_TYPE_BUY  && isSellPending)
         trade.OrderDelete(tk);
      if(activePosType == POSITION_TYPE_SELL && isBuyPending)
         trade.OrderDelete(tk);
   }
}

//==================================================================
//  ARM THE GRID
//==================================================================
double GridLevelDistance(int levelIndex, double step, double minDist)
{
   // L1 = step from frozen anchor; L2, L3... each exactly +step gap (not tied to live price)
   double d0 = MathMax(step, minDist);
   return d0 + levelIndex * step;
}

void ArmGrid()
{
   double point   = _Point;
   double step    = InpGridStepPips * PipSize();
   double ask     = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid     = SymbolInfoDouble(_Symbol, SYMBOL_BID);

   long   stopsLv = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
   double minDist = (stopsLv + 2) * point;

   g_anchorAsk = ask;
   g_anchorBid = bid;

   bool placeBuys  = true;
   bool placeSells = true;
   if(InpUseTrendFilter)
   {
      int dir = TrendDir();
      placeBuys  = (dir >= 0);
      placeSells = (dir <= 0);
   }

   ArrayResize(g_buyPrices,  InpLevelsPerSide);
   ArrayResize(g_sellPrices, InpLevelsPerSide);

   PrintFormat("Arm grid @ frozen anchor bid=%.5f ask=%.5f | step=%.0f pips (%.5f)",
               g_anchorBid, g_anchorAsk, InpGridStepPips, step);

   for(int i = 0; i < InpLevelsPerSide; i++)
   {
      double dist = GridLevelDistance(i, step, minDist);
      double lot  = LevelLot(i);

      if(placeBuys)
      {
         double bp = NormalizeDouble(g_anchorAsk + dist, _Digits);
         g_buyPrices[i] = bp;
         if(!trade.BuyStop(lot, bp, _Symbol, 0, 0, ORDER_TIME_GTC, 0, InpComment))
            PrintFormat("BuyStop lvl %d failed @ %.5f lot %.2f err %d", i + 1, bp, lot, GetLastError());
      }
      else
         g_buyPrices[i] = 0.0;

      if(placeSells)
      {
         double sp = NormalizeDouble(g_anchorBid - dist, _Digits);
         g_sellPrices[i] = sp;
         if(!trade.SellStop(lot, sp, _Symbol, 0, 0, ORDER_TIME_GTC, 0, InpComment))
            PrintFormat("SellStop lvl %d failed @ %.5f lot %.2f err %d", i + 1, sp, lot, GetLastError());
      }
      else
         g_sellPrices[i] = 0.0;
   }

   g_gridStep  = step;
   g_gridReady = true;
   g_peak      = 0.0;
}

//==================================================================
//  LOT PER LEVEL  (levelIndex 0 = L1, 1 = L2, ...)
//  L1 = base, L2 = base x mult, L3 = base x mult^2, ...
//==================================================================
double LevelLot(int levelIndex)
{
   if(levelIndex < 0) levelIndex = 0;
   double lot = InpBaseLot * MathPow(InpLotMultiplier, (double)levelIndex);
   return NormalizeLot(lot);
}

//==================================================================
//  PIP SIZE  (price value of 1 pip)
//  Standard heuristic: 10 points on 3/5-digit symbols, else 1 point.
//  For gold this yields 1 pip = 0.01  ->  100 pips = $1.00.
//  Set InpPipSizeOverride if your broker uses a different convention.
//==================================================================
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

//==================================================================
//  BASKET P/L  (profit + swap of our positions; commission not
//  included as MT5 stores it on the deal, not the open position)
//==================================================================
double BasketProfit()
{
   double p = 0.0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong tk = PositionGetTicket(i);
      if(tk == 0) continue;
      if(PositionGetInteger(POSITION_MAGIC)  != InpMagic) continue;
      if(PositionGetString(POSITION_SYMBOL)  != _Symbol)  continue;
      p += PositionGetDouble(POSITION_PROFIT) + PositionGetDouble(POSITION_SWAP);
   }
   return p;
}

//==================================================================
//  COUNTERS
//==================================================================
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
      if(OrderGetInteger(ORDER_MAGIC)  != InpMagic) continue;
      if(OrderGetString(ORDER_SYMBOL)  != _Symbol)  continue;
      c++;
   }
   return c;
}

//==================================================================
//  CLOSE EVERYTHING + DELETE PENDINGS
//==================================================================
void CloseAllAndReset()
{
   CloseAllPositions();
   DeleteAllPendings();
   g_peak         = 0.0;
   g_gridReady    = false;
   g_anchorAsk    = 0.0;
   g_anchorBid    = 0.0;
   g_levelSlArmed = false;
   g_prevPosCount = 0;
}

// Any SL (broker or virtual) on buy OR sell -> close everything and wipe grid
void CheckLevelSlClosed()
{
   if(!InpUseLevelTrailSL || !g_levelSlArmed) return;

   int now = CountPositions();
   if(g_prevPosCount > 0 && now < g_prevPosCount)
   {
      PrintFormat("Level SL: position count %d -> %d. Full cycle restart.", g_prevPosCount, now);
      CloseAllAndReset();
      return;
   }
   g_prevPosCount = now;
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

   long entry = HistoryDealGetInteger(deal, DEAL_ENTRY);

   if(entry == DEAL_ENTRY_IN && InpOneSideOnly)
   {
      long dtype = HistoryDealGetInteger(deal, DEAL_TYPE);
      if(dtype == DEAL_TYPE_BUY)
         DeleteOppositePendings(POSITION_TYPE_BUY);
      else if(dtype == DEAL_TYPE_SELL)
         DeleteOppositePendings(POSITION_TYPE_SELL);
      return;
   }

   if(entry != DEAL_ENTRY_OUT) return;

   long reason = HistoryDealGetInteger(deal, DEAL_REASON);
   if(reason != DEAL_REASON_SL && reason != DEAL_REASON_SO) return;

   PrintFormat("Broker lock-SL on %s (deal %I64u). Cycle restart.", _Symbol, deal);
   CloseAllAndReset();
}

void CloseAllPositions()
{
   for(int attempt = 0; attempt < 5; attempt++)
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

//==================================================================
//  TREND DIRECTION (optional filter)
//==================================================================
int TrendDir()
{
   double f[], s[];
   if(CopyBuffer(g_hFast, 0, 0, 1, f) < 1) return 0;
   if(CopyBuffer(g_hSlow, 0, 0, 1, s) < 1) return 0;
   if(f[0] > s[0]) return  1;
   if(f[0] < s[0]) return -1;
   return 0;
}
//+------------------------------------------------------------------+