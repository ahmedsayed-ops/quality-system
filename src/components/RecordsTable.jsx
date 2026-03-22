// src/components/RecordsTable.jsx
// Uses normalised field names: branchUser, agentUser, employeeName,
// visitDate, q1, q2, q3, q4, comments
import React, { useState, useMemo } from "react";

const PAGE_SIZE = 15;

function AwareBadge({ val }) {
  if (!val) return <span className="text-slate-300 text-xs">—</span>;
  return (
    <span className={`badge ${val === "Aware" ? "badge-green" : "badge-red"}`}>
      {val === "Aware" ? "✓" : "✗"} {val}
    </span>
  );
}

function formatDate(raw) {
  const d = (raw || "").slice(0, 10);
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d || "—";
  return `${day}/${m}/${y.slice(2)}`;
}

function getPageNums(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (cur <= 4)        return [1, 2, 3, 4, 5, "…", total];
  if (cur >= total -3) return [1, "…", total-4, total-3, total-2, total-1, total];
  return [1, "…", cur-1, cur, cur+1, "…", total];
}

export default function RecordsTable({ records, loading = false }) {
  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter(r =>
      [r.branchUser, r.agentUser, r.employeeName, r.visitDate, r.comments]
        .some(v => (v || "").toLowerCase().includes(q))
    );
  }, [records, search]);

  // Reset to page 1 when search or records change
  React.useEffect(() => { setPage(1); }, [search, records]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const slice      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="card overflow-hidden">

      {/* Header row */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h3 className="font-display font-bold text-slate-800">Visit Records</h3>
          <p className="text-slate-400 text-xs mt-0.5">
            {loading ? "Loading…" : `${filtered.length} of ${records.length} records`}
          </p>
        </div>

        {/* Search */}
        <div className="sm:ml-auto relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search records…" className="input-field !pl-10 !py-2 text-xs" />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Table / states */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse"
                   style={{ opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
              {search ? "🔍" : "📋"}
            </div>
            <div>
              <p className="font-display font-semibold text-slate-600 text-sm">
                {search ? "No matching records" : "No records yet"}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                {search ? "Try different search terms." : "Submit a visit assessment to see records here."}
              </p>
            </div>
            {search && (
              <button onClick={() => setSearch("")}
                className="btn-secondary text-xs !py-1.5 !px-3 mt-1">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-24">Date</th>
                <th className="w-36">Branch</th>
                <th className="w-36">Agent</th>
                <th className="w-36">Employee</th>
                <th className="w-28">Project</th>
                <th className="w-28">Burn Methods</th>
                <th className="w-28">Live Email</th>
                <th className="w-28">Support No.</th>
                <th className="w-48">Comments</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((r, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(r.visitDate || r.timestamp)}
                  </td>
                  <td className="font-semibold text-slate-800 whitespace-nowrap">{r.branchUser   || "—"}</td>
                  <td className="text-slate-600 whitespace-nowrap">                {r.agentUser    || "—"}</td>
                  <td className="text-slate-600 whitespace-nowrap">                {r.employeeName || "—"}</td>
                  <td><AwareBadge val={r.q1} /></td>
                  <td><AwareBadge val={r.q2} /></td>
                  <td><AwareBadge val={r.q3} /></td>
                  <td><AwareBadge val={r.q4} /></td>
                  <td className="text-slate-500 max-w-[200px] truncate text-xs" title={r.comments}>
                    {r.comments || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row
                        items-center justify-between gap-2">
          <span className="text-xs text-slate-400 order-2 sm:order-1">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-1 order-1 sm:order-2">
            <PBtn onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1} label="← Prev" />
            {getPageNums(page, totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`e${i}`}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">…</span>
              ) : (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all
                    ${p === page ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                  {p}
                </button>
              )
            )}
            <PBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages} label="Next →" />
          </div>
        </div>
      )}
    </div>
  );
}

function PBtn({ onClick, disabled, label }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="px-3 h-8 rounded-lg text-xs font-semibold text-slate-500
                 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
      {label}
    </button>
  );
}
