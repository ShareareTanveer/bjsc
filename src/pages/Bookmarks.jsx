import React, { useState, useEffect } from "react";
import { BookmarkCheck, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Card, Button, EmptyState, Badge } from "../components/UI";
import { getBookmarks, toggleBookmark } from "../utils/storage";
import { loadExamData } from "../utils/quizEngine";

const OPTION_KEYS = ["a", "b", "c", "d"];

function parseCorrectKey(str) {
  if (!str) return null;
  const m = str.trim().toLowerCase().match(/^([a-d])[).:\s]/);
  if (m) return m[1];
  if (/^[a-d]$/.test(str.trim()[0])) return str.trim()[0].toLowerCase();
  return null;
}

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [questions, setQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const bm = getBookmarks();
    setBookmarks(bm);

    // Group by exam file
    const groups = {};
    bm.forEach(({ examFile }) => {
      if (!groups[examFile]) groups[examFile] = true;
    });

    // Load each exam file
    Promise.all(
      Object.keys(groups).map((file) =>
        loadExamData(file).then((data) => ({ file, data }))
      )
    ).then((results) => {
      const qMap = {};
      results.forEach(({ file, data }) => {
        if (!data) return;
        data.questions.forEach((q) => {
          qMap[`${file}::${q.id}`] = { ...q, _examFile: file, _examLabel: data.exam };
        });
      });
      setQuestions(qMap);
      setLoading(false);
    });
  }, []);

  const handleRemove = (bm) => {
    toggleBookmark(bm.questionId, bm.examFile);
    setBookmarks((prev) => prev.filter((b) => b.key !== bm.key));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading bookmarks...</p>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <EmptyState
          icon={BookmarkCheck}
          title="No bookmarks yet"
          description="During a quiz, tap the Save button on any question to bookmark it for later review."
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Bookmarks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{bookmarks.length} saved questions</p>
        </div>
      </div>

      <div className="space-y-2">
        {bookmarks.map((bm) => {
          const qKey = `${bm.examFile}::${bm.questionId}`;
          const q = questions[qKey];
          const isOpen = expanded === bm.key;
          const ck = q ? parseCorrectKey(q.correct_answer) : null;

          return (
            <Card key={bm.key} className="overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : bm.key)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <BookmarkCheck size={16} className="text-brand-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  {q && <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{q._examLabel}</p>}
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed prose-bidi">
                    {q ? q.question : "Loading..."}
                  </p>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
              </button>

              {isOpen && q && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
                  {OPTION_KEYS.map((key) => {
                    const text = q.options?.[key];
                    if (!text) return null;
                    const isCorrect = key === ck;
                    return (
                      <div
                        key={key}
                        className={`flex items-start gap-2.5 p-3 rounded-xl text-sm border ${
                          isCorrect
                            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                            : "border-gray-100 dark:border-gray-800"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold mt-0.5 shrink-0 ${
                          isCorrect ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        }`}>
                          {key.toUpperCase()}
                        </span>
                        <span className={`prose-bidi flex-1 leading-relaxed ${isCorrect ? "text-emerald-900 dark:text-emerald-100 font-medium" : "text-gray-600 dark:text-gray-400"}`}>
                          {text}
                        </span>
                      </div>
                    );
                  })}

                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900">
                      <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wide mb-1">Explanation</p>
                      <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed prose-bidi">{q.explanation}</p>
                      {q.reference && <p className="text-xs text-blue-400 mt-1">Source: {q.reference}</p>}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(bm)}
                    className="text-red-500 dark:text-red-400"
                  >
                    <Trash2 size={14} /> Remove bookmark
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
