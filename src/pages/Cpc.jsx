// CPC.js
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scale,
  BookOpen,
  Search,
  CheckCircle,
  Eye,
  EyeOff,
  Zap,
  BarChart2,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Award,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Card, Badge } from "../components/UI";

// Helper to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function CPC() {
  const navigate = useNavigate();
  const [allMCQs, setAllMCQs] = useState([]);
  const [cpcData, setCpcData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [revealedQuestions, setRevealedQuestions] = useState({});

  // Practice mode states
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0, total: 0 });
  const [practiceComplete, setPracticeComplete] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/data/cpc/questions.json");
        if (!response.ok) {
          throw new Error(`Failed to load CPC data: ${response.status}`);
        }
        const data = await response.json();
        setCpcData(data);
        setAllMCQs(data.mcqs || []);
      } catch (err) {
        console.error("Error loading CPC data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter MCQs based on search
  const filteredMCQs = useMemo(() => {
    if (!searchTerm) return allMCQs;
    return allMCQs.filter(
      (q) =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.reference.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [allMCQs, searchTerm]);

  // Toggle question reveal
  const toggleReveal = (questionId) => {
    setRevealedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Start practice
  const startPractice = (count = 10) => {
    const questions = shuffleArray(allMCQs).slice(0, count);
    setCurrentQuestions(questions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setScore({ correct: 0, wrong: 0, total: 0 });
    setPracticeComplete(false);
    setPracticeMode(true);
  };

  // Handle answer selection
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

  // Next question
  const nextQuestion = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      setPracticeComplete(true);
    }
  };

  // Reset practice
  const resetPractice = () => {
    setPracticeMode(false);
    setCurrentQuestions([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setScore({ correct: 0, wrong: 0, total: 0 });
    setPracticeComplete(false);
  };

  // Get stats for results
  const getStats = () => {
    const total = score.total;
    const correct = score.correct;
    const wrong = score.wrong;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, wrong, percentage };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Loader2
          size={32}
          className="animate-spin text-brand-600 mx-auto mb-4"
        />
        <p className="text-gray-500 dark:text-gray-400">
          Loading CPC questions...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={32} className="text-red-500 mx-auto mb-4" />
        <p className="text-red-500 dark:text-red-400 font-medium">
          Error loading CPC data
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Practice Mode View
  if (practiceMode) {
    const stats = getStats();
    const currentQ = currentQuestions[currentIndex];
    const progress =
      currentQuestions.length > 0
        ? ((currentIndex + 1) / currentQuestions.length) * 100
        : 0;

    if (!currentQ) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No questions available for practice.
          </p>
          <button
            onClick={resetPractice}
            className="mt-4 text-brand-600 dark:text-brand-400 hover:underline"
          >
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
              >
                <ArrowLeft size={20} />
              </button>
              <Scale size={20} className="text-brand-600" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                CPC Practice
              </h1>
              <Badge variant="blue">Random</Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentIndex + 1} of {currentQuestions.length} questions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="text-emerald-600 dark:text-emerald-400">
                {score.correct}
              </span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-red-500">{score.wrong}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {!practiceComplete ? (
          <>
            {/* Question Card */}
            <Card className="p-6 mb-4">
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                <Badge variant="gray">{currentQ.topic}</Badge>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span>{currentQ.reference}</span>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span className="text-brand-600 dark:text-brand-400">
                  Q{currentQ.id}
                </span>
              </div>

              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                {currentQ.question}
              </p>

              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = option === currentQ.answer;
                  const showCorrect = showAnswer && isCorrect;
                  const showWrong = showAnswer && isSelected && !isCorrect;

                  let optionClass =
                    "border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-600";
                  if (showCorrect) {
                    optionClass =
                      "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-400";
                  } else if (showWrong) {
                    optionClass =
                      "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400";
                  } else if (isSelected && !showAnswer) {
                    optionClass =
                      "border-brand-500 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-400";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(option)}
                      disabled={showAnswer}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${optionClass} ${
                        showAnswer && !isSelected && !isCorrect
                          ? "opacity-60"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 flex-1">
                          {option}
                        </span>
                        {showCorrect && (
                          <CheckCircle
                            size={18}
                            className="text-emerald-500 shrink-0"
                          />
                        )}
                        {showWrong && (
                          <XCircle
                            size={18}
                            className="text-red-500 shrink-0"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showAnswer && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ✓ Correct Answer: {currentQ.answer}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Reference: {currentQ.reference}
                  </p>
                </div>
              )}
            </Card>

            <div className="flex justify-end">
              <button
                onClick={nextQuestion}
                disabled={!showAnswer}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  showAnswer
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                {currentIndex < currentQuestions.length - 1
                  ? "Next Question →"
                  : "See Results"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="mb-8">
              <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4">
                <Award
                  size={32}
                  className="text-brand-600 dark:text-brand-400"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Practice Complete!
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                You answered {stats.total} questions
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
              <Card className="p-4">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.correct}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Correct
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-2xl font-bold text-red-500">{stats.wrong}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Wrong
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                  {stats.percentage}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Score
                </p>
              </Card>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => startPractice(10)}
                className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                <Play size={16} className="inline mr-2" />
                Try Again
              </button>
              <button
                onClick={resetPractice}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Library
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main Library View - Flat list like MCQ page
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <Scale size={16} className="text-white" />
          </div>
          <Badge variant="blue">CPC Reference</Badge>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {cpcData?.title || "Code of Civil Procedure, 1908"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {allMCQs.length} questions • BJSC Preliminary Preparation
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-100"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => startPractice(10)}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <Zap size={16} />
            Practice 10
          </button>
          <button
            onClick={() => startPractice(allMCQs.length)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <Play size={16} />
            All {allMCQs.length}
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Showing {filteredMCQs.length} questions
      </p>

      {/* MCQ List - Flat list with reveal buttons */}
      <div className="space-y-4">
        {filteredMCQs.map((q) => {
          const isRevealed = revealedQuestions[q.id];

          return (
            <Card key={q.id} className="overflow-hidden">
              {/* Question Header */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Q{q.id}
                  </span>
                  {isRevealed && (
                    <div>
                      {" "}
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        •
                      </span>
                      <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
                        {q.topic}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        •
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {q.reference}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => toggleReveal(q.id)}
                  className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                >
                  {isRevealed ? (
                    <>
                      <EyeOff size={14} />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      Reveal
                    </>
                  )}
                </button>
              </div>

              {/* Question Body */}
              <div className="p-4">
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">
                  {q.question}
                </p>

                {/* Options */}
                <div className="space-y-1.5">
                  {q.options.map((option, optIdx) => {
                    const isCorrect = option === q.answer;
                    const showCorrect = isRevealed && isCorrect;

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                          showCorrect
                            ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                            : isRevealed && !isCorrect
                              ? "opacity-60"
                              : ""
                        }`}
                      >
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-5">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span
                          className={`text-gray-700 dark:text-gray-300 ${
                            showCorrect
                              ? "font-medium text-emerald-700 dark:text-emerald-300"
                              : ""
                          }`}
                        >
                          {option}
                        </span>
                        {showCorrect && (
                          <CheckCircle
                            size={14}
                            className="text-emerald-500 ml-auto shrink-0"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Revealed Answer */}
                {isRevealed && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Answer:
                      </span>{" "}
                      {q.answer}
                    </p>
                  </div>
                )}
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

      {/* CPC Info Footer */}
      {cpcData && (
        <Card className="p-4 mt-6 bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={18}
              className="text-brand-600 dark:text-brand-400 shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                About this CPC Bank
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {cpcData.note} • {cpcData.coverage} • {cpcData.batch} •{" "}
                {cpcData.count_in_this_batch} questions in this batch
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
