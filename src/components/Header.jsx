// src/components/Header.jsx
import React from "react";
import config from "../config";

const TABS = [
  { id: "form",      label: "New Visit",  icon: "📝" },
  { id: "dashboard", label: "Dashboard",  icon: "📊" }
];

export default function Header({ activePage, setPage }) {
  return (
    <header className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4">

          {/* ── Brand / Logo ─────────────────── */}
          <div className="flex items-center gap-3 min-w-0">
            {config.LOGO_URL ? (
              <img
                src={config.LOGO_URL}
                alt={`${config.COMPANY_NAME} logo`}
                className="h-8 sm:h-9 w-auto object-contain flex-shrink-0"
              />
            ) : (
              /* Default icon shown when LOGO_URL is null */
              <div className="h-9 w-9 rounded-xl bg-white/15 border border-white/20
                              flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                       M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            )}
            <div className="min-w-0 hidden sm:block">
              <div className="font-display font-bold text-white text-sm truncate leading-tight">
                {config.COMPANY_NAME}
              </div>
              <div className="text-white/50 text-xs truncate hidden md:block">
                {config.SYSTEM_TITLE}
              </div>
            </div>
          </div>

          {/* ── Navigation tabs ──────────────── */}
          <nav className="flex items-center gap-1" role="navigation">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setPage(tab.id)}
                aria-current={activePage === tab.id ? "page" : undefined}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl
                            font-display font-semibold text-sm
                            transition-all duration-150 select-none
                            ${activePage === tab.id
                              ? "bg-white text-brand-700 shadow-sm"
                              : "text-white/75 hover:text-white hover:bg-white/10"}`}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

        </div>
      </div>
    </header>
  );
}
