import React from "react";
import { Handle, Position } from "@xyflow/react";

export default function DecisionNode({ data }: any) {
  const isHighlighted = data.isHighlighted;

  return (
    <div
      className={`relative min-w-[260px] max-w-[280px] rounded-2xl bg-white p-5 shadow-xl transition-all duration-300 dark:bg-slate-900 border ${
        isHighlighted
          ? "border-emerald-500 shadow-emerald-500/30 shadow-2xl scale-105 ring-4 ring-emerald-500/20"
          : "border-slate-200 hover:border-violet-400 dark:border-slate-800"
      }`}
    >
      {/* Input Handle Top */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3.5 !w-3.5 !bg-indigo-500 border-2 border-white dark:border-slate-900"
      />

      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
        <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-violet-600 dark:text-violet-400">
          <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse"></span>
          AI Decision
        </span>
        {data.lastDecision && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${
              data.lastDecision === "YES"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
            }`}
          >
            {data.lastDecision}
          </span>
        )}
      </div>

      <p className="mt-3 text-xs leading-relaxed font-semibold text-slate-700 dark:text-slate-200">
        {data.prompt || "Configure decision question..."}
      </p>

      {/* Output Handles Bottom */}
      <div className="mt-4 flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-bold text-slate-400 uppercase">
        <span className="text-emerald-600 dark:text-emerald-400">YES</span>
        <span className="text-rose-600 dark:text-rose-400">NO</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: "25%" }}
        className="!h-3.5 !w-3.5 !bg-emerald-500 border-2 border-white dark:border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: "75%" }}
        className="!bg-rose-500 !h-3.5 !w-3.5 border-2 border-white dark:border-slate-900"
      />
    </div>
  );
}