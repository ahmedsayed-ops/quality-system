// src/components/KpiCard.jsx
import React from "react";

const PALETTE = {
  blue:  { text: "text-brand-700",   icon: "bg-brand-100 text-brand-600",    bar: "bg-brand-500",   border: "border-brand-100"   },
  green: { text: "text-emerald-700", icon: "bg-emerald-100 text-emerald-600", bar: "bg-emerald-500", border: "border-emerald-100" },
  red:   { text: "text-red-700",     icon: "bg-red-100 text-red-600",         bar: "bg-red-400",     border: "border-red-100"     },
  sky:   { text: "text-sky-700",     icon: "bg-sky-100 text-sky-600",         bar: "bg-sky-500",     border: "border-sky-100"     },
  amber: { text: "text-amber-700",   icon: "bg-amber-100 text-amber-600",     bar: "bg-amber-500",   border: "border-amber-100"   }
};

export default function KpiCard({ title, value, subtitle, icon, color = "blue", barPercent }) {
  const c = PALETTE[color] || PALETTE.blue;
  return (
    <div className={`card animate-slide-up flex flex-col gap-3 p-4 sm:p-5 border ${c.border}
                     hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center
                         text-xl flex-shrink-0`}>
          {icon}
        </div>
        <span className={`text-xs font-display font-semibold uppercase tracking-widest
                          ${c.text} text-right leading-tight mt-0.5`}>
          {title}
        </span>
      </div>
      <div>
        <div className={`font-display font-extrabold text-3xl sm:text-4xl leading-none ${c.text}`}>
          {value}
        </div>
        {subtitle && (
          <div className="text-slate-400 text-xs mt-1.5 leading-snug">{subtitle}</div>
        )}
      </div>
      {barPercent !== undefined && (
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-auto">
          <div
            className={`h-full rounded-full ${c.bar} transition-all duration-700`}
            style={{ width: `${Math.min(100, Math.max(0, barPercent))}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="card p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-3 w-20 rounded-full bg-slate-100 animate-pulse mt-1" />
      </div>
      <div>
        <div className="h-9 w-16 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-2.5 w-24 rounded-full bg-slate-100 animate-pulse mt-2" />
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 animate-pulse" />
    </div>
  );
}
