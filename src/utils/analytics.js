// ================================================================
//  src/utils/analytics.js
//  Pure computation functions for the dashboard.
//
//  All records use these normalised field names (set by api.js):
//    timestamp, branchUser, agentUser, employeeName, mobile,
//    visitDate, q1, q2, q3, q4, comments
// ================================================================

import config from "../config";

// ["q1","q2","q3","q4"] — derived from config so it stays in sync
const Q_KEYS = config.QUESTIONS.map(q => q.key);

// ── Headline KPIs — single-pass O(n×4) ──────────────────────────
export function computeKPIs(records) {
  let totalAware = 0, totalNotAware = 0;

  for (const r of records)
    for (const k of Q_KEYS) {
      if (r[k] === "Aware")      totalAware++;
      else if (r[k] === "Not Aware") totalNotAware++;
    }

  const total = totalAware + totalNotAware;
  return {
    totalVisits:     records.length,
    totalAware,
    totalNotAware,
    awarePercent:    total > 0 ? Math.round(totalAware    / total * 100) : 0,
    notAwarePercent: total > 0 ? Math.round(totalNotAware / total * 100) : 0
  };
}

// ── Per-question breakdown ───────────────────────────────────────
export function computeQuestionBreakdown(records) {
  const counts = Object.fromEntries(Q_KEYS.map(k => [k, { aware: 0, notAware: 0 }]));

  for (const r of records)
    for (const k of Q_KEYS) {
      if (r[k] === "Aware")      counts[k].aware++;
      else if (r[k] === "Not Aware") counts[k].notAware++;
    }

  return config.QUESTIONS.map(q => {
    const { aware, notAware } = counts[q.key];
    const total = aware + notAware;
    // Shorten label for chart axis
    const name = q.label
      .replace(/^Is the branch aware of (the )?/i, "")
      .replace(/^Has the branch received the /i, "")
      .replace(/\?$/, "")
      .trim();
    return {
      name,
      fullLabel:    q.label,
      aware,
      notAware,
      awarePercent: total > 0 ? Math.round(aware / total * 100) : 0
    };
  });
}

// ── Agent ranking ────────────────────────────────────────────────
export function computeAgentRanking(records) {
  const map = {};
  for (const r of records) {
    const name = (r.agentUser || "Unknown").trim();
    if (!map[name]) map[name] = { name, aware: 0, notAware: 0, visits: 0 };
    map[name].visits++;
    for (const k of Q_KEYS) {
      if (r[k] === "Aware")      map[name].aware++;
      else if (r[k] === "Not Aware") map[name].notAware++;
    }
  }
  return Object.values(map)
    .map(a => ({ ...a, total: a.aware + a.notAware,
      awarePercent: (a.aware + a.notAware) > 0
        ? Math.round(a.aware / (a.aware + a.notAware) * 100) : 0 }))
    .sort((a, b) => b.awarePercent - a.awarePercent || b.visits - a.visits);
}

// ── Branch ranking ───────────────────────────────────────────────
export function computeBranchRanking(records) {
  const map = {};
  for (const r of records) {
    const name = (r.branchUser || "Unknown").trim();
    if (!map[name]) map[name] = { name, aware: 0, notAware: 0, visits: 0 };
    map[name].visits++;
    for (const k of Q_KEYS) {
      if (r[k] === "Aware")      map[name].aware++;
      else if (r[k] === "Not Aware") map[name].notAware++;
    }
  }
  return Object.values(map)
    .map(b => ({ ...b, total: b.aware + b.notAware,
      awarePercent: (b.aware + b.notAware) > 0
        ? Math.round(b.aware / (b.aware + b.notAware) * 100) : 0 }))
    .sort((a, b) => b.awarePercent - a.awarePercent || b.visits - a.visits);
}

// ── Daily trend ──────────────────────────────────────────────────
export function computeDailyTrend(records) {
  const map = {};
  for (const r of records) {
    const date = (r.visitDate || r.timestamp || "").slice(0, 10);
    if (!date || date.length < 10) continue;
    if (!map[date]) map[date] = { date, aware: 0, notAware: 0 };
    for (const k of Q_KEYS) {
      if (r[k] === "Aware")      map[date].aware++;
      else if (r[k] === "Not Aware") map[date].notAware++;
    }
  }
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

// ── Client-side filter ───────────────────────────────────────────
export function filterRecords(records, { agentUser, branchUser, dateFrom, dateTo }) {
  // Short-circuit when nothing is active — common on initial load
  if (!agentUser && !branchUser && !dateFrom && !dateTo) return records;

  return records.filter(r => {
    if (agentUser  && r.agentUser  !== agentUser)  return false;
    if (branchUser && r.branchUser !== branchUser) return false;
    const d = (r.visitDate || r.timestamp || "").slice(0, 10);
    if (dateFrom && d < dateFrom) return false;
    if (dateTo   && d > dateTo)   return false;
    return true;
  });
}
