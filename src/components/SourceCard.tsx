import React from "react";
import { ExternalLink, Shield } from "lucide-react";
import { FactCheckSource } from "../types";

interface SourceCardProps {
  source: FactCheckSource;
}

export function SourceCard({ source }: SourceCardProps) {
  // Helper to color credibility score
  const getCredibilityColor = (score: number) => {
    if (score >= 85) return "text-emerald-400 bg-emerald-950/20 border-emerald-500/25";
    if (score >= 60) return "text-amber-400 bg-amber-950/20 border-amber-500/25";
    return "text-rose-400 bg-rose-950/25 border-rose-500/20";
  };

  const getGaugeColorClass = (score: number) => {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="border border-[#262626] bg-[#121212] p-5 rounded-sm transition-all duration-300 hover:border-amber-900/40 group flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className={`px-2 py-0.5 text-[10px] font-semibold rounded-sm font-mono uppercase flex items-center gap-1 border ${getCredibilityColor(source.credibilityScore)}`}>
              <Shield className="w-3 h-3" />
              <span>{source.credibilityScore}% Reliability</span>
            </div>
          </div>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 px-2.5 rounded-sm text-zinc-500 hover:text-amber-500 hover:bg-zinc-900 flex items-center gap-1.5 transition-colors text-[10px] font-mono uppercase tracking-wider"
          >
            Visit Source <ExternalLink className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        <h4 className="text-sm font-medium font-serif italic text-white line-clamp-2 md:line-clamp-1 mb-2">
          "{source.title}"
        </h4>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase">Reviewer:</span>
          <span className="text-[10px] font-medium text-zinc-350 bg-zinc-900 px-2 py-0.5 rounded-sm border border-[#262626]">
            {source.publisher}
          </span>
          <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase ml-2">Rating:</span>
          <span className="text-[10px] font-semibold text-amber-500 bg-amber-950/20 px-2 py-0.5 rounded-sm border border-amber-900/30">
            {source.rating}
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed italic mb-4">
          "{source.analysis}"
        </p>
      </div>

      <div className="mt-auto pt-3 border-t border-[#262626]">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
          <span>SOURCE AUTHORITY RATING</span>
          <span className="font-semibold text-zinc-300">{source.credibilityScore}/100</span>
        </div>
        <div className="w-full bg-zinc-800 h-1 rounded-sm overflow-hidden">
          <div
            className={`h-full rounded-sm ${getGaugeColorClass(source.credibilityScore)}`}
            style={{ width: `${source.credibilityScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}

