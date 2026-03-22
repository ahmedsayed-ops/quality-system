// ================================================================
//  src/services/api.js
//  All HTTP communication with the Google Apps Script backend.
//
//  POST body sent (raw JSON, no wrapper object):
//    branchUser, agentUser, employeeName, mobile,
//    visitDate, q1, q2, q3, q4, comments
//
//  GET response shape from Apps Script:
//    { success: true, data: [ { ...row }, ... ] }
//    Row keys may be sheet column names (e.g. "Branch User") or
//    already camelCase — normaliseRow() handles both cases.
// ================================================================

import config from "../config";

const ENDPOINT = config.APPS_SCRIPT_URL;

// Maps Google Sheet column names → camelCase keys used by the UI.
// If the Apps Script already returns camelCase the passthrough works too.
const COL_TO_KEY = {
  "Timestamp":                "timestamp",
  "Branch User":              "branchUser",
  "Field Agent User":         "agentUser",
  "Branch Employee Name":     "employeeName",
  "Mobile Number":            "mobile",
  "Visit Date":               "visitDate",
  "Project Awareness":        "q1",
  "Burn Methods Awareness":   "q2",
  "Live Email Received":      "q3",
  "Support Number Awareness": "q4",
  "Comments":                 "comments"
};

// ── POST: submit a new visit assessment ──────────────────────────
//
// Sends the exact payload shape the Apps Script expects.
// Uses Content-Type: text/plain to avoid a CORS preflight request,
// which Apps Script Web Apps do NOT handle for POST requests.
//
export async function submitVisit(payload) {
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method:  "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body:    JSON.stringify(payload)   // raw object, no wrapper
    });
  } catch {
    throw new Error("Network error — check your connection and try again.");
  }

  if (!res.ok) throw new Error(`Server error ${res.status}. Please try again.`);

  // Apps Script returns JSON on success, but may return HTML on first-run auth.
  // If we can't parse JSON we assume success (the row was written).
  let result;
  try { result = await res.json(); } catch { return; }

  if (result && result.success === false)
    throw new Error(result.message || "Submission rejected by the server.");
}

// ── GET: load all records for the dashboard ──────────────────────
//
// Falls back to demo data if the endpoint is unreachable so the
// dashboard is always usable during development / network issues.
//
export async function fetchRecords() {
  let res;
  try {
    res = await fetch(ENDPOINT, { method: "GET" });
  } catch {
    console.warn("QVTS: API unreachable, showing demo data.");
    return buildDemoData();
  }

  if (!res.ok) {
    console.warn(`QVTS: API returned ${res.status}, showing demo data.`);
    return buildDemoData();
  }

  let result;
  try { result = await res.json(); } catch {
    console.warn("QVTS: Could not parse API response, showing demo data.");
    return buildDemoData();
  }

  if (!result || !result.success) {
    console.warn("QVTS: API success=false, showing demo data.", result?.message);
    return buildDemoData();
  }

  // Normalise column-name keys → camelCase and sort newest first
  return (result.data || [])
    .map(normaliseRow)
    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
}

// Accepts a row with either sheet column names or camelCase keys
function normaliseRow(raw) {
  const out = {};
  for (const [k, v] of Object.entries(raw))
    out[COL_TO_KEY[k] ?? k] = v ?? "";
  return out;
}

// ── Demo data — used when the live endpoint is unreachable ────────
function buildDemoData() {
  const agents   = ["Ahmed Samy", "Sara Khaled", "Omar Tarek", "Dina Fouad", "Karim Hassan"];
  const branches = ["Branch Alpha", "Branch Beta", "Branch Gamma", "Branch Delta", "Branch Epsilon"];
  const pool     = ["Aware", "Not Aware"];

  return Array.from({ length: 52 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i % 30));
    return {
      timestamp:   d.toISOString(),
      branchUser:  branches[i % branches.length],
      agentUser:   agents[i % agents.length],
      employeeName:`Employee ${i + 1}`,
      mobile:      `010${String(10000000 + i * 7).slice(0, 8)}`,
      visitDate:   d.toISOString().slice(0, 10),
      q1: pool[Math.floor(Math.random() * 2)],
      q2: pool[Math.floor(Math.random() * 2)],
      q3: pool[Math.floor(Math.random() * 2)],
      q4: pool[Math.floor(Math.random() * 2)],
      comments: `Demo visit note #${i + 1}`
    };
  });
}
