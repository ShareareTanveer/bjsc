import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart2,
  Scale,
  BookOpen,
  Layers,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Filter,
  Lightbulb,
  Target,
  AlertTriangle,
  Flame,
  Snowflake,
  Search,
} from "lucide-react";
import { Card, Badge } from "../components/UI";

const DATA_URL = "/data/full-question-bank.json";

// ---------------------------------------------------------------------
// Small color palette keyed by subject, reused across bars/badges
// ---------------------------------------------------------------------
const SUBJECT_COLORS = {
  Law: "bg-brand-500",
  "General Knowledge": "bg-amber-500",
  English: "bg-sky-500",
  Bangla: "bg-rose-500",
  Mathematics: "bg-violet-500",
  "Bangladesh Affairs": "bg-emerald-500",
  "General Science": "bg-teal-500",
  "International Affairs": "bg-fuchsia-500",
};
const FALLBACK_COLOR = "bg-gray-400";
const colorFor = (subject) => SUBJECT_COLORS[subject] || FALLBACK_COLOR;

const UNSPECIFIED_LABELS = new Set([
  "General Legal Knowledge / Unspecified Act",
  "General Knowledge / Miscellaneous",
  "Unclassified",
]);

// ---------------------------------------------------------------------
// Aggregation helpers
// ---------------------------------------------------------------------
function flattenQuestions(data) {
  const rows = [];
  for (const exam of data) {
    for (const q of exam.questions) {
      rows.push({
        examId: exam.id,
        exam: exam.exam,
        year: exam.year,
        id: q.id,
        question: q.question,
        subject: q.subject || "Unclassified",
        act: q.act_or_chapter || "Unclassified",
        topic: q.topic || "Unclassified",
      });
    }
  }
  return rows;
}

function countBy(rows, keyFn) {
  const map = new Map();
  for (const r of rows) {
    const key = keyFn(r);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

// how many distinct exams (out of total) each key appeared in
// — a proxy for "how important / recurring" a topic or act is
function examCoverageBy(rows, keyFn, totalExams) {
  const map = new Map();
  for (const r of rows) {
    const key = keyFn(r);
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(r.exam);
  }
  const out = new Map();
  for (const [key, set] of map.entries()) {
    out.set(key, { examCount: set.size, totalExams });
  }
  return out;
}

// Priority tier from exam-coverage ratio: how consistently a key recurs
// across exams is a better "should I study this" signal than raw volume.
function tierFor(ratio) {
  if (ratio >= 0.7) return { label: "Core", rank: 3, className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" };
  if (ratio >= 0.4) return { label: "Important", rank: 2, className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" };
  if (ratio >= 0.15) return { label: "Occasional", rank: 1, className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" };
  return { label: "Rare", rank: 0, className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
}

// Split years into an "early" and "recent" half, then compare average
// questions-per-exam for a key in each half -> trend direction + magnitude.
function computeTrends(rows, keyFn, yearOrder) {
  const mid = Math.ceil(yearOrder.length / 2);
  const earlyYears = new Set(yearOrder.slice(0, mid));
  const recentYears = new Set(yearOrder.slice(mid));
  const earlyN = earlyYears.size || 1;
  const recentN = recentYears.size || 1;

  const earlyCounts = new Map();
  const recentCounts = new Map();
  for (const r of rows) {
    const key = keyFn(r);
    const bucket = earlyYears.has(r.year) ? earlyCounts : recentYears.has(r.year) ? recentCounts : null;
    if (bucket) bucket.set(key, (bucket.get(key) || 0) + 1);
  }

  const keys = new Set([...earlyCounts.keys(), ...recentCounts.keys()]);
  const out = [];
  for (const key of keys) {
    const earlyAvg = (earlyCounts.get(key) || 0) / earlyN;
    const recentAvg = (recentCounts.get(key) || 0) / recentN;
    const delta = recentAvg - earlyAvg;
    let direction = "stable";
    if (delta > 0.2) direction = "rising";
    else if (delta < -0.2) direction = "falling";
    out.push({ key, earlyAvg, recentAvg, delta, direction });
  }
  return out.sort((a, b) => b.delta - a.delta);
}

function pct(n, d) {
  return d ? Math.round((n / d) * 1000) / 10 : 0;
}

// ---------------------------------------------------------------------
// UI atoms
// ---------------------------------------------------------------------
function BarRow({ label, count, total, color, right, onClick, active }) {
  const p = total ? Math.round((count / total) * 1000) / 10 : 0;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left group ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-sm truncate ${
            active
              ? "font-semibold text-gray-900 dark:text-gray-100"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {label}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-2">
          {right ?? `${count} · ${p}%`}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${Math.max(p, 2)}%` }}
        />
      </div>
    </button>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card className="p-4">
      <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-3">
        <Icon size={18} className="text-brand-600 dark:text-brand-400" />
      </div>
      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
        {value}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">{sub}</p>}
    </Card>
  );
}

function SectionHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h2>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}

const TONE_STYLES = {
  positive: { border: "border-emerald-400", icon: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
  warning: { border: "border-amber-400", icon: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/10" },
  info: { border: "border-brand-400", icon: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-900/10" },
  danger: { border: "border-red-400", icon: "text-red-500", bg: "bg-red-50 dark:bg-red-900/10" },
};

function InsightCard({ icon: Icon, tone = "info", children }) {
  const t = TONE_STYLES[tone];
  return (
    <div className={`flex gap-3 p-3 rounded-xl border-l-4 ${t.border} ${t.bg}`}>
      <Icon size={16} className={`${t.icon} shrink-0 mt-0.5`} />
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{children}</p>
    </div>
  );
}

function TierBadge({ tier }) {
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${tier.className}`}>
      {tier.label}
    </span>
  );
}

function TrendPill({ direction, delta }) {
  if (direction === "rising")
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">
        <TrendingUp size={12} /> +{delta.toFixed(1)}/exam
      </span>
    );
  if (direction === "falling")
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] text-red-500 dark:text-red-400">
        <TrendingDown size={12} /> {delta.toFixed(1)}/exam
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-400">
      <Minus size={12} /> stable
    </span>
  );
}

// ---------------------------------------------------------------------
// Insight & recommendation generators (pure data -> text, so they stay
// accurate as the underlying question bank is refined/expanded)
// ---------------------------------------------------------------------
function generateInsights({ rows, subjectStats, totalQuestions, actStats, actCoverage, totalExams, actTrends }) {
  const insights = [];

  // 1. Dominant subject
  const top = subjectStats[0];
  if (top) {
    insights.push({
      tone: "info",
      icon: Target,
      text: `${top.key} is your highest-leverage subject at ${pct(top.count, totalQuestions)}% of all questions (${top.count}/${totalQuestions}). Prioritize study time roughly in proportion to this weighting.`,
    });
  }

  // 2. Core acts (appear in almost every exam)
  const coreActs = actStats
    .filter((a) => !UNSPECIFIED_LABELS.has(a.key))
    .map((a) => ({ ...a, cov: actCoverage.get(a.key) }))
    .filter((a) => a.cov && a.cov.examCount / totalExams >= 0.7)
    .sort((a, b) => b.cov.examCount - a.cov.examCount);
  if (coreActs.length) {
    const names = coreActs.slice(0, 3).map((a) => a.key).join(", ");
    insights.push({
      tone: "positive",
      icon: Flame,
      text: `${coreActs.length} act${coreActs.length > 1 ? "s" : ""} showed up in 70%+ of exams — treat ${names}${coreActs.length > 3 ? ", and others" : ""} as core, near-guaranteed material.`,
    });
  }

  // 3. Unspecified / uncited law share
  const lawRows = rows.filter((r) => r.subject === "Law");
  const unspecCount = lawRows.filter((r) => UNSPECIFIED_LABELS.has(r.act)).length;
  if (lawRows.length) {
    const share = pct(unspecCount, lawRows.length);
    if (share >= 25) {
      insights.push({
        tone: "warning",
        icon: AlertTriangle,
        text: `${share}% of Law questions don't cite a specific act (legal maxims, general procedure, conceptual reasoning). Don't over-index on section-memorization alone — examiners clearly also test general legal reasoning.`,
      });
    }
  }

  // 4. Biggest riser
  const risers = actTrends.filter((t) => !UNSPECIFIED_LABELS.has(t.key) && t.direction === "rising");
  if (risers.length) {
    const r = risers[0];
    insights.push({
      tone: "positive",
      icon: TrendingUp,
      text: `"${r.key}" is trending up — roughly ${r.earlyAvg.toFixed(1)} question(s)/exam in earlier papers vs ${r.recentAvg.toFixed(1)} in recent ones. Recent exams are leaning into it more.`,
    });
  }

  // 5. Biggest faller
  const fallers = actTrends.filter((t) => !UNSPECIFIED_LABELS.has(t.key) && t.direction === "falling");
  if (fallers.length) {
    const f = fallers[fallers.length - 1];
    insights.push({
      tone: "info",
      icon: Snowflake,
      text: `"${f.key}" has cooled off — from ${f.earlyAvg.toFixed(1)} question(s)/exam early on to ${f.recentAvg.toFixed(1)} recently. Still worth knowing, but lower priority than it used to be.`,
    });
  }

  // 6. Long tail warning
  const rareActs = actStats.filter((a) => !UNSPECIFIED_LABELS.has(a.key) && (actCoverage.get(a.key)?.examCount ?? 0) === 1);
  if (rareActs.length >= 5) {
    insights.push({
      tone: "warning",
      icon: AlertTriangle,
      text: `${rareActs.length} acts appeared in just a single exam each (a long tail of ${rareActs.reduce((s, a) => s + a.count, 0)} questions total). These are individually low-yield — skim for awareness rather than deep study.`,
    });
  }

  return insights;
}

function buildRecommendations(actStats, actCoverage, totalExams) {
  const list = actStats
    .filter((a) => !UNSPECIFIED_LABELS.has(a.key))
    .map((a) => {
      const cov = actCoverage.get(a.key) || { examCount: 0 };
      const ratio = cov.examCount / totalExams;
      return { ...a, examCount: cov.examCount, ratio, tier: tierFor(ratio) };
    })
    .sort((a, b) => b.tier.rank - a.tier.rank || b.count - a.count);
  return list;
}

// ---------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------
export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState("Law");
  const [expandedAct, setExpandedAct] = useState(null);
  const [sortMode, setSortMode] = useState("count");
  const [showAllRecs, setShowAllRecs] = useState(false);
  
  // New state for exam filtering
  const [selectedExams, setSelectedExams] = useState([]);
  const [examSearchTerm, setExamSearchTerm] = useState("");
  const [showExamDropdown, setShowExamDropdown] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load data (${res.status})`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Get unique exam names from data
  const examOptions = useMemo(() => {
    if (!data) return [];
    return data.map(exam => exam.exam);
  }, [data]);

  // Filter data by selected exams
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (selectedExams.length === 0) return data;
    return data.filter(exam => selectedExams.includes(exam.exam));
  }, [data, selectedExams]);

  const rows = useMemo(() => (filteredData ? flattenQuestions(filteredData) : []), [filteredData]);
  const totalExams = filteredData.length;
  const totalQuestions = rows.length;

  const yearOrder = useMemo(
    () => [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b),
    [rows]
  );

  const subjectStats = useMemo(() => countBy(rows, (r) => r.subject), [rows]);

  const filteredRows = useMemo(
    () => (subjectFilter === "All" ? rows : rows.filter((r) => r.subject === subjectFilter)),
    [rows, subjectFilter]
  );

  const actStats = useMemo(() => countBy(filteredRows, (r) => r.act), [filteredRows]);
  const actCoverage = useMemo(
    () => examCoverageBy(filteredRows, (r) => r.act, totalExams),
    [filteredRows, totalExams]
  );

  const sortedActs = useMemo(() => {
    const arr = [...actStats];
    if (sortMode === "coverage") {
      arr.sort((a, b) => {
        const ca = actCoverage.get(a.key)?.examCount ?? 0;
        const cb = actCoverage.get(b.key)?.examCount ?? 0;
        return cb - ca || b.count - a.count;
      });
    }
    return arr;
  }, [actStats, actCoverage, sortMode]);

  const topicStatsForExpanded = useMemo(() => {
    if (!expandedAct) return [];
    return countBy(
      filteredRows.filter((r) => r.act === expandedAct),
      (r) => r.topic
    );
  }, [filteredRows, expandedAct]);

  const subjectTrend = useMemo(() => {
    const map = {};
    for (const r of rows) {
      map[r.subject] = map[r.subject] || {};
      map[r.subject][r.year] = (map[r.subject][r.year] || 0) + 1;
    }
    return map;
  }, [rows]);

  const actTrends = useMemo(
    () => (yearOrder.length >= 4 ? computeTrends(filteredRows, (r) => r.act, yearOrder) : []),
    [filteredRows, yearOrder]
  );
  const subjectTrends = useMemo(
    () => (yearOrder.length >= 4 ? computeTrends(rows, (r) => r.subject, yearOrder) : []),
    [rows, yearOrder]
  );

  const insights = useMemo(
    () =>
      totalQuestions
        ? generateInsights({
            rows,
            subjectStats,
            totalQuestions,
            actStats: countBy(
              rows.filter((r) => r.subject === "Law"),
              (r) => r.act
            ),
            actCoverage: examCoverageBy(
              rows.filter((r) => r.subject === "Law"),
              (r) => r.act,
              totalExams
            ),
            totalExams,
            actTrends:
              yearOrder.length >= 4
                ? computeTrends(rows.filter((r) => r.subject === "Law"), (r) => r.act, yearOrder)
                : [],
          })
        : [],
    [rows, subjectStats, totalQuestions, totalExams, yearOrder]
  );

  const recommendations = useMemo(
    () => buildRecommendations(actStats, actCoverage, totalExams),
    [actStats, actCoverage, totalExams]
  );

  const unclassifiedCount = useMemo(
    () => rows.filter((r) => UNSPECIFIED_LABELS.has(r.act)).length,
    [rows]
  );

  const subjectList = ["All", ...subjectStats.map((s) => s.key)];
  const visibleRecs = showAllRecs ? recommendations : recommendations.slice(0, 6);

  // Filter exam options based on search
  const filteredExamOptions = useMemo(() => {
    if (!examSearchTerm) return examOptions;
    return examOptions.filter(exam => 
      exam.toLowerCase().includes(examSearchTerm.toLowerCase())
    );
  }, [examOptions, examSearchTerm]);

  const toggleExam = (exam) => {
    setSelectedExams(prev => 
      prev.includes(exam) 
        ? prev.filter(e => e !== exam)
        : [...prev, exam]
    );
  };

  const selectAllExams = () => {
    setSelectedExams([]);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500 dark:text-gray-400">
        Loading analytics…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-red-500">
        Couldn't load {DATA_URL}: {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <BarChart2 size={16} className="text-white" />
          </div>
          <Badge variant="blue">BJSC Preliminary</Badge>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Question Bank Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {totalQuestions} questions across {totalExams} exams, tagged by subject, act &amp; topic.
        </p>
      </div>

      {/* Exam Filter */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader 
            title="Filter by Exams" 
            subtitle={`${selectedExams.length} of ${examOptions.length} exams selected`}
          />
          {selectedExams.length > 0 && (
            <button
              onClick={selectAllExams}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        
        <div className="relative">
          <div 
            className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-brand-400 transition-colors"
            onClick={() => setShowExamDropdown(!showExamDropdown)}
          >
            <Search size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300 flex-1">
              {selectedExams.length === 0 
                ? "Select exams to filter..." 
                : `${selectedExams.length} exam${selectedExams.length > 1 ? 's' : ''} selected`}
            </span>
            {selectedExams.length > 0 && (
              <span className="text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full">
                {selectedExams.length}
              </span>
            )}
            {showExamDropdown ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>

          {showExamDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900">
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={examSearchTerm}
                  onChange={(e) => setExamSearchTerm(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    setSelectedExams([]);
                    setShowExamDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md"
                >
                  Show all exams
                </button>
                {filteredExamOptions.map((exam) => (
                  <button
                    key={exam}
                    onClick={() => toggleExam(exam)}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center justify-between"
                  >
                    <span className="text-gray-700 dark:text-gray-300">{exam}</span>
                    {selectedExams.includes(exam) && (
                      <span className="text-brand-600 dark:text-brand-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedExams.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {selectedExams.map((exam) => (
              <span
                key={exam}
                className="inline-flex items-center gap-1 text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full"
              >
                {exam}
                <button
                  onClick={() => toggleExam(exam)}
                  className="hover:text-brand-900 dark:hover:text-brand-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={BookOpen} label="Total questions" value={totalQuestions} />
        <StatCard icon={Layers} label="Exams covered" value={totalExams} sub={`${yearOrder[0] || 'N/A'}–${yearOrder[yearOrder.length - 1] || 'N/A'}`} />
        <StatCard
          icon={Scale}
          label="Distinct acts referenced"
          value={actStats.filter((a) => !UNSPECIFIED_LABELS.has(a.key)).length}
        />
        <StatCard
          icon={TrendingUp}
          label="Top subject"
          value={subjectStats[0]?.key || 'N/A'}
          sub={`${subjectStats[0]?.count || 0} questions`}
        />
      </div>

      {/* Key insights */}
      {insights.length > 0 && (
        <Card className="p-4 mb-6">
          <SectionHeader
            title="Key insights"
            subtitle="Auto-generated from question frequency, exam coverage & year-over-year trend"
          />
          <div className="space-y-2">
            {insights.map((ins, i) => (
              <InsightCard key={i} icon={ins.icon} tone={ins.tone}>
                {ins.text}
              </InsightCard>
            ))}
          </div>
        </Card>
      )}

      {/* Subject distribution */}
      <Card className="p-4 mb-6">
        <SectionHeader title="Subject distribution" subtitle="Share of all questions" />
        <div className="space-y-3">
          {subjectStats.map((s) => (
            <BarRow
              key={s.key}
              label={s.key}
              count={s.count}
              total={totalQuestions}
              color={colorFor(s.key)}
              onClick={() => setSubjectFilter(s.key)}
              active={subjectFilter === s.key}
            />
          ))}
        </div>
      </Card>

      {/* Subject filter tabs for everything below */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
        <Filter size={14} className="text-gray-400 shrink-0" />
        {subjectList.map((s) => (
          <button
            key={s}
            onClick={() => {
              setSubjectFilter(s);
              setExpandedAct(null);
            }}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              subjectFilter === s
                ? "bg-brand-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Study recommendations */}
      <Card className="p-4 mb-6">
        <SectionHeader
          title={`Study priority — ${subjectFilter}`}
          subtitle="Ranked by how consistently each chapter recurs across exams, not just raw count"
        />
        <div className="space-y-2">
          {visibleRecs.map((r) => {
            const trend = actTrends.find((t) => t.key === r.key);
            return (
              <div
                key={r.key}
                className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
              >
                <TierBadge tier={r.tier} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{r.key}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-600">
                    {r.count} question{r.count !== 1 ? "s" : ""} · {r.examCount}/{totalExams} exams (
                    {Math.round(r.ratio * 100)}%)
                  </p>
                </div>
                {trend && <TrendPill direction={trend.direction} delta={trend.delta} />}
              </div>
            );
          })}
        </div>
        {recommendations.length > 6 && (
          <button
            onClick={() => setShowAllRecs((v) => !v)}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline mt-3"
          >
            {showAllRecs ? "Show fewer" : `Show all ${recommendations.length}`}
          </button>
        )}
        {recommendations.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
            <Lightbulb size={12} className="inline -mt-0.5 mr-1 text-amber-500" />
            Suggested split: put the bulk of your prep time into{" "}
            <strong>Core</strong> and <strong>Important</strong> items (
            {recommendations.filter((r) => r.tier.rank >= 2).length} chapters) — they account for{" "}
            {pct(
              recommendations.filter((r) => r.tier.rank >= 2).reduce((s, r) => s + r.count, 0),
              recommendations.reduce((s, r) => s + r.count, 0)
            )}
            % of {subjectFilter} questions. Treat <strong>Occasional</strong>/<strong>Rare</strong>{" "}
            items as light revision, not primary study targets.
          </p>
        )}
      </Card>

      {/* Act / chapter breakdown with topic drill-down */}
      <Card className="p-4 mb-6">
        <SectionHeader
          title={`Chapters & topics — ${subjectFilter}`}
          subtitle="Click a row to see its recurring topics"
          right={
            <div className="flex gap-1 text-[11px]">
              <button
                onClick={() => setSortMode("count")}
                className={`px-2 py-1 rounded-md ${
                  sortMode === "count"
                    ? "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300"
                    : "text-gray-400"
                }`}
              >
                By count
              </button>
              <button
                onClick={() => setSortMode("coverage")}
                className={`px-2 py-1 rounded-md ${
                  sortMode === "coverage"
                    ? "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300"
                    : "text-gray-400"
                }`}
              >
                By recurrence
              </button>
            </div>
          }
        />

        <div className="space-y-1">
          {sortedActs.slice(0, 20).map((a) => {
            const cov = actCoverage.get(a.key);
            const isOpen = expandedAct === a.key;
            return (
              <div
                key={a.key}
                className="border-b border-gray-100 dark:border-gray-800 last:border-b-0 py-2"
              >
                <button
                  onClick={() => setExpandedAct(isOpen ? null : a.key)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{a.key}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-600">
                      {a.count} question{a.count !== 1 ? "s" : ""} · asked in {cov?.examCount ?? 0}/
                      {totalExams} exams
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {cov && cov.examCount >= Math.ceil(totalExams * 0.6) && (
                      <Badge variant="green">high-yield</Badge>
                    )}
                    {isOpen ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-3 pl-3 border-l-2 border-brand-100 dark:border-brand-900/40 space-y-2">
                    {topicStatsForExpanded.map((t) => (
                      <BarRow
                        key={t.key}
                        label={t.key}
                        count={t.count}
                        total={a.count}
                        color="bg-gray-400 dark:bg-gray-600"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {unclassifiedCount > 0 && subjectFilter === "Law" && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-3">
            Note: "General Legal Knowledge / Unspecified Act" groups questions that didn't cite a
            specific act by name — treat it as needing manual review, not a real chapter.
          </p>
        )}
      </Card>

      {/* Momentum: risers & fallers within the selected subject */}
      {actTrends.length > 0 && (
        <Card className="p-4 mb-6">
          <SectionHeader
            title="Momentum"
            subtitle={`Comparing exams ${yearOrder[0] || 'N/A'}–${yearOrder[Math.ceil(yearOrder.length / 2) - 1] || 'N/A'} vs ${
              yearOrder[Math.ceil(yearOrder.length / 2)] || 'N/A'
            }–${yearOrder[yearOrder.length - 1] || 'N/A'}`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-16">
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                <TrendingUp size={13} /> Rising
              </p>
              <div className="space-y-2">
                {actTrends
                  .filter((t) => t.direction === "rising" && !UNSPECIFIED_LABELS.has(t.key))
                  .slice(0, 5)
                  .map((t) => (
                    <div key={t.key} className="flex items-center justify-between text-xs gap-2">
                      <span className="text-gray-700 dark:text-gray-300 truncate">{t.key}</span>
                      <TrendPill direction={t.direction} delta={t.delta} />
                    </div>
                  ))}
                {actTrends.filter((t) => t.direction === "rising").length === 0 && (
                  <p className="text-xs text-gray-400">No clear risers yet.</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-red-500 dark:text-red-400 mb-2 flex items-center gap-1">
                <TrendingDown size={13} /> Falling
              </p>
              <div className="space-y-2">
                {actTrends
                  .filter((t) => t.direction === "falling" && !UNSPECIFIED_LABELS.has(t.key))
                  .slice(-5)
                  .reverse()
                  .map((t) => (
                    <div key={t.key} className="flex items-center justify-between text-xs gap-2">
                      <span className="text-gray-700 dark:text-gray-300 truncate">{t.key}</span>
                      <TrendPill direction={t.direction} delta={t.delta} />
                    </div>
                  ))}
                {actTrends.filter((t) => t.direction === "falling").length === 0 && (
                  <p className="text-xs text-gray-400">No clear fallers yet.</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Trend across exams */}
      <Card className="p-4 mb-6">
        <SectionHeader title="Subject mix over time" subtitle="Questions per subject, by exam year" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left font-medium text-gray-500 dark:text-gray-400 pb-2 pr-2">
                  Subject
                </th>
                {yearOrder.map((y) => (
                  <th
                    key={y}
                    className="text-center font-medium text-gray-500 dark:text-gray-400 pb-2 px-1"
                  >
                    {y}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjectStats.map((s) => {
                const trend = subjectTrends.find((t) => t.key === s.key);
                return (
                  <tr key={s.key} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="py-1.5 pr-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        {s.key}
                        {trend && trend.direction !== "stable" && (
                          <TrendingUp
                            size={11}
                            className={
                              trend.direction === "rising"
                                ? "text-emerald-500"
                                : "text-red-400 rotate-90"
                            }
                          />
                        )}
                      </span>
                    </td>
                    {yearOrder.map((y) => (
                      <td key={y} className="text-center py-1.5 px-1 text-gray-500 dark:text-gray-400">
                        {subjectTrend[s.key]?.[y] || "–"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}