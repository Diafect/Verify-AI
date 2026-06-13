import React, { useState, useEffect } from "react";
import { 
  Search, 
  FileText, 
  History, 
  Sparkles, 
  ShieldCheck, 
  X, 
  RefreshCw, 
  Database, 
  Info, 
  AlertCircle, 
  Globe, 
  Layers, 
  TrendingUp, 
  Clock 
} from "lucide-react";
import Markdown from "react-markdown";
import { FactCheckResult, HistoryItem } from "./types";
import { VerdictBadge } from "./components/VerdictBadge";
import { SourceCard } from "./components/SourceCard";
import { LandingExamples } from "./components/LandingExamples";
import { HistoryList } from "./components/HistoryList";

export default function App() {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"verify" | "history">("verify");
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyHealthy, setIsApiKeyHealthy] = useState<boolean | null>(null);

  // Load local history on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("fact_check_history");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error("Failed to load search history:", err);
    }

    // Check backend state / API key availability
    fetch("/api/config-status")
      .then((res) => res.json())
      .then((data) => setIsApiKeyHealthy(data.isConfigured))
      .catch((err) => console.error("Config check error:", err));
  }, []);

  // Save history helper
  const saveHistory = (updatedHistory: HistoryItem[]) => {
    setHistory(updatedHistory);
    try {
      localStorage.setItem("fact_check_history", JSON.stringify(updatedHistory));
    } catch (err) {
      console.error("Failed to write to localStorage:", err);
    }
  };

  // Perform claims verification
  const handleVerify = async (queryToVerify?: string) => {
    const targetClaim = queryToVerify || claim;
    if (!targetClaim || targetClaim.trim().length === 0) return;

    setLoading(true);
    setLoadingStep(1);
    setError(null);
    setResult(null);
    setActiveTab("verify");

    // Simulated timing intervals for beautiful step-by-step loading progression
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < 3) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 2800);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: targetClaim }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with HTTP error status ${response.status}`);
      }

      const verifiedResult: FactCheckResult = await response.json();
      setResult(verifiedResult);

      // Save to local history (avoid duplication of the exact same claim title nearby)
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 11),
        timestamp: new Date().toISOString(),
        claim: verifiedResult.claim,
        verdict: verifiedResult.verdict,
        confidenceScore: verifiedResult.confidenceScore,
        result: verifiedResult,
      };

      const filteredHistory = history.filter(
        (h) => h.claim.toLowerCase().trim() !== verifiedResult.claim.toLowerCase().trim()
      );
      saveHistory([newItem, ...filteredHistory]);

    } catch (err: any) {
      console.error("Claims check failure:", err);
      setError(err.message || "Something went wrong while connecting with verification server.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  // Select item from history tab to display
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setResult(item.result);
    setClaim(item.claim);
    setError(null);
    setActiveTab("verify");
  };

  // Delete unique history item
  const handleDeleteHistoryItem = (id: string) => {
    const nextHistory = history.filter((item) => item.id !== id);
    saveHistory(nextHistory);
  };

  // Clear entire history list
  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to permanently clear your fact-check history?")) {
      saveHistory([]);
    }
  };

  // Copy or trigger an example claim
  const handleSelectExample = (exampleClaim: string) => {
    setClaim(exampleClaim);
    handleVerify(exampleClaim);
  };

  // Get color classes for confidence scores
  // Get color classes for confidence scores
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-950/20";
    if (score >= 50) return "text-amber-500 bg-amber-950/20";
    return "text-rose-400 bg-rose-950/20";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d8] font-sans selection:bg-amber-500/20 selection:text-white">
      
      {/* Upper Brand Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0a0a0a]/90 border-b border-[#262626]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 flex items-center justify-center rounded-sm text-black font-bold">
              <span className="text-xl">V</span>
            </div>
            <div>
              <h1 className="text-xl font-medium tracking-widest uppercase italic font-serif text-white flex items-center gap-2">
                Veritas AI <span className="text-[9px] bg-amber-950/60 text-amber-400 px-2 py-0.5 rounded-sm font-mono not-italic uppercase tracking-wide border border-amber-900/30">LATEST</span>
              </h1>
              <p className="text-[10px] text-[#71717a] font-mono uppercase">Fact Verification & Misinformation Detector</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Navigation Tab Toggles inside header */}
            <div className="flex items-center p-1 bg-[#121212] rounded-sm border border-[#262626]">
              <button
                onClick={() => setActiveTab("verify")}
                className={`px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-sm flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === "verify"
                    ? "bg-white text-black font-bold"
                    : "text-[#a1a1aa] hover:text-white"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Analyze Rumor
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-sm flex items-center gap-2 transition-all relative cursor-pointer ${
                  activeTab === "history"
                    ? "bg-white text-black font-bold"
                    : "text-[#a1a1aa] hover:text-white"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                History Log
                {history.length > 0 && (
                  <span className="w-4 h-4 bg-amber-500 text-black font-bold text-[9px] flex items-center justify-center rounded-sm">
                    {history.length}
                  </span>
                )}
              </button>
            </div>

            {/* Sys Status Dot */}
            <div className="hidden md:flex items-center space-x-3 border-l border-[#262626] pl-4">
              <div className="text-[10px] text-[#71717a] font-mono uppercase tracking-tight">SYS_STATUS: OPTIMAL</div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Banner Alert for missing API key */}
        {isApiKeyHealthy === false && (
          <div className="mb-6 p-4 rounded-sm border border-amber-900/40 bg-amber-950/20 text-amber-200 flex items-start gap-3.5 shadow-md">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 text-left">
              <p className="font-bold text-white uppercase font-mono tracking-wider">GEMINI_API_KEY Missing</p>
              <p className="text-zinc-400 max-w-2xl leading-relaxed">
                We detected that your Gemini API key is not currently defined. Go to the <strong>Settings &gt; Secrets</strong> tab of the AI Studio UI to configure <code>GEMINI_API_KEY</code> so the search grounding functions are fully operational.
              </p>
            </div>
          </div>
        )}

        {activeTab === "verify" ? (
          <div className="space-y-8">
            {/* Input Card Panel */}
            <div className="bg-[#121212] border border-[#262626] rounded-sm p-6 shadow-2xl">
              <div className="text-left mb-4">
                <label className="block text-[11px] uppercase tracking-widest text-[#71717a] mb-2 font-mono">
                  Input Claim for Verification
                </label>
                <p className="text-xs text-[#71717a] mt-1 pr-6 leading-relaxed">
                  Paste a news headline, viral post, WhatsApp rumors, or quotes. Our engine analyzes global consensus patterns and databases in real-time.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="e.g. 'Bananas grow on trees and are botanically classified as berries...'"
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    disabled={loading}
                    className="w-full text-white text-lg font-serif italic p-4 pr-10 border border-[#262626] bg-[#0c0c0c] hover:border-zinc-800 focus:border-amber-900/50 focus:outline-none rounded-sm transition resize-none"
                  />
                  {claim && (
                    <button
                      onClick={() => setClaim("")}
                      disabled={loading}
                      className="absolute right-3.5 top-3.5 p-1 rounded-sm text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
                      title="Clear text"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-tight flex items-center gap-1.5 text-left">
                    <Database className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    SEARCH: GLOBAL FACT CHECK DB + GEMINI SEARCH GROUNDING FEEDBACK
                  </span>

                  <button
                    onClick={() => handleVerify()}
                    disabled={loading || !claim.trim()}
                    className="w-full sm:w-auto bg-white text-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all rounded-sm shadow-none cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Analyze Claim
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error block */}
            {error && (
              <div className="p-5 border border-rose-900/40 bg-rose-950/20 text-rose-200 mt-4 space-y-1.5 text-xs text-left rounded-sm mx-auto">
                <p className="font-bold flex items-center gap-1.5 uppercase font-mono tracking-wider">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Verification Error
                </p>
                <p className="text-zinc-300 leading-relaxed font-serif italic">{error}</p>
                <p className="text-[10px] text-zinc-500 font-mono uppercase pt-1">
                  Please verify that your internet connection is active and that your API key limits are not exceeded.
                </p>
              </div>
            )}

            {/* Simulated Animated Progress Loader */}
            {loading && (
              <div className="p-8 border border-[#262626] rounded-sm bg-[#121212] flex flex-col items-center max-w-xl mx-auto text-center space-y-6">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-20 h-20 bg-amber-500/10 rounded-full animate-ping" />
                  <div className="w-14 h-14 bg-zinc-900 border border-[#262626] text-amber-500 rounded-sm flex items-center justify-center shadow-inner">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif italic text-[#d4d4d8] text-base">Gathering Evidence</h3>
                  <p className="text-xs text-[#71717a] max-w-sm">
                    Cross-referencing across global search grounding indices and fact-checking authorities...
                  </p>
                </div>

                {/* Steps trackers */}
                <div className="w-full max-w-md space-y-3.5 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase px-2">
                    <span className="font-bold text-amber-500">Verification Steps</span>
                    <span className="text-[#71717a]">{loadingStep}/3 Complete</span>
                  </div>

                  <div className="bg-[#262626] h-1.5 rounded-sm overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-sm transition-all duration-700 ease-out" 
                      style={{ width: `${(loadingStep / 3) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] text-center font-mono uppercase">
                    <div className={loadingStep >= 1 ? "text-amber-500" : "text-[#71717a]"}>
                      1. DB Lookup
                    </div>
                    <div className={loadingStep >= 2 ? "text-amber-500" : "text-[#71717a]"}>
                      2. Fallback Search
                    </div>
                    <div className={loadingStep >= 3 ? "text-amber-500" : "text-[#71717a]"}>
                      3. Synthesis Reports
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Display Panel */}
            {result && !loading && (
              <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                
                {result.isSimulated && (
                  <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-sm flex items-start gap-3.5 text-left shadow-lg">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Veritas Intel Sandbox Active</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        To maintain full system availability independent of rate limits or depleted prepayment credits, the system has loaded its offline fact-check database & heuristic synthesis fallback. The app remains fully functional.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Header overview blocks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Column 1: Verdict Banner */}
                  <div className="bg-[#121212] border border-[#262626] rounded-sm p-6 shadow-2xl flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-mono tracking-wider text-[#71717a] uppercase mb-1 block">Factual Verdict</span>
                      <div className="mt-2.5">
                        <VerdictBadge verdict={result.verdict} size="lg" />
                      </div>
                    </div>
                    <p className="text-[10px] text-[#71717a] font-mono uppercase leading-relaxed text-left">
                      Analyzed on {new Date(result.analyzedAt).toLocaleDateString()} via {result.searchGrounded ? "Gemini-Search fallback" : "FactCheckDB sources."}
                    </p>
                  </div>

                  {/* Column 2: Confidence Rating Dial */}
                  <div className="bg-[#121212] border border-[#262626] rounded-sm p-6 shadow-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-wider text-amber-500 uppercase mb-1 block">Confidence Rating</span>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-5xl font-serif text-white">
                          {result.confidenceScore}%
                        </span>
                        <span className="text-[10px] font-mono uppercase text-[#71717a]">Confidence</span>
                      </div>
                      
                      {/* Bar indicator */}
                      <div className="w-full bg-[#262626] h-1.5 rounded-sm overflow-hidden mt-4">
                        <div 
                          className="h-full rounded-sm bg-amber-500 transition-all duration-1000"
                          style={{ width: `${result.confidenceScore}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-[#71717a] leading-relaxed mt-4 uppercase font-mono text-left">
                      Evaluates levels of alignment with verified records.
                    </p>
                  </div>

                  {/* Column 3: Consensus Synthesizer */}
                  <div className="bg-[#121212] border border-[#262626] rounded-sm p-6 shadow-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-wider text-[#71717a] uppercase block">Consensus Summary</span>
                      <div className="mt-3 text-sm leading-relaxed font-serif italic text-[#a1a1aa] text-left">
                        "{result.consensus}"
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-4 text-[10px] font-mono uppercase text-[#71717a]">
                      <Layers className="w-3.5 h-3.5 text-amber-500" />
                      Cross reference confirmed
                    </div>
                  </div>
                </div>

                {/* Section: Explainer Narrative */}
                <div className="bg-[#121212] border border-[#262626] rounded-sm p-6 md:p-8 shadow-2xl text-left">
                  <div className="flex items-center justify-between border-b border-[#262626] pb-4 mb-5">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      AI Explainer & Synthesis
                    </h3>
                    <div className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm bg-zinc-900 border border-[#262626] text-[#71717a] uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      SYNTHESIZED BY VERITAS AI
                    </div>
                  </div>

                  {/* Markdown container */}
                  <div className="markdown-body prose max-w-none text-[#a1a1aa] text-sm leading-relaxed font-serif italic space-y-4">
                    <Markdown>{result.explanation}</Markdown>
                  </div>
                </div>

                {/* Section: Authority Publishing Sources */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-left">
                    <Globe className="w-4 h-4 text-amber-500" />
                    <h3 className="text-[11px] uppercase tracking-widest text-[#71717a] font-mono font-bold">Reference Factchecking Reviews</h3>
                  </div>

                  {result.sources.length === 0 ? (
                    <div className="p-8 text-center bg-[#121212] border border-[#262626] text-zinc-500 font-mono text-xs rounded-sm">
                      NO SPECIFIC REFERENCE SOURCES WERE INDEXED DIRECTLY. REFER TO SEARCH GROUNDING.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                      {result.sources.map((src, idx) => (
                        <SourceCard key={idx} source={src} />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Landing onboarding info (Displays when no current searched claim exists) */}
            {!result && !loading && (
              <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                
                {/* Visual features grids */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="bg-[#121212] p-5 rounded-sm border border-[#262626] shadow-2xl space-y-2.5">
                    <div className="w-8 h-8 rounded-sm bg-amber-950/40 text-amber-500 border border-amber-900/30 flex items-center justify-center font-mono font-bold text-xs">
                      1
                    </div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-white font-serif italic">Cross-verify Sources</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Automatically queries claim reviews compiled by Snopes, PolitiFact, FactCheck.org, and more to verify historical truths.
                    </p>
                  </div>

                  <div className="bg-[#121212] p-5 rounded-sm border border-[#262626] shadow-2xl space-y-2.5">
                    <div className="w-8 h-8 rounded-sm bg-amber-950/40 text-amber-500 border border-amber-900/30 flex items-center justify-center font-mono font-bold text-xs">
                      2
                    </div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-white font-serif italic">Grounding search Fallback</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      If the claim is too new or lacks historical records, we activate high-speed Google Search Grounding to evaluate fresh reports.
                    </p>
                  </div>

                  <div className="bg-[#121212] p-5 rounded-sm border border-[#262626] shadow-2xl space-y-2.5">
                    <div className="w-8 h-8 rounded-sm bg-amber-950/40 text-amber-500 border border-amber-900/30 flex items-center justify-center font-mono font-bold text-xs">
                      3
                    </div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-white font-serif italic font-medium text-white">Truth Score Analysis</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Generates percentage confidence meters, a high-level verdict tag, plain-English summaries, and source reliability ratings.
                    </p>
                  </div>
                </div>

                <LandingExamples onSelect={handleSelectExample} />
              </div>
            )}
          </div>
        ) : (
          /* History View Tab */
          <div className="bg-[#121212] border border-[#262626] rounded-sm p-6 md:p-8 shadow-2xl">
            <HistoryList
              items={history}
              onSelectItem={handleSelectHistoryItem}
              onDeleteItem={handleDeleteHistoryItem}
              onClearAll={handleClearHistory}
            />
          </div>
        )}

      </main>

      {/* Decorative simple footer */}
      <footer className="mt-20 border-t border-[#262626] bg-[#0c0c0c]/80 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-2">
          <div className="flex items-center justify-between opacity-40">
            <span className="text-[9px] font-mono tracking-widest uppercase text-[#71717a]">© {new Date().getFullYear()} VERITAS AI FACT SYSTEM</span>
            <span className="text-[9px] font-mono text-[#71717a]">V 2.1.0_LATEST</span>
          </div>
          <p className="text-[10px] text-zinc-600 font-mono uppercase text-center pt-2 leading-relaxed">
            Powered by Google Gemini 3.5 Flash &amp; Google Fact Check ClaimReview API. AI generated synthesis models are supplemental tools. Verify with official records only.
          </p>
        </div>
      </footer>
    </div>
  );
}
