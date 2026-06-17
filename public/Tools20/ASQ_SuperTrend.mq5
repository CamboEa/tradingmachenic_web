//+------------------------------------------------------------------+
//|                                            ASQ_SuperTrend.mq5    |
//|                              Copyright 2026, AlgoSphere Quant    |
//|                        https://www.mql5.com/en/users/robin2.0    |
//+------------------------------------------------------------------+
#property copyright   "Copyright 2026, AlgoSphere Quant"
#property link        "https://www.mql5.com/en/users/robin2.0"
#property version     "2.00"
#property description "ASQ SuperTrend v2 — ATR-based trend indicator"
#property description "3 ATR modes, color line, signal arrows, trend duration,"
#property description "distance in pips, trend strength, expanded dashboard."
#property description "AlgoSphere Quant — Precision before profit."
#property indicator_chart_window
#property indicator_buffers 7
#property indicator_plots   3
#property strict

//--- Plot 0: Bullish SuperTrend
#property indicator_label1  "ST Bull"
#property indicator_type1   DRAW_LINE
#property indicator_color1  C'0,200,120'
#property indicator_style1  STYLE_SOLID
#property indicator_width1  2

//--- Plot 1: Bearish SuperTrend
#property indicator_label2  "ST Bear"
#property indicator_type2   DRAW_LINE
#property indicator_color2  C'240,50,70'
#property indicator_style2  STYLE_SOLID
#property indicator_width2  2

//--- Plot 2: Signal arrows
#property indicator_label3  "Signal"
#property indicator_type3   DRAW_COLOR_ARROW
#property indicator_color3  C'0,200,120',C'240,50,70'
#property indicator_width3  3

//+------------------------------------------------------------------+
//| Enumerations                                                      |
//+------------------------------------------------------------------+
enum ENUM_ATR_MODE
  {
   ATR_STANDARD = 0,   // Standard (Wilder smoothing)
   ATR_SMA      = 1,   // Simple Moving Average
   ATR_EMA      = 2    // Exponential Moving Average
  };

//+------------------------------------------------------------------+
//| Inputs                                                            |
//+------------------------------------------------------------------+
input group           "═══════ SUPERTREND ═══════"
input int             InpPeriod        = 10;             // ATR Period
input double          InpMultiplier    = 3.0;            // ATR Multiplier
input ENUM_ATR_MODE   InpATRMode       = ATR_STANDARD;   // ATR Calculation Mode

input group           "═══════ VISUAL ═══════"
input color           InpBullColor     = C'0,200,120';   // Bullish Color
input color           InpBearColor     = C'240,50,70';   // Bearish Color
input int             InpLineWidth     = 2;              // Line Width
input bool            InpShowArrows    = true;           // Show Signal Arrows
input int             InpArrowSize     = 3;              // Arrow Size (1-5)

input group           "═══════ ALERTS ═══════"
input bool            InpAlertPopup    = true;           // Popup Alert
input bool            InpAlertSound    = true;           // Sound Alert
input string          InpSoundFile     = "alert.wav";    // Sound File
input bool            InpAlertEmail    = false;          // Email Alert
input bool            InpAlertPush     = false;          // Push Notification

input group           "═══════ DASHBOARD ═══════"
input bool            InpShowDash      = true;           // Show Dashboard
input int             InpDashX         = 20;             // X Position
input int             InpDashY         = 30;             // Y Position
input int             InpFontSize      = 9;              // Font Size
input color           InpAccentColor   = C'0,150,255';   // Accent Color
input color           InpTextColor     = C'175,180,192'; // Text Color
input color           InpDimColor      = C'70,75,90';    // Dim Color
input color           InpBgColor       = C'12,14,22';    // Background
input color           InpBorderColor   = C'28,32,48';    // Border

//+------------------------------------------------------------------+
//| Constants & Globals                                                |
//+------------------------------------------------------------------+
const string P       = "ASQ_ST_";
const string IND_TAG = "ASQ SuperTrend";
const string IND_VER = "2.0";

double BuffBull[], BuffBear[];
double BuffArrow[], BuffArrowClr[];
double BuffUpper[], BuffLower[], BuffDir[];

datetime g_lastAlertTime = 0;

//+------------------------------------------------------------------+
//| Init                                                              |
//+------------------------------------------------------------------+
int OnInit()
  {
   int period = MathMax(InpPeriod, 1);
   double mult = MathMax(InpMultiplier, 0.1);

   SetIndexBuffer(0, BuffBull,     INDICATOR_DATA);
   SetIndexBuffer(1, BuffBear,     INDICATOR_DATA);
   SetIndexBuffer(2, BuffArrow,    INDICATOR_DATA);
   SetIndexBuffer(3, BuffArrowClr, INDICATOR_COLOR_INDEX);
   SetIndexBuffer(4, BuffUpper,    INDICATOR_CALCULATIONS);
   SetIndexBuffer(5, BuffLower,    INDICATOR_CALCULATIONS);
   SetIndexBuffer(6, BuffDir,      INDICATOR_CALCULATIONS);

   PlotIndexSetDouble(0, PLOT_EMPTY_VALUE, EMPTY_VALUE);
   PlotIndexSetDouble(1, PLOT_EMPTY_VALUE, EMPTY_VALUE);
   PlotIndexSetDouble(2, PLOT_EMPTY_VALUE, EMPTY_VALUE);

//--- arrow codes (set once, not per bar)
   PlotIndexSetInteger(2, PLOT_ARROW, 233);

   PlotIndexSetInteger(0, PLOT_LINE_COLOR, InpBullColor);
   PlotIndexSetInteger(0, PLOT_LINE_WIDTH, InpLineWidth);
   PlotIndexSetInteger(1, PLOT_LINE_COLOR, InpBearColor);
   PlotIndexSetInteger(1, PLOT_LINE_WIDTH, InpLineWidth);
   PlotIndexSetInteger(2, PLOT_LINE_WIDTH, InpArrowSize);
   PlotIndexSetInteger(2, PLOT_COLOR_INDEXES, 2);
   PlotIndexSetInteger(2, PLOT_LINE_COLOR, 0, InpBullColor);
   PlotIndexSetInteger(2, PLOT_LINE_COLOR, 1, InpBearColor);

   string atrName = "SMA";
   if(InpATRMode == ATR_STANDARD) atrName = "Wilder";
   else if(InpATRMode == ATR_EMA) atrName = "EMA";

   IndicatorSetString(INDICATOR_SHORTNAME,
      StringFormat("ASQ ST(%d, %.1f, %s)", period, mult, atrName));
   IndicatorSetInteger(INDICATOR_DIGITS, _Digits);

   if(InpShowDash) CreateDashboard();

   return(INIT_SUCCEEDED);
  }

void OnDeinit(const int reason) { ObjectsDeleteAll(0, P); ChartRedraw(0); }

//+------------------------------------------------------------------+
//| Main calculation                                                   |
//+------------------------------------------------------------------+
int OnCalculate(const int rates_total, const int prev_calculated,
                const datetime &time[], const double &open[],
                const double &high[], const double &low[],
                const double &close[], const long &tick_volume[],
                const long &volume[], const int &spread[])
  {
   int period = MathMax(InpPeriod, 1);
   double mult = MathMax(InpMultiplier, 0.1);

   if(rates_total < period + 1) return(0);

   int start;
   if(prev_calculated == 0)
     {
      start = period;
      for(int i = 0; i < period; i++)
        {
         BuffBull[i] = EMPTY_VALUE; BuffBear[i] = EMPTY_VALUE;
         BuffArrow[i] = EMPTY_VALUE; BuffArrowClr[i] = 0;
         BuffUpper[i] = 0; BuffLower[i] = 0; BuffDir[i] = 1;
        }
     }
   else
      start = prev_calculated - 1;

   for(int i = start; i < rates_total; i++)
     {
      double atr = CalcATR(high, low, close, i, period);
      double median = (high[i] + low[i]) / 2.0;
      double basicUp = median + mult * atr;
      double basicDn = median - mult * atr;

      if(i == period)
        {
         BuffUpper[i] = basicUp;
         BuffLower[i] = basicDn;
         BuffDir[i] = (close[i] > basicUp) ? 1 : -1;
        }
      else
        {
         BuffUpper[i] = (basicUp < BuffUpper[i-1] || close[i-1] > BuffUpper[i-1])
                        ? basicUp : BuffUpper[i-1];
         BuffLower[i] = (basicDn > BuffLower[i-1] || close[i-1] < BuffLower[i-1])
                        ? basicDn : BuffLower[i-1];

         double prevDir = BuffDir[i-1];
         if(prevDir == -1 && close[i] > BuffUpper[i])      BuffDir[i] = 1;
         else if(prevDir == 1 && close[i] < BuffLower[i])  BuffDir[i] = -1;
         else                                               BuffDir[i] = prevDir;
        }

      //--- assign plots
      if(BuffDir[i] == 1)
        { BuffBull[i] = BuffLower[i]; BuffBear[i] = EMPTY_VALUE; }
      else
        { BuffBear[i] = BuffUpper[i]; BuffBull[i] = EMPTY_VALUE; }

      //--- arrows
      BuffArrow[i] = EMPTY_VALUE;
      BuffArrowClr[i] = 0;

      if(i > period && InpShowArrows)
        {
         if(BuffDir[i] == 1 && BuffDir[i-1] == -1)
           { BuffArrow[i] = BuffLower[i] - atr * 0.5; BuffArrowClr[i] = 0; }
         else if(BuffDir[i] == -1 && BuffDir[i-1] == 1)
           { BuffArrow[i] = BuffUpper[i] + atr * 0.5; BuffArrowClr[i] = 1; }
        }

      //--- alert on last completed bar
      if(i == rates_total - 2 && prev_calculated > 0 && time[i] > g_lastAlertTime)
        {
         if(BuffDir[i] == 1 && BuffDir[i-1] == -1)
           { FireAlert("BULLISH", close[i]); g_lastAlertTime = time[i]; }
         else if(BuffDir[i] == -1 && BuffDir[i-1] == 1)
           { FireAlert("BEARISH", close[i]); g_lastAlertTime = time[i]; }
        }
     }

   //--- update dashboard
   if(InpShowDash && rates_total > period + 1)
     {
      int last = rates_total - 1;
      double stLevel = (BuffDir[last] == 1) ? BuffBull[last] : BuffBear[last];
      double dist = MathAbs(close[last] - stLevel);
      int duration = CountTrendDuration(rates_total);
      int signals = CountRecentSignals(rates_total, 100);
      double atrNow = CalcATR(high, low, close, last, period);
      double strength = (stLevel > 0) ? dist / atrNow : 0;

      UpdateDashboard(BuffDir[last], close[last], stLevel, dist, duration,
                      signals, strength, atrNow);
     }

   return(rates_total);
  }

//+------------------------------------------------------------------+
//| ATR calculation — 3 modes fully implemented                        |
//+------------------------------------------------------------------+
double CalcATR(const double &high[], const double &low[], const double &close[],
               int idx, int period)
  {
   if(idx < 1) return(high[idx] - low[idx]);

   double tr;

   switch(InpATRMode)
     {
      case ATR_EMA:
        {
         //--- EMA-smoothed ATR
         double alpha = 2.0 / (period + 1);
         double ema = high[MathMax(idx - period + 1, 1)] - low[MathMax(idx - period + 1, 1)];
         for(int j = MathMax(idx - period + 2, 1); j <= idx; j++)
           {
            tr = MathMax(high[j] - low[j],
                 MathMax(MathAbs(high[j] - close[j-1]), MathAbs(low[j] - close[j-1])));
            ema = alpha * tr + (1.0 - alpha) * ema;
           }
         return ema;
        }

      case ATR_STANDARD:
        {
         //--- Wilder smoothing (standard ATR)
         double atr = 0;
         int startJ = MathMax(idx - period + 1, 1);
         for(int j = startJ; j <= idx; j++)
           {
            tr = MathMax(high[j] - low[j],
                 MathMax(MathAbs(high[j] - close[j-1]), MathAbs(low[j] - close[j-1])));
            if(j == startJ)
               atr = tr;
            else
               atr = (atr * (period - 1) + tr) / period;
           }
         return atr;
        }

      case ATR_SMA:
      default:
        {
         //--- Simple moving average of TR
         double sum = 0;
         int count = 0;
         for(int j = idx; j >= MathMax(idx - period + 1, 1); j--)
           {
            tr = MathMax(high[j] - low[j],
                 MathMax(MathAbs(high[j] - close[j-1]), MathAbs(low[j] - close[j-1])));
            sum += tr;
            count++;
           }
         return (count > 0) ? sum / count : high[idx] - low[idx];
        }
     }
  }

//+------------------------------------------------------------------+
//| Count bars in current trend direction                              |
//+------------------------------------------------------------------+
int CountTrendDuration(int rates_total)
  {
   int last = rates_total - 1;
   double curDir = BuffDir[last];
   int count = 0;
   for(int i = last; i >= 0; i--)
     {
      if(BuffDir[i] != curDir) break;
      count++;
     }
   return count;
  }

//+------------------------------------------------------------------+
//| Count signal reversals in last N bars                              |
//+------------------------------------------------------------------+
int CountRecentSignals(int rates_total, int lookback)
  {
   int count = 0;
   int startBar = MathMax(rates_total - lookback, 1);
   for(int i = startBar; i < rates_total; i++)
     {
      if(BuffDir[i] != BuffDir[i-1]) count++;
     }
   return count;
  }

//+------------------------------------------------------------------+
//| Period to string                                                   |
//+------------------------------------------------------------------+
string TFStr()
  {
   switch(_Period)
     {
      case PERIOD_M1:  return "M1";   case PERIOD_M5:  return "M5";
      case PERIOD_M15: return "M15";  case PERIOD_M30: return "M30";
      case PERIOD_H1:  return "H1";   case PERIOD_H4:  return "H4";
      case PERIOD_D1:  return "D1";   case PERIOD_W1:  return "W1";
      case PERIOD_MN1: return "MN";
      default: return IntegerToString(_Period);
     }
  }

//+------------------------------------------------------------------+
//| Fire alert                                                         |
//+------------------------------------------------------------------+
void FireAlert(string direction, double price)
  {
   string msg = IND_TAG + " | " + _Symbol + " " + TFStr() +
                " | " + direction + " @ " + DoubleToString(price, _Digits);
   Print(msg);
   if(InpAlertPopup) Alert(msg);
   if(InpAlertSound) PlaySound(InpSoundFile);
   if(InpAlertEmail) SendMail(IND_TAG + " — " + direction, msg);
   if(InpAlertPush)  SendNotification(msg);
  }

//+------------------------------------------------------------------+
//| Create dashboard background                                        |
//+------------------------------------------------------------------+
void CreateDashboard()
  {
   string bg = P + "BG";
   ObjectCreate(0, bg, OBJ_RECTANGLE_LABEL, 0, 0, 0);
   ObjectSetInteger(0, bg, OBJPROP_XDISTANCE, InpDashX);
   ObjectSetInteger(0, bg, OBJPROP_YDISTANCE, InpDashY);
   ObjectSetInteger(0, bg, OBJPROP_XSIZE, 280);
   ObjectSetInteger(0, bg, OBJPROP_YSIZE, 300);
   ObjectSetInteger(0, bg, OBJPROP_BGCOLOR, InpBgColor);
   ObjectSetInteger(0, bg, OBJPROP_BORDER_TYPE, BORDER_FLAT);
   ObjectSetInteger(0, bg, OBJPROP_BORDER_COLOR, InpBorderColor);
   ObjectSetInteger(0, bg, OBJPROP_CORNER, CORNER_LEFT_UPPER);
   ObjectSetInteger(0, bg, OBJPROP_BACK, false);
   ObjectSetInteger(0, bg, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, bg, OBJPROP_HIDDEN, true);
  }

//+------------------------------------------------------------------+
//| Update dashboard                                                   |
//+------------------------------------------------------------------+
void UpdateDashboard(double dir, double price, double stLevel, double dist,
                     int duration, int signals, double strength, double atr)
  {
   int x  = InpDashX + 10;
   int xv = InpDashX + 140;
   int y  = InpDashY + 8;
   int lh = (int)(InpFontSize * 1.7);

   double pipSize = (_Digits == 3 || _Digits == 5) ? _Point * 10 : _Point;
   double distPips = dist / pipSize;

   string atrMode = "SMA";
   if(InpATRMode == ATR_STANDARD) atrMode = "Wilder";
   else if(InpATRMode == ATR_EMA) atrMode = "EMA";

   //--- HEADER
   DL("Title", x, y, "ASQ SUPERTREND", InpAccentColor, InpFontSize + 2);
   DL("Ver", InpDashX + 215, y + 2, "v" + IND_VER, InpDimColor, InpFontSize - 2);
   y += lh + 2;
   DL("Sep0", x, y, "-----------------------------", InpBorderColor, InpFontSize - 3);
   y += lh - 4;

   //--- TREND
   color tClr = (dir == 1) ? InpBullColor : InpBearColor;
   string tStr = (dir == 1) ? "BULLISH" : "BEARISH";

   DL("TrL", x, y, "Trend", InpDimColor, InpFontSize - 1);
   DL("TrV", xv, y, tStr, tClr, InpFontSize + 1);
   y += lh;

   DL("LvL", x, y, "ST Level", InpDimColor, InpFontSize - 1);
   DL("LvV", xv, y, DoubleToString(stLevel, _Digits), tClr, InpFontSize);
   y += lh;

   DL("PrL", x, y, "Price", InpDimColor, InpFontSize - 1);
   DL("PrV", xv, y, DoubleToString(price, _Digits), InpTextColor, InpFontSize);
   y += lh;

   //--- DISTANCE
   DL("DsL", x, y, "Distance", InpDimColor, InpFontSize - 1);
   DL("DsV", xv, y, StringFormat("%.1f pips", distPips), tClr, InpFontSize);
   y += lh;
   DL("Sep1", x, y, "-----------------------------", InpBorderColor, InpFontSize - 3);
   y += lh - 4;

   //--- STATS
   DL("DuL", x, y, "Duration", InpDimColor, InpFontSize - 1);
   DL("DuV", xv, y, StringFormat("%d bars", duration), InpTextColor, InpFontSize);
   y += lh;

   //--- Strength label
   string strLabel = "WEAK";
   color  strClr   = InpDimColor;
   if(strength >= 2.0)      { strLabel = "STRONG"; strClr = InpBullColor; }
   else if(strength >= 1.0) { strLabel = "NORMAL"; strClr = InpTextColor; }
   else if(strength >= 0.5) { strLabel = "WEAK";   strClr = C'255,180,0'; }
   else                     { strLabel = "FLAT";   strClr = InpDimColor; }

   DL("StL", x, y, "Strength", InpDimColor, InpFontSize - 1);
   DL("StV", xv, y, strLabel, strClr, InpFontSize);
   y += lh;

   DL("SgL", x, y, "Signals (100)", InpDimColor, InpFontSize - 1);
   DL("SgV", xv, y, IntegerToString(signals), InpTextColor, InpFontSize);
   y += lh;

   DL("Sep2", x, y, "-----------------------------", InpBorderColor, InpFontSize - 3);
   y += lh - 4;

   //--- SETTINGS
   DL("CfL", x, y, "Config", InpDimColor, InpFontSize - 1);
   DL("CfV", xv, y, StringFormat("ATR(%d) x%.1f %s",
      MathMax(InpPeriod,1), MathMax(InpMultiplier,0.1), atrMode),
      InpDimColor, InpFontSize - 1);
   y += lh;

   DL("AtL", x, y, "ATR Value", InpDimColor, InpFontSize - 1);
   DL("AtV", xv, y, StringFormat("%.1f pips", atr / pipSize), InpTextColor, InpFontSize - 1);
   y += lh;

   DL("TfL", x, y, "Timeframe", InpDimColor, InpFontSize - 1);
   DL("TfV", xv, y, _Symbol + " " + TFStr(), InpTextColor, InpFontSize - 1);
   y += lh;

   //--- FOOTER
   DL("Sep3", x, y, "-----------------------------", InpBorderColor, InpFontSize - 3);
   y += lh - 4;
   DL("Brand", x, y, "AlgoSphere Quant", InpDimColor, InpFontSize - 2);
   DL("Tag", InpDashX + 155, y, "Precision before profit", C'35,38,52', InpFontSize - 3);
   y += lh;

   ObjectSetInteger(0, P + "BG", OBJPROP_YSIZE, y - InpDashY + 5);
  }

//+------------------------------------------------------------------+
//| Dashboard label helper                                             |
//+------------------------------------------------------------------+
void DL(const string id, const int x, const int y,
        const string text, const color clr, const int fontSize)
  {
   string name = P + "D_" + id;
   if(ObjectFind(0, name) < 0)
     {
      ObjectCreate(0, name, OBJ_LABEL, 0, 0, 0);
      ObjectSetInteger(0, name, OBJPROP_CORNER, CORNER_LEFT_UPPER);
      ObjectSetInteger(0, name, OBJPROP_ANCHOR, ANCHOR_LEFT_UPPER);
      ObjectSetString(0, name, OBJPROP_FONT, "Consolas");
      ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
     }
   ObjectSetInteger(0, name, OBJPROP_XDISTANCE, x);
   ObjectSetInteger(0, name, OBJPROP_YDISTANCE, y);
   ObjectSetString(0, name, OBJPROP_TEXT, text);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_FONTSIZE, fontSize);
  }
//+------------------------------------------------------------------+
