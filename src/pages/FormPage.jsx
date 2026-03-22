// src/pages/FormPage.jsx
// ================================================================
//  Visit assessment form.
//  POST payload sent to Apps Script (exact field names):
//    branchUser, agentUser, employeeName, mobile,
//    visitDate (auto = today's date), q1, q2, q3, q4, comments
// ================================================================
import React, { useState, useCallback } from "react";
import config from "../config";
import { submitVisit } from "../services/api";

// Empty form state — keys match POST payload exactly
const EMPTY_FORM = {
  branchUser: "",
  agentUser: "",
  employeeName: "",
  mobile: "",
  comments: "",
  q1: "",
  q2: "",
  q3: "",
  q4: ""
};

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export default function FormPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errMsg, setErrMsg] = useState("");

  // today's date — auto-generated, not editable by the user
  const today = new Date().toISOString().slice(0, 10);

  // Update a single field and clear its error
  const setField = useCallback((key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  }, []);

  // ── Validation ────────────────────────────────────────────────
  const validate = () => {
    const e = {};

    if (!form.branchUser.trim()) e.branchUser = "Branch User is required";
    if (!form.agentUser.trim()) e.agentUser = "Field Agent User is required";
    if (!form.employeeName.trim()) e.employeeName = "Employee name is required";

    if (!form.mobile.trim()) {
      e.mobile = "Mobile number is required";
    } else if (!/^\d{7,15}$/.test(form.mobile.trim())) {
      e.mobile = "Enter a valid numeric mobile number (7–15 digits)";
    }

    for (const q of config.QUESTIONS) {
      if (!form[q.key]) e[q.key] = "Please select an answer";
    }

    if (!form.comments.trim()) e.comments = "Comments are required";

    return e;
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const ve = validate();

    if (Object.keys(ve).length > 0) {
      setErrors(ve);
      const firstKey = Object.keys(ve)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
      return;
    }

    setStatus("loading");
    setErrMsg("");

    try {
      await submitVisit({
        branchUser: form.branchUser.trim(),
        agentUser: form.agentUser.trim(),
        employeeName: form.employeeName.trim(),
        mobile: form.mobile.trim(),
        visitDate: today,
        q1: form.q1,
        q2: form.q2,
        q3: form.q3,
        q4: form.q4,
        comments: form.comments.trim()
      });

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrMsg(err.message || "Submission failed. Please try again.");
    }
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setStatus("idle");
    setErrMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Success screen ─────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center text-center animate-fade-in">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring opacity-40" />
          <div
            className="relative w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-200
                          flex items-center justify-center"
          >
            <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <span className="badge badge-green mb-4">Submitted Successfully</span>
        <h2 className="font-display font-bold text-2xl text-slate-800 mb-2">Assessment Saved!</h2>
        <p className="text-slate-500 text-sm max-w-xs mx-auto mb-2">
          Your visit for <strong>{today}</strong> has been recorded in Google Sheets.
        </p>
        <p className="text-slate-400 text-xs mb-10">You can view it in the Dashboard tab.</p>
        <button onClick={handleReset} className="btn-primary px-10 py-3.5">
          Submit Another Visit
        </button>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 animate-fade-in">
      {/* ── Page header ────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="page-pill">📋 New Visit Assessment</div>
        <h1 className="page-title">Quality Visit Form</h1>
        <p className="page-subtitle">Complete all required fields to submit a branch visit assessment.</p>
      </div>

      {/* ── Auto visit-date badge ───────────────────────────────── */}
      <div
        className="flex items-center gap-3 mb-6 p-3.5 bg-brand-50 border border-brand-100
                      rounded-xl animate-slide-up"
      >
        <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5
                 a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-xs text-brand-600 font-display font-semibold uppercase tracking-wide">
            Visit Date — Auto-generated
          </div>
          <div className="font-mono font-bold text-brand-800 text-sm mt-0.5">{today}</div>
        </div>
        <span className="badge badge-blue text-xs">Today</span>
      </div>

      {/* ── Submission error alert ──────────────────────────────── */}
      {status === "error" && (
        <div className="alert alert-err mb-5 animate-slide-in">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <div className="flex-1">
            <div className="font-display font-semibold text-sm">Submission Failed</div>
            <div className="text-sm mt-0.5 opacity-90">{errMsg}</div>
          </div>
          <button
            onClick={() => setStatus("idle")}
            className="opacity-60 hover:opacity-100 transition-opacity ml-1 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Validation summary ──────────────────────────────────── */}
      {errorCount > 0 && (
        <div className="alert alert-warn mb-5 animate-slide-in">
          <span className="text-xl flex-shrink-0">⚠</span>
          <div>
            <div className="font-display font-semibold text-sm">
              {errorCount} field{errorCount > 1 ? "s" : ""} need{errorCount === 1 ? "s" : ""} attention
            </div>
            <div className="text-sm mt-0.5 opacity-90">Please fix the highlighted fields before submitting.</div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          SECTION 1 — Visit Information
          ════════════════════════════════════════════════════════ */}
      <FormSection title="Visit Information" icon="👤" number={1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="branchUser" label="Branch User" error={errors.branchUser} required>
            <input
              id="field-branchUser"
              autoComplete="off"
              className={`input-field ${errors.branchUser ? "has-error" : ""}`}
              placeholder="e.g. Branch Alpha"
              value={form.branchUser}
              onChange={(e) => setField("branchUser", e.target.value)}
            />
          </FormField>

          <FormField id="agentUser" label="Field Agent User" error={errors.agentUser} required>
            <input
              id="field-agentUser"
              autoComplete="off"
              className={`input-field ${errors.agentUser ? "has-error" : ""}`}
              placeholder="e.g. Ahmed Samy"
              value={form.agentUser}
              onChange={(e) => setField("agentUser", e.target.value)}
            />
          </FormField>

          <FormField id="employeeName" label="Branch Employee Name" error={errors.employeeName} required>
            <input
              id="field-employeeName"
              autoComplete="off"
              className={`input-field ${errors.employeeName ? "has-error" : ""}`}
              placeholder="Full name of the employee"
              value={form.employeeName}
              onChange={(e) => setField("employeeName", e.target.value)}
            />
          </FormField>

          <FormField id="mobile" label="Mobile Number" hint="Numbers only" error={errors.mobile} required>
            <input
              id="field-mobile"
              inputMode="numeric"
              type="tel"
              maxLength={15}
              className={`input-field font-mono ${errors.mobile ? "has-error" : ""}`}
              placeholder="01012345678"
              value={form.mobile}
              onChange={(e) => setField("mobile", e.target.value.replace(/\D/g, ""))}
            />
          </FormField>
        </div>
      </FormSection>

      {/* ════════════════════════════════════════════════════════
          SECTION 2 — Quality Assessment
          ════════════════════════════════════════════════════════ */}
      <FormSection title="Quality Assessment" icon="✅" number={2}>
        <p className="text-slate-400 text-xs mb-4">
          For the <strong className="text-brand-700">Live Email</strong> question, select{" "}
          <strong className="text-emerald-600">Yes</strong> or <strong className="text-red-500">No</strong>. For all
          other questions, select <strong className="text-emerald-600">Aware</strong> or{" "}
          <strong className="text-red-500">Not Aware</strong>.
        </p>

        <div className="space-y-4">
          {config.QUESTIONS.map((q, idx) => (
            <AwarenessQuestion
              key={q.key}
              qKey={q.key}
              index={idx + 1}
              label={q.label}
              value={form[q.key]}
              error={errors[q.key]}
              onChange={(val) => setField(q.key, val)}
            />
          ))}
        </div>
      </FormSection>

      {/* ════════════════════════════════════════════════════════
          SECTION 3 — Comments
          ════════════════════════════════════════════════════════ */}
      <FormSection title="Comments & Notes" icon="💬" number={3}>
        <FormField id="comments" label="Observations / Follow-up Actions" error={errors.comments} required>
          <textarea
            id="field-comments"
            rows={4}
            className={`input-field resize-none ${errors.comments ? "has-error" : ""}`}
            placeholder="Enter any observations, follow-up actions, or notes about this visit…"
            value={form.comments}
            onChange={(e) => setField("comments", e.target.value)}
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${form.comments.length > 450 ? "text-amber-500" : "text-slate-300"}`}>
              {form.comments.length} / 500
            </span>
          </div>
        </FormField>
      </FormSection>

      {/* ── Submit ──────────────────────────────────────────────── */}
      <button onClick={handleSubmit} disabled={status === "loading"} className="btn-primary w-full py-4 text-base">
        {status === "loading" ? (
          <>
            <Spinner /> Submitting assessment…
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Submit Assessment
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400 mt-3">
        All fields marked <span className="text-red-400 font-semibold">*</span> are required. Data is saved securely to
        Google Sheets.
      </p>
    </div>
  );
}

// ── Reusable sub-components ───────────────────────────────────────

function FormSection({ title, icon, number, children }) {
  return (
    <div className="fsection animate-slide-up" style={{ animationDelay: `${number * 60}ms` }}>
      <div className="fsection-header">
        <div className="fsection-icon">{icon}</div>
        <div>
          <div className="text-xs text-slate-400 font-mono mb-0.5">Section {number}</div>
          <h2 className="font-display font-bold text-slate-800 text-base leading-tight">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  );
}

function FormField({ id, label, children, error, hint, required }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-display font-semibold text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
        {hint && <span className="text-slate-400 font-normal ml-1">({hint})</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1 mt-1.5 text-red-500 text-xs animate-slide-in">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1
                 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}

function AwarenessQuestion({ qKey, index, label, value, error, onChange }) {
  const isEmailQuestion = qKey === "q3" || label.toLowerCase().includes("live email");

  const options = isEmailQuestion
    ? [
        { value: "Yes", icon: "✓" },
        { value: "No", icon: "✗" }
      ]
    : [
        { value: "Aware", icon: "✓" },
        { value: "Not Aware", icon: "✗" }
      ];

  return (
    <div
      id={`field-${qKey}`}
      className={`p-4 rounded-xl border-2 transition-all duration-150
        ${error ? "border-red-200 bg-red-50/30" : "border-slate-100 bg-slate-50/40"}`}
    >
      <div
        className={`text-sm font-display font-semibold mb-3 flex items-start gap-2
                       ${error ? "text-red-700" : "text-slate-700"}`}
      >
        <span
          className="inline-flex items-center justify-center w-5 h-5 rounded-full
                         bg-brand-100 text-brand-700 text-xs font-bold flex-shrink-0 mt-0.5"
        >
          {index}
        </span>
        <span>
          {label} <span className="text-red-400">*</span>
        </span>
      </div>

      <div className="flex gap-3 flex-wrap">
        {options.map((opt) => {
          const selected = value === opt.value;
          const isPositive = opt.value === "Aware" || opt.value === "Yes";

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={selected}
              className={`aware-btn ${
                selected
                  ? isPositive
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-red-500 text-white border-red-500"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="mr-1.5">{opt.icon}</span>
              {opt.value}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-2 text-red-500 text-xs flex items-center gap-1 animate-slide-in">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1
                 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
