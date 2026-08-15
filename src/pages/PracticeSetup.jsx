import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Zap, BookOpen, Shuffle, List, AlertTriangle, CheckSquare } from "lucide-react";
import { Card, Button, Badge, Spinner } from "../components/UI";
import { EXAM_FILES, loadExamData } from "../utils/quizEngine";

const QUESTION_COUNTS = [10, 25, 50, 75, 100];

export default function PracticeSetup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [mode, setMode] = useState(params.get("mode") === "random" ? "random" : "exam");
  const [selectedExams, setSelectedExams] = useState(
    params.get("exam") ? [params.get("exam")] : []
  );
  const [count, setCount] = useState(25);
  const [randomOrder, setRandomOrder] = useState(true);
  const [negativeMarking, setNegativeMarking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleExam = (file) => {
    if (mode === "random") {
      setSelectedExams((prev) =>
        prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file]
      );
    } else {
      setSelectedExams([file]);
    }
  };

  const canStart = mode === "random" ? selectedExams.length > 0 : selectedExams.length === 1;

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load all selected exam files
      const loaded = await Promise.all(selectedExams.map(loadExamData));
      const failed = loaded.some((d) => !d);
      if (failed) {
        setError("Could not load one or more exam files. Make sure the JSON files are in the public/data/ folder.");
        setLoading(false);
        return;
      }

      // Gather questions
      let allQuestions = [];
      loaded.forEach((data, idx) => {
        const examFile = selectedExams[idx];
        const exam = EXAM_FILES.find((e) => e.file === examFile);
        data.questions.forEach((q) => {
          allQuestions.push({ ...q, _examFile: examFile, _examLabel: exam?.label || examFile });
        });
      });

      // Store session in sessionStorage
      const session = {
        questions: allQuestions,
        count: Math.min(count, allQuestions.length),
        randomOrder,
        negativeMarking,
        mode,
        label: mode === "random"
          ? `Random (${selectedExams.length} exam${selectedExams.length > 1 ? "s" : ""})`
          : EXAM_FILES.find((e) => e.file === selectedExams[0])?.label + " Preliminary",
        examFile: mode === "exam" ? selectedExams[0] : null,
      };
      sessionStorage.setItem("bjsc-session", JSON.stringify(session));
      navigate("/quiz");
    } catch (e) {
      setError("Unexpected error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Start a session</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure your practice session below.</p>
      </div>

      {/* Mode selector */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mode</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "exam", label: "Exam mode", desc: "One full exam, in order or random", icon: BookOpen },
            { id: "random", label: "Random mix", desc: "Questions from multiple exams", icon: Zap },
          ].map(({ id, label, desc, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setMode(id); setSelectedExams([]); }}
              className={`p-4 rounded-xl border text-left transition-all ${
                mode === id
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-500"
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900"
              }`}
            >
              <Icon size={18} className={mode === id ? "text-brand-600 dark:text-brand-400 mb-2" : "text-gray-400 mb-2"} />
              <p className={`text-sm font-medium mb-0.5 ${mode === id ? "text-brand-700 dark:text-brand-300" : "text-gray-900 dark:text-gray-100"}`}>{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Exam selection */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {mode === "exam" ? "Select exam" : "Select exams to draw from"}
        </label>
        {mode === "random" && (
          <div className="flex gap-2 mb-2">
            <button onClick={() => setSelectedExams(EXAM_FILES.map(e => e.file))} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">Select all</button>
            <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
            <button onClick={() => setSelectedExams([])} className="text-xs text-gray-500 dark:text-gray-400 hover:underline">Clear</button>
          </div>
        )}
        <Card>
          {EXAM_FILES.map((exam, i) => {
            const active = selectedExams.includes(exam.file);
            return (
              <button
                key={exam.file}
                onClick={() => toggleExam(exam.file)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  i !== EXAM_FILES.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""
                } ${active ? "bg-brand-50 dark:bg-brand-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/40"}`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  active
                    ? "border-brand-600 bg-brand-600"
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  {active && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${active ? "text-brand-700 dark:text-brand-300" : "text-gray-900 dark:text-gray-100"}`}>
                    {exam.label} Preliminary
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Year {exam.year} · 100 questions</p>
                </div>
              </button>
            );
          })}
        </Card>
      </div>

      {/* Question count */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Number of questions
        </label>
        <div className="flex flex-wrap gap-2">
          {QUESTION_COUNTS.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                count === n
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                  : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {n}
            </button>
          ))}
          <input
            type="number"
            min={1}
            max={900}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Custom"
          />
        </div>
      </div>

      {/* Options */}
      <div className="mb-6 space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Options</label>

        {[
          { id: "random", label: "Randomize question order", desc: "Shuffle questions instead of original order", icon: Shuffle, value: randomOrder, toggle: () => setRandomOrder(v => !v) },
          { id: "neg", label: "Negative marking", desc: "−0.25 per wrong answer (matches real exam)", icon: AlertTriangle, value: negativeMarking, toggle: () => setNegativeMarking(v => !v) },
        ].map(({ id, label, desc, icon: Icon, value, toggle }) => (
          <button
            key={id}
            onClick={toggle}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-left transition-colors"
          >
            <Icon size={18} className="text-gray-400 dark:text-gray-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors ${value ? "bg-brand-600" : "bg-gray-200 dark:bg-gray-700"} flex items-center px-0.5 shrink-0`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : "translate-x-0"}`} />
            </div>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <Button
        onClick={handleStart}
        disabled={!canStart || loading}
        size="lg"
        className="w-full"
      >
        {loading ? <Spinner size={18} /> : <Zap size={18} />}
        {loading ? "Loading questions..." : "Start session"}
      </Button>
    </div>
  );
}
