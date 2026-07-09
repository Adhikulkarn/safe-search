import React, { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export function Terminal({
  title = "console.log",
  logs = [],
  status = null, // e.g. "active", "idle", "success", "error"
  cursor = true,
  loading = false,
  className = "",
  ...props
}) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div
      className={`w-full rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950/95 shadow-2xl backdrop-blur-md ${className}`}
      {...props}
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800/60 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 block hover:bg-rose-600 transition"></span>
          <span className="w-3 h-3 rounded-full bg-amber-500/80 block hover:bg-amber-600 transition"></span>
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 block hover:bg-emerald-600 transition"></span>
        </div>
        <div className="text-xs font-mono font-medium text-slate-400 flex items-center gap-2">
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
          ) : (
            <svg
              className="w-3.5 h-3.5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
          {title}
        </div>
        <div className="flex items-center gap-1.5">
          {status && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
              status === "success" || status === "active"
                ? "bg-emerald-950 border border-emerald-800 text-emerald-400"
                : status === "error"
                ? "bg-rose-950 border border-rose-800 text-rose-400"
                : "bg-slate-900 border border-slate-850 text-slate-400"
            }`}>
              {status}
            </span>
          )}
          <div className="w-4"></div>
        </div>
      </div>

      {/* Terminal Screen */}
      <div className="p-5 h-64 overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed text-slate-300 space-y-2 select-text custom-scrollbar">
        {logs.map((log, i) => {
          let colorClass = "text-slate-300";
          
          if (log.toLowerCase().includes("error") || log.toLowerCase().includes("failed")) {
            colorClass = "text-rose-400 font-semibold";
          } else if (log.includes("✔") || log.toLowerCase().includes("complete") || log.toLowerCase().includes("stored") || log.toLowerCase().includes("verified")) {
            colorClass = "text-emerald-400 font-medium";
          } else if (log.toLowerCase().includes("preparing") || log.toLowerCase().includes("sending") || log.toLowerCase().includes("querying") || log.toLowerCase().includes("retrieving")) {
            colorClass = "text-cyan-400";
          } else if (log.toLowerCase().includes("generating") || log.toLowerCase().includes("signing") || log.toLowerCase().includes("encrypting") || log.toLowerCase().includes("hashing")) {
            colorClass = "text-violet-400";
          } else if (log.toLowerCase().includes("awaiting")) {
            colorClass = "text-slate-500 italic";
          }

          return (
            <div key={i} className="flex items-start gap-2 animate-[fadeIn_0.2s_ease-out]">
              <span className="text-slate-600 select-none">&gt;</span>
              <span className={colorClass}>{log}</span>
            </div>
          );
        })}
        
        {/* Blinking Cursor */}
        {cursor && (
          <div className="flex items-center gap-2 text-slate-500">
            <span className="text-slate-600 select-none">&gt;</span>
            <span className="w-2 h-4 bg-emerald-500 animate-[pulse_1s_infinite] inline-block"></span>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}

export default Terminal;
