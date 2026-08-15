import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Zap, BarChart2, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { Card, Badge, Button } from "../components/UI";
import { getHistory } from "../utils/storage";
import { EXAM_FILES } from "../utils/quizEngine";

export default function Home() {
  const navigate = useNavigate();
  const history = getHistory();
  const recent = history.slice(0, 3);

  const totalAttempted = history.length;
  const avgScore = totalAttempted
    ? Math.round(history.reduce((a, b) => a + b.pct, 0) / totalAttempted)
    : 0;
  const totalQAnswered = history.reduce((a, b) => a + (b.total || 0), 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <Badge variant="blue">BJSC Preliminary</Badge>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Bangladesh Judicial Service
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Practice with past exam papers. {EXAM_FILES.length} exams available.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card
          className="p-4 cursor-pointer hover:border-brand-400 dark:hover:border-brand-500 transition-all group"
          onClick={() => navigate("/practice?mode=random")}
        >
          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-3 group-hover:bg-brand-200 dark:group-hover:bg-brand-800/40 transition-colors">
            <Zap size={20} className="text-brand-600 dark:text-brand-400" />
          </div>
          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-0.5">Random Practice</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Questions from all exams</p>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:border-brand-400 dark:hover:border-brand-500 transition-all group"
          onClick={() => navigate("/practice")}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40 transition-colors">
            <BookOpen size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-0.5">Choose Exam</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">By year or exam number</p>
        </Card>
      </div>

      {/* Stats row */}
      {totalAttempted > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Sessions", value: totalAttempted, icon: BarChart2 },
            { label: "Avg score", value: `${avgScore}%`, icon: TrendingUp },
            { label: "Questions", value: totalQAnswered, icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-3 text-center">
              <Icon size={16} className="text-gray-400 dark:text-gray-500 mx-auto mb-1" />
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Exam list */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Exams</h2>
          <span className="text-xs text-gray-400">{EXAM_FILES.length} papers</span>
        </div>
        <Card>
          {EXAM_FILES.map((exam, i) => {
            const attempt = history.find((h) => h.examFile === exam.file);
            return (
              <button
                key={exam.file}
                onClick={() => navigate(`/practice?exam=${exam.file}`)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${
                  i !== EXAM_FILES.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono font-medium text-gray-600 dark:text-gray-300">
                    {exam.label.replace("th BJS", "").replace("rd BJS", "").replace("st BJS", "").replace("nd BJS", "")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{exam.label} Preliminary</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Year {exam.year} · 100 questions</p>
                </div>
                {attempt ? (
                  <Badge variant={attempt.pct >= 50 ? "green" : "red"}>{attempt.pct}%</Badge>
                ) : (
                  <ChevronRight size={16} className="text-gray-400 dark:text-gray-600 shrink-0" />
                )}
              </button>
            );
          })}
        </Card>
      </div>

      {/* Recent attempts */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent attempts</h2>
            <button onClick={() => navigate("/history")} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-2">
            {recent.map((r, i) => (
              <Card key={i} className="p-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold ${
                  r.pct >= 50 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                               : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                }`}>
                  {r.pct}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{r.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {r.correct}/{r.total} correct · {r.wrong} wrong · {new Date(r.savedAt).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
