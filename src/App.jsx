// src/App.jsx
import React, { useState } from "react";
import Header       from "./components/Header";
import FormPage     from "./pages/FormPage";
import DashboardPage from "./pages/DashboardPage";
import config       from "./config";

export default function App() {
  const [page, setPage] = useState("form");

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header activePage={page} setPage={setPage} />

      <main className="flex-1" key={page}>
        {page === "form"      && <FormPage />}
        {page === "dashboard" && <DashboardPage />}
      </main>

      <footer className="py-3 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center
                        justify-between gap-1 text-xs text-slate-400">
          <span>{config.COMPANY_NAME} · {config.SYSTEM_TITLE}</span>
          <span>Powered by Google Sheets &amp; Apps Script</span>
        </div>
      </footer>
    </div>
  );
}
