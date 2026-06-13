import React, { useState } from "react";
import { Search, Calendar, ChevronRight, Trash2, History, FolderOpen, Sparkles } from "lucide-react";
import { HistoryItem, VerdictType } from "../types";
import { VerdictBadge } from "./VerdictBadge";

interface HistoryListProps {
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export function HistoryList({ items, onSelectItem, onDeleteItem, onClearAll }: HistoryListProps) {
  const [search, setSearch] = useState("");

  const filteredItems = items.filter(item => {
    const searchLower = search.toLowerCase();
    return (
      item.claim.toLowerCase().includes(searchLower) ||
      item.verdict.toLowerCase().includes(searchLower)
    );
  });

  const getVerdictBorderClass = (verdict: VerdictType) => {
    switch (verdict) {
      case "True": return "border-l-2 border-l-emerald-500";
      case "False": return "border-l-2 border-l-rose-500";
      case "Misleading": return "border-l-2 border-l-amber-500";
      case "Partially True": return "border-l-2 border-l-orange-500";
      default: return "border-l-2 border-l-[#262626]";
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block & Clear button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium tracking-wider uppercase text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-500" />
            Inquiry History Archive
          </h2>
          <p className="text-[11px] font-mono text-[#71717a] uppercase">
            Securely saved and cached within client browser ({items.length} sessions)
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[10px] font-mono uppercase tracking-widest text-[#71717a] hover:text-red-400 border border-[#262626] bg-[#121212] px-3.5 py-1.5 hover:bg-red-950/20 hover:border-red-900/40 rounded-sm transition-all"
          >
            Clear History Log
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#262626] rounded-sm bg-[#121212] flex flex-col items-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-zinc-900 border border-[#262626] text-zinc-500 flex items-center justify-center rounded-sm mb-4">
            <FolderOpen className="w-5 h-5" />
          </div>
          <h3 className="font-medium font-serif italic text-white text-base mb-1">No past reports recorded</h3>
          <p className="text-xs text-[#71717a] leading-relaxed max-w-sm mb-5">
            Any claims you analyze on the query terminal will automatically be logged and cached locally for rapid reference.
          </p>
          <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5 bg-zinc-900/50 px-2.5 py-1 rounded-sm border border-[#262626]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            PERSISTED LOCALLY
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-[#71717a]" />
            <input
              type="text"
              placeholder="Search archived files by keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-white placeholder-zinc-600 bg-[#121212] text-sm pl-11 pr-5 py-3 border border-[#262626] focus:border-amber-900/50 rounded-sm shadow-inner transition outline-none"
            />
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-10 text-center text-[#71717a] text-xs font-mono">
              NO ARCHIVES MATCHED "{search.toUpperCase()}".
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`group bg-[#121212] border border-[#262626] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-all duration-300 hover:border-amber-900/40 ${getVerdictBorderClass(
                    item.verdict
                  )}`}
                >
                  {/* Left segment */}
                  <div
                    onClick={() => onSelectItem(item)}
                    className="flex-1 cursor-pointer select-none"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <VerdictBadge verdict={item.verdict} size="sm" />
                      <span className="text-[10px] font-mono text-[#71717a] flex items-center gap-1 uppercase">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.timestamp)}
                      </span>
                      <span className="text-[9px] font-mono bg-zinc-900 text-zinc-500 border border-[#262626] rounded-sm px-1.5 py-0.5">
                        {item.result.searchGrounded ? "ONLINE GROUNDED" : "FACT CHECK DB"}
                      </span>
                    </div>
                    <p className="font-serif italic text-sm text-[#d4d4d8] line-clamp-2 md:line-clamp-1 group-hover:text-amber-500 transition-colors">
                      "{item.claim}"
                    </p>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <button
                      onClick={() => onSelectItem(item)}
                      className="px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-widest font-bold text-black bg-white hover:bg-amber-500 rounded-sm flex items-center gap-1 transition-colors"
                    >
                      View Report
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 rounded-sm transition"
                      title="Delete log record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

