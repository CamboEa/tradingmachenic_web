//+------------------------------------------------------------------+
//|                      SuperHedgingEA  v1.0                        |
//|  Dual BuyStop / SellStop recovery: gap triggers, $ side TP,     |
//|  opposite pending scaled by RecoveryMult.                        |
//+------------------------------------------------------------------+
#property copyright "SuperHedgingEA"
#property description "BuyStop/SellStop hedge cycle with scaled recovery legs"
#property version   "1.0"

#include <Trade\Trade.mqh>
CTrade trade;

//=== STRATEGY INPUTS ================================================
input int    GapPips           = 100;    // Distance from bid/ask for outer pendings
input double BaseLot           = 0.01;   // First arm (both sides when flat)
input double SideTakeProfitUSD = 1.0;    // Close all positions on that side when P/L reaches this
input double RecoveryMult      = 2.0;    // Next leg vs opposite exposure (e.g. sell add = buys*R)

//=== NEWS FILTER INPUTS =============================================
input int    NewsMinutesBefore = 30;
input int    NewsMinutesAfter  = 30;
input bool   CloseTradesOnNews = false;

//=== DAILY LIMIT ====================================================
input double DailyProfitTarget = 1000.0;

//=== MISC ===========================================================
input ulong  MagicNumber  = 20240105;
input int    Slippage     = 3;

//=== PERFORMANCE ====================================================
input int    NewsPollSeconds    = 5;
input int    DashboardRefreshMs = 500;

//=== GLOBALS ========================================================
double   g_pip;

double   g_symVolMin      = 0;
double   g_symVolMax      = 0;
double   g_symVolStep     = 0;
double   g_symTickValue   = 0;
double   g_symTickSize    = 0;

bool     g_dailyTargetHit = false;
int      g_lastTradeDay   = -1;
double   g_dailyProfit    = 0.0;

datetime g_newsPollTime     = 0;
bool     g_newsBlocked      = false;
string   g_newsOutName      = "None";
datetime g_newsOutTime      = 0;
ulong    g_lastNewsPrintId  = 0;
datetime g_lastNewsPrintT   = 0;

bool     g_calendarAvailable = false;

ulong    g_lastDashMs       = 0;

struct PositionSnapshot
{
   double   floatingProfit;
   double   buyProfit;
   double   sellProfit;
   int      buyCount;
   int      sellCount;
   double   lowestBuyPrice;
   double   highestBuyPrice;
   double   highestSellPrice;
   double   lowestSellPrice;
   double   buyLots;
   double   buyWeightedSum;
   double   sellLots;
   double   sellWeightedSum;
   bool     hasOurPositions;
};

//+------------------------------------------------------------------+
int OnInit()
{
   trade.SetExpertMagicNumber(MagicNumber);
   trade.SetDeviationInPoints(Slippage * 10);

   g_pip = (_Digits == 5 || _Digits == 3) ? 10.0 * _Point : _Point;

   g_symVolMin    = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   g_symVolMax    = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   g_symVolStep   = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   g_symTickValue = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   g_symTickSize  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   if(g_symVolStep <= 0 || g_symTickSize <= 0 || g_symTickValue <= 0)
   {
      Print("ERROR: Invalid symbol volume or tick parameters.");
      return INIT_FAILED;
   }

   g_newsPollTime = 0;
   g_lastDashMs   = 0;

   MqlDateTime now;
   TimeToStruct(TimeCurrent(), now);
   g_lastTradeDay = now.day_of_year;

   MqlCalendarValue testValues[];
   int testCount = CalendarValueHistory(testValues,
                                        TimeCurrent() - 60,
                                        TimeCurrent() + 60,
                                        NULL, NULL);
   if(testCount < 0)
   {
      g_calendarAvailable = false;
      Alert("SuperHedgingEA: Economic Calendar unavailable on this broker!\n"
            "News filter DISABLED. Check MT5 calendar permissions.");
      Print("WARNING: Calendar unavailable — news filter DISABLED.");
   }
   else
   {
      g_calendarAvailable = true;
      Print("Calendar OK — ", testCount, " events in test window.");
   }

   Print("=== SuperHedgingEA v1.0 Started | ", _Symbol,
         " | Gap=", GapPips, " pips | BaseLot=", BaseLot,
         " | Side TP $", SideTakeProfitUSD, " | R=", RecoveryMult,
         " | Calendar: ", g_calendarAvailable ? "OK" : "OFF", " ===");

   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   DeleteOurPendingOrders();
   Comment("");
   Print("=== SuperHedgingEA v1.0 Stopped. Reason: ", reason, " ===");
}

//+------------------------------------------------------------------+
void PollNewsIfDue()
{
   if(!g_calendarAvailable)
   {
      g_newsBlocked = false;
      g_newsOutName = "None";
      g_newsOutTime = 0;
      return;
   }

   datetime now = TimeCurrent();
   int      pollSec = NewsPollSeconds < 1 ? 1 : NewsPollSeconds;
   if(g_newsPollTime != 0 && (now - g_newsPollTime) < pollSec)
      return;

   g_newsPollTime  = now;
   g_newsBlocked   = false;
   g_newsOutName   = "None";
   g_newsOutTime   = 0;

   datetime scanFrom = now - NewsMinutesAfter  * 60;
   datetime scanTo   = now + NewsMinutesBefore * 60;

   MqlCalendarValue values[];
   int count = CalendarValueHistory(values, scanFrom, scanTo, NULL, NULL);
   if(count <= 0) return;

   for(int i = 0; i < count; i++)
   {
      MqlCalendarEvent event;
      if(!CalendarEventById(values[i].event_id, event)) continue;
      if(event.importance != CALENDAR_IMPORTANCE_HIGH)  continue;

      MqlCalendarCountry country;
      if(!CalendarCountryById(event.country_id, country)) continue;

      string curr = country.currency;
      if(curr != "USD" && curr != "EUR" && curr != "GBP" &&
         curr != "JPY" && curr != "CHF" && curr != "XAU")
         continue;

      g_newsBlocked = true;
      g_newsOutName = event.name;
      g_newsOutTime = values[i].time;

      ulong evId = (ulong)values[i].event_id;
      if(evId != g_lastNewsPrintId || values[i].time != g_lastNewsPrintT)
      {
         g_lastNewsPrintId = evId;
         g_lastNewsPrintT  = values[i].time;
         Print("NEWS: [", curr, "] ", event.name, " at ", TimeToString(values[i].time));
      }
      return;
   }
}

//+------------------------------------------------------------------+
double NormalizeLot(double lots)
{
   lots = MathFloor(lots / g_symVolStep) * g_symVolStep;
   lots = MathMax(lots, g_symVolMin);
   lots = MathMin(lots, g_symVolMax);
   return NormalizeDouble(lots, 2);
}

//+------------------------------------------------------------------+
void BuildPositionSnapshot(PositionSnapshot &snap)
{
   ZeroMemory(snap);
   long magic = (long)MagicNumber;

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != magic) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol) continue;

      snap.hasOurPositions = true;

      double profit = PositionGetDouble(POSITION_PROFIT) + PositionGetDouble(POSITION_SWAP);
      snap.floatingProfit += profit;

      ENUM_POSITION_TYPE pt = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
      double lots  = PositionGetDouble(POSITION_VOLUME);
      double price = PositionGetDouble(POSITION_PRICE_OPEN);

      if(pt == POSITION_TYPE_BUY)
      {
         snap.buyCount++;
         snap.buyProfit += profit;
         snap.buyLots += lots;
         snap.buyWeightedSum += lots * price;
         if(snap.lowestBuyPrice == 0 || price < snap.lowestBuyPrice) snap.lowestBuyPrice = price;
         if(snap.highestBuyPrice == 0 || price > snap.highestBuyPrice) snap.highestBuyPrice = price;
      }
      else if(pt == POSITION_TYPE_SELL)
      {
         snap.sellCount++;
         snap.sellProfit += profit;
         snap.sellLots += lots;
         snap.sellWeightedSum += lots * price;
         if(snap.highestSellPrice == 0 || price > snap.highestSellPrice) snap.highestSellPrice = price;
         if(snap.lowestSellPrice == 0 || price < snap.lowestSellPrice) snap.lowestSellPrice = price;
      }
   }
}

//+------------------------------------------------------------------+
void DeleteOurPendingOrders()
{
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      ulong ticket = OrderGetTicket(i);
      if(ticket == 0) continue;
      if(!OrderSelect(ticket)) continue;
      if(OrderGetInteger(ORDER_MAGIC) != (long)MagicNumber) continue;
      if(OrderGetString(ORDER_SYMBOL) != _Symbol) continue;

      ENUM_ORDER_TYPE ot = (ENUM_ORDER_TYPE)OrderGetInteger(ORDER_TYPE);
      if(ot != ORDER_TYPE_BUY_STOP && ot != ORDER_TYPE_SELL_STOP &&
         ot != ORDER_TYPE_BUY_LIMIT && ot != ORDER_TYPE_SELL_LIMIT)
         continue;

      if(!trade.OrderDelete(ticket))
         Print("OrderDelete failed ", GetLastError(), " ticket=", ticket);
   }
}

//+------------------------------------------------------------------+
bool OrderExistsNear(ENUM_ORDER_TYPE type, double targetPrice, double lots, double tolPrice)
{
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      ulong ticket = OrderGetTicket(i);
      if(ticket == 0) continue;
      if(!OrderSelect(ticket)) continue;
      if(OrderGetInteger(ORDER_MAGIC) != (long)MagicNumber) continue;
      if(OrderGetString(ORDER_SYMBOL) != _Symbol) continue;
      if((ENUM_ORDER_TYPE)OrderGetInteger(ORDER_TYPE) != type) continue;

      double op = OrderGetDouble(ORDER_PRICE_OPEN);
      double vo = OrderGetDouble(ORDER_VOLUME_CURRENT);
      if(MathAbs(op - targetPrice) <= tolPrice && MathAbs(vo - lots) <= g_symVolStep * 0.5)
         return true;
   }
   return false;
}

//+------------------------------------------------------------------+
bool PlaceBuyPendingAt(double price, double lots, string cmt)
{
   double minDist = (double)SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL) * _Point;
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   price = NormalizeDouble(price, _Digits);
   lots  = NormalizeLot(lots);

   if(price > ask + minDist)
      return trade.BuyStop(lots, price, _Symbol, 0, 0, ORDER_TIME_GTC, 0, cmt);
   if(price < bid - minDist)
      return trade.BuyLimit(lots, price, _Symbol, 0, 0, ORDER_TIME_GTC, 0, cmt);
   Print("PlaceBuyPendingAt: price inside spread, skip. price=", price, " ask=", ask, " bid=", bid);
   return false;
}

//+------------------------------------------------------------------+
bool PlaceSellPendingAt(double price, double lots, string cmt)
{
   double minDist = (double)SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL) * _Point;
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   price = NormalizeDouble(price, _Digits);
   lots  = NormalizeLot(lots);

   if(price < bid - minDist)
      return trade.SellStop(lots, price, _Symbol, 0, 0, ORDER_TIME_GTC, 0, cmt);
   if(price > ask + minDist)
      return trade.SellLimit(lots, price, _Symbol, 0, 0, ORDER_TIME_GTC, 0, cmt);
   Print("PlaceSellPendingAt: price inside spread, skip. price=", price, " ask=", ask, " bid=", bid);
   return false;
}

//+------------------------------------------------------------------+
void CloseSide(ENUM_POSITION_TYPE side)
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != (long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol) continue;
      if((ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE) != side) continue;
      if(!trade.PositionClose(ticket))
         Print("CloseSide ERROR ", GetLastError(), " Ticket=", ticket);
      else
         Print("Closed ", (side == POSITION_TYPE_BUY ? "BUY" : "SELL"), " #", ticket);
   }
}

//+------------------------------------------------------------------+
void CloseAllPositions()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) != (long)MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol) continue;
      if(!trade.PositionClose(ticket))
         Print("CloseAll ERROR ", GetLastError(), " Ticket=", ticket);
   }
}

//+------------------------------------------------------------------+
void UpdateDashboard(const PositionSnapshot &snap, double bid, double ask,
                     double buyStopPx, double sellStopPx,
                     double buyRecPx, double sellAddLot, double buyRecLot)
{
   if(DashboardRefreshMs > 0)
   {
      ulong ms = GetTickCount64();
      if(g_lastDashMs != 0 && (ms - g_lastDashMs) < (ulong)DashboardRefreshMs)
         return;
      g_lastDashMs = ms;
   }

   string cal = g_calendarAvailable ? "OK" : "OFF";
   string nw  = g_newsBlocked ? ("BLACKOUT: " + g_newsOutName) : "clear";

   Comment(
      "SuperHedgingEA v1.0\n",
      "Buys: ", snap.buyCount, " vol ", DoubleToString(snap.buyLots, 2),
      "  Sells: ", snap.sellCount, " vol ", DoubleToString(snap.sellLots, 2), "\n",
      "Buy P/L $", DoubleToString(snap.buyProfit, 2),
      "  Sell P/L $", DoubleToString(snap.sellProfit, 2),
      "  Float $", DoubleToString(snap.floatingProfit, 2), "\n",
      "Gap ", GapPips, " pips | Side TP $", SideTakeProfitUSD, " | R ", RecoveryMult, "\n",
      "BuyStop(outer) ", DoubleToString(buyStopPx, _Digits),
      "  SellStop(outer) ", DoubleToString(sellStopPx, _Digits), "\n",
      "BuyRecover@ ", DoubleToString(buyRecPx, _Digits), " lot ", DoubleToString(buyRecLot, 2),
      "  NextSellAdd ", DoubleToString(sellAddLot, 2), "\n",
      "News: ", nw, "  Calendar: ", cal, "\n",
      "Bid ", DoubleToString(bid, _Digits), "  Ask ", DoubleToString(ask, _Digits)
   );
}

//+------------------------------------------------------------------+
double NextSellAddVolume(const PositionSnapshot &s)
{
   double target = NormalizeLot(s.buyLots * RecoveryMult);
   if(s.sellLots <= 0.0)
      return target;
   double add = target - s.sellLots;
   if(add < g_symVolMin)
      add = target;
   return NormalizeLot(MathMax(add, g_symVolMin));
}

//+------------------------------------------------------------------+
double NextBuyRecoverVolume(const PositionSnapshot &s)
{
   if(s.buyLots <= 0.0)
      return NormalizeLot(BaseLot);
   if(s.sellLots <= 0.0)
      return NormalizeLot(MathMax(BaseLot, s.buyLots * RecoveryMult * RecoveryMult));
   return NormalizeLot(MathMax(g_symVolMin, s.sellLots * RecoveryMult));
}

//+------------------------------------------------------------------+
void OnTick()
{
   MqlDateTime nowStruct;
   TimeToStruct(TimeCurrent(), nowStruct);
   int todayDOY = nowStruct.day_of_year;

   if(todayDOY != g_lastTradeDay)
   {
      Print("=== NEW DAY (", todayDOY, ") — Resetting daily tracker ===");
      g_lastTradeDay   = todayDOY;
      g_dailyProfit    = 0.0;
      g_dailyTargetHit = false;
   }

   PollNewsIfDue();

   if(g_newsBlocked)
   {
      if(CloseTradesOnNews)
      {
         bool had = false;
         for(int i = PositionsTotal() - 1; i >= 0; i--)
         {
            ulong t = PositionGetTicket(i);
            if(t == 0) continue;
            if(PositionGetInteger(POSITION_MAGIC) != (long)MagicNumber) continue;
            if(PositionGetString(POSITION_SYMBOL) != _Symbol) continue;
            had = true;
            break;
         }
         if(had)
         {
            Print("NEWS: Closing all before: ", g_newsOutName);
            DeleteOurPendingOrders();
            CloseAllPositions();
         }
      }
      Comment("NEWS BLACKOUT\n", g_newsOutName, "\n", TimeToString(g_newsOutTime));
      return;
   }

   if(g_dailyTargetHit)
   {
      Comment("Daily target hit — idle until next day.");
      return;
   }

   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double gap = (double)GapPips * g_pip;
   double tol = MathMax(_Point * 10.0, gap * 0.01);

   PositionSnapshot snap;
   BuildPositionSnapshot(snap);

   double totalDaily = g_dailyProfit + snap.floatingProfit;
   if(totalDaily >= DailyProfitTarget)
   {
      Print("=== DAILY TARGET HIT $", DoubleToString(totalDaily, 2), " ===");
      DeleteOurPendingOrders();
      CloseAllPositions();
      g_dailyProfit    = totalDaily;
      g_dailyTargetHit = true;
      return;
   }

   double outerBuyStop  = NormalizeDouble(ask + gap, _Digits);
   double outerSellStop = NormalizeDouble(bid - gap, _Digits);
   double buyVwap      = (snap.buyLots > 0.0) ? (snap.buyWeightedSum / snap.buyLots) : 0.0;
   double sellVwap     = (snap.sellLots > 0.0) ? (snap.sellWeightedSum / snap.sellLots) : 0.0;

   double sellAddLot  = NextSellAddVolume(snap);
   double buyRecLot    = NextBuyRecoverVolume(snap);

   if(snap.buyProfit >= SideTakeProfitUSD && snap.buyCount > 0)
   {
      Print("BUY side TP $", DoubleToString(snap.buyProfit, 2));
      g_dailyProfit += snap.buyProfit;
      CloseSide(POSITION_TYPE_BUY);
      DeleteOurPendingOrders();
      return;
   }

   if(snap.sellProfit >= SideTakeProfitUSD && snap.sellCount > 0)
   {
      Print("SELL side TP $", DoubleToString(snap.sellProfit, 2));
      g_dailyProfit += snap.sellProfit;
      CloseSide(POSITION_TYPE_SELL);
      DeleteOurPendingOrders();
      return;
   }

   if(snap.buyCount == 0 && snap.sellCount == 0)
   {
      DeleteOurPendingOrders();
      double lot0 = NormalizeLot(BaseLot);
      if(!OrderExistsNear(ORDER_TYPE_BUY_STOP, outerBuyStop, lot0, tol))
         if(!trade.BuyStop(lot0, outerBuyStop, _Symbol, 0, 0, ORDER_TIME_GTC, 0, "HS init buy"))
            Print("BuyStop init err ", GetLastError());
      if(!OrderExistsNear(ORDER_TYPE_SELL_STOP, outerSellStop, lot0, tol))
         if(!trade.SellStop(lot0, outerSellStop, _Symbol, 0, 0, ORDER_TIME_GTC, 0, "HS init sell"))
            Print("SellStop init err ", GetLastError());
   }
   else if(snap.buyCount > 0 && snap.sellCount == 0)
   {
      if(!OrderExistsNear(ORDER_TYPE_SELL_STOP, outerSellStop, sellAddLot, tol))
      {
         if(!trade.SellStop(sellAddLot, outerSellStop, _Symbol, 0, 0, ORDER_TIME_GTC, 0, "HS sell add"))
            Print("SellStop add err ", GetLastError());
      }
      if(buyVwap > 0.0 && buyRecLot >= g_symVolMin)
      {
         if(!OrderExistsNear(ORDER_TYPE_BUY_STOP, buyVwap, buyRecLot, tol) &&
            !OrderExistsNear(ORDER_TYPE_BUY_LIMIT, buyVwap, buyRecLot, tol))
            PlaceBuyPendingAt(buyVwap, buyRecLot, "HS buy recover");
      }
   }
   else if(snap.sellCount > 0 && snap.buyCount == 0)
   {
      double buyAddLot = NormalizeLot(MathMax(g_symVolMin, snap.sellLots * RecoveryMult));
      if(!OrderExistsNear(ORDER_TYPE_BUY_STOP, outerBuyStop, buyAddLot, tol))
      {
         if(!trade.BuyStop(buyAddLot, outerBuyStop, _Symbol, 0, 0, ORDER_TIME_GTC, 0, "HS buy add"))
            Print("BuyStop add err ", GetLastError());
      }
      if(sellVwap > 0.0)
      {
         double sellRecLot = NormalizeLot(MathMax(g_symVolMin, snap.sellLots * RecoveryMult * RecoveryMult));
         if(!OrderExistsNear(ORDER_TYPE_SELL_STOP, sellVwap, sellRecLot, tol) &&
            !OrderExistsNear(ORDER_TYPE_SELL_LIMIT, sellVwap, sellRecLot, tol))
            PlaceSellPendingAt(sellVwap, sellRecLot, "HS sell recover");
      }
   }
   else
   {
      if(!OrderExistsNear(ORDER_TYPE_SELL_STOP, outerSellStop, sellAddLot, tol))
         if(!trade.SellStop(sellAddLot, outerSellStop, _Symbol, 0, 0, ORDER_TIME_GTC, 0, "HS sell leg"))
            Print("SellStop hedge err ", GetLastError());

      if(buyVwap > 0.0 && buyRecLot >= g_symVolMin)
      {
         if(!OrderExistsNear(ORDER_TYPE_BUY_STOP, buyVwap, buyRecLot, tol) &&
            !OrderExistsNear(ORDER_TYPE_BUY_LIMIT, buyVwap, buyRecLot, tol))
            PlaceBuyPendingAt(buyVwap, buyRecLot, "HS buy recover H");
      }
   }

   UpdateDashboard(snap, bid, ask, outerBuyStop, outerSellStop, buyVwap, sellAddLot, buyRecLot);
}
//+------------------------------------------------------------------+
