//+------------------------------------------------------------------+
//| SnD_EA_v1.mq5                                                    |
//| Supply & Demand EA — trades SnD.pine rejection signals (MTF)     |
//| Zones: BOS/CHoCH + FVG (valid mode) or pivots; entry on reject   |
//+------------------------------------------------------------------+
#property copyright "Suppy Demand"
#property version   "1.00"
#property description "MTF S/D zones (M5/M15/H1/H4) + zone rejection entries like SnD.pine"
#property strict

#include <Trade\Trade.mqh>

CTrade trade;

//+------------------------------------------------------------------+
//| Inputs — match SnD.pine defaults where possible                   |
//+------------------------------------------------------------------+
input group "═══════ TIMEFRAMES ═══════"
input bool   InpUseM5            = true;    // Detect zones from M5
input bool   InpUseM15           = true;    // 15m
input bool   InpUseH1            = true;    // 1H
input bool   InpUseH4            = true;    // 4H
input bool   InpUseChartTf       = false;   // Also detect zones from chart TF

input group "═══════ ZONE DETECTION ═══════"
input int    InpPivotLen         = 5;       // Pivot length (simple zones)
input int    InpZoneAtrLen       = 14;      // ATR length
input double InpZoneAtrMult      = 1.0;     // Zone thickness (ATR x)
input double InpZoneBufferAtr    = 0.15;    // SL buffer beyond zone (ATR x)
input int    InpMaxZones         = 12;      // Max zones per side per TF
input int    InpMaxScanBars      = 600;     // History bars to scan per TF

input bool   InpValidZonesOnly   = true;    // Only valid zones (BOS + imbalance)
input int    InpBosSwingLen      = 5;       // BOS swing length (validation)
input bool   InpRequireFVG       = true;    // Require imbalance (FVG)
input int    InpFvgLookback      = 20;      // FVG lookback (bars)

input group "═══════ MITIGATION ═══════"
input bool   InpRemoveMitigated  = true;    // Drop mitigated zones
enum ENUM_SND_MIT { SND_MIT_TOUCH = 0, SND_MIT_BREAK = 1, SND_MIT_TOUCH_OR_BREAK = 2 };
input ENUM_SND_MIT InpMitigationMode = SND_MIT_TOUCH_OR_BREAK;
enum ENUM_SND_BREAK { SND_BREAK_WICK = 0, SND_BREAK_CLOSE = 1 };
input ENUM_SND_BREAK InpBreakConfirm = SND_BREAK_WICK;

input group "═══════ SIGNALS ═══════"
input double InpRewardMultiple   = 2.0;     // TP risk:reward
input int    InpCooldownBars     = 15;      // Signal cooldown (chart bars)
input bool   InpConfirmCloseOutside = true; // Confirm rejection: close outside zone
input bool   InpUseWickTouch       = true;  // Wick must touch zone (else close in zone)

input group "═══════ EXECUTION ═══════"
input string InpTradeSymbol      = "";      // Empty = chart symbol
input ulong  InpMagicNumber      = 26052501;
input double InpFixedLots        = 0.01;
input int    InpSlippagePoints   = 30;
input int    InpMaxSpreadPoints  = 400;
input bool   InpOnePositionOnly  = true;
input int    InpMinBarsWarmup    = 100;

input group "═══════ PROP FIRM (optional) ═══════"
input bool   InpUsePropLimits     = false;
input double InpAccountBaseline   = 2000.0;
input double InpMaxDailyLossUSD   = 100.0;
input double InpMaxTotalLossUSD   = 200.0;
input double InpRiskPercentCap    = 1.0;     // Skip if $ risk at SL > % equity
input int    InpMaxTradesPerDay   = 2;       // 0 = unlimited

input group "═══════ TRADE MANAGEMENT ═══════"
input bool   InpUseBreakEven      = true;
input double InpBE_TriggerR       = 1.0;
input double InpBE_LockR          = 0.1;
input double InpBE_ATR_Buffer     = 0.15;
input bool   InpUseTrailing       = true;
input double InpTrail_StartR      = 1.25;
input double InpTrail_ATR_Mult    = 1.0;
input double InpTrail_StepATR     = 0.12;
input int    InpMgmtAtrPeriod     = 14;
input int    InpMgmtUpdateMs      = 400;

input group "═══════ SESSION ═══════"
input bool   InpUseSessionFilter  = false;
input int    InpSessionStartHour  = 8;
input int    InpSessionEndHour    = 20;

//+------------------------------------------------------------------+
enum ENUM_SND_TF
  {
   SND_TF_M5  = 0,
   SND_TF_M15 = 1,
   SND_TF_H1  = 2,
   SND_TF_H4  = 3,
   SND_TF_CHART = 4,
   SND_TF_COUNT
  };

struct SDZone
  {
   bool     active;
   datetime left_time;
   double   top;
   double   bottom;
  };

struct SnDSignal
  {
   bool     valid;
   bool     is_buy;
   double   entry;
   double   sl;
   double   tp;
   string   tf_label;
  };

// Zone storage per TF / side
SDZone g_supply_m5[];
SDZone g_supply_m15[];
SDZone g_supply_h1[];
SDZone g_supply_h4[];
SDZone g_supply_chart[];
SDZone g_demand_m5[];
SDZone g_demand_m15[];
SDZone g_demand_h1[];
SDZone g_demand_h4[];
SDZone g_demand_chart[];

string   g_sym;
double   g_point;
int      g_digits;
double   g_volMin, g_volMax, g_volStep;
double   g_tickSize, g_tickValue;
double   g_minStopDistance;
double   g_normLots;

int      g_atr_chart = INVALID_HANDLE;
int      g_atr_mgmt  = INVALID_HANDLE;

datetime g_lastSignalBarTime = 0;
datetime g_lastChartBarTime  = 0;

double   g_baselineEquity   = 0.0;
int      g_dayKey           = 0;
double   g_dayStartEquity   = 0.0;
bool     g_dailyStopLatched = false;
bool     g_totalStopLatched = false;
int      g_dailyTradesOpened = 0;
uint     g_lastMgmtMs       = 0;
double   g_lastMgmtAtr      = 0.0;

double   g_bufAtr[];

#define SND_GV_BASELINE "SND_BASELINE"
#define SND_GV_DAYKEY   "SND_DAYKEY"
#define SND_GV_DAYEQ    "SND_DAYEQ"
#define SND_GV_DAILY_LAT "SND_DAILY_LAT"
#define SND_GV_TOTAL_LAT "SND_TOTAL_LAT"
#define SND_GV_DAYTRADES "SND_DAYTRADES"
#define SND_GV_POS_TK    "SND_POS_TK"
#define SND_GV_RISK_DIST "SND_RISK_DIST"
#define SND_GV_BE_DONE   "SND_BE_DONE"
#define SND_GV_TRAIL_ON  "SND_TRAIL_ON"

//+------------------------------------------------------------------+
string TfLabel(const ENUM_SND_TF id)
  {
   switch(id)
     {
      case SND_TF_M5:    return "M5";
      case SND_TF_M15:   return "M15";
      case SND_TF_H1:    return "H1";
      case SND_TF_H4:    return "H4";
      case SND_TF_CHART: return EnumToString((ENUM_TIMEFRAMES)Period());
     }
   return "?";
  }

ENUM_TIMEFRAMES TfPeriod(const ENUM_SND_TF id)
  {
   switch(id)
     {
      case SND_TF_M5:    return PERIOD_M5;
      case SND_TF_M15:   return PERIOD_M15;
      case SND_TF_H1:    return PERIOD_H1;
      case SND_TF_H4:    return PERIOD_H4;
      case SND_TF_CHART: return (ENUM_TIMEFRAMES)Period();
     }
   return PERIOD_CURRENT;
  }

bool TfEnabled(const ENUM_SND_TF id)
  {
   switch(id)
     {
      case SND_TF_M5:    return InpUseM5;
      case SND_TF_M15:   return InpUseM15;
      case SND_TF_H1:    return InpUseH1;
      case SND_TF_H4:    return InpUseH4;
      case SND_TF_CHART: return InpUseChartTf;
     }
   return false;
  }

bool ZonesGetArray(const ENUM_SND_TF tf_id, const bool is_supply, SDZone &zones[])
  {
   switch(tf_id)
     {
      case SND_TF_M5:
         if(is_supply) { ArrayCopy(zones, g_supply_m5); return true; }
         ArrayCopy(zones, g_demand_m5);
         return true;
      case SND_TF_M15:
         if(is_supply) { ArrayCopy(zones, g_supply_m15); return true; }
         ArrayCopy(zones, g_demand_m15);
         return true;
      case SND_TF_H1:
         if(is_supply) { ArrayCopy(zones, g_supply_h1); return true; }
         ArrayCopy(zones, g_demand_h1);
         return true;
      case SND_TF_H4:
         if(is_supply) { ArrayCopy(zones, g_supply_h4); return true; }
         ArrayCopy(zones, g_demand_h4);
         return true;
      case SND_TF_CHART:
         if(is_supply) { ArrayCopy(zones, g_supply_chart); return true; }
         ArrayCopy(zones, g_demand_chart);
         return true;
     }
   ArrayResize(zones, 0);
   return false;
  }

void ZonesBind(const ENUM_SND_TF tf_id, const bool is_supply, SDZone &zones[])
  {
   switch(tf_id)
     {
      case SND_TF_M5:
         if(is_supply) ArrayCopy(g_supply_m5, zones);
         else          ArrayCopy(g_demand_m5, zones);
         break;
      case SND_TF_M15:
         if(is_supply) ArrayCopy(g_supply_m15, zones);
         else          ArrayCopy(g_demand_m15, zones);
         break;
      case SND_TF_H1:
         if(is_supply) ArrayCopy(g_supply_h1, zones);
         else          ArrayCopy(g_demand_h1, zones);
         break;
      case SND_TF_H4:
         if(is_supply) ArrayCopy(g_supply_h4, zones);
         else          ArrayCopy(g_demand_h4, zones);
         break;
      case SND_TF_CHART:
         if(is_supply) ArrayCopy(g_supply_chart, zones);
         else          ArrayCopy(g_demand_chart, zones);
         break;
     }
  }

void ZonesClear(const ENUM_SND_TF tf_id, const bool is_supply)
  {
   SDZone empty[];
   ZonesBind(tf_id, is_supply, empty);
  }

void TrimZones(SDZone &zones[])
  {
   while(ArraySize(zones) > InpMaxZones)
      ArrayRemove(zones, 0, 1);
  }

void PushZone(SDZone &zones[], const datetime left_time, const double top, const double bottom)
  {
   int n = ArraySize(zones);
   ArrayResize(zones, n + 1);
   zones[n].active    = true;
   zones[n].left_time = left_time;
   zones[n].top       = top;
   zones[n].bottom    = bottom;
   TrimZones(zones);
  }

void ZonesPush(const ENUM_SND_TF tf_id, const bool is_supply,
               const datetime left_time, const double top, const double bottom)
  {
   SDZone zones[];
   ZonesGetArray(tf_id, is_supply, zones);
   PushZone(zones, left_time, top, bottom);
   ZonesBind(tf_id, is_supply, zones);
  }

//+------------------------------------------------------------------+
double CalcATR(const MqlRates &rates[], const int index, const int len, const int total)
  {
   if(len < 1 || index < 0 || index >= total)
      return 0.0;
   int end = MathMin(total - 1, index + len - 1);
   if(end <= index)
      return MathMax(rates[index].high - rates[index].low, g_point);
   double sum = 0.0;
   int cnt = 0;
   for(int i = index; i <= end && i < total - 1; i++)
     {
      double hl = rates[i].high - rates[i].low;
      double hc = MathAbs(rates[i].high - rates[i + 1].close);
      double lc = MathAbs(rates[i].low  - rates[i + 1].close);
      sum += MathMax(hl, MathMax(hc, lc));
      cnt++;
     }
   if(cnt <= 0)
      return MathMax(rates[index].high - rates[index].low, g_point);
   return sum / (double)cnt;
  }

bool IsPivotHigh(const MqlRates &rates[], const int i, const int len, const int total)
  {
   if(i < len || i > total - 1 - len)
      return false;
   double h = rates[i].high;
   for(int j = 1; j <= len; j++)
     {
      if(rates[i - j].high >= h) return false;
      if(rates[i + j].high >= h) return false;
     }
   return true;
  }

bool IsPivotLow(const MqlRates &rates[], const int i, const int len, const int total)
  {
   if(i < len || i > total - 1 - len)
      return false;
   double l = rates[i].low;
   for(int j = 1; j <= len; j++)
     {
      if(rates[i - j].low <= l) return false;
      if(rates[i + j].low <= l) return false;
     }
   return true;
  }

bool FvgBullAt(const MqlRates &rates[], const int i)
  {
   if(i + 2 >= ArraySize(rates))
      return false;
   return (rates[i].low > rates[i + 2].high);
  }

bool FvgBearAt(const MqlRates &rates[], const int i)
  {
   if(i + 2 >= ArraySize(rates))
      return false;
   return (rates[i].high < rates[i + 2].low);
  }

int BarsSinceCond(const MqlRates &rates[], const int from_i, const bool bull_fvg, const int max_look)
  {
   int total = ArraySize(rates);
   for(int k = from_i; k < total && k <= from_i + max_look; k++)
     {
      if(bull_fvg && FvgBullAt(rates, k))
         return k - from_i;
      if(!bull_fvg && FvgBearAt(rates, k))
         return k - from_i;
     }
   return max_look + 1;
  }

datetime LastFvgTime(const MqlRates &rates[], const int from_i, const bool bull_fvg, const int max_look)
  {
   int total = ArraySize(rates);
   for(int k = from_i; k < total && k <= from_i + max_look; k++)
     {
      if(bull_fvg && FvgBullAt(rates, k))
         return rates[k].time;
      if(!bull_fvg && FvgBearAt(rates, k))
         return rates[k].time;
     }
   return 0;
  }

bool OkImbalance(const datetime fvg_time, const datetime pivot_time, const int bars_ago)
  {
   if(!InpRequireFVG)
      return true;
   if(fvg_time <= 0 || pivot_time <= 0)
      return false;
   if(fvg_time < pivot_time)
      return false;
   return (bars_ago <= InpFvgLookback);
  }

bool InZone(const double high, const double low, const double top, const double bottom)
  {
   return (high >= bottom && low <= top);
  }

bool IsBrokenSupply(const double high, const double close, const double top)
  {
   if(InpBreakConfirm == SND_BREAK_CLOSE)
      return (close > top);
   return (high > top);
  }

bool IsBrokenDemand(const double low, const double close, const double bottom)
  {
   if(InpBreakConfirm == SND_BREAK_CLOSE)
      return (close < bottom);
   return (low < bottom);
  }

bool CrossOver(const double c0, const double c1, const double level)
  {
   return (c0 > level && c1 <= level);
  }

bool CrossUnder(const double c0, const double c1, const double level)
  {
   return (c0 < level && c1 >= level);
  }

bool IsMitigatedBar(const MqlRates &bar, const double top, const double bottom,
                    const bool is_supply, const datetime left_time)
  {
   if(bar.time <= left_time)
      return false;
   bool touched = InZone(bar.high, bar.low, top, bottom);
   bool broken  = is_supply
                  ? IsBrokenSupply(bar.high, bar.close, top)
                  : IsBrokenDemand(bar.low, bar.close, bottom);
   if(InpMitigationMode == SND_MIT_TOUCH)
      return touched;
   if(InpMitigationMode == SND_MIT_BREAK)
      return broken;
   return (touched || broken);
  }

bool IsMitigatedHistory(const MqlRates &rates[], const int zone_bar,
                        const double top, const double bottom,
                        const bool is_supply, const datetime left_time)
  {
   for(int j = zone_bar - 1; j >= 0; j--)
     {
      if(IsMitigatedBar(rates[j], top, bottom, is_supply, left_time))
         return true;
     }
   return false;
  }

void PruneMitigatedList(SDZone &zones[], const MqlRates &rates[], const bool is_supply)
  {
   if(!InpRemoveMitigated)
      return;
   for(int z = ArraySize(zones) - 1; z >= 0; z--)
     {
      if(!zones[z].active)
        {
         ArrayRemove(zones, z, 1);
         continue;
        }
      if(IsMitigatedHistory(rates, 0, zones[z].top, zones[z].bottom, is_supply, zones[z].left_time))
         ArrayRemove(zones, z, 1);
     }
  }

//+------------------------------------------------------------------+
void ScanTimeframe(const ENUM_SND_TF tf_id)
  {
   ZonesClear(tf_id, true);
   ZonesClear(tf_id, false);
   if(!TfEnabled(tf_id))
      return;

   ENUM_TIMEFRAMES period = TfPeriod(tf_id);
   MqlRates rates[];
   ArraySetAsSeries(rates, true);
   int want = MathMax(200, InpMaxScanBars);
   int got = CopyRates(g_sym, period, 0, want, rates);
   if(got < MathMax(InpBosSwingLen, InpPivotLen) * 4 + 10)
      return;

   const int bos_len  = MathMax(2, InpBosSwingLen);
   const int piv_len  = MathMax(2, InpPivotLen);
   const int atr_len  = MathMax(1, InpZoneAtrLen);

   double last_ph = 0.0, prev_ph = 0.0;
   double last_pl = 0.0, prev_pl = 0.0;
   datetime last_ph_t = 0, last_pl_t = 0;
   double last_ph_atr = 0.0, last_pl_atr = 0.0;

   double piv_ph = 0.0, piv_pl = 0.0;
   datetime piv_ph_t = 0, piv_pl_t = 0;
   double piv_ph_atr = 0.0, piv_pl_atr = 0.0;

   for(int i = got - 1 - bos_len; i >= bos_len; i--)
     {
      if(IsPivotHigh(rates, i, bos_len, got))
        {
         prev_ph     = last_ph;
         last_ph     = rates[i].high;
         last_ph_t   = rates[i].time;
         last_ph_atr = CalcATR(rates, i, atr_len, got);
        }
      if(IsPivotLow(rates, i, bos_len, got))
        {
         prev_pl     = last_pl;
         last_pl     = rates[i].low;
         last_pl_t   = rates[i].time;
         last_pl_atr = CalcATR(rates, i, atr_len, got);
        }

      if(!InpValidZonesOnly)
        {
         if(IsPivotHigh(rates, i, piv_len, got))
           {
            piv_ph     = rates[i].high;
            piv_ph_t   = rates[i].time;
            piv_ph_atr = CalcATR(rates, i, atr_len, got);
            double thick = piv_ph_atr * InpZoneAtrMult;
            if(thick <= 0.0) thick = rates[i].high - rates[i].low;
            double top = piv_ph;
            double bot = piv_ph - thick;
            if(!IsMitigatedHistory(rates, i, top, bot, true, piv_ph_t))
               ZonesPush(tf_id, true, piv_ph_t, top, bot);
           }
         if(IsPivotLow(rates, i, piv_len, got))
           {
            piv_pl     = rates[i].low;
            piv_pl_t   = rates[i].time;
            piv_pl_atr = CalcATR(rates, i, atr_len, got);
            double thick = piv_pl_atr * InpZoneAtrMult;
            if(thick <= 0.0) thick = rates[i].high - rates[i].low;
            double top = piv_pl + thick;
            double bot = piv_pl;
            if(!IsMitigatedHistory(rates, i, top, bot, false, piv_pl_t))
               ZonesPush(tf_id, false, piv_pl_t, top, bot);
           }
        }

      if(i + 1 >= got)
         continue;

      if(InpValidZonesOnly)
        {
         if(prev_ph > 0.0 && last_pl > 0.0 &&
            CrossOver(rates[i].close, rates[i + 1].close, prev_ph))
           {
            int fvg_ago = BarsSinceCond(rates, i, true, InpFvgLookback + 5);
            datetime fvg_t = LastFvgTime(rates, i, true, InpFvgLookback + 5);
            if(OkImbalance(fvg_t, last_pl_t, fvg_ago))
              {
               double thick = last_pl_atr * InpZoneAtrMult;
               if(thick <= 0.0) thick = rates[i].high - rates[i].low;
               double top = last_pl + thick;
               double bot = last_pl;
               if(!IsMitigatedHistory(rates, i, top, bot, false, last_pl_t))
                  ZonesPush(tf_id, false, last_pl_t, top, bot);
              }
           }
         if(prev_pl > 0.0 && last_ph > 0.0 &&
            CrossUnder(rates[i].close, rates[i + 1].close, prev_pl))
           {
            int fvg_ago = BarsSinceCond(rates, i, false, InpFvgLookback + 5);
            datetime fvg_t = LastFvgTime(rates, i, false, InpFvgLookback + 5);
            if(OkImbalance(fvg_t, last_ph_t, fvg_ago))
              {
               double thick = last_ph_atr * InpZoneAtrMult;
               if(thick <= 0.0) thick = rates[i].high - rates[i].low;
               double top = last_ph;
               double bot = last_ph - thick;
               if(!IsMitigatedHistory(rates, i, top, bot, true, last_ph_t))
                  ZonesPush(tf_id, true, last_ph_t, top, bot);
              }
           }
        }
     }

   SDZone supply[], demand[];
   ZonesGetArray(tf_id, true, supply);
   ZonesGetArray(tf_id, false, demand);
   PruneMitigatedList(supply, rates, true);
   PruneMitigatedList(demand, rates, false);
   ZonesBind(tf_id, true, supply);
   ZonesBind(tf_id, false, demand);
  }

void ScanAllZones()
  {
   ScanTimeframe(SND_TF_H4);
   ScanTimeframe(SND_TF_H1);
   ScanTimeframe(SND_TF_M15);
   ScanTimeframe(SND_TF_M5);
   ScanTimeframe(SND_TF_CHART);
  }

//+------------------------------------------------------------------+
//| Signal logic (SnD.pine f_rejectBuy / f_scanBuy)                   |
//+------------------------------------------------------------------+
bool MayTouchZone(const double hi, const double lo, const double top, const double bottom)
  {
   return (lo <= top && hi >= bottom);
  }

bool RejectBuy(const double o, const double h, const double l, const double c,
               const double top, const double bottom)
  {
   bool touched = InpUseWickTouch
                  ? InZone(h, l, top, bottom)
                  : (c <= top && c >= bottom);
   bool condClose = InpConfirmCloseOutside
                    ? (c > top)
                    : (c > (top + bottom) * 0.5);
   return (touched && condClose && c > o);
  }

bool RejectSell(const double o, const double h, const double l, const double c,
                const double top, const double bottom)
  {
   bool touched = InpUseWickTouch
                  ? InZone(h, l, top, bottom)
                  : (c <= top && c >= bottom);
   bool condClose = InpConfirmCloseOutside
                    ? (c < bottom)
                    : (c < (top + bottom) * 0.5);
   return (touched && condClose && c < o);
  }

bool SideMayInteract(const SDZone &zones[], const double hi, const double lo)
  {
   int n = ArraySize(zones);
   for(int i = 0; i < n; i++)
     {
      if(!zones[i].active)
         continue;
      if(MayTouchZone(hi, lo, zones[i].top, zones[i].bottom))
         return true;
     }
   return false;
  }

bool PriceNearAnyZone(const double hi, const double lo)
  {
   SDZone z[];
   const ENUM_SND_TF order[] = { SND_TF_H4, SND_TF_H1, SND_TF_M15, SND_TF_M5, SND_TF_CHART };
   for(int t = 0; t < 5; t++)
     {
      if(!TfEnabled(order[t]))
         continue;
      ZonesGetArray(order[t], false, z);
      if(SideMayInteract(z, hi, lo)) return true;
      ZonesGetArray(order[t], true, z);
      if(SideMayInteract(z, hi, lo)) return true;
     }
   return false;
  }

bool ScanBuySide(const SDZone &zones[], const double hi, const double lo,
                 const double o, const double c, const double atr_buf,
                 double &entry, double &sl, double &tp)
  {
   int n = ArraySize(zones);
   for(int i = n - 1; i >= 0; i--)
     {
      if(!zones[i].active)
         continue;
      double topZ = zones[i].top;
      double botZ = zones[i].bottom;
      if(MayTouchZone(hi, lo, topZ, botZ) && RejectBuy(o, hi, lo, c, topZ, botZ))
        {
         entry = c;
         sl    = botZ - atr_buf * InpZoneBufferAtr;
         double risk = MathMax(entry - sl, g_point);
         tp = entry + risk * InpRewardMultiple;
         return true;
        }
     }
   return false;
  }

bool ScanSellSide(const SDZone &zones[], const double hi, const double lo,
                  const double o, const double c, const double atr_buf,
                  double &entry, double &sl, double &tp)
  {
   int n = ArraySize(zones);
   for(int i = n - 1; i >= 0; i--)
     {
      if(!zones[i].active)
         continue;
      double topZ = zones[i].top;
      double botZ = zones[i].bottom;
      if(MayTouchZone(hi, lo, topZ, botZ) && RejectSell(o, hi, lo, c, topZ, botZ))
        {
         entry = c;
         sl    = topZ + atr_buf * InpZoneBufferAtr;
         double risk = MathMax(sl - entry, g_point);
         tp = entry - risk * InpRewardMultiple;
         return true;
        }
     }
   return false;
  }

bool TryScanTfBuy(const ENUM_SND_TF tf_id, const double hi, const double lo,
                  const double o, const double c, const double atr_buf, SnDSignal &sig)
  {
   if(!TfEnabled(tf_id))
      return false;
   SDZone zones[];
   ZonesGetArray(tf_id, false, zones);
   double e, s, t;
   if(!ScanBuySide(zones, hi, lo, o, c, atr_buf, e, s, t))
      return false;
   sig.valid    = true;
   sig.is_buy   = true;
   sig.entry    = e;
   sig.sl       = s;
   sig.tp       = t;
   sig.tf_label = TfLabel(tf_id);
   return true;
  }

bool TryScanTfSell(const ENUM_SND_TF tf_id, const double hi, const double lo,
                   const double o, const double c, const double atr_buf, SnDSignal &sig)
  {
   if(!TfEnabled(tf_id))
      return false;
   SDZone zones[];
   ZonesGetArray(tf_id, true, zones);
   double e, s, t;
   if(!ScanSellSide(zones, hi, lo, o, c, atr_buf, e, s, t))
      return false;
   sig.valid    = true;
   sig.is_buy   = false;
   sig.entry    = e;
   sig.sl       = s;
   sig.tp       = t;
   sig.tf_label = TfLabel(tf_id);
   return true;
  }

bool CanSignalCooldown()
  {
   if(InpCooldownBars <= 0)
      return true;
   if(g_lastSignalBarTime <= 0)
      return true;
   int barsSince = iBarShift(g_sym, (ENUM_TIMEFRAMES)Period(), g_lastSignalBarTime, true);
   if(barsSince < 0)
      return true;
   return (barsSince > InpCooldownBars);
  }

bool EvaluateSnDSignal(SnDSignal &sig)
  {
   sig.valid = false;
   if(!CanSignalCooldown())
      return false;

   const int shift = 1;
   double o = iOpen(g_sym, (ENUM_TIMEFRAMES)Period(), shift);
   double h = iHigh(g_sym, (ENUM_TIMEFRAMES)Period(), shift);
   double l = iLow(g_sym, (ENUM_TIMEFRAMES)Period(), shift);
   double c = iClose(g_sym, (ENUM_TIMEFRAMES)Period(), shift);
   if(o <= 0.0 || c <= 0.0)
      return false;

   double atr_buf = 0.0;
   if(CopyBuffer(g_atr_chart, 0, shift, 1, g_bufAtr) == 1)
      atr_buf = g_bufAtr[0];
   if(atr_buf <= 0.0)
      atr_buf = MathMax(h - l, g_point);

   if(!PriceNearAnyZone(h, l))
      return false;

   const ENUM_SND_TF prio[] = { SND_TF_H4, SND_TF_H1, SND_TF_M15, SND_TF_M5, SND_TF_CHART };
   for(int t = 0; t < 5; t++)
     {
      if(TryScanTfBuy(prio[t], h, l, o, c, atr_buf, sig))
         return true;
     }
   for(int t = 0; t < 5; t++)
     {
      if(TryScanTfSell(prio[t], h, l, o, c, atr_buf, sig))
         return true;
     }
   return false;
  }

//+------------------------------------------------------------------+
//| Risk / prop / execution (PropFirm-style helpers)                  |
//+------------------------------------------------------------------+
void CacheSymbolConstraints()
  {
   int stopsLevel  = (int)SymbolInfoInteger(g_sym, SYMBOL_TRADE_STOPS_LEVEL);
   int freezeLevel = (int)SymbolInfoInteger(g_sym, SYMBOL_TRADE_FREEZE_LEVEL);
   g_minStopDistance = (double)MathMax(stopsLevel, freezeLevel) * g_point;
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

double MoneyRiskAtSL(const ENUM_ORDER_TYPE orderType, const double entry, const double sl, const double lots)
  {
   if(lots <= 0.0 || MathAbs(entry - sl) <= 0.0)
      return 0.0;
   double profit = 0.0;
   if(OrderCalcProfit(orderType, g_sym, lots, entry, sl, profit))
      return MathAbs(profit);
   double slDist = MathAbs(entry - sl);
   return (slDist / g_tickSize) * g_tickValue * lots;
  }

bool RiskWithinCap(const ENUM_ORDER_TYPE orderType, const double entry, const double sl, const double lots)
  {
   if(!InpUsePropLimits || InpRiskPercentCap <= 0.0)
      return true;
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double cap = equity * InpRiskPercentCap / 100.0;
   double risk = MoneyRiskAtSL(orderType, entry, sl, lots);
   if(risk > cap + 0.01)
     {
      Print("SnD_EA: skip — risk $", DoubleToString(risk, 2),
            " > ", DoubleToString(InpRiskPercentCap, 1), "% cap");
      return false;
     }
   return true;
  }

void PersistState()
  {
   if(!InpUsePropLimits)
      return;
   GlobalVariableSet(SND_GV_BASELINE, g_baselineEquity);
   GlobalVariableSet(SND_GV_DAYKEY, (double)g_dayKey);
   GlobalVariableSet(SND_GV_DAYEQ, g_dayStartEquity);
   GlobalVariableSet(SND_GV_DAILY_LAT, g_dailyStopLatched ? 1.0 : 0.0);
   GlobalVariableSet(SND_GV_TOTAL_LAT, g_totalStopLatched ? 1.0 : 0.0);
   GlobalVariableSet(SND_GV_DAYTRADES, (double)g_dailyTradesOpened);
  }

void LoadPersistedState()
  {
   if(!InpUsePropLimits)
      return;
   double eq = AccountInfoDouble(ACCOUNT_EQUITY);
   if(GlobalVariableCheck(SND_GV_BASELINE))
      g_baselineEquity = GlobalVariableGet(SND_GV_BASELINE);
   else
      g_baselineEquity = (InpAccountBaseline > 0.0) ? InpAccountBaseline : eq;
   if(GlobalVariableCheck(SND_GV_DAYKEY))
      g_dayKey = (int)GlobalVariableGet(SND_GV_DAYKEY);
   if(GlobalVariableCheck(SND_GV_DAYEQ))
      g_dayStartEquity = GlobalVariableGet(SND_GV_DAYEQ);
   if(GlobalVariableCheck(SND_GV_DAILY_LAT))
      g_dailyStopLatched = (GlobalVariableGet(SND_GV_DAILY_LAT) > 0.5);
   if(GlobalVariableCheck(SND_GV_TOTAL_LAT))
      g_totalStopLatched = (GlobalVariableGet(SND_GV_TOTAL_LAT) > 0.5);
   if(GlobalVariableCheck(SND_GV_DAYTRADES))
      g_dailyTradesOpened = (int)GlobalVariableGet(SND_GV_DAYTRADES);
   if(g_dayStartEquity <= 0.0)
      g_dayStartEquity = eq;
  }

void RefreshDayBaseline()
  {
   if(!InpUsePropLimits)
      return;
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   int key = dt.year * 10000 + dt.mon * 100 + dt.day;
   if(g_dayKey != key)
     {
      g_dayKey = key;
      g_dayStartEquity = AccountInfoDouble(ACCOUNT_EQUITY);
      g_dailyStopLatched = false;
      g_dailyTradesOpened = 0;
      PersistState();
     }
  }

bool IsDailyDrawdownHit(const double equity)
  {
   if(!InpUsePropLimits || g_dailyStopLatched)
      return g_dailyStopLatched;
   if(InpMaxDailyLossUSD <= 0.0)
      return false;
   double dLoss = MathMax(0.0, g_dayStartEquity - equity);
   if(dLoss >= InpMaxDailyLossUSD - 0.01)
     {
      g_dailyStopLatched = true;
      PersistState();
      Print("SnD_EA: daily DD limit hit");
      return true;
     }
   return false;
  }

bool IsTotalDrawdownHit(const double equity)
  {
   if(!InpUsePropLimits || g_totalStopLatched)
      return g_totalStopLatched;
   if(InpMaxTotalLossUSD <= 0.0)
      return false;
   double tLoss = MathMax(0.0, g_baselineEquity - equity);
   if(tLoss >= InpMaxTotalLossUSD - 0.01)
     {
      g_totalStopLatched = true;
      PersistState();
      Print("SnD_EA: total DD limit hit");
      return true;
     }
   return false;
  }

bool PropBlocksTrading(const double equity)
  {
   if(!InpUsePropLimits)
      return false;
   if(IsTotalDrawdownHit(equity)) return true;
   if(IsDailyDrawdownHit(equity)) return true;
   return false;
  }

bool CanOpenAnotherTradeToday()
  {
   if(!InpUsePropLimits || InpMaxTradesPerDay <= 0)
      return true;
   return (g_dailyTradesOpened < InpMaxTradesPerDay);
  }

void RegisterTradeOpened()
  {
   if(!InpUsePropLimits || InpMaxTradesPerDay <= 0)
      return;
   g_dailyTradesOpened++;
   PersistState();
  }

bool InSession()
  {
   if(!InpUseSessionFilter)
      return true;
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   return (dt.hour >= InpSessionStartHour && dt.hour < InpSessionEndHour);
  }

bool CanOpenNewEntry(const double equity)
  {
   if(PropBlocksTrading(equity))
      return false;
   if(!InSession())
      return false;
   if(!CanOpenAnotherTradeToday())
      return false;
   return true;
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

void ClearPositionMgmtState()
  {
   if(GlobalVariableCheck(SND_GV_POS_TK))   GlobalVariableDel(SND_GV_POS_TK);
   if(GlobalVariableCheck(SND_GV_RISK_DIST)) GlobalVariableDel(SND_GV_RISK_DIST);
   if(GlobalVariableCheck(SND_GV_BE_DONE))  GlobalVariableDel(SND_GV_BE_DONE);
   if(GlobalVariableCheck(SND_GV_TRAIL_ON))  GlobalVariableDel(SND_GV_TRAIL_ON);
  }

void BindPositionMgmtState(const ulong ticket, const double entry, const double sl)
  {
   double risk = MathAbs(entry - sl);
   if(risk <= 0.0)
      return;
   GlobalVariableSet(SND_GV_POS_TK, (double)ticket);
   GlobalVariableSet(SND_GV_RISK_DIST, risk);
   GlobalVariableSet(SND_GV_BE_DONE, 0.0);
   GlobalVariableSet(SND_GV_TRAIL_ON, 0.0);
  }

bool FindOurPositionTicket(ulong &ticketOut)
  {
   ticketOut = 0;
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
      ticketOut = tk;
      return true;
     }
   return false;
  }

bool TryModifyPositionSL(const ulong ticket, const ENUM_POSITION_TYPE ptype,
                         const double newSl, const double tp)
  {
   if(!PositionSelectByTicket(ticket))
      return false;
   double curSl = PositionGetDouble(POSITION_SL);
   double normSl = NormalizePrice(newSl);
   if(normSl <= 0.0 || MathAbs(curSl - normSl) < g_point * 0.5)
      return true;
   double bid = SymbolInfoDouble(g_sym, SYMBOL_BID);
   double ask = SymbolInfoDouble(g_sym, SYMBOL_ASK);
   ENUM_ORDER_TYPE otype = (ptype == POSITION_TYPE_BUY) ? ORDER_TYPE_BUY : ORDER_TYPE_SELL;
   double refPrice = (ptype == POSITION_TYPE_BUY) ? bid : ask;
   if(StopsTooClose(otype, refPrice, normSl, tp))
      return false;
   if(!trade.PositionModify(ticket, normSl, tp))
     {
      Print("SnD_EA: SL modify failed — ", trade.ResultRetcodeDescription());
      return false;
     }
   return true;
  }

void ManageOpenPositions()
  {
   if(!InpUseBreakEven && !InpUseTrailing)
      return;
   uint nowMs = GetTickCount();
   if(InpMgmtUpdateMs > 0 && (nowMs - g_lastMgmtMs) < (uint)InpMgmtUpdateMs)
      return;
   g_lastMgmtMs = nowMs;

   ulong ticket = 0;
   if(!FindOurPositionTicket(ticket))
     {
      ClearPositionMgmtState();
      return;
     }
   if(!PositionSelectByTicket(ticket))
      return;

   ENUM_POSITION_TYPE ptype = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
   double entry = PositionGetDouble(POSITION_PRICE_OPEN);
   double sl    = PositionGetDouble(POSITION_SL);
   double tp    = PositionGetDouble(POSITION_TP);
   double bid   = SymbolInfoDouble(g_sym, SYMBOL_BID);
   double ask   = SymbolInfoDouble(g_sym, SYMBOL_ASK);

   double riskDist = 0.0;
   if(GlobalVariableCheck(SND_GV_POS_TK) && GlobalVariableCheck(SND_GV_RISK_DIST))
     {
      if((ulong)GlobalVariableGet(SND_GV_POS_TK) == ticket)
         riskDist = GlobalVariableGet(SND_GV_RISK_DIST);
     }
   if(riskDist <= 0.0)
      riskDist = MathAbs(entry - sl);
   if(riskDist <= 0.0)
      return;
   if(!GlobalVariableCheck(SND_GV_POS_TK))
      BindPositionMgmtState(ticket, entry, sl);

   if(CopyBuffer(g_atr_mgmt, 0, 0, 1, g_bufAtr) == 1)
      g_lastMgmtAtr = g_bufAtr[0];
   if(g_lastMgmtAtr <= 0.0)
      return;

   double profitDist = (ptype == POSITION_TYPE_BUY) ? (bid - entry) : (entry - ask);
   if(profitDist <= 0.0)
      return;
   double rMultiple = profitDist / riskDist;
   double targetSl = sl;
   bool beDone = (GlobalVariableCheck(SND_GV_BE_DONE) && GlobalVariableGet(SND_GV_BE_DONE) > 0.5);

   if(InpUseBreakEven && !beDone && InpBE_TriggerR > 0.0 && rMultiple >= InpBE_TriggerR)
     {
      double lockDist = riskDist * MathMax(0.0, InpBE_LockR);
      double atrBuf = g_lastMgmtAtr * MathMax(0.0, InpBE_ATR_Buffer);
      if(atrBuf > lockDist)
         lockDist = atrBuf;
      if(lockDist < g_minStopDistance)
         lockDist = g_minStopDistance;
      targetSl = (ptype == POSITION_TYPE_BUY) ? entry + lockDist : entry - lockDist;
      if(TryModifyPositionSL(ticket, ptype, targetSl, tp))
        {
         GlobalVariableSet(SND_GV_BE_DONE, 1.0);
         beDone = true;
        }
     }

   if(!PositionSelectByTicket(ticket))
      return;
   targetSl = PositionGetDouble(POSITION_SL);
   if(!InpUseTrailing || rMultiple < InpTrail_StartR)
      return;
   if(InpUseBreakEven && !beDone)
      return;

   double trailDist = g_lastMgmtAtr * InpTrail_ATR_Mult;
   double minStep   = g_lastMgmtAtr * InpTrail_StepATR;
   double trailSl = targetSl;
   if(ptype == POSITION_TYPE_BUY)
     {
      trailSl = bid - trailDist;
      if(trailSl <= targetSl + minStep)
         return;
     }
   else
     {
      trailSl = ask + trailDist;
      if(trailSl >= targetSl - minStep)
         return;
     }
   if(TryModifyPositionSL(ticket, ptype, trailSl, tp))
      GlobalVariableSet(SND_GV_TRAIL_ON, 1.0);
  }

bool TryEnterSignal(const SnDSignal &sig)
  {
   if(!sig.valid)
      return false;

   if(sig.is_buy)
     {
      double ask = SymbolInfoDouble(g_sym, SYMBOL_ASK);
      double sl = NormalizePrice(sig.sl);
      double tp = NormalizePrice(sig.tp);
      if(StopsTooClose(ORDER_TYPE_BUY, ask, sl, tp))
         return false;
      if(!RiskWithinCap(ORDER_TYPE_BUY, ask, sl, g_normLots))
         return false;
      string cmt = "SnD BUY " + sig.tf_label;
      if(!trade.Buy(g_normLots, g_sym, ask, sl, tp, cmt))
        {
         Print("SnD_EA: Buy failed — ", trade.ResultRetcodeDescription());
         return false;
        }
     }
   else
     {
      double bid = SymbolInfoDouble(g_sym, SYMBOL_BID);
      double sl = NormalizePrice(sig.sl);
      double tp = NormalizePrice(sig.tp);
      if(StopsTooClose(ORDER_TYPE_SELL, bid, sl, tp))
         return false;
      if(!RiskWithinCap(ORDER_TYPE_SELL, bid, sl, g_normLots))
         return false;
      string cmt = "SnD SELL " + sig.tf_label;
      if(!trade.Sell(g_normLots, g_sym, bid, sl, tp, cmt))
        {
         Print("SnD_EA: Sell failed — ", trade.ResultRetcodeDescription());
         return false;
        }
     }

   RegisterTradeOpened();
   ulong posTk = 0;
   if(FindOurPositionTicket(posTk))
     {
      if(!PositionSelectByTicket(posTk))
         return true;
      double entry = PositionGetDouble(POSITION_PRICE_OPEN);
      double slPos = PositionGetDouble(POSITION_SL);
      BindPositionMgmtState(posTk, entry, slPos);
     }

   g_lastSignalBarTime = iTime(g_sym, (ENUM_TIMEFRAMES)Period(), 1);
   Print("SnD_EA: ", (sig.is_buy ? "BUY" : "SELL"), " @ ", sig.tf_label,
         " entry=", DoubleToString(sig.entry, g_digits),
         " sl=", DoubleToString(sig.sl, g_digits),
         " tp=", DoubleToString(sig.tp, g_digits));
   return true;
  }

void UpdateChartComment()
  {
   double eq = AccountInfoDouble(ACCOUNT_EQUITY);
   int dCnt = ArraySize(g_demand_h4) + ArraySize(g_demand_h1);
   int sCnt = ArraySize(g_supply_h4) + ArraySize(g_supply_h1);
   string status = "OK";
   if(g_totalStopLatched) status = "TOTAL DD STOP";
   else if(g_dailyStopLatched) status = "DAILY DD STOP";
   else if(InpUsePropLimits && InpMaxTradesPerDay > 0 && g_dailyTradesOpened >= InpMaxTradesPerDay)
      status = "TRADE LIMIT";

   Comment("SnD_EA_v1 | ", g_sym, " | ", EnumToString((ENUM_TIMEFRAMES)Period()), "\n",
           "Status: ", status, "\n",
           "Zones (H4 d/s): ", IntegerToString(ArraySize(g_demand_h4)), "/",
           IntegerToString(ArraySize(g_supply_h4)), "\n",
           "RR 1:", DoubleToString(InpRewardMultiple, 1),
           " | Lots: ", DoubleToString(g_normLots, 2),
           " | Valid zones: ", (InpValidZonesOnly ? "BOS+FVG" : "Pivot"),
           "\nEquity: $", DoubleToString(eq, 2));
  }

//+------------------------------------------------------------------+
int OnInit()
  {
   g_sym = (StringLen(InpTradeSymbol) > 0) ? InpTradeSymbol : _Symbol;
   if(!SymbolSelect(g_sym, true))
     {
      Print("SnD_EA: symbol not available: ", g_sym);
      return INIT_FAILED;
     }

   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetDeviationInPoints(InpSlippagePoints);

   g_point     = SymbolInfoDouble(g_sym, SYMBOL_POINT);
   g_digits    = (int)SymbolInfoInteger(g_sym, SYMBOL_DIGITS);
   g_volMin    = SymbolInfoDouble(g_sym, SYMBOL_VOLUME_MIN);
   g_volMax    = SymbolInfoDouble(g_sym, SYMBOL_VOLUME_MAX);
   g_volStep   = SymbolInfoDouble(g_sym, SYMBOL_VOLUME_STEP);
   g_tickSize  = SymbolInfoDouble(g_sym, SYMBOL_TRADE_TICK_SIZE);
   g_tickValue = SymbolInfoDouble(g_sym, SYMBOL_TRADE_TICK_VALUE);

   if(g_point <= 0.0 || g_volStep <= 0.0)
      return INIT_FAILED;

   CacheSymbolConstraints();
   g_normLots = NormalizeVolume(InpFixedLots);

   ArrayResize(g_bufAtr, 1);
   ArraySetAsSeries(g_bufAtr, true);

   g_atr_chart = iATR(g_sym, (ENUM_TIMEFRAMES)Period(), InpZoneAtrLen);
   g_atr_mgmt  = iATR(g_sym, (ENUM_TIMEFRAMES)Period(), InpMgmtAtrPeriod);
   if(g_atr_chart == INVALID_HANDLE || g_atr_mgmt == INVALID_HANDLE)
     {
      Print("SnD_EA: ATR create failed");
      return INIT_FAILED;
     }

   LoadPersistedState();
   RefreshDayBaseline();
   ScanAllZones();
   UpdateChartComment();

   Print("SnD_EA_v1 started | ", g_sym,
         " | chart=", EnumToString((ENUM_TIMEFRAMES)Period()),
         " | RR=", DoubleToString(InpRewardMultiple, 1));
   return INIT_SUCCEEDED;
  }

void OnDeinit(const int reason)
  {
   if(g_atr_chart != INVALID_HANDLE) IndicatorRelease(g_atr_chart);
   if(g_atr_mgmt != INVALID_HANDLE)  IndicatorRelease(g_atr_mgmt);
   Comment("");
  }

void OnTick()
  {
   RefreshDayBaseline();
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   PropBlocksTrading(equity);
   ManageOpenPositions();

   ENUM_TIMEFRAMES chartTf = (ENUM_TIMEFRAMES)Period();
   datetime tClosed = iTime(g_sym, chartTf, 1);
   if(tClosed == 0 || tClosed == g_lastChartBarTime)
      return;

   g_lastChartBarTime = tClosed;
   ScanAllZones();
   UpdateChartComment();

   if(!CanOpenNewEntry(equity))
      return;
   if(SymbolInfoInteger(g_sym, SYMBOL_SPREAD) > InpMaxSpreadPoints)
      return;
   if(Bars(g_sym, chartTf) < InpMinBarsWarmup)
      return;
   if(InpOnePositionOnly && CountOurPositions() > 0)
      return;

   SnDSignal sig;
   if(!EvaluateSnDSignal(sig))
      return;

   TryEnterSignal(sig);
  }
//+------------------------------------------------------------------+
