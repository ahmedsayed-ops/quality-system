// src/pages/DashboardPage.jsx
// ================================================================
//  Analytics dashboard.
//  Loads records via GET from the same Apps Script endpoint.
//  Records use normalised keys: branchUser, agentUser, employeeName,
//  mobile, visitDate, q1, q2, q3, q4, comments, timestamp
// ================================================================
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
  LineChart, Line
} from "recharts";

import { fetchRecords }              from "../services/api";
import { exportCSV, exportExcel }    from "../utils/exportUtils";
import {
  computeKPIs, computeQuestionBreakdown,
  computeAgentRanking, computeBranchRanking,
  computeDailyTrend, filterRecords
} from "../utils/analytics";
import KpiCard, { KpiCardSkeleton } from "../components/KpiCard";
import RecordsTable                  from "../components/RecordsTable";
import DashboardFilters              from "../components/DashboardFilters";
import config                        from "../config";

// ── Shared chart styles ───────────────────────────────────────────
const TOOLTIP_STYLE = {
  background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px",
  fontSize: "12px", fontFamily: "DM Sans, sans-serif",
  boxShadow: "0 4px 16px rgba(0,0,0,0.10)", padding: "8px 12px"
};
const AWARE_COLOR    = "#2563eb";
const NOT_AWARE_COLOR = "#f87171";
const SEQ_COLORS     = ["#2563eb","#0ea5e9","#06b6d4","#6366f1","#8b5cf6","#ec4899"];
const perfColor      = pct => pct >= 75 ? "#059669" : pct >= 50 ? "#d97706" : "#dc2626";

const DEFAULT_FILTERS = { dateFrom: "", dateTo: "", agentUser: "", branchUser: "" };

export default function DashboardPage() {
  const [allRecords,   setAllRecords]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [lastRefresh,  setLastRefresh]  = useState(null);
  const [filters,      setFilters]      = useState(DEFAULT_FILTERS);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingXLS, setExportingXLS] = useState(false);

  // ── Load data ──────────────────────────────────────────────────
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const data = await fetchRecords();
      setAllRecords(data);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!config.DASHBOARD_REFRESH_MS) return;
    const t = setInterval(() => load(true), config.DASHBOARD_REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  // ── Derived values — all memoised ─────────────────────────────
  const records       = useMemo(() => filterRecords(allRecords, filters), [allRecords, filters]);
  const agents        = useMemo(() => [...new Set(allRecords.map(r => r.agentUser).filter(Boolean))].sort(),   [allRecords]);
  const branches      = useMemo(() => [...new Set(allRecords.map(r => r.branchUser).filter(Boolean))].sort(),  [allRecords]);
  const kpis          = useMemo(() => computeKPIs(records),             [records]);
  const questionData  = useMemo(() => computeQuestionBreakdown(records), [records]);
  const agentRanking  = useMemo(() => computeAgentRanking(records),     [records]);
  const branchRanking = useMemo(() => computeBranchRanking(records),    [records]);
  const dailyTrend    = useMemo(() => computeDailyTrend(records),       [records]);
  const pieData       = useMemo(() => [
    { name: "Aware",     value: kpis.totalAware,    pct: kpis.awarePercent    },
    { name: "Not Aware", value: kpis.totalNotAware, pct: kpis.notAwarePercent }
  ], [kpis]);

  const hasFilters = Object.values(filters).some(v => v && v.trim());
  const isEmpty    = records.length === 0;

  const handleCSV = () => {
    setExportingCSV(true);
    exportCSV(records);
    setTimeout(() => setExportingCSV(false), 800);
  };
  const handleExcel = () => {
    setExportingXLS(true);
    exportExcel(records);
    setTimeout(() => setExportingXLS(false), 800);
  };

  // ── Initial full-page loader ───────────────────────────────────
  if (loading && allRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-5 animate-fade-in">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
          <div className="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-brand-300 border-b-transparent animate-spin"
               style={{ animationDirection: "reverse", animationDuration: "0.7s" }} />
        </div>
        <div className="text-center">
          <p className="font-display font-semibold text-slate-600 text-sm">Loading dashboard data…</p>
          <p className="text-slate-400 text-xs mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 animate-fade-in">

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="page-pill">📊 Analytics Dashboard</div>
          <h1 className="page-title">
            Visit Quality Overview
            {hasFilters && (
              <span className="badge badge-amber ml-3 text-xs align-middle">Filtered</span>
            )}
          </h1>
          {lastRefresh && (
            <p className="page-subtitle">
              {allRecords.length} total visits · Updated {lastRefresh.toLocaleTimeString()}
              {loading && <span className="ml-2 text-brand-400 text-xs">· Refreshing…</span>}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => load(true)} disabled={loading} className="btn-secondary text-sm">
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0
                   a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
          <button onClick={handleCSV}   disabled={exportingCSV  || isEmpty} className="btn-secondary text-sm">
            {exportingCSV  ? "…" : "📄"} CSV
          </button>
          <button onClick={handleExcel} disabled={exportingXLS || isEmpty} className="btn-secondary text-sm">
            {exportingXLS ? "…" : "📊"} Excel
          </button>
        </div>
      </div>

      {/* ── Error / demo-data notice ─────────────────────────────── */}
      {error && (
        <div className="alert alert-warn mb-5">
          <span className="text-xl flex-shrink-0">⚠</span>
          <div className="flex-1">
            <div className="font-display font-semibold text-sm">Could not reach Google Sheets</div>
            <div className="text-sm mt-0.5 opacity-90">{error} — Dashboard is showing demo data.</div>
          </div>
          <button onClick={() => setError("")} className="opacity-60 hover:opacity-100 transition-opacity ml-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="mb-6">
        <DashboardFilters
          filters={filters} setFilters={setFilters}
          agents={agents} branches={branches}
          onReset={() => setFilters(DEFAULT_FILTERS)} />
      </div>

      {/* ── KPI cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard title="Total Visits"  value={kpis.totalVisits}
              subtitle={hasFilters ? "in current filter" : "all time"}
              icon="🏪" color="blue" />
            <KpiCard title="Total Aware"   value={kpis.totalAware.toLocaleString()}
              subtitle="across all questions"
              icon="✅" color="green" barPercent={kpis.awarePercent} />
            <KpiCard title="Not Aware"     value={kpis.totalNotAware.toLocaleString()}
              subtitle="across all questions"
              icon="❌" color="red"   barPercent={kpis.notAwarePercent} />
            <KpiCard title="Aware %"       value={`${kpis.awarePercent}%`}
              subtitle="overall awareness rate"
              icon="📈" color="sky"   barPercent={kpis.awarePercent} />
            <KpiCard title="Not Aware %"   value={`${kpis.notAwarePercent}%`}
              subtitle="gap to close"
              icon="📉" color="amber" barPercent={kpis.notAwarePercent} />
          </>
        )}
      </div>

      {/* ── Charts row 1: Pie + Question bar ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-5">

        {/* Pie chart */}
        <div className="chart-card">
          <div className="mb-5">
            <h3 className="font-display font-bold text-slate-800 text-sm">Overall Awareness Split</h3>
            <p className="text-slate-400 text-xs mt-0.5">Aware vs Not Aware across all visits &amp; questions</p>
          </div>
          {isEmpty ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%"
                     innerRadius={70} outerRadius={110}
                     dataKey="value" paddingAngle={3}
                     label={renderPieLabel} labelLine={false}>
                  <Cell fill={AWARE_COLOR}     stroke="none" />
                  <Cell fill={NOT_AWARE_COLOR} stroke="none" />
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE}
                  formatter={(val, name, props) => [
                    `${val} answers (${props.payload.pct}%)`, name ]} />
                <Legend iconType="circle" iconSize={10}
                  formatter={v => <span style={{ fontSize:12, color:"#64748b" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Per-question bar chart */}
        <div className="chart-card">
          <div className="mb-5">
            <h3 className="font-display font-bold text-slate-800 text-sm">Awareness % per Question</h3>
            <p className="text-slate-400 text-xs mt-0.5">How aware branches are on each topic</p>
          </div>
          {isEmpty ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={questionData} margin={{ top:20, right:16, left:-8, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tickFormatter={v=>`${v}%`}
                  tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE}
                  formatter={(v,_,p)=>[
                    `${v}% (${p.payload.aware} Aware / ${p.payload.notAware} Not Aware)`,
                    "Awareness"
                  ]}
                  labelFormatter={l=>`Topic: ${l}`} />
                <Bar dataKey="awarePercent" radius={[8,8,0,0]} maxBarSize={60}>
                  {questionData.map((_,i) => (
                    <Cell key={i} fill={SEQ_COLORS[i % SEQ_COLORS.length]} />
                  ))}
                  <LabelList dataKey="awarePercent" position="top"
                    formatter={v=>`${v}%`}
                    style={{ fontSize:11, fill:"#475569", fontWeight:600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* ── Daily trend ──────────────────────────────────────────── */}
      <div className="chart-card mb-5">
        <div className="mb-5">
          <h3 className="font-display font-bold text-slate-800 text-sm">Daily Awareness Trend</h3>
          <p className="text-slate-400 text-xs mt-0.5">Aware vs Not Aware answers over time</p>
        </div>
        {dailyTrend.length < 2 ? (
          <EmptyChart message="Not enough data for a trend yet — submit more visits" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyTrend} margin={{ top:8, right:16, left:-8, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize:10, fill:"#94a3b8" }}
                axisLine={false} tickLine={false}
                tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={d=>`Date: ${d}`} />
              <Legend iconType="circle" iconSize={8}
                formatter={v=><span style={{ fontSize:12, color:"#64748b" }}>{v}</span>} />
              <Line type="monotone" dataKey="aware" name="Aware"
                stroke={AWARE_COLOR} strokeWidth={2.5}
                dot={{ r:4, fill:AWARE_COLOR, strokeWidth:0 }} activeDot={{ r:6 }} />
              <Line type="monotone" dataKey="notAware" name="Not Aware"
                stroke={NOT_AWARE_COLOR} strokeWidth={2.5}
                dot={{ r:4, fill:NOT_AWARE_COLOR, strokeWidth:0 }} activeDot={{ r:6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Ranking charts ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-6">
        <RankingCard title="Field Agent Ranking"
          subtitle="Ranked by % of Aware answers collected"
          icon="🏆" data={agentRanking} nameCol="Agent" />
        <RankingCard title="Branch Ranking"
          subtitle="Ranked by overall awareness score"
          icon="🏪" data={branchRanking} nameCol="Branch" />
      </div>

      {/* ── Records table ────────────────────────────────────────── */}
      <RecordsTable records={records} loading={loading && allRecords.length > 0} />

    </div>
  );
}

// ── Ranking chart + mini-table ────────────────────────────────────
function RankingCard({ title, subtitle, icon, data, nameCol }) {
  const top8        = data.slice(0, 8);
  const chartHeight = Math.max(160, Math.min(top8.length * 44, 320));

  return (
    <div className="chart-card">
      <div className="mb-5">
        <h3 className="font-display font-bold text-slate-800 text-sm">
          <span className="mr-2">{icon}</span>{title}
        </h3>
        <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>
      </div>

      {data.length === 0 ? <EmptyChart message={`No ${nameCol.toLowerCase()} data yet`} /> : (
        <>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart layout="vertical" data={top8}
              margin={{ top:0, right:48, left:8, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0,100]} tickFormatter={v=>`${v}%`}
                tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={90}
                tick={{ fontSize:11, fontFamily:"DM Sans", fill:"#475569" }}
                axisLine={false} tickLine={false}
                tickFormatter={n => n.length > 12 ? n.slice(0,12)+"…" : n} />
              <Tooltip contentStyle={TOOLTIP_STYLE}
                formatter={(v,_,p)=>[
                  `${v}% Aware (${p.payload.visits} visit${p.payload.visits!==1?"s":""})`,
                  nameCol
                ]} />
              <Bar dataKey="awarePercent" radius={[0,6,6,0]} maxBarSize={24}>
                {top8.map((e,i) => <Cell key={i} fill={perfColor(e.awarePercent)} />)}
                <LabelList dataKey="awarePercent" position="right"
                  formatter={v=>`${v}%`}
                  style={{ fontSize:11, fill:"#475569", fontWeight:700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Mini table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs min-w-[280px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {["#", nameCol, "Visits", "Aware", "%"].map(h => (
                    <th key={h} className={`py-2 px-2 font-display font-semibold uppercase
                                            tracking-wide text-slate-400
                                            ${h==="#"||h===nameCol?"text-left":"text-right"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 6).map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-1.5 px-2 text-slate-300 font-mono">{i+1}</td>
                    <td className="py-1.5 px-2 font-semibold text-slate-700 max-w-[100px] truncate"
                        title={row.name}>{row.name}</td>
                    <td className="py-1.5 px-2 text-right text-slate-500">{row.visits}</td>
                    <td className="py-1.5 px-2 text-right text-emerald-600 font-semibold">{row.aware}</td>
                    <td className="py-1.5 px-2 text-right">
                      <span className={`font-bold ${
                        row.awarePercent>=75?"text-emerald-600":
                        row.awarePercent>=50?"text-amber-600":"text-red-500"}`}>
                        {row.awarePercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 6 && (
              <p className="text-xs text-slate-400 text-center py-2">
                +{data.length-6} more
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Empty chart placeholder ───────────────────────────────────────
function EmptyChart({ message = "No data available" }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">📊</div>
      <p className="text-slate-400 text-sm font-medium">{message}</p>
      <p className="text-slate-300 text-xs">Submit some visits to see data here.</p>
    </div>
  );
}

// ── Pie slice label — shows % inside each slice ───────────────────
function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, pct }) {
  if (pct < 5) return null;
  const RAD = Math.PI / 180;
  const r   = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x   = cx + r * Math.cos(-midAngle * RAD);
  const y   = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
          style={{ fontSize:13, fontFamily:"Lexend", fontWeight:700 }}>
      {`${pct}%`}
    </text>
  );
}
