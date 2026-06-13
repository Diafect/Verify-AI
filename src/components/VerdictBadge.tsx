import React from "react";
import { CheckCircle, AlertTriangle, AlertCircle, HelpCircle, ShieldAlert } from "lucide-react";
import { VerdictType } from "../types";

interface VerdictBadgeProps {
  verdict: VerdictType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function VerdictBadge({ verdict, className = "", size = "md" }: VerdictBadgeProps) {
  const getStyles = () => {
    switch (verdict) {
      case "True":
        return {
          bg: "bg-emerald-950/30 text-emerald-400 border-emerald-500/30",
          icon: CheckCircle,
          label: "Confirmed True",
          shadow: "shadow-[0_0_12px_rgba(16,185,129,0.1)]"
        };
      case "False":
        return {
          bg: "bg-rose-950/40 text-rose-400 border-rose-500/30",
          icon: ShieldAlert,
          label: "Confirmed False",
          shadow: "shadow-[0_0_12px_rgba(244,63,94,0.1)]"
        };
      case "Misleading":
        return {
          bg: "bg-amber-950/30 text-amber-500 border-amber-500/35",
          icon: AlertTriangle,
          label: "Misleading Info",
          shadow: "shadow-[0_0_12px_rgba(245,158,11,0.1)]"
        };
      case "Partially True":
        return {
          bg: "bg-orange-950/30 text-orange-400 border-orange-500/30",
          icon: AlertCircle,
          label: "Partially True",
          shadow: "shadow-[0_0_12px_rgba(249,115,22,0.1)]"
        };
      default:
        return {
          bg: "bg-zinc-900 text-zinc-400 border-zinc-800",
          icon: HelpCircle,
          label: "Unverified / Unknown",
          shadow: "shadow-none"
        };
    }
  };

  const config = getStyles();
  const Icon = config.icon;

  const sizeClass = {
    sm: "px-2 py-1 text-xs border gap-1 rounded-md",
    md: "px-3 py-1.5 text-sm border gap-1.5 rounded-lg",
    lg: "px-5 py-3 text-lg border gap-2.5 rounded-xl font-semibold tracking-tight"
  }[size];

  return (
    <div className={`inline-flex items-center font-medium ${config.bg} ${config.shadow} ${sizeClass} ${className} transition-all duration-300`}>
      <Icon className={size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </div>
  );
}
