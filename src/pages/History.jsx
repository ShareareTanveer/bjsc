import React, { useState } from "react";
import { Clock, Trash2, TrendingUp, BarChart2, CheckCircle2, XCircle } from "lucide-react";
import { Card, Button, EmptyState, Badge } from "../components/UI";
import { getHistory, clearHistory } from "../utils/storage";
import { formatTime } from "../utils/quizEngine";

export default function History() {
  const [history, setHistory] = useState(getHistory());

  const handleClear = () => {
    if (window.confirm("Clear all history? This cannot be undone.")) {
      clearHistory();
      setHistory([]);
    }
  };

  const avgScore = history.length
    ? Math.round(history.reduce((a, b) => a + b.pct, 0) / history.length)
    : 0;

  if (history.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <EmptyState
          icon={BarChart2}
          title="No attempts yet"
          description="Complete a practice session to see your history here."
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Session history</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{history.length} attempts · avg {avgScore}%</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClear} className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
          <Trash2 size={15} /> Clear all
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Sessions", value: history.length },
          { label: "Avg score", value: `${avgScore}%` },
          { label: "Best", value: `${Math.max(...history.map(h => h.pct))}%` },
        ].map(({ label, value }) => (
          <Card key={label} className="p-3 text-center">
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        {history.map((h, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0 ${
                h.pct >= 70 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                : h.pct >= 50 ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              }`}>
                {h.pct}%
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{h.label}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={12} /> {h.correct} correct
                  </span>
                  <span className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                    <XCircle size={12} /> {h.wrong} wrong
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <Clock size={12} /> {h.duration ? formatTime(h.duration) : "—"}
                  </span>
                  {h.negativeMarking && <Badge variant="red" className="text-[10px]">-0.25</Badge>}
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                {new Date(h.savedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
