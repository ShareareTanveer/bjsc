import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Flag, Bookmark, BookmarkCheck,
  Clock, CheckCircle2, XCircle, HelpCircle, AlertTriangle, List
} from "lucide-react";
import { Button, Badge, ProgressBar, Spinner } from "../components/UI";
import { buildSession, parseCorrectKey, calcScore, formatTime, shuffle } from "../utils/quizEngine";
import { saveResult, toggleBookmark, isBookmarked } from "../utils/storage";

const OPTION_KEYS = ["a", "b", "c", "d"];

export default function Quiz() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [bookmarks, setBookmarks] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const raw = sessionStorage.getItem("bjsc-session");
    if (!raw) { navigate("/practice"); return; }
    const sess = JSON.parse(raw);
    const built = buildSession(sess.questions, sess.count, sess.randomOrder, sess.negativeMarking);
    setSession({ ...sess, ...built });
    setQuestions(built.questions);

    // Init bookmark state
    const bm = {};
    built.questions.forEach((q) => {
      bm[q.id + q._examFile] = isBookmarked(q.id, q._examFile);
    });
    setBookmarks(bm);

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [navigate]);

  const q = questions[current];
  if (!session || !q) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size={32} />
      </div>
    );
  }

  const correctKey = parseCorrectKey(q.correct_answer);
  const selectedKey = answers[q.id];
  const isAnswered = !!selectedKey;
  const isCorrect = selectedKey === correctKey;

  const handleSelect = (key) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [q.id]: key }));
    setShowExplanation(false);
  };

  const handleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(q.id) ? next.delete(q.id) : next.add(q.id);
      return next;
    });
  };

  const handleBookmark = () => {
    const key = q.id + q._examFile;
    const isNowBm = toggleBookmark(q.id, q._examFile);
    setBookmarks((prev) => ({ ...prev, [key]: isNowBm }));
  };

  const handleFinish = () => {
    clearInterval(timerRef.current);
    const result = calcScore(questions, answers, session.negativeMarking);
    const record = {
      ...result,
      label: session.label,
      examFile: session.examFile,
      duration: elapsed,
      negativeMarking: session.negativeMarking,
    };
    saveResult(record);
    sessionStorage.setItem("bjsc-result", JSON.stringify({
      ...record,
      questions,
      answers,
    }));
    navigate("/result");
  };

  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  const optionClass = (key) => {
    const base = "w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-100";
    if (submitted || showExplanation) {
      if (key === correctKey) return `${base} border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20`;
      if (key === selectedKey && key !== correctKey) return `${base} border-red-400 bg-red-50 dark:bg-red-900/20`;
      return `${base} border-gray-200 dark:border-gray-800 opacity-60`;
    }
    if (key === selectedKey) return `${base} border-brand-500 bg-brand-50 dark:bg-brand-900/20`;
    return `${base} border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer`;
  };

  const optionLabelClass = (key) => {
    const base = "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5";
    if (submitted || showExplanation) {
      if (key === correctKey) return `${base} bg-emerald-500 text-white`;
      if (key === selectedKey && key !== correctKey) return `${base} bg-red-500 text-white`;
      return `${base} bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400`;
    }
    if (key === selectedKey) return `${base} bg-brand-600 text-white`;
    return `${base} bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400`;
  };

  const getOptionText = (key) => {
    return q.options?.[key] || "";
  };

  const bmKey = q.id + q._examFile;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-32 md:pb-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { if (window.confirm("Exit this session? Progress will not be saved.")) navigate("/practice"); }}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">{session.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{current + 1} of {questions.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
            <Clock size={14} className="text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{formatTime(elapsed)}</span>
          </div>
          <button
            onClick={() => setShowGrid((v) => !v)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-1">
        <ProgressBar value={answeredCount} max={questions.length} />
      </div>
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-4">
        <span>{answeredCount} answered</span>
        <span>{questions.length - answeredCount} remaining</span>
      </div>

      {/* Question grid overlay */}
      {showGrid && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Jump to question</p>
          <div className="flex flex-wrap gap-1.5">
            {questions.map((qItem, i) => {
              const ans = answers[qItem.id];
              const ck = parseCorrectKey(qItem.correct_answer);
              let cls = "w-8 h-8 rounded-lg text-xs font-medium border transition-colors";
              if (i === current) cls += " border-brand-500 bg-brand-600 text-white";
              else if (ans && (submitted || showExplanation)) {
                cls += ans === ck
                  ? " border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                  : " border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
              } else if (ans) cls += " border-brand-400 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300";
              else if (flagged.has(qItem.id)) cls += " border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300";
              else cls += " border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300";
              return (
                <button key={i} onClick={() => { setCurrent(i); setShowGrid(false); setShowExplanation(false); }} className={cls}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            {[
              { label: "Current", cls: "w-3 h-3 rounded bg-brand-600" },
              { label: "Answered", cls: "w-3 h-3 rounded bg-brand-100 border border-brand-400" },
              { label: "Flagged", cls: "w-3 h-3 rounded bg-amber-100 border border-amber-400" },
              { label: "Skipped", cls: "w-3 h-3 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600" },
            ].map(({ label, cls }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={cls} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source badge */}
      {q._examLabel && (
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="gray">{q._examLabel}</Badge>
          {flagged.has(q.id) && <Badge variant="amber">Flagged</Badge>}
          {session.negativeMarking && (
            <Badge variant="red">
              <AlertTriangle size={10} className="mr-1" />
              -0.25 per wrong
            </Badge>
          )}
        </div>
      )}

      {/* Question */}
      <div className="mb-5">
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">Question {current + 1}</p>
        <p className="text-base text-gray-900 dark:text-gray-100 leading-relaxed prose-bidi font-medium">
          {q.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {OPTION_KEYS.map((key) => {
          const text = getOptionText(key);
          if (!text) return null;
          return (
            <button key={key} onClick={() => handleSelect(key)} className={optionClass(key)} disabled={submitted}>
              <span className={optionLabelClass(key)}>{key.toUpperCase()}</span>
              <span className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed prose-bidi flex-1">{text}</span>
              {(submitted || showExplanation) && key === correctKey && (
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              )}
              {(submitted || showExplanation) && key === selectedKey && key !== correctKey && (
                <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {(showExplanation || submitted) && q.explanation && (
        <div className="mb-5 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5 uppercase tracking-wide">Explanation</p>
          <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed prose-bidi">{q.explanation}</p>
          {q.reference && (
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">Source: {q.reference}</p>
          )}
          {q.note && (
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1.5 italic">{q.note}</p>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {isAnswered && !submitted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExplanation((v) => !v)}
          >
            <HelpCircle size={15} />
            {showExplanation ? "Hide" : "Explain"}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFlag}
          className={flagged.has(q.id) ? "text-amber-600 dark:text-amber-400" : ""}
        >
          <Flag size={15} />
          {flagged.has(q.id) ? "Unflag" : "Flag"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className={bookmarks[bmKey] ? "text-brand-600 dark:text-brand-400" : ""}
        >
          {bookmarks[bmKey] ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          {bookmarks[bmKey] ? "Saved" : "Save"}
        </Button>

        <div className="flex-1" />

        <Button variant="secondary" size="sm" onClick={() => { setCurrent(Math.max(0, current - 1)); setShowExplanation(false); }} disabled={current === 0}>
          <ChevronLeft size={15} /> Prev
        </Button>

        {current < questions.length - 1 ? (
          <Button size="sm" onClick={() => { setCurrent(current + 1); setShowExplanation(false); }}>
            Next <ChevronRight size={15} />
          </Button>
        ) : (
          <Button size="sm" variant="success" onClick={handleFinish}>
            <CheckCircle2 size={15} /> Finish
          </Button>
        )}
      </div>

      {/* Finish shortcut when all answered */}
      {answeredCount === questions.length && current < questions.length - 1 && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
          <p className="text-sm text-emerald-800 dark:text-emerald-200">All questions answered.</p>
          <Button size="sm" variant="success" onClick={handleFinish}>
            <CheckCircle2 size={14} /> See results
          </Button>
        </div>
      )}
    </div>
  );
}
