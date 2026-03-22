// src/components/DashboardFilters.jsx
import React from "react";

export default function DashboardFilters({ filters, setFilters, agents, branches, onReset }) {
  const set = (k, v) => setFilters(prev => ({ ...prev, [k]: v }));
  const activeCount = Object.values(filters).filter(v => v && v.trim()).length;

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-end gap-3">

        {/* Label */}
        <div className="flex items-center gap-2 self-center mr-1">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19
                 a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          <span className="font-display font-semibold text-slate-600 text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full
                             bg-brand-600 text-white text-xs font-bold">
              {activeCount}
            </span>
          )}
        </div>

        {/* Date From */}
        <FilterField label="From">
          <input type="date" value={filters.dateFrom || ""}
            onChange={e => set("dateFrom", e.target.value)}
            max={filters.dateTo || undefined}
            className="input-field !py-2 text-xs w-36" />
        </FilterField>

        {/* Date To */}
        <FilterField label="To">
          <input type="date" value={filters.dateTo || ""}
            onChange={e => set("dateTo", e.target.value)}
            min={filters.dateFrom || undefined}
            className="input-field !py-2 text-xs w-36" />
        </FilterField>

        {/* Agent */}
        <FilterField label="Agent">
          <select value={filters.agentUser || ""}
            onChange={e => set("agentUser", e.target.value)}
            className="input-field !py-2 text-xs w-44">
            <option value="">All Agents</option>
            {agents.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </FilterField>

        {/* Branch */}
        <FilterField label="Branch">
          <select value={filters.branchUser || ""}
            onChange={e => set("branchUser", e.target.value)}
            className="input-field !py-2 text-xs w-44">
            <option value="">All Branches</option>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </FilterField>

        {/* Clear button — only shown when filters are active */}
        {activeCount > 0 && (
          <button onClick={onReset} className="btn-secondary !py-2 !px-3 text-xs self-end">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-display font-semibold text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}
