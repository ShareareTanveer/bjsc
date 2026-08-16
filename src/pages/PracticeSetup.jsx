import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Zap, BookOpen, Shuffle, AlertTriangle } from "lucide-react";
import { Card, Button, Badge, Spinner } from "../components/UI";
import { 
  loadFullQuestionBank, 
  getExamInfoFromData, 
  getQuestionsForExams,
  getExamLabel,
  getTotalQuestions
} from "../utils/quizEngine";

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
  
  // State for question bank data
  const [examData, setExamData] = useState(null);
  const [examFiles, setExamFiles] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Load the full question bank on mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const data = await loadFullQuestionBank();
        if (data && Array.isArray(data)) {
          setExamData(data);
          const exams = getExamInfoFromData(data);
          setExamFiles(exams);
          setTotalQuestions(getTotalQuestions(data));
          
          // If exam param exists in URL, validate it
          const examParam = params.get("exam");
          if (examParam) {
            const validExam = exams.find(e => e.file === examParam);
            if (validExam) {
              setSelectedExams([examParam]);
            } else {
              setSelectedExams([]);
            }
          }
        } else {
          setError("Could not load question bank. Please check the data file.");
        }
      } catch (e) {
        console.error("Error loading data:", e);
        setError("Failed to load question bank: " + e.message);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [params]);

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
    if (!examData) {
      setError("Question bank not loaded. Please refresh the page.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Get questions for selected exams
      let allQuestions = getQuestionsForExams(examData, selectedExams);
      
      if (!allQuestions || allQuestions.length === 0) {
        setError("No questions found for the selected exam(s).");
        setLoading(false);
        return;
      }

      // Calculate max questions available
      const maxQuestions = allQuestions.length;
      const questionCount = Math.min(count, maxQuestions);

      // Store session in sessionStorage
      const session = {
        questions: allQuestions,
        count: questionCount,
        randomOrder,
        negativeMarking,
        mode,
        label: mode === "random"
          ? `Random (${selectedExams.length} exam${selectedExams.length > 1 ? "s" : ""})`
          : getExamLabel(examData, selectedExams[0]) + " Preliminary",
        examFile: mode === "exam" ? selectedExams[0] : null,
        totalAvailable: maxQuestions,
      };
      sessionStorage.setItem("bjsc-session", JSON.stringify(session));
      navigate("/quiz");
    } catch (e) {
      console.error("Error starting session:", e);
      setError("Unexpected error. Please try again.");
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size={32} />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading question bank...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Start a session</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure your practice session below. {totalQuestions} questions available.
        </p>
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
            <button 
              onClick={() => setSelectedExams(examFiles.map(e => e.file))} 
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
            >
              Select all
            </button>
            <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
            <button 
              onClick={() => setSelectedExams([])} 
              className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
        <Card>
          {examFiles.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No exams available
            </div>
          ) : (
            examFiles.map((exam, i) => {
              const active = selectedExams.includes(exam.file);
              return (
                <button
                  key={exam.file}
                  onClick={() => toggleExam(exam.file)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    i !== examFiles.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Year {exam.year} · {exam.questions.length} questions</p>
                  </div>
                </button>
              );
            })
          )}
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
            max={totalQuestions}
            value={count}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val > 0 && val <= totalQuestions) {
                setCount(val);
              }
            }}
            className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Custom"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Max: {totalQuestions} questions available
        </p>
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