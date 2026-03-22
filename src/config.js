// ================================================================
//  src/config.js  –  Single source of truth for the entire app
// ================================================================

const config = {

  // ── Backend endpoint ─────────────────────────────────────────
  // Hardcoded production URL. Override via Vercel env var if needed.
  APPS_SCRIPT_URL:
    process.env.REACT_APP_APPS_SCRIPT_URL ||
    "https://script.google.com/macros/s/AKfycbzmZgc0R0BvGZdUCS6JAZEsnn2nCSWeMsoTNyiZA0eVA9ODhzLcdtY_mE8PHFoRL2YZ/exec",

  // ── Branding ─────────────────────────────────────────────────
  // Replace with your company name. Set LOGO_URL to "/logo.png"
  // (place file in /public) or a remote URL. null = icon logo.
 COMPANY_NAME: "Dsquares",
SYSTEM_TITLE: "Quality Visit Audit System",
  SYSTEM_SUBTITLE: "Field Operations Monitoring",
  LOGO_URL: "/logo.png",

  // ── Assessment questions ──────────────────────────────────────
  // key   = exact POST field name sent to Apps Script (q1–q4)
  //         AND the key returned in GET records
  // label = text shown to the field agent on the form
  //
  // ⚠ DO NOT change the key values — they must match the backend.
  QUESTIONS: [
    { key: "q1", label: "Is the branch aware of the project?"        },
    { key: "q2", label: "Is the branch aware of burn methods?"       },
    { key: "q3", label: "Has the branch received the Live Email?"    },
    { key: "q4", label: "Is the branch aware of the support number?" }
  ],

  // ── Dashboard auto-refresh (ms). 0 = disabled. ───────────────
  DASHBOARD_REFRESH_MS: 60000
};

export default config;
