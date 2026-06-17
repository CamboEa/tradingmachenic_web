//+------------------------------------------------------------------+
//|                                         SMC_AutoTrader_AI.mq5  |
//|                                                Bunkheang - v1.00 |
//|  Auto-trading EA: Smart Money Concepts context + SEA-LION AI   |
//|  (OpenAI-compatible /v1/chat/completions).                     |
//|                                                                  |
//|  SETUP                                                           |
//|  1) Tools -> Options -> Expert Advisors: allow WebRequest for    |
//|     https://api.sea-lion.ai                                      |
//|  2) Set InpApiKey to your SEA-LION key (never commit real keys). |
//|  3) Run on demo first. SMC + LLM are heuristics, not guarantees. |
//|  v1.01  HTF bias + LTF entry context; evaluate on LTF new bar.   |
//+------------------------------------------------------------------+
#property copyright "Bunkheang"
#property version   "1.01"
#property strict
#property description "HTF/LTF SMC context + SEA-LION JSON trade decisions."

#include <Trade/Trade.mqh>

//================================================================
// INPUTS
//================================================================
input group "=== LLM (SEA-LION) ==="
input string InpApiUrl    = "https://api.sea-lion.ai/v1/chat/completions";
input string InpApiKey    = "sk-Cn2m7P-cRYAcBAhR3EPuuw"; 
input string InpModel     = "aisingapore/Gemma-SEA-LION-v4-27B-IT";
input int    InpMaxTokens = 1280000;
input int    InpTimeoutMs = 45000;
input int    InpMinSecondsBetweenCalls = 120; 

input group "=== SMC timeframes (HTF bias / LTF execution) ==="
input ENUM_TIMEFRAMES InpHTF = PERIOD_H1;   // higher timeframe: structure / bias
input ENUM_TIMEFRAMES InpLTF = PERIOD_M5;   // lower timeframe: FVG, sweeps, SL anchors; new bar clock
input int    InpPivotLeft   = 2;
input int    InpPivotRight  = 2;
input int    InpLookbackBars = 400;
input int    InpMaxFvgReport = 4;

input group "=== Execution gates ==="
input bool   InpTradeEnabled = false;          // safety: flip on after testing
input bool   InpRequireNewBar = true;          // evaluate on newly closed bar only
input bool   InpGateAiWithSMC = true;          // BUY only if code sees bullish bias, etc.
input double InpMinTpRR = 1.5;                 // reject AI TP RR below this

input group "=== Risk / orders ==="
input double InpLots        = 0.01;
input ulong  InpMagic       = 90900001;
input int    InpSlExtraPoints = 50;            // buffer beyond pivot/FVG invalidation
input int    InpDefaultSLPoints = 200;         // fallback SL distance in points
input int    InpSlippagePoints = 30;
input int    InpMaxPositions = 1;

input group "=== Timer ==="
input int    InpTimerSec = 15; // how often OnTimer runs (light work each tick)

//================================================================
// GLOBALS
//================================================================
CTrade g_trade;
datetime g_lastEvalBarTime = 0;
datetime g_lastApiCallTime = 0;
string   g_lastStatus = "init";

//================================================================
// FORWARD DECLS
//================================================================
string   JsonEscape(const string s);
string   ExtractJsonString(const string json, const string field, const int startFrom);
double   ExtractJsonNumber(const string json, const string field, const int startFrom);
string   StripMarkdownFences(const string s);
string   SliceJsonObject(const string s);

bool     PivotHigh(const MqlRates &r[], const int n, const int i, const int L, const int R);
bool     PivotLow(const MqlRates &r[], const int n, const int i, const int L, const int R);
ENUM_TIMEFRAMES ResolveTf(const ENUM_TIMEFRAMES tf);
string   BuildSMCOneTf(const string symbol, const ENUM_TIMEFRAMES tf, const string sectionTitle,
                       const bool fillStopHints, double &outBuySl, double &outSellSl,
                       bool &outStructBull, bool &outStructBear,
                       bool &outBullSetup, bool &outBearSetup);
string   BuildDualSMCContext(const string symbol, const ENUM_TIMEFRAMES htf, const ENUM_TIMEFRAMES ltf,
                             double &outNearestBuySl, double &outNearestSellSl);
string   CallDecisionLLM(const string smcBlock);
bool     ParseDecision(const string reply, string &signal, string &reason,
                       double &tpRR, int &slPoints);
bool     GateSignalAgainstSMC(const string signal, const string smcSummary);
bool     OpenBySignal(const string signal, const int slPoints, const double tpRR,
                      const double suggestedBuySl, const double suggestedSellSl);
void     SetCommentStatus(const string s);
void     ApplySymbolFillingMode();

//================================================================
// LIFECYCLE
//================================================================
int OnInit()
{
   g_trade.SetExpertMagicNumber(InpMagic);
   g_trade.SetDeviationInPoints(InpSlippagePoints);
   ApplySymbolFillingMode();

   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED))
      Print("Warning: AutoTrading button may be OFF in the terminal.");

   EventSetTimer(MathMax(1, InpTimerSec));

   const ENUM_TIMEFRAMES hInit = ResolveTf(InpHTF);
   const ENUM_TIMEFRAMES lInit = ResolveTf(InpLTF);
   if(PeriodSeconds(hInit) <= PeriodSeconds(lInit))
   {
      Print("Init failed: InpHTF must be strictly higher than InpLTF. Got HTF=",
            EnumToString(hInit), " LTF=", EnumToString(lInit));
      return INIT_FAILED;
   }

   SetCommentStatus("SMC AI EA loaded. Set InpApiKey + allow WebRequest + enable InpTradeEnabled when ready.");
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   EventKillTimer();
   Comment("");
}

void OnTick()
{
   // heavy work in timer; tick path stays light
}

void OnTimer()
{
   if(StringLen(InpApiKey) < 8)
   {
      SetCommentStatus("Set InpApiKey (SEA-LION) in EA inputs.");
      return;
   }

   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED) || !MQLInfoInteger(MQL_TRADE_ALLOWED))
   {
      SetCommentStatus("Trading not allowed (terminal or EA permissions).");
      return;
   }

   const ENUM_TIMEFRAMES htf = ResolveTf(InpHTF);
   const ENUM_TIMEFRAMES ltf = ResolveTf(InpLTF);

   if(InpRequireNewBar)
   {
      datetime t1 = iTime(_Symbol, ltf, 1);
      if(t1 == 0) return;
      if(t1 == g_lastEvalBarTime)
         return;
      g_lastEvalBarTime = t1;
   }

   const datetime now = TimeCurrent();
   if(g_lastApiCallTime != 0 && (now - g_lastApiCallTime) < InpMinSecondsBetweenCalls)
   {
      SetCommentStatus("Skipping: min seconds between API calls not elapsed.");
      return;
   }

   double sugBuySL = 0.0, sugSellSL = 0.0;
   string smc = BuildDualSMCContext(_Symbol, htf, ltf, sugBuySL, sugSellSL);

   g_lastApiCallTime = now;
   SetCommentStatus("Calling SEA-LION...");
   string reply = CallDecisionLLM(smc);

   string signal = "SKIP", reason = "";
   double tpRR = 2.0;
   int slPts = InpDefaultSLPoints;
   if(!ParseDecision(reply, signal, reason, tpRR, slPts))
   {
      SetCommentStatus("Bad AI response (expected JSON). See Experts log.");
      Print("RAW AI:\n", reply);
      return;
   }

   if(tpRR < InpMinTpRR)
   {
      SetCommentStatus("Rejected: tp_rr below minimum.");
      return;
   }

   if(InpGateAiWithSMC && !GateSignalAgainstSMC(signal, smc))
   {
      SetCommentStatus("Gated: AI signal does not match SMC bias / context.");
      Print("Gate fail. signal=", signal, " reason=", reason);
      return;
   }

   if(!InpTradeEnabled)
   {
      SetCommentStatus("InpTradeEnabled=false (dry run). Signal=" + signal + " | " + reason);
      return;
   }

   if(signal == "SKIP" || signal == "NONE")
   {
      SetCommentStatus("SKIP: " + reason);
      return;
   }

   if(!OpenBySignal(signal, slPts, tpRR, sugBuySL, sugSellSL))
      SetCommentStatus("Trade send failed. Check Experts log.");
   else
      SetCommentStatus("Order sent: " + signal + " | " + reason);
}

//================================================================
// UI / STATUS
//================================================================
void SetCommentStatus(const string s)
{
   g_lastStatus = s;
   string head = "SMC+AI EA | " + _Symbol + " HTF=" + EnumToString(ResolveTf(InpHTF)) +
                  " LTF=" + EnumToString(ResolveTf(InpLTF)) + "\n";
   Comment(head + s);
}

void ApplySymbolFillingMode()
{
   const long mask = (long)SymbolInfoInteger(_Symbol, SYMBOL_FILLING_MODE);
   ENUM_ORDER_TYPE_FILLING fill = ORDER_FILLING_RETURN;
   if((mask & SYMBOL_FILLING_IOC) != 0) fill = ORDER_FILLING_IOC;
   else if((mask & SYMBOL_FILLING_FOK) != 0) fill = ORDER_FILLING_FOK;
   g_trade.SetTypeFilling(fill);
}

//================================================================
// SMC
//================================================================
bool PivotHigh(const MqlRates &r[], const int n, const int i, const int L, const int R)
{
   if(i - L < 0 || i + R >= n) return false;
   const double h = r[i].high;
   for(int k = 1; k <= L; k++)
      if(r[i - k].high > h) return false;
   for(int k = 1; k <= R; k++)
      if(r[i + k].high > h) return false;
   return true;
}

bool PivotLow(const MqlRates &r[], const int n, const int i, const int L, const int R)
{
   if(i - L < 0 || i + R >= n) return false;
   const double l = r[i].low;
   for(int k = 1; k <= L; k++)
      if(r[i - k].low < l) return false;
   for(int k = 1; k <= R; k++)
      if(r[i + k].low < l) return false;
   return true;
}

ENUM_TIMEFRAMES ResolveTf(const ENUM_TIMEFRAMES tf)
{
   if(tf == PERIOD_CURRENT)
      return (ENUM_TIMEFRAMES)_Period;
   return tf;
}

string BuildSMCOneTf(const string symbol, const ENUM_TIMEFRAMES tf, const string sectionTitle,
                     const bool fillStopHints, double &outBuySl, double &outSellSl,
                     bool &outStructBull, bool &outStructBear,
                     bool &outBullSetup, bool &outBearSetup)
{
   outStructBull = false;
   outStructBear = false;
   outBullSetup = false;
   outBearSetup = false;
   if(fillStopHints)
   {
      outBuySl = 0.0;
      outSellSl = 0.0;
   }

   MqlRates r[];
   const int want = MathMax(200, MathMin(2000, InpLookbackBars));
   const int n = CopyRates(symbol, tf, 0, want, r);
   if(n <= 0)
      return "ERROR: CopyRates failed for " + sectionTitle + " tf=" + EnumToString(tf) + ".\n";

   ArraySetAsSeries(r, true);

   const int L = MathMax(1, InpPivotLeft);
   const int R = MathMax(1, InpPivotRight);

   double lastPH = 0, prevPH = 0, lastPL = 0, prevPL = 0;
   datetime tPH = 0, tPH2 = 0, tPL = 0, tPL2 = 0;

   for(int i = n - R - 2; i > L; i--)
   {
      if(PivotHigh(r, n, i, L, R))
      {
         prevPH = lastPH;
         tPH2 = tPH;
         lastPH = r[i].high;
         tPH = r[i].time;
      }
      if(PivotLow(r, n, i, L, R))
      {
         prevPL = lastPL;
         tPL2 = tPL;
         lastPL = r[i].low;
         tPL = r[i].time;
      }
   }

   const double bid = SymbolInfoDouble(symbol, SYMBOL_BID);
   const double ask = SymbolInfoDouble(symbol, SYMBOL_ASK);
   const int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   const double point = SymbolInfoDouble(symbol, SYMBOL_POINT);

   string ctx = "";
   ctx += "=== " + sectionTitle + " (" + EnumToString(tf) + ") ===\n";
   ctx += "Pivot L/R: " + IntegerToString(L) + " / " + IntegerToString(R) + "\n";
   if(lastPH > 0) ctx += StringFormat("Last pivot high: %s @ %s\n", DoubleToString(lastPH, digits), TimeToString(tPH));
   if(prevPH > 0) ctx += StringFormat("Prev pivot high: %s @ %s\n", DoubleToString(prevPH, digits), TimeToString(tPH2));
   if(lastPL > 0) ctx += StringFormat("Last pivot low:  %s @ %s\n", DoubleToString(lastPL, digits), TimeToString(tPL));
   if(prevPL > 0) ctx += StringFormat("Prev pivot low:  %s @ %s\n", DoubleToString(prevPL, digits), TimeToString(tPL2));

   string bias = "RANGE";
   if(lastPH > 0 && prevPH > 0 && lastPL > 0 && prevPL > 0)
   {
      const bool hh = (lastPH > prevPH);
      const bool hl = (lastPL > prevPL);
      const bool lh = (lastPH < prevPH);
      const bool ll = (lastPL < prevPL);
      if(hh && hl) bias = "BULLISH_STRUCTURE";
      else if(lh && ll) bias = "BEARISH_STRUCTURE";
      else bias = "MIXED_OR_RANGE";
   }
   ctx += "StructureBias: " + bias + "\n";
   outStructBull = (bias == "BULLISH_STRUCTURE");
   outStructBear = (bias == "BEARISH_STRUCTURE");

   bool bullFvgNear = false;
   bool bearFvgNear = false;

   int fvgCount = 0;
   ctx += "FairValueGaps (up to " + IntegerToString(InpMaxFvgReport) + " per side):\n";
   for(int i = 3; i < n - 3; i++)
   {
      const double hi_old = r[i + 2].high;
      const double lo_new = r[i].low;
      if(lo_new > hi_old)
      {
         const double gapLow = hi_old;
         const double gapHigh = lo_new;
         ctx += StringFormat(" - BULL_FVG [%s .. %s] @ %s\n",
                             DoubleToString(gapLow, digits),
                             DoubleToString(gapHigh, digits),
                             TimeToString(r[i].time));
         const bool near = (bid >= gapLow - 3 * point && bid <= gapHigh + 10 * point);
         if(near)
            bullFvgNear = true;
         if(fillStopHints && outBuySl == 0.0 && near)
            outBuySl = gapLow - InpSlExtraPoints * point;
         fvgCount++;
         if(fvgCount >= InpMaxFvgReport) break;
      }
   }

   fvgCount = 0;
   for(int i = 3; i < n - 3; i++)
   {
      const double lo_old = r[i + 2].low;
      const double hi_new = r[i].high;
      if(hi_new < lo_old)
      {
         const double gapHigh = lo_old;
         const double gapLow = hi_new;
         ctx += StringFormat(" - BEAR_FVG [%s .. %s] @ %s\n",
                             DoubleToString(gapLow, digits),
                             DoubleToString(gapHigh, digits),
                             TimeToString(r[i].time));
         const bool near = (ask <= gapHigh + 3 * point && ask >= gapLow - 10 * point);
         if(near)
            bearFvgNear = true;
         if(fillStopHints && outSellSl == 0.0 && near)
            outSellSl = gapHigh + InpSlExtraPoints * point;
         fvgCount++;
         if(fvgCount >= InpMaxFvgReport) break;
      }
   }

   bool bullSweep = false;
   bool bearSweep = false;
   if(lastPL > 0 && n > 5)
   {
      if(r[1].low < lastPL && r[1].close > lastPL)
      {
         ctx += "SweepHint: bullish liquidity grab (wick under last pivot low, close back above).\n";
         bullSweep = true;
      }
   }
   if(lastPH > 0 && n > 5)
   {
      if(r[1].high > lastPH && r[1].close < lastPH)
      {
         ctx += "SweepHint: bearish liquidity grab (wick over last pivot high, close back below).\n";
         bearSweep = true;
      }
   }

   outBullSetup = (outStructBull || bullSweep || bullFvgNear);
   outBearSetup = (outStructBear || bearSweep || bearFvgNear);

   if(fillStopHints)
   {
      if(outBuySl == 0.0 && lastPL > 0)
         outBuySl = lastPL - InpSlExtraPoints * point;
      if(outSellSl == 0.0 && lastPH > 0)
         outSellSl = lastPH + InpSlExtraPoints * point;
   }

   ctx += "SUMMARY: bias=" + bias +
          " pivLow=" + (lastPL > 0 ? DoubleToString(lastPL, digits) : "n/a") +
          " pivHigh=" + (lastPH > 0 ? DoubleToString(lastPH, digits) : "n/a") + "\n";

   return ctx;
}

string BuildDualSMCContext(const string symbol, const ENUM_TIMEFRAMES htf, const ENUM_TIMEFRAMES ltf,
                           double &outNearestBuySl, double &outNearestSellSl)
{
   outNearestBuySl = 0.0;
   outNearestSellSl = 0.0;

   const double bid = SymbolInfoDouble(symbol, SYMBOL_BID);
   const double ask = SymbolInfoDouble(symbol, SYMBOL_ASK);
   const int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);

   string head = "";
   head += "Symbol: " + symbol + "\n";
   head += "HTF: " + EnumToString(htf) + "  |  LTF: " + EnumToString(ltf) + "\n";
   head += "Time: " + TimeToString(TimeCurrent(), TIME_DATE | TIME_MINUTES) + "\n";
   head += StringFormat("Bid/Ask: %s / %s\n\n",
                        DoubleToString(bid, digits), DoubleToString(ask, digits));

   double dumB = 0.0, dumS = 0.0;
   bool hStructBull, hStructBear, hBullSetup, hBearSetup;
   const string hBlock = BuildSMCOneTf(symbol, htf, "HTF", false, dumB, dumS,
                                       hStructBull, hStructBear, hBullSetup, hBearSetup);

   bool lStructBull, lStructBear, lBullSetup, lBearSetup;
   const string lBlock = BuildSMCOneTf(symbol, ltf, "LTF", true, outNearestBuySl, outNearestSellSl,
                                       lStructBull, lStructBear, lBullSetup, lBearSetup);

   const int htfStrongBull = (hStructBull ? 1 : 0);
   const int htfStrongBear = (hStructBear ? 1 : 0);
   const int ltfEntryBull = (lBullSetup ? 1 : 0);
   const int ltfEntryBear = (lBearSetup ? 1 : 0);

   string gate = "\n=== MACHINE_GATE (for EA alignment) ===\n";
   gate += "HTF_STRONG_BULL=" + IntegerToString(htfStrongBull) + "\n";
   gate += "HTF_STRONG_BEAR=" + IntegerToString(htfStrongBear) + "\n";
   gate += "LTF_ENTRY_BULL=" + IntegerToString(ltfEntryBull) + "\n";
   gate += "LTF_ENTRY_BEAR=" + IntegerToString(ltfEntryBear) + "\n";
   gate += "Rule: use ONLY the four numeric lines above for alignment checks.\n";

   return head + hBlock + "\n" + lBlock + gate;
}

bool GateSignalAgainstSMC(const string signal, const string smcSummary)
{
   if(signal == "SKIP" || signal == "NONE") return true;

   const int p = StringFind(smcSummary, "=== MACHINE_GATE");
   if(p < 0)
      return false;

   const string tail = StringSubstr(smcSummary, p);

   if(signal == "BUY")
   {
      if(StringFind(tail, "HTF_STRONG_BEAR=1") >= 0)
         return false;
      if(StringFind(tail, "LTF_ENTRY_BULL=1") < 0)
         return false;
      return true;
   }

   if(signal == "SELL")
   {
      if(StringFind(tail, "HTF_STRONG_BULL=1") >= 0)
         return false;
      if(StringFind(tail, "LTF_ENTRY_BEAR=1") < 0)
         return false;
      return true;
   }

   return false;
}

//================================================================
// LLM
//================================================================
string CallDecisionLLM(const string smcBlock)
{
   const string sys =
      "You are a disciplined prop-firm style trader. You MUST answer with a single JSON object ONLY, "
      "no markdown fences, no extra text. Schema: "
      "{\"signal\":\"BUY|SELL|SKIP\",\"reason\":\"short\",\"tp_rr\":number,\"sl_points\":integer}. "
      "Context has HTF (bias / swing picture) and LTF (entry triggers: FVG proximity, sweeps, micro structure). "
      "Prefer SKIP unless HTF is not strongly against the direction AND LTF shows a plausible trigger. "
      "tp_rr is take-profit risk multiple (e.g. 2.0). sl_points is stop distance in POINTS (not pips) "
      "appropriate for the symbol's volatility; if unsure use 200. "
      "Do not output BUY when HTF shows clear BEARISH_STRUCTURE unless LTF documents a strong bullish sweep reclaim; "
      "mirror for SELL vs BULLISH_STRUCTURE.";

   const string user =
      "Dual timeframe SMC snapshot (HTF bias + LTF execution). Decide if we open a new market order on this LTF bar close.\n\n" +
      smcBlock;

   string body = "{";
   body += "\"model\":\"" + JsonEscape(InpModel) + "\",";
   body += "\"max_completion_tokens\":" + IntegerToString(InpMaxTokens) + ",";
   body += "\"messages\":[";
   body += "{\"role\":\"system\",\"content\":\"" + JsonEscape(sys) + "\"},";
   body += "{\"role\":\"user\",\"content\":\"" + JsonEscape(user) + "\"}";
   body += "]}";

   string headers = "Content-Type: application/json\r\n";
   headers += "Accept: application/json\r\n";
   headers += "Authorization: Bearer " + InpApiKey + "\r\n";

   char data[];
   int dataLen = StringToCharArray(body, data, 0, -1, CP_UTF8);
   if(dataLen > 0 && data[dataLen - 1] == 0) ArrayResize(data, dataLen - 1);

   char result[];
   string responseHeaders;

   ResetLastError();
   const int httpCode = WebRequest("POST", InpApiUrl, headers, InpTimeoutMs, data, result, responseHeaders);
   if(httpCode == -1)
   {
      const int err = GetLastError();
      string msg = "[WebRequest failed] err=" + IntegerToString(err);
      if(err == 4060) msg += " (4060: add https://api.sea-lion.ai to allowed URLs)";
      return msg;
   }

   string response = CharArrayToString(result, 0, ArraySize(result), CP_UTF8);
   if(httpCode != 200)
   {
      string apiErr = ExtractJsonString(response, "message", 0);
      return "[HTTP " + IntegerToString(httpCode) + "] " + (apiErr != "" ? apiErr : response);
   }

   int chPos = StringFind(response, "\"choices\":[");
   int msgPos = StringFind(response, "\"message\":{", (chPos >= 0 ? chPos : 0));
   int from = (msgPos >= 0 ? msgPos : (chPos >= 0 ? chPos : 0));
   string text = ExtractJsonString(response, "content", from);
   if(text == "") text = ExtractJsonString(response, "content", 0);
   if(text == "") return "[Error] Could not parse LLM content field. Raw=" + response;

   return text;
}

//================================================================
// JSON helpers
//================================================================
string JsonEscape(const string s)
{
   string out = "";
   const int len = StringLen(s);
   for(int i = 0; i < len; i++)
   {
      const ushort c = StringGetCharacter(s, i);
      if(c == '"') out += "\\\"";
      else if(c == '\\') out += "\\\\";
      else if(c == '\n') out += "\\n";
      else if(c == '\r') out += "\\r";
      else if(c == '\t') out += "\\t";
      else if(c < 0x20) out += StringFormat("\\u%04X", c);
      else out += ShortToString(c);
   }
   return out;
}

string ExtractJsonString(const string json, const string field, const int startFrom)
{
   const string needle = "\"" + field + "\":\"";
   int pos = StringFind(json, needle, startFrom);
   if(pos < 0) return "";
   const int start = pos + StringLen(needle);
   string out = "";
   const int len = StringLen(json);
   for(int i = start; i < len; i++)
   {
      const ushort c = StringGetCharacter(json, i);
      if(c == '\\')
      {
         if(i + 1 < len)
         {
            const ushort n = StringGetCharacter(json, i + 1);
            if(n == 'n') out += "\n";
            else if(n == 'r') out += "\r";
            else if(n == 't') out += "\t";
            else if(n == '"') out += "\"";
            else if(n == '\\') out += "\\";
            else if(n == '/') out += "/";
            else if(n == 'b' || n == 'f') out += " ";
            else if(n == 'u' && i + 5 < len)
            {
               const string hex = StringSubstr(json, i + 2, 4);
               const int code = (int)StringToInteger("0x" + hex);
               out += ShortToString((ushort)code);
               i += 4;
            }
            else out += ShortToString(n);
            i++;
         }
      }
      else if(c == '"')
      {
         return out;
      }
      else
      {
         out += ShortToString(c);
      }
   }
   return out;
}

double ExtractJsonNumber(const string json, const string field, const int startFrom)
{
   const string needle1 = "\"" + field + "\":";
   int pos = StringFind(json, needle1, startFrom);
   if(pos < 0)
   {
      // also allow unquoted keys (rare)
      const string needle2 = field + "\":";
      pos = StringFind(json, needle2, startFrom);
      if(pos < 0) return EMPTY_VALUE;
      pos += StringLen(needle2);
   }
   else
   {
      pos += StringLen(needle1);
   }

   while(pos < StringLen(json))
   {
      const ushort c = StringGetCharacter(json, pos);
      if(c == ' ' || c == '\t' || c == '\r' || c == '\n') { pos++; continue; }
      break;
   }

   string num = "";
   const int len = StringLen(json);
   for(int i = pos; i < len; i++)
   {
      const ushort c = StringGetCharacter(json, i);
      if((c >= '0' && c <= '9') || c == '.' || c == '-' || c == 'e' || c == 'E')
         num += ShortToString(c);
      else
         break;
   }
   if(num == "") return EMPTY_VALUE;
   return StringToDouble(num);
}

string StripMarkdownFences(const string s)
{
   string t = s;
   if(StringFind(t, "```") == 0)
   {
      int p = StringFind(t, "\n");
      if(p > 0) t = StringSubstr(t, p + 1);
      int p2 = StringFind(t, "```");
      if(p2 > 0) t = StringSubstr(t, 0, p2);
   }
   StringTrimLeft(t);
   StringTrimRight(t);
   return t;
}

string SliceJsonObject(const string s)
{
   int a = StringFind(s, "{");
   if(a < 0) return s;
   int b = -1;
   for(int i = StringLen(s) - 1; i >= a; i--)
   {
      if(StringGetCharacter(s, i) == '}')
      {
         b = i;
         break;
      }
   }
   if(b < 0) return s;
   return StringSubstr(s, a, b - a + 1);
}

bool ParseDecision(const string reply, string &signal, string &reason, double &tpRR, int &slPoints)
{
   signal = "SKIP";
   reason = "";
   tpRR = 2.0;
   slPoints = InpDefaultSLPoints;

   string t = StripMarkdownFences(reply);
   t = SliceJsonObject(t);

   string sig = ExtractJsonString(t, "signal", 0);
   StringTrimLeft(sig);
   StringTrimRight(sig);
   if(sig == "") return false;

   // normalize
   if(sig == "buy") sig = "BUY";
   if(sig == "sell") sig = "SELL";
   if(sig == "skip" || sig == "none") sig = "SKIP";

   if(sig != "BUY" && sig != "SELL" && sig != "SKIP") return false;

   signal = sig;
   reason = ExtractJsonString(t, "reason", 0);

   const double rr = ExtractJsonNumber(t, "tp_rr", 0);
   if(rr != EMPTY_VALUE && rr > 0) tpRR = rr;

   const double sl = ExtractJsonNumber(t, "sl_points", 0);
   if(sl != EMPTY_VALUE && sl > 10) slPoints = (int)MathRound(sl);

   return true;
}

//================================================================
// TRADING
//================================================================
int CountOurPositions(const string symbol)
{
   int cnt = 0;
   const int total = PositionsTotal();
   for(int i = 0; i < total; i++)
   {
      if(!PositionSelectByTicket(PositionGetTicket(i))) continue;
      if(PositionGetString(POSITION_SYMBOL) != symbol) continue;
      if((ulong)PositionGetInteger(POSITION_MAGIC) != InpMagic) continue;
      cnt++;
   }
   return cnt;
}

bool OpenBySignal(const string signal, const int slPoints, const double tpRR,
                  const double suggestedBuySl, const double suggestedSellSl)
{
   if(CountOurPositions(_Symbol) >= InpMaxPositions)
   {
      Print("Max positions reached.");
      return false;
   }

   const double point = SymbolInfoDouble(_Symbol, SYMBOL_POINT);
   const int digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);

   double price = 0, sl = 0, tp = 0;
   ENUM_ORDER_TYPE type = ORDER_TYPE_BUY;

   if(signal == "BUY")
   {
      type = ORDER_TYPE_BUY;
      price = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
      double slCand = (suggestedBuySl > 0 ? suggestedBuySl : price - slPoints * point);
      sl = NormalizeDouble(slCand, digits);
      tp = NormalizeDouble(price + (price - sl) * tpRR, digits);
      if(sl >= price - point) sl = NormalizeDouble(price - slPoints * point, digits);
   }
   else if(signal == "SELL")
   {
      type = ORDER_TYPE_SELL;
      price = SymbolInfoDouble(_Symbol, SYMBOL_BID);
      double slCand = (suggestedSellSl > 0 ? suggestedSellSl : price + slPoints * point);
      sl = NormalizeDouble(slCand, digits);
      tp = NormalizeDouble(price - (sl - price) * tpRR, digits);
      if(sl <= price + point) sl = NormalizeDouble(price + slPoints * point, digits);
   }
   else return false;

   const string comment = "SMCAI";
   if(!g_trade.PositionOpen(_Symbol, type, InpLots, price, sl, tp, comment))
   {
      Print("PositionOpen failed retcode=", g_trade.ResultRetcode(), " desc=", g_trade.ResultRetcodeDescription());
      return false;
   }
   return true;
}

//+------------------------------------------------------------------+
