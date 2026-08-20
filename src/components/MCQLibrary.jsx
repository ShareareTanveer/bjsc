// components/MCQLibrary.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Scale,
  Search,
  CheckCircle,
  Zap,
  AlertCircle,
  HelpCircle,
  Play,
  Award,
  Loader2,
  ArrowLeft,
  XCircle,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Target,
  ListChecks,
  BarChart3,
} from "lucide-react";
import { Card, Badge } from "./UI";

// ---------- helpers ----------

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const COUNT_PRESETS = [10, 25, 50, 100];

export default function MCQLibrary({
  dataPath,
  title = "Code of Civil Procedure, 1908",
  badgeText = "Reference",
  icon: Icon = Scale,
  loadingText = "Loading questions...",
  errorTitle = "Error loading data",
  practiceTitle = "Practice",
  footerNote = "About this Bank",
}) {
  const [allMCQs, setAllMCQs] = useState([]);
  const [metaData, setMetaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [topicFilter, setTopicFilter] = useState("All");
  const [topicMenuOpen, setTopicMenuOpen] = useState(false);

  // Library "answer inline" state: { [questionId]: selectedOptionText }
  const [answeredMap, setAnsweredMap] = useState({});

  // View: "library" | "setup" | "practice"
  const [view, setView] = useState("library");

  // Quiz setup state
  const [setupCount, setSetupCount] = useState(10);
  const [setupCustomCount, setSetupCustomCount] = useState("");
  const [setupTopics, setSetupTopics] = useState(new Set());

  // Practice session state
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0, total: 0 });
  const [practiceComplete, setPracticeComplete] = useState(false);

  // ---------- load data ----------
  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(dataPath);
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.status}`);
        }
        const data = await response.json();
        if (cancelled) return;

        // Shuffle each question's options once, on load, so the correct
        // answer isn't always in the same position (source data lists the
        // correct answer first).
        const mcqs = (data.mcqs || []).map((q) => ({
          ...q,
          options: shuffleArray(q.options),
        }));

        setMetaData(data);
        setAllMCQs(mcqs);
        setSetupTopics(new Set(mcqs.map((q) => q.topic)));
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading data:", err);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => {
      cancelled = true;
    };
  }, [dataPath]);

  // ---------- derived data ----------

  const topics = useMemo(() => {
    const set = new Set(allMCQs.map((q) => q.topic).filter(Boolean));
    return Array.from(set).sort();
  }, [allMCQs]);

  const filteredMCQs = useMemo(() => {
    let list = allMCQs;
    if (topicFilter !== "All") {
      list = list.filter((q) => q.topic === topicFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (q) =>
          q.question.toLowerCase().includes(term) ||
          q.topic.toLowerCase().includes(term) ||
          q.reference.toLowerCase().includes(term),
      );
    }
    return list;
  }, [allMCQs, searchTerm, topicFilter]);

  const libraryStats = useMemo(() => {
    const answeredIds = Object.keys(answeredMap);
    const attempted = answeredIds.length;
    const correct = answeredIds.filter((id) => {
      const q = allMCQs.find((mcq) => String(mcq.id) === id);
      return q && answeredMap[id] === q.answer;
    }).length;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : null;
    return { attempted, correct, accuracy };
  }, [answeredMap, allMCQs]);

  const setupPool = useMemo(() => {
    if (setupTopics.size === 0) return [];
    return allMCQs.filter((q) => setupTopics.has(q.topic));
  }, [allMCQs, setupTopics]);

  const resolvedSetupCount = useMemo(() => {
    if (setupCount === "custom") {
      const n = parseInt(setupCustomCount, 10);
      if (!Number.isFinite(n) || n <= 0) return 0;
      return Math.min(n, setupPool.length);
    }
    if (setupCount === "all") return setupPool.length;
    return Math.min(setupCount, setupPool.length);
  }, [setupCount, setupCustomCount, setupPool.length]);

  // ---------- library interactions ----------

  const answerInline = useCallback((questionId, option) => {
    setAnsweredMap((prev) => {
      if (prev[questionId] !== undefined) return prev; // already answered, locked
      return { ...prev, [questionId]: option };
    });
  }, []);

  const retryQuestion = useCallback((questionId) => {
    setAnsweredMap((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  // ---------- quiz setup ----------

  const openSetup = () => {
    setSetupTopics(new Set(topics.length ? topics : allMCQs.map((q) => q.topic)));
    setSetupCount(allMCQs.length > 10 ? 10 : "all");
    setSetupCustomCount("");
    setView("setup");
  };

  const toggleSetupTopic = (topic) => {
    setSetupTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  };

  const beginPracticeFromSetup = () => {
    const count = resolvedSetupCount;
    if (count <= 0) return;
    const questions = shuffleArray(setupPool).slice(0, count);
    launchPractice(questions);
  };

  const quickPractice = (count) => {
    const pool = topicFilter !== "All" ? allMCQs.filter((q) => q.topic === topicFilter) : allMCQs;
    const questions = shuffleArray(pool).slice(0, Math.min(count, pool.length));
    launchPractice(questions);
  };

  const launchPractice = (questions) => {
    setCurrentQuestions(questions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setScore({ correct: 0, wrong: 0, total: 0 });
    setPracticeComplete(false);
    setView("practice");
  };

  // ---------- practice interactions ----------

  const handleOptionSelect = (option) => {
    if (showAnswer || practiceComplete) return;
    setSelectedOption(option);
    setShowAnswer(true);
    const currentQ = currentQuestions[currentIndex];
    const isCorrect = option === currentQ.answer;
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      total: prev.total + 1,
    }));
  };

  const nextQuestion = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      setPracticeComplete(true);
    }
  };

  const resetPractice = () => {
    setView("library");
    setCurrentQuestions([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setScore({ correct: 0, wrong: 0, total: 0 });
    setPracticeComplete(false);
  };

  const restartSamePractice = () => {
    launchPractice(shuffleArray(currentQuestions));
  };

  const stats = useMemo(() => {
    const total = score.total;
    const correct = score.correct;
    const wrong = score.wrong;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, wrong, percentage };
  }, [score]);

  // ---------- loading / error ----------

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <Loader2 size={28} className="animate-spin text-brand-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">{loadingText}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <AlertCircle size={28} className="text-red-500 mx-auto mb-4" />
        <p className="text-red-500 dark:text-red-400 font-medium">{errorTitle}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  // ============================================================
  // QUIZ SETUP VIEW
  // ============================================================
  if (view === "setup") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setView("library")}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Back to library"
          >
            <ArrowLeft size={20} />
          </button>
          <SlidersHorizontal size={18} className="text-brand-600" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Set up your quiz
          </h1>
        </div>

        <Card className="p-6 mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            How many questions?
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {COUNT_PRESETS.filter((n) => n <= allMCQs.length).map((n) => (
              <button
                key={n}
                onClick={() => setSetupCount(n)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                  setupCount === n
                    ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-300"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setSetupCount("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                setupCount === "all"
                  ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-300"
              }`}
            >
              All ({setupPool.length})
            </button>
            <button
              onClick={() => setSetupCount("custom")}
              className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                setupCount === "custom"
                  ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-300"
              }`}
            >
              Custom
            </button>
          </div>
          {setupCount === "custom" && (
            <input
              type="number"
              min={1}
              max={setupPool.length}
              value={setupCustomCount}
              onChange={(e) => setSetupCustomCount(e.target.value)}
              placeholder={`1–${setupPool.length}`}
              className="mt-2 w-32 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-100"
            />
          )}
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Which topics?
            </p>
            <div className="flex gap-3 text-xs">
              <button
                onClick={() => setSetupTopics(new Set(topics))}
                className="text-brand-600 dark:text-brand-400 hover:underline"
              >
                Select all
              </button>
              <button
                onClick={() => setSetupTopics(new Set())}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
            {topics.map((t) => {
              const active = setupTopics.has(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleSetupTopic(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? "border-brand-500 bg-brand-600 text-white"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-300"
                  }`}
                >
                  {active && <Check size={12} />}
                  {t}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {resolvedSetupCount > 0
              ? `${resolvedSetupCount} question${resolvedSetupCount === 1 ? "" : "s"} in this quiz`
              : "Select at least one topic and a valid question count"}
          </p>
          <button
            onClick={beginPracticeFromSetup}
            disabled={resolvedSetupCount <= 0}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
              resolvedSetupCount > 0
                ? "bg-brand-600 text-white hover:bg-brand-700"
                : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
            }`}
          >
            <Play size={16} />
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // PRACTICE VIEW
  // ============================================================
  if (view === "practice") {
    const currentQ = currentQuestions[currentIndex];
    const progress =
      currentQuestions.length > 0 ? ((currentIndex + 1) / currentQuestions.length) * 100 : 0;

    if (!currentQ) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 dark:text-gray-400">No questions available for practice.</p>
          <button onClick={resetPractice} className="mt-4 text-brand-600 dark:text-brand-400 hover:underline">
            Go back
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Practice Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={resetPractice}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Back to library"
              >
                <ArrowLeft size={20} />
              </button>
              <Icon size={20} className="text-brand-600" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{practiceTitle}</h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Question {currentIndex + 1} of {currentQuestions.length}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={14} /> {score.correct}
            </span>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="flex items-center gap-1 text-red-500">
              <XCircle size={14} /> {score.wrong}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {!practiceComplete ? (
          <>
            <Card className="p-6 mb-4">
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                <Badge variant="gray">{currentQ.topic}</Badge>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span>{currentQ.reference}</span>
              </div>

              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6 leading-snug">
                {currentQ.question}
              </p>

              <div className="space-y-2.5">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = option === currentQ.answer;
                  const showCorrect = showAnswer && isCorrect;
                  const showWrong = showAnswer && isSelected && !isCorrect;

                  let optionClass =
                    "bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-750";
                  let chipClass = "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300";
                  if (showCorrect) {
                    optionClass = "bg-emerald-100 dark:bg-emerald-900/40 shadow-md";
                    chipClass = "bg-emerald-500 text-white";
                  } else if (showWrong) {
                    optionClass = "bg-red-100 dark:bg-red-900/40 shadow-md";
                    chipClass = "bg-red-500 text-white";
                  } else if (isSelected && !showAnswer) {
                    optionClass = "bg-brand-100 dark:bg-brand-900/40 shadow-md";
                    chipClass = "bg-brand-600 text-white";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(option)}
                      disabled={showAnswer}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-150 ${optionClass} ${
                        showAnswer && !isSelected && !isCorrect ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0 transition-colors ${chipClass}`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 flex-1 text-sm">{option}</span>
                        {showCorrect && <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
                        {showWrong && <XCircle size={18} className="text-red-600 dark:text-red-400 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showAnswer && (
                <div
                  className={`mt-5 p-4 rounded-lg border text-sm ${
                    selectedOption === currentQ.answer
                      ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                      : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {selectedOption === currentQ.answer ? "Correct." : "Correct answer:"} {currentQ.answer}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Reference: {currentQ.reference}</p>
                </div>
              )}
            </Card>

            <div className="flex justify-end">
              <button
                onClick={nextQuestion}
                disabled={!showAnswer}
                className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  showAnswer
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                {currentIndex < currentQuestions.length - 1 ? "Next Question →" : "See Results"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="mb-8">
              <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4">
                <Award size={32} className="text-brand-600 dark:text-brand-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Quiz Complete</h2>
              <p className="text-gray-500 dark:text-gray-400">You answered {stats.total} questions</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
              <Card className="p-4">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.correct}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Correct</p>
              </Card>
              <Card className="p-4">
                <p className="text-2xl font-bold text-red-500">{stats.wrong}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Wrong</p>
              </Card>
              <Card className="p-4">
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.percentage}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
              </Card>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={restartSamePractice}
                className="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Retake This Set
              </button>
              <button
                onClick={openSetup}
                className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <SlidersHorizontal size={16} />
                New Quiz
              </button>
              <button
                onClick={resetPractice}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Back to Library
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // LIBRARY VIEW (default)
  // ============================================================
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <Icon size={16} className="text-white" />
          </div>
          <Badge variant="blue">{badgeText}</Badge>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {metaData?.title || title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {allMCQs.length} questions • BJSC Preliminary Preparation
        </p>
      </div>

      {/* Session stats strip */}
      {libraryStats.attempted > 0 && (
        <div className="flex items-center gap-4 mb-5 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs">
          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <BarChart3 size={14} className="text-brand-600" />
            {libraryStats.attempted} answered here
          </span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <Target size={14} className="text-brand-600" />
            {libraryStats.accuracy}% accuracy
          </span>
        </div>
      )}

      {/* Search, filter, and actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-100"
          />
        </div>

        {topics.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setTopicMenuOpen((o) => !o)}
              className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-between gap-2 text-gray-600 dark:text-gray-300 whitespace-nowrap"
            >
              <span className="truncate max-w-[10rem]">{topicFilter}</span>
              <ChevronDown size={14} className={`transition-transform ${topicMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {topicMenuOpen && (
              <div className="absolute z-10 mt-1 w-64 max-h-72 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 right-0">
                <button
                  onClick={() => {
                    setTopicFilter("All");
                    setTopicMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    topicFilter === "All" ? "text-brand-600 dark:text-brand-400 font-medium" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  All topics
                </button>
                {topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTopicFilter(t);
                      setTopicMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      topicFilter === t ? "text-brand-600 dark:text-brand-400 font-medium" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => quickPractice(10)}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <Zap size={16} />
            Quick 10
          </button>
          <button
            onClick={openSetup}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <SlidersHorizontal size={16} />
            Set Up Quiz
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1.5">
        <ListChecks size={14} />
        {filteredMCQs.length} question{filteredMCQs.length === 1 ? "" : "s"} shown
      </p>

      {/* MCQ List */}
      <div className="space-y-3">
        {filteredMCQs.map((q) => {
          const selected = answeredMap[q.id];
          const isAnswered = selected !== undefined;
          const isCorrectPick = isAnswered && selected === q.answer;

          return (
            <Card key={q.id} className="overflow-hidden">
              {/* Question Header */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Q{q.id}</span>
                  <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
                  <span className="text-xs font-medium text-brand-600 dark:text-brand-400">{q.topic}</span>
                  <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{q.reference}</span>
                </div>
                {isAnswered && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        isCorrectPick ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                      }`}
                    >
                      {isCorrectPick ? <CheckCircle size={13} /> : <XCircle size={13} />}
                      {isCorrectPick ? "Correct" : "Incorrect"}
                    </span>
                    <button
                      onClick={() => retryQuestion(q.id)}
                      className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      aria-label="Try again"
                      title="Try again"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Question Body */}
              <div className="p-4">
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 leading-relaxed">{q.question}</p>

                <div className="space-y-2">
                  {q.options.map((option, optIdx) => {
                    const isThisSelected = selected === option;
                    const isCorrectOption = option === q.answer;
                    const showCorrect = isAnswered && isCorrectOption;
                    const showWrong = isAnswered && isThisSelected && !isCorrectOption;

                    let optionClass =
                      "bg-gray-50 dark:bg-gray-800/60 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-gray-800 cursor-pointer";
                    let chipClass = "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 shadow-sm";
                    if (showCorrect) {
                      optionClass = "bg-emerald-100 dark:bg-emerald-900/40 shadow-md";
                      chipClass = "bg-emerald-500 text-white";
                    } else if (showWrong) {
                      optionClass = "bg-red-100 dark:bg-red-900/40 shadow-md";
                      chipClass = "bg-red-500 text-white";
                    } else if (isAnswered) {
                      optionClass = "bg-transparent shadow-none opacity-50 cursor-default";
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => answerInline(q.id, option)}
                        disabled={isAnswered}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-150 ${optionClass}`}
                      >
                        <span
                          className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold shrink-0 transition-colors ${chipClass}`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span
                          className={`flex-1 text-gray-700 dark:text-gray-300 ${
                            showCorrect ? "font-medium text-emerald-700 dark:text-emerald-300" : ""
                          } ${showWrong ? "text-red-700 dark:text-red-300" : ""}`}
                        >
                          {option}
                        </span>
                        {showCorrect && <CheckCircle size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
                        {showWrong && <XCircle size={15} className="text-red-600 dark:text-red-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredMCQs.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <HelpCircle size={32} className="mx-auto mb-3 opacity-50" />
          <p>No questions found matching your search.</p>
        </div>
      )}

      {/* Info Footer */}
      {metaData && (
        <Card className="p-4 mt-6 bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">{footerNote}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {metaData.note} • {metaData.coverage} • {metaData.batch} • {metaData.count_in_this_batch} questions
                in this batch
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}