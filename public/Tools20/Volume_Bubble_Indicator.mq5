//+------------------------------------------------------------------+
//|                                      Volume_Bubble_Indicator.mq5 |
//|                                             Abioye Israel Pelumi |
//|                             https://linktr.ee/abioyeisraelpelumi |
//+------------------------------------------------------------------+
#property copyright "Abioye Israel Pelumi"
#property link      "https://linktr.ee/abioyeisraelpelumi"
#property version   "1.00"
#property indicator_chart_window
#property indicator_plots 0

//--- Look-back window: number of bars used to compute mean and stddev of volume
input int N = 100; // Look Back Bars

//--- Global variables for statistical calculations
double sum;
double mean;
int    window_start;

double variance;
double diff;
double stddev;

//--- Bubble display variables
int    bubble_size;
long   v;
double n_vol;

string name;
color  bubble_color;
string bubble_old_name;

string tex_name;
string old_name;

int old_index;
//+------------------------------------------------------------------+
//| Returns a stable bubble object name based on candle timestamp    |
//+------------------------------------------------------------------+
string BubbleName(datetime t)
  {
   return StringFormat("Bubble%d", (int)t);
  }

//+------------------------------------------------------------------+
//| Returns a stable label object name based on candle timestamp     |
//+------------------------------------------------------------------+
string MakeName(datetime t)
  {
   return StringFormat("VolLabel_%d", (int)t);
  }

//+------------------------------------------------------------------+
//| Formats a volume number into a compact readable string           |
//| e.g. 1500 -> "1K",  3000000 -> "3M",  2000000000 -> "2B"        |
//+------------------------------------------------------------------+
string FormatVolume(long vol)
  {
   int digits = StringLen(IntegerToString((int)vol));

   if(digits <= 3)
      return IntegerToString((int)vol);                           // hundreds: 123
   else
      if(digits <= 6)
         return IntegerToString((int)(vol / 1000)) + "K";          // thousands: 45K
      else
         if(digits <= 9)
            return IntegerToString((int)(vol / 1000000)) + "M";    // millions: 12M
         else
            return IntegerToString((int)(vol / 1000000000)) + "B"; // billions: 3B
  }

//+------------------------------------------------------------------+
//| Custom indicator initialization function                         |
//+------------------------------------------------------------------+
int OnInit()
  {

   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Cleanup: delete all indicator objects when removed from chart    |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   ObjectsDeleteAll(0, "VolLabel_");
   ObjectsDeleteAll(0, "Bubble");
   ChartRedraw(0);
   Comment("");
  }

//+------------------------------------------------------------------+
//| Custom indicator iteration function                              |
//+------------------------------------------------------------------+
int OnCalculate(const int rates_total,
                const int prev_calculated,
                const datetime &time[],
                const double   &open[],
                const double   &high[],
                const double   &low[],
                const double   &close[],
                const long     &tick_volume[],
                const long     &volume[],
                const int      &spread[])
  {

   Comment(prev_calculated);

//--- Need at least N bars to calculate meaningful statistics
   if(rates_total < N)
      return 0;

//--- The window covers the most recent N bars
   window_start = rates_total - N;

//--- Step 1: compute the mean tick volume over the window
   sum = 0.0;
   for(int i = window_start; i < rates_total; i++)
      sum += (double)tick_volume[i];
   mean = sum / N;

//--- Step 2: compute variance then standard deviation
   variance = 0.0;
   for(int i = window_start; i < rates_total; i++)
     {
      diff      = (double)tick_volume[i] - mean;
      variance += diff * diff;
     }
   variance /= N;
   stddev = MathSqrt(variance);

//--- Guard: if all volumes are identical stddev is zero; nothing useful to show
   if(stddev == 0.0)
      return rates_total;


//--- Step 3: draw or update a bubble (and optional label) for every bar in the window
   bool need_redraw = false;
   for(int i = window_start; i < rates_total; i++)
     {
      v     = tick_volume[i];
      n_vol = (double)v / stddev; // normalised volume: how many stddevs above the mean

      //--- Map normalised volume to a bubble font size
      if(n_vol < 1)
         bubble_size = 24;
      else
         if(n_vol < 2)
            bubble_size = 32;
         else
            if(n_vol < 3)
               bubble_size = 40;
            else
               if(n_vol < 4)
                  bubble_size = 48;
               else
                 {
                  bubble_size = 56;

                  //--- Exceptional volume (>= 4 stddevs): also show a formatted volume label
                  tex_name = MakeName(time[i]);

                  //--- Create the label only if it does not already exist; otherwise just update it
                  if(ObjectFind(0, tex_name) < 0)
                    {
                     ObjectCreate(0, tex_name, OBJ_TEXT, 0, time[i], high[i]);
                     need_redraw = true;
                    }


                  ObjectSetString(0,  tex_name, OBJPROP_TEXT,       FormatVolume(v));
                  ObjectSetInteger(0, tex_name, OBJPROP_ANCHOR,     ANCHOR_CENTER);
                  ObjectSetInteger(0, tex_name, OBJPROP_COLOR,      clrDodgerBlue);
                  ObjectSetInteger(0, tex_name, OBJPROP_FONTSIZE,   10);
                  ObjectSetString(0,  tex_name, OBJPROP_FONT,       "Arial Bold");
                  ObjectSetInteger(0, tex_name, OBJPROP_SELECTABLE, false);
                  ObjectSetInteger(0, tex_name, OBJPROP_HIDDEN,     true);

                  if(ObjectMove(0, tex_name, 0, time[i], high[i]))
                     need_redraw = true;
                 }

      //--- Determine bubble colour: green if volume rose, orange if fell, gray for first bar
      if(i > window_start)
         bubble_color = (tick_volume[i] > tick_volume[i - 1]) ? clrLime : clrOrange;
      else
         bubble_color = clrGray;

      //--- Draw the bubble dot — create only if missing, otherwise just update properties
      name = BubbleName(time[i]);

      if(ObjectFind(0, name) < 0)
        {
         ObjectCreate(0, name, OBJ_TEXT, 0, time[i], high[i]);
         need_redraw = true;
        }

      ObjectSetString(0,  name, OBJPROP_TEXT,       "●");
      ObjectSetInteger(0, name, OBJPROP_COLOR,      bubble_color);
      ObjectSetInteger(0, name, OBJPROP_FONTSIZE,   bubble_size);
      ObjectSetInteger(0, name, OBJPROP_BACK,       true);
      ObjectSetInteger(0, name, OBJPROP_ANCHOR,     ANCHOR_CENTER);
      ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, name, OBJPROP_HIDDEN,     true);
      if(ObjectMove(0, name, 0, time[i], high[i]))
         need_redraw = true;
     }

//--- Step 4: remove objects that have scrolled out of the look-back window
   static int last_window_start = -1;

   if(window_start != last_window_start)
     {
      last_window_start = window_start;

      old_index = window_start - 1;

      if(old_index >= 0)
        {
         bubble_old_name = BubbleName(time[old_index]);

         if(ObjectFind(0, bubble_old_name) >= 0)
           {
            ObjectDelete(0, bubble_old_name);
            need_redraw = true;
           }

         old_name = MakeName(time[old_index]);

         if(ObjectFind(0, old_name) >= 0)
           {
            ObjectDelete(0, old_name);
            need_redraw = true;
           }
        }
     }


//--- Redraw ONLY when needed
   if(need_redraw)
      ChartRedraw(0);


   return(rates_total);
  }
//+------------------------------------------------------------------+

