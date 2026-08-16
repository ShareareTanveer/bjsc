import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, XCircle, MinusCircle, RotateCcw,
  Home, ChevronDown, ChevronUp, Clock, TrendingUp
} from "lucide-react";
import { Card, Badge, Button, ProgressBar } from "../components/UI";
import { parseCorrectKey, formatTime } from "../utils/quizEngine";

const OPTION_KEYS = ["a", "b", "c", "d"];

export default function Result() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all"); // all | correct | wrong | skipped

  useEffect(() => {
    const raw = sessionStorage.getItem("bjsc-result");
    if (!raw) { navigate("/"); return; }
    setData(JSON.parse(raw));
  }, [navigate]);

  if (!data) return null;

  const { questions, answers, correct, wrong, skipped, score, total, pct, duration, negativeMarking, label } = data;

  const filteredQ = questions.filter((q) => {
    const ck = parseCorrectKey(q.correct_answer);
    const sel = answers[q.id];
    if (filter === "correct") return sel === ck;
    if (filter === "wrong") return sel && sel !== ck;
    if (filter === "skipped") return !sel;
    return true;
  });

  const scoreColor = pct >= 70 ? "text-emerald-600 dark:text-emerald-400"
    : pct >= 50 ? "text-brand-600 dark:text-brand-400"
    : "text-red-600 dark:text-red-400";

  const barColor = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-brand-500" : "bg-red-500";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Score card */}
      <Card className="p-6 mb-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className={`text-6xl font-semibold mb-1 ${scoreColor}`}>{pct}%</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Score: {score}/{total} {negativeMarking ? "(−0.25 penalty applied)" : "(no penalty)"}
        </p>
        <ProgressBar value={pct} max={100} colorClass={barColor} className="mb-5" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Correct", value: correct, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: "Wrong", value: wrong, icon: XCircle, color: "text-red-500 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
            { label: "Skipped", value: skipped, icon: MinusCircle, color: "text-gray-400 dark:text-gray-500", bg: "bg-gray-50 dark:bg-gray-800" },
          ].map(({ label: l, value, icon: Icon, color, bg }) => (
            <div key={l} className={`rounded-xl p-3 ${bg}`}>
              <Icon size={18} className={`${color} mx-auto mb-1`} />
              <p className={`text-xl font-semibold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{l}</p>
            </div>
          ))}
        </div>

        {duration && (
          <div className="flex items-center justify-center gap-1.5 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <Clock size={14} />
            <span>Time: {formatTime(duration)}</span>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <Button variant="secondary" className="flex-1" onClick={() => navigate("/")}>
            <Home size={15} /> Home
          </Button>
          <Button className="flex-1" onClick={() => { sessionStorage.removeItem("bjsc-result"); navigate("/practice"); }}>
            <RotateCcw size={15} /> Practice again
          </Button>
        </div>
      </Card>

      {/* Review */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Review answers</h2>
          <span className="text-xs text-gray-400 dark:text-gray-500">{filteredQ.length} shown</span>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
          {[
            { id: "all", label: `All (${total})` },
            { id: "correct", label: `Correct (${correct})` },
            { id: "wrong", label: `Wrong (${wrong})` },
            { id: "skipped", label: `Skipped (${skipped})` },
          ].map(({ id, label: l }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                filter === id
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Question list */}
      <div className="space-y-2">
        {filteredQ.map((q, idx) => {
          const ck = parseCorrectKey(q.correct_answer);
          const sel = answers[q.id];
          const isRight = sel === ck;
          const isWrong = sel && sel !== ck;
          const isSkipped = !sel;
          const isOpen = expanded === q.id;

          return (
            <Card key={q.id} className="overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : q.id)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <div className="shrink-0 mt-0.5">
                  {isRight && <CheckCircle2 size={18} className="text-emerald-500" />}
                  {isWrong && <XCircle size={18} className="text-red-400" />}
                  {isSkipped && <MinusCircle size={18} className="text-gray-300 dark:text-gray-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                    Q{q.id} · {q._examLabel || q.exam || "Unknown Exam"}
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed prose-bidi line-clamp-2">{q.question}</p>
                </div>
                <div className="shrink-0 ml-1">
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                  {OPTION_KEYS.map((key) => {
                    const text = q.options?.[key];
                    if (!text) return null;
                    const isCorrect = key === ck;
                    const isSelected = key === sel;
                    const isWrongSel = isSelected && !isCorrect;
                    return (
                      <div
                        key={key}
                        className={`flex items-start gap-2.5 p-3 rounded-xl text-sm border ${
                          isCorrect
                            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                            : isWrongSel
                            ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                            : "border-gray-100 dark:border-gray-800"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded shrink-0 flex items-center justify-center text-[11px] font-bold mt-0.5 ${
                          isCorrect ? "bg-emerald-500 text-white"
                          : isWrongSel ? "bg-red-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        }`}>
                          {key.toUpperCase()}
                        </span>
                        <span className={`leading-relaxed prose-bidi flex-1 ${
                          isCorrect ? "text-emerald-900 dark:text-emerald-100"
                          : isWrongSel ? "text-red-800 dark:text-red-200"
                          : "text-gray-600 dark:text-gray-400"
                        }`}>{text}</span>
                        {isCorrect && <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />}
                        {isWrongSel && <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />}
                      </div>
                    );
                  })}

                  {q.explanation && (
                    <div className="mt-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900">
                      <p className="text-[11px] font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">Explanation</p>
                      <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed prose-bidi">{q.explanation}</p>
                      {q.reference && <p className="text-xs text-blue-400 dark:text-blue-500 mt-1">Source: {q.reference}</p>}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}